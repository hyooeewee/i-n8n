"use client";

import { BaseHandle } from "@/components/react-flow/base-handle";
import { BaseNode, BaseNodeContent } from "@/components/react-flow/base-node";
import { WorkflowNode } from "@/components/workflow-node";
import { Position, type NodeProps } from "@xyflow/react";
import { LucideIcon } from "lucide-react";
import Image from "next/image";
import { memo } from "react";

interface BaseTriggerNodeProps extends NodeProps {
  icon: LucideIcon | string;
  name: string;
  description?: string;
  children?: React.ReactNode;
  status?: string;
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
    status,
    onSetting,
    onDoubleClick,
  }: BaseTriggerNodeProps) => {
    // TODO: Add delete method
    const handleDelete = () => {};
    return (
      <WorkflowNode
        name={name}
        description={description}
        onSetting={onSetting}
        onDelete={handleDelete}
      >
        {/* TODO: Wrap within NodeStatusIndicator */}
        <BaseNode
          onDoubleClick={onDoubleClick}
          className="rounded-l-2xl relative group"
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
      </WorkflowNode>
    );
  }
);

BaseTriggerNode.displayName = "BaseTriggerNode";
