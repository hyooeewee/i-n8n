"use client";

import { BaseHandle } from "@/components/react-flow/base-handle";
import { BaseNode, BaseNodeContent } from "@/components/react-flow/base-node";
import {
  NodeStatusIndicator,
  type NodeStatus,
} from "@/components/react-flow/node-status-indicator";
import { WorkflowNode } from "@/components/workflow-node";
import { Position, useReactFlow, type NodeProps } from "@xyflow/react";
import { LucideIcon } from "lucide-react";
import Image from "next/image";
import { memo } from "react";

interface BaseTriggerNodeProps extends NodeProps {
  icon: LucideIcon | string;
  name: string;
  description?: string;
  children?: React.ReactNode;
  status?: NodeStatus;
  onSetting?: () => void;
  onDoubleClick?: () => void;
}

export const BaseTriggerNode = memo(
  ({
    id,
    icon: Icon,
    name,
    description,
    children,
    status = "initial",
    onSetting,
    onDoubleClick,
  }: BaseTriggerNodeProps) => {
    const { setNodes, setEdges } = useReactFlow();
    const handleDelete = () => {
      setNodes(nodes => {
        const filteredNodes = nodes.filter(node => node.id !== id);
        return filteredNodes;
      });
      setEdges(edges => {
        const filteredEdges = edges.filter(
          edge => edge.source !== id && edge.target !== id
        );
        return filteredEdges;
      });
    };
    return (
      <WorkflowNode
        name={name}
        description={description}
        onSetting={onSetting}
        onDelete={handleDelete}
      >
        <NodeStatusIndicator
          status={status}
          variant="border"
          className="rounded-l-2xl"
        >
          <BaseNode
            className="rounded-l-2xl relative group"
            onDoubleClick={onDoubleClick}
            status={status}
          >
            <BaseNodeContent>
              {typeof Icon === "string" ? (
                <Image
                  src={Icon}
                  alt={name}
                  width={16}
                  height={16}
                />
              ) : (
                <Icon className="size-4 text-muted-foreground" />
              )}
              {children}
              <BaseHandle
                id="source-1"
                type="source"
                position={Position.Right}
              />
            </BaseNodeContent>
          </BaseNode>
        </NodeStatusIndicator>
      </WorkflowNode>
    );
  }
);

BaseTriggerNode.displayName = "BaseTriggerNode";
