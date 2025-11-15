"use client";

import { Button } from "@/components/ui/button";
import { NodeToolbar, Position } from "@xyflow/react";
import { SettingsIcon, TrashIcon } from "lucide-react";

interface WorkflowNodeProps {
  children: React.ReactNode;
  showToolbar?: boolean;
  name?: string;
  description?: string;
  onDelete?: () => void;
  onSetting?: () => void;
}

export const WorkflowNode = ({
  children,
  showToolbar = true,
  name,
  description,
  onDelete,
  onSetting,
}: WorkflowNodeProps) => {
  return (
    <>
      {showToolbar && (
        <NodeToolbar>
          <Button
            size="sm"
            variant="ghost"
            onClick={onSetting}
          >
            <SettingsIcon className="size-4" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={onDelete}
          >
            <TrashIcon className="size-4" />
          </Button>
        </NodeToolbar>
      )}
      {children}
      {name && (
        <NodeToolbar
          className="max-w-[200px] text-center"
          isVisible
          position={Position.Bottom}
        >
          <p className="font-medium">{name}</p>
          {description && (
            <p className="text-muted-foreground truncate text-sm">
              {description}
            </p>
          )}
        </NodeToolbar>
      )}
    </>
  );
};
