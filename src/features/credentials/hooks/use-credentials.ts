"use client";

import { useCredentialsParams } from "@/features/credentials/hooks/use-credentials-params";
import { CredentialType } from "@/generated/prisma/enums";
import { useTRPC } from "@/trpc/client";
import {
  useMutation,
  useQuery,
  useQueryClient,
  useSuspenseQuery,
} from "@tanstack/react-query";
import { TRPCClientError } from "@trpc/client";
import { toast } from "sonner";

/**
 * Hook to fetch all credentials using suspense
 */
export const useSuspenseCredentials = () => {
  const trpc = useTRPC();
  const [params] = useCredentialsParams();
  return useSuspenseQuery(trpc.credentials.findMany.queryOptions(params));
};

/**
 * Hook to create a new credential
 */
export const useCreateCredential = () => {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const [params] = useCredentialsParams();
  return useMutation(
    trpc.credentials.create.mutationOptions({
      onSuccess: (data) => {
        toast.success(`Credential "${data.name}" created`);
        queryClient.invalidateQueries(
          trpc.credentials.findMany.queryOptions(params)
        );
      },
      onError: (error) => {
        if (!(error instanceof TRPCClientError))
          toast.error(`Failed to create credential: ${error.message}`);
      },
    })
  );
};

/**
 * Hook to remove a credential
 */
export const useRemoveCredential = () => {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  return useMutation(
    trpc.credentials.remove.mutationOptions({
      onSuccess: (data) => {
        toast.success(`Credential "${data.name}" removed`);
        queryClient.invalidateQueries(
          trpc.credentials.findMany.queryOptions({})
        );
        queryClient.invalidateQueries(
          trpc.credentials.findOne.queryOptions({ id: data.id })
        );
      },
      onError: (error) => {
        if (!(error instanceof TRPCClientError))
          toast.error(`Failed to remove credential: ${error.message}`);
      },
    })
  );
};

/**
 * Hook to fetch a single credential using suspense
 */
export const useSuspenseCredential = (id: string) => {
  const trpc = useTRPC();
  return useSuspenseQuery(trpc.credentials.findOne.queryOptions({ id }));
};

/**
 * Hook to update a credential
 */
export const useUpdateCredential = () => {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  return useMutation(
    trpc.credentials.update.mutationOptions({
      onSuccess: (data) => {
        toast.success(`Credential "${data.name}" saved`);
        queryClient.invalidateQueries(
          trpc.credentials.findMany.queryOptions({})
        );
        queryClient.invalidateQueries(
          trpc.credentials.findOne.queryOptions({ id: data.id })
        );
      },
      onError: (error) => {
        if (!(error instanceof TRPCClientError))
          toast.error(`Failed to save credential: ${error.message}`);
      },
    })
  );
};

/**
 * Hook to fetch credentials by type
 */
export const useCredentialsByType = (type: CredentialType) => {
  const trpc = useTRPC();
  return useQuery(trpc.credentials.findByType.queryOptions({ type }));
};
