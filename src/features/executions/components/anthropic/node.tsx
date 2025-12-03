"use client";

import { BaseExecutionNode } from "@/features/executions/components/base-execution-node";
import { useNodeStatus } from "@/features/executions/hooks/use-node-status";
import { ANTHROPIC_CHANNEL_NAME } from "@/inngest/channels/anthropic";
import { useReactFlow, type Node, type NodeProps } from "@xyflow/react";
import { memo, useState } from "react";
import { fetchAnthropicRealtimeToken } from "./actions";
import { AVAILABLE_MODELS, AnthropicDialog, AnthropicValues } from "./dialog";

type AnthropicNodeData = {
  variableName?: string;
  model?: (typeof AVAILABLE_MODELS)[number];
  systemPrompt?: string;
  userPrompt?: string;
};

type AnthropicNodeProps = Node<AnthropicNodeData>;

export const AnthropicNode = memo((props: NodeProps<AnthropicNodeProps>) => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const { setNodes } = useReactFlow();
  const nodeData = props.data;
  const description = nodeData?.userPrompt
    ? `${nodeData.model || AVAILABLE_MODELS[0]}: ${nodeData.userPrompt.slice(
        0,
        50
      )}...`
    : "Not configured";
  const status = useNodeStatus({
    nodeId: props.id,
    channel: ANTHROPIC_CHANNEL_NAME,
    topic: "status",
    refreshToken: fetchAnthropicRealtimeToken,
  });
  const handleOpenSettings = () => setDialogOpen(true);
  const handleSubmit = (values: AnthropicValues) =>
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
      <AnthropicDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSubmit={handleSubmit}
        defaultValues={nodeData}
      />
      <BaseExecutionNode
        {...props}
        icon="/logos/anthropic.svg"
        name="Anthropic"
        description={description}
        status={status}
        onSetting={handleOpenSettings}
        onDoubleClick={handleOpenSettings}
      />
    </>
  );
});

AnthropicNode.displayName = "AnthropicNode";
