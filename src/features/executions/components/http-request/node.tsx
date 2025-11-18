"use client";

import { useReactFlow, type Node, type NodeProps } from "@xyflow/react";
import { GlobeIcon } from "lucide-react";
import { memo, useState } from "react";
import { BaseExecutionNode } from "../base-execution-node";
import { HttpRequestDialog, type FormType } from "./dialog";

type HttpRequestNodeData = {
  endpoint?: string;
  method?: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
  body?: string;
  [key: string]: unknown;
};

type HttpRequestNodeProps = Node<HttpRequestNodeData>;

export const HttpRequestNode = memo(
  (props: NodeProps<HttpRequestNodeProps>) => {
    const [dialogOpen, setDialogOpen] = useState(true);
    const { setNodes } = useReactFlow();
    const nodeData = props.data;
    const description = nodeData?.endpoint
      ? `${nodeData.method || "GET"}: ${nodeData.endpoint}`
      : "Not configured";
    const status = "initial";
    const handleOpenSettings = () => setDialogOpen(true);
    const handleSubmit = (values: FormType) => {
      setNodes(nodes => {
        nodes.map(node => {
          if (node.id === props.id) {
            node.data = {
              ...node.data,
              endpoint: values.endpoint,
              method: values.method,
              body: values.body,
            };
            return node;
          }
        });
        return nodes;
      });
    };
    return (
      <>
        <HttpRequestDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          onSubmit={handleSubmit}
          // TODO: Check if it can be improved by just sending initialValues={nodeData}
          defaultEndpoint={nodeData.endpoint}
          defaultMethod={nodeData.method}
          defaultBody={nodeData.body}
        />
        <BaseExecutionNode
          {...props}
          id={props.id}
          icon={GlobeIcon}
          name="HTTP Request"
          description={description}
          status={status}
          onSetting={handleOpenSettings}
          onDoubleClick={handleOpenSettings}
        />
      </>
    );
  }
);

HttpRequestNode.displayName = "HttpRequestNode";
