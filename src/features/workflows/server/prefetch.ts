import { prefetch, trpc } from "@/trpc/server";
import { inferInput } from "@trpc/tanstack-react-query";

type Input = inferInput<typeof trpc.workflows.findMany>;
/**
 * Prefetch all workflows
 */
export const prefetchWorkflows = (params: Input) => {
  return prefetch(trpc.workflows.findMany.queryOptions(params));
};
