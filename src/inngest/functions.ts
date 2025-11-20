import { getExecutor } from "@/features/executions/lib/executor-registry";
import { NodeType } from "@/generated/prisma/enums";
import prisma from "@/lib/db";
import { createOpenAI } from "@ai-sdk/openai";
import { NonRetriableError } from "inngest";
import { inngest } from "./client";
import { topologicalSort } from "./utils";

const zhipu = createOpenAI({
  baseURL: "https://open.bigmodel.cn/api/paas/v4/",
  apiKey: process.env.ZHIPU_API_KEY,
});

export const executeWorkflow = inngest.createFunction(
  { id: "execute-workflow" },
  { event: "workflow/execute.workflow" },
  async ({ event, step }) => {
    const id = event.data.id;
    if (!id) throw new NonRetriableError("Workflow ID is required.");
    // const { steps: zhipuSteps } = await step.ai.wrap(
    //   "zhipu-generate-text",
    //   generateText,
    //   {
    //     model: zhipu.chat("glm-4.5-flash"),
    //     system: "You are a helpful assistant.",
    //     prompt: "What is 2 + 2?",
    //     experimental_telemetry: {
    //       isEnabled: true,
    //       recordInputs: true,
    //       recordOutputs: true,
    //     },
    //   }
    // );
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
        data: node.data as Record<string, unknown>,
      });
    }
    return {
      workflowId: id,
      result: context,
    };
  }
);
