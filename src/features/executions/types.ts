import type { Realtime } from "@inngest/realtime";
import { GetStepTools, Inngest } from "inngest";

export type WorkflowContext = Record<string, unknown>;

export type StepTools = GetStepTools<Inngest.Any>;

export interface NodeExecutorParams<TData = Record<string, unknown>> {
  userId: string;
  data: TData;
  nodeId: string;
  context: WorkflowContext;
  step: StepTools;
  publish: Realtime.PublishFn;
}

export type NodeExecutor<
  TData = {
    [key: string]: unknown;
  }
> = (params: NodeExecutorParams<TData>) => Promise<WorkflowContext | undefined>;
