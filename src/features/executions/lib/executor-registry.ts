import { anthropicExecutor } from "@/features/executions/components/anthropic/executor";
import { geminiExecutor } from "@/features/executions/components/gemini/executor";
import { httpRequestExecutor } from "@/features/executions/components/http-request/executor";
import { openaiExecutor } from "@/features/executions/components/openai/executor";
import { zhipuExecutor } from "@/features/executions/components/zhipu/executor";
import { NodeExecutor } from "@/features/executions/types";
import { googleFormTriggerExecutor } from "@/features/triggers/components/google-form-trigger/executor";
import { manualTriggerExecutor } from "@/features/triggers/components/manual-trigger/executor";
import { stripeTriggerExecutor } from "@/features/triggers/components/stripe-trigger/executor";
import { NodeType } from "@/generated/prisma/enums";
import { discordExecutor } from "../components/discord/executor";
import { slackExecutor } from "../components/slack/executor";

export const executorRegistry: Record<NodeType, NodeExecutor> = {
  [NodeType.INITIAL]: manualTriggerExecutor,
  [NodeType.MANUAL_TRIGGER]: manualTriggerExecutor,
  [NodeType.HTTP_REQUEST]: httpRequestExecutor,
  [NodeType.GOOGLE_FORM_TRIGGER]: googleFormTriggerExecutor,
  [NodeType.STRIPE_TRIGGER]: stripeTriggerExecutor,
  [NodeType.GEMINI]: geminiExecutor,
  [NodeType.OPENAI]: openaiExecutor,
  [NodeType.ANTHROPIC]: anthropicExecutor,
  [NodeType.ZHIPU]: zhipuExecutor,
  [NodeType.DISCORD]: discordExecutor,
  [NodeType.SLACK]: slackExecutor,
};

export const getExecutor = (type: NodeType): NodeExecutor => {
  const executor = executorRegistry[type];
  if (!executor) throw new Error(`No executor found for node type: ${type}.`);
  return executor;
};
