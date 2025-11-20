"use client";

import { AddNodeButton } from "@/components/add-node-button";
import { ErrorView, LoadingView } from "@/components/entity-components";
import { nodeComponents } from "@/config/node-components";
import { useSuspenseWorkflow } from "@/features/workflows/hooks/use-workflows";
import { NodeType } from "@/generated/prisma/enums";
import {
  Background,
  type Connection,
  Controls,
  type Edge,
  type EdgeChange,
  MiniMap,
  type Node,
  type NodeChange,
  Panel,
  ReactFlow,
  addEdge,
  applyEdgeChanges,
  applyNodeChanges,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { useSetAtom } from "jotai";
import { useCallback, useMemo, useState } from "react";
import { editorAtom } from "../store/atoms";
import ExecuteWorkflowButton from "./execute-workflow-button";

export const EditorLoading = () => {
  return <LoadingView message="Loading editor..." />;
};

export const EditorError = () => {
  return <ErrorView message="Error loading editor" />;
};

export const Editor = ({ id }: { id: string }) => {
  const { data } = useSuspenseWorkflow(id);
  const setEditor = useSetAtom(editorAtom);
  const [nodes, setNodes] = useState<Node[]>(data.nodes);
  const [edges, setEdges] = useState<Edge[]>(data.edges);
  const onNodesChange = useCallback(
    (changes: NodeChange[]) =>
      setNodes(nodesSnapshot => applyNodeChanges(changes, nodesSnapshot)),
    []
  );
  const onEdgesChange = useCallback(
    (changes: EdgeChange[]) =>
      setEdges(edgesSnapshot => applyEdgeChanges(changes, edgesSnapshot)),
    []
  );
  const onConnect = useCallback(
    (params: Connection) =>
      setEdges(edgesSnapshot => addEdge(params, edgesSnapshot)),
    []
  );
  const hasManualTrigger = useMemo(
    () => nodes.some(node => node.type === NodeType.MANUAL_TRIGGER),
    [nodes]
  );
  return (
    <div className="size-full">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeComponents}
        onInit={setEditor}
        fitView
        snapGrid={[10, 10]}
        snapToGrid
        panOnScroll
        panOnDrag={false}
        selectionOnDrag
        proOptions={{
          hideAttribution: true,
        }}
      >
        <Background />
        <Controls />
        <MiniMap />
        <Panel position="top-right">
          <AddNodeButton />
        </Panel>
        {hasManualTrigger && (
          <Panel position="bottom-center">
            <ExecuteWorkflowButton id={id} />
          </Panel>
        )}
      </ReactFlow>
    </div>
  );
};
