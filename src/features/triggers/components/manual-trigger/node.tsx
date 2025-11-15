"use client";

import type { NodeProps } from "@xyflow/react";
import { GlobeIcon } from "lucide-react";
import { memo } from "react";
import { BaseTriggerNode } from "../base-trigger-node";

export const ManualTriggerNode = memo((props: NodeProps) => {
  return (
    <>
      <BaseTriggerNode
        {...props}
        id={props.id}
        icon={GlobeIcon}
        name="When clicking 'Execute workflow'"
        status="{status}"
        description="{description}"
        onSetting={() => {}}
        onDoubleClick={() => {}}
      />
    </>
  );
});

ManualTriggerNode.displayName = "ManualTriggerNode";
