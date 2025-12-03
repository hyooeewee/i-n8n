"use client";

import { BaseExecutionNode } from "@/features/executions/components/base-execution-node";
import { useNodeStatus } from "@/features/executions/hooks/use-node-status";
import { ZHIPU_CHANNEL_NAME } from "@/inngest/channels/zhipu";
import { useReactFlow, type Node, type NodeProps } from "@xyflow/react";
import { memo, useState } from "react";
import { fetchZhiPuRealtimeToken } from "./actions";
import { AVAILABLE_MODELS, ZhiPuDialog, ZhiPuValues } from "./dialog";

type ZhiPuNodeData = {
  variableName?: string;
  model?: (typeof AVAILABLE_MODELS)[number];
  systemPrompt?: string;
  userPrompt?: string;
};

type ZhiPuNodeProps = Node<ZhiPuNodeData>;

export const ZhiPuNode = memo((props: NodeProps<ZhiPuNodeProps>) => {
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
    channel: ZHIPU_CHANNEL_NAME,
    topic: "status",
    refreshToken: fetchZhiPuRealtimeToken,
  });
  // const status = 'loading'
  const handleOpenSettings = () => setDialogOpen(true);
  const handleSubmit = (values: ZhiPuValues) =>
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
      <ZhiPuDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSubmit={handleSubmit}
        defaultValues={nodeData}
      />
      <BaseExecutionNode
        {...props}
        id={props.id}
        icon="/logos/zhipu.svg"
        name="ZhiPu"
        description={description}
        status={status}
        onSetting={handleOpenSettings}
        onDoubleClick={handleOpenSettings}
      />
    </>
  );
});

ZhiPuNode.displayName = "ZhiPuNode";
