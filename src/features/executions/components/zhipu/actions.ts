"use server";

import { zhipuChannel } from "@/inngest/channels/zhipu";
import { inngest } from "@/inngest/client";
import { getSubscriptionToken, type Realtime } from "@inngest/realtime";

export type ZhiPuToken = Realtime.Token<typeof zhipuChannel, ["status"]>;

export const fetchZhiPuRealtimeToken = async (): Promise<ZhiPuToken> => {
  const token = await getSubscriptionToken(inngest, {
    channel: zhipuChannel(),
    topics: ["status"],
  });
  return token;
};
