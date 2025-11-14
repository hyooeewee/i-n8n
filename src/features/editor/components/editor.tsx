"use client";

import { ErrorView, LoadingView } from "@/components/entity-components";
import { useSuspenseWorkflow } from "@/features/workflows/hooks/use-workflows";

export const EditorLoading = () => {
  return <LoadingView message="Loading editor..." />;
};

export const EditorError = () => {
  return <ErrorView message="Error loading editor" />;
};

export const Editor = ({ id }: { id: string }) => {
  const { data } = useSuspenseWorkflow(id);
  return <div>{JSON.stringify(data, null, 2)}</div>;
};
