import { getExecutor } from "@/features/executions/lib/executor-registry";
import { NodeType } from "@/generated/prisma/enums";
import { googleFormTriggerChannel } from "@/inngest/channels/google-form-trigger";
import { httpRequestChannel } from "@/inngest/channels/http-request";
import { manualTriggerChannel } from "@/inngest/channels/manual-trigger";
import { stripeTriggerChannel } from "@/inngest/channels/stripe-trigger";
import { inngest } from "@/inngest/client";
import { topologicalSort } from "@/inngest/utils";
import prisma from "@/lib/db";
import { NonRetriableError } from "inngest";

export const executeWorkflow = inngest.createFunction(
  { id: "execute-workflow" },
  {
    event: "workflows/execute.workflow",
    channels: [
      httpRequestChannel(),
      manualTriggerChannel(),
      googleFormTriggerChannel(),
      stripeTriggerChannel(),
    ],
  },
  async ({ event, step, publish }) => {
    const id = event.data.id;
    if (!id) throw new NonRetriableError("Workflow ID is required.");
    const sortedNodes = await step.run("prepare-workflow", async () => {
      const workflow = await prisma.workflow.findUniqueOrThrow({
        where: { id },
        include: { nodes: true, connections: true },
      });
      return topologicalSort(workflow.nodes, workflow.connections);
    });
    // Initialize context with any initial data from the trigger
    let context = event.data.initialData || {};
    // Execute each node in the workflow
    for (const node of sortedNodes) {
      const executor = getExecutor(node.type as NodeType);
      context = await executor({
        nodeId: node.id,
        context,
        step,
        data: node.data as {
          variableName: string;
          method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
          endpoint: string;
          [key: string]: unknown;
        },
        publish,
      });
    }
    return {
      workflowId: id,
      result: context,
    };
  }
);
