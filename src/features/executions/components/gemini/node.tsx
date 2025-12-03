"use client";

import { BaseExecutionNode } from "@/features/executions/components/base-execution-node";
import { useNodeStatus } from "@/features/executions/hooks/use-node-status";
import { GEMINI_CHANNEL_NAME } from "@/inngest/channels/gemini";
import { useReactFlow, type Node, type NodeProps } from "@xyflow/react";
import { memo, useState } from "react";
import { fetchGeminiRealtimeToken } from "./actions";
import { AVAILABLE_MODELS, GeminiDialog, GeminiValues } from "./dialog";

type GeminiNodeData = {
  variableName?: string;
  model?: (typeof AVAILABLE_MODELS)[number];
  systemPrompt?: string;
  userPrompt?: string;
};

type GeminiNodeProps = Node<GeminiNodeData>;

export const GeminiNode = memo((props: NodeProps<GeminiNodeProps>) => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const { setNodes } = useReactFlow();
  const nodeData = props.data;
  const description = nodeData?.userPrompt
    ? `${nodeData.model || AVAILABLE_MODELS[0]}: ${nodeData.userPrompt.slice(
        0,
        50
      )}...}`
    : "Not configured";
  const status = useNodeStatus({
    nodeId: props.id,
    channel: GEMINI_CHANNEL_NAME,
    topic: "status",
    refreshToken: fetchGeminiRealtimeToken,
  });
  // const status = 'loading'
  const handleOpenSettings = () => setDialogOpen(true);
  const handleSubmit = (values: GeminiValues) =>
    setNodes((nodes) =>
      nodes.map((node) => {
        if (node.id === props.id) {
          return {
            ...node,
            data: {
              ...node.data,
              ...values,
            },
          };
        }
        return node;
      })
    );

  return (
    <>
      <GeminiDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSubmit={handleSubmit}
        defaultValues={nodeData}
      />
      <BaseExecutionNode
        {...props}
        id={props.id}
        icon="/logos/gemini.svg"
        name="Gemini"
        description={description}
        status={status}
        onSetting={handleOpenSettings}
        onDoubleClick={handleOpenSettings}
      />
    </>
  );
});

GeminiNode.displayName = "GeminiNode";
