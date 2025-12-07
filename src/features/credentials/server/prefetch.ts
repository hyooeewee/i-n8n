import { prefetch, trpc } from "@/trpc/server";
import { inferInput } from "@trpc/tanstack-react-query";

type Input = inferInput<typeof trpc.credentials.findMany>;

/**
 * Prefetch all credentials
 */
export const prefetchCredentials = (params: Input) => {
  return prefetch(trpc.credentials.findMany.queryOptions(params));
};

/**
 * Prefetch a single credential
 */
export const prefetchCredential = (id: string) => {
  return prefetch(trpc.credentials.findOne.queryOptions({ id }));
};
