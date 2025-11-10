"use client";

import { useTRPC } from "@/trpc/client";
import { trpc } from "@/trpc/server";
import {
  useMutation,
  useQueryClient,
  useSuspenseQuery,
} from "@tanstack/react-query";
import { TRPCClientError } from "@trpc/client";
import { inferInput } from "@trpc/tanstack-react-query";
import { toast } from "sonner";

/**
 * Hook to fetch all workflows using suspense
 */
type Input = inferInput<typeof trpc.workflows.findMany>;
export const useSuspenseWorkflows = (params: Input) => {
  const trpc = useTRPC();
  return useSuspenseQuery(trpc.workflows.findMany.queryOptions(params));
};

/**
 * Hook to create a new workflow
 */
export const useCreateWorkflow = () => {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  return useMutation(
    trpc.workflows.create.mutationOptions({
      onSuccess: data => {
        toast.success(`Workflow ${data.name} created`);
        queryClient.invalidateQueries(trpc.workflows.findMany.queryOptions({}));
      },
      onError: error => {
        if (!(error instanceof TRPCClientError))
          toast.error(`Field to create workflow: ${error.message}`);
      },
    })
  );
};
