import { channel, topic } from "@inngest/realtime";

export const ZHIPU_CHANNEL_NAME = "zhipu-execution";

export const zhipuChannel = channel(ZHIPU_CHANNEL_NAME).addTopic(
  topic("status").type<{
    nodeId: string;
    status: "loading" | "error" | "success";
  }>()
);
