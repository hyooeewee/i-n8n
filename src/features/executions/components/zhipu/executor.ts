import { NodeExecutor } from "@/features/executions/types";
import { zhipuChannel } from "@/inngest/channels/zhipu";
import { generateText } from "ai";
import Handlebars from "handlebars";
import { NonRetriableError } from "inngest";
// import { createZhipu } from "zhipu-ai-provider";
import { createOpenAI } from "@ai-sdk/openai";
import { AVAILABLE_MODELS } from "./dialog";

Handlebars.registerHelper("json", (context) => {
  const jsonString = JSON.stringify(context, null, 2);
  const safeString = new Handlebars.SafeString(jsonString);
  return safeString;
});

export type ZhiPuData = {
  variableName?: string;
  model?: (typeof AVAILABLE_MODELS)[number];
  systemPrompt?: string;
  userPrompt?: string;
};

export const zhipuExecutor: NodeExecutor<ZhiPuData> = async ({
  data,
  nodeId,
  context,
  step,
  publish,
}) => {
  await publish(
    zhipuChannel().status({
      nodeId,
      status: "loading",
    })
  );
  if (!data.variableName) {
    await publish(
      zhipuChannel().status({
        nodeId,
        status: "error",
      })
    );
    throw new NonRetriableError("ZhiPu node: No variable name configured.");
  }
  if (!data.model) {
    await publish(
      zhipuChannel().status({
        nodeId,
        status: "error",
      })
    );
    throw new NonRetriableError("ZhiPu node: No model configured.");
  }
  // TODO: Throw if credential is not set.
  if (!data.userPrompt) {
    await publish(
      zhipuChannel().status({
        nodeId,
        status: "error",
      })
    );
    throw new NonRetriableError("ZhiPu node: No user prompt configured.");
  }
  const systemPrompt = data.systemPrompt
    ? Handlebars.compile(data.systemPrompt)(context)
    : "You are a helpful assistant.";
  const userPrompt = Handlebars.compile(data.userPrompt)(context);
  // TODO: Fetch credential from user selected.
  // const credentialValue = process.env.ZHIPU_API_KEY;
  // const zhipu = createZhipu({
  //   apiKey: credentialValue,
  // });
  const zhipu = createOpenAI({
    baseURL: "https://open.bigmodel.cn/api/paas/v4",
    apiKey: process.env.ZHIPU_API_KEY,
  });
  try {
    const { steps } = await step.ai.wrap("zhipu-generate-text", generateText, {
      model: zhipu.chat(data.model || AVAILABLE_MODELS[0]),
      system: systemPrompt,
      prompt: userPrompt,
      experimental_telemetry: {
        isEnabled: true,
        recordInputs: true,
        recordOutputs: true,
      },
    });
    const text =
      steps[0].content[0].type === "text" ? steps[0].content[0].text : "";
    await publish(
      zhipuChannel().status({
        nodeId,
        status: "success",
      })
    );
    return {
      ...context,
      [data.variableName]: {
        aiResponse: { text },
      },
    };
  } catch (error) {
    await publish(
      zhipuChannel().status({
        nodeId,
        status: "error",
      })
    );
    console.error("Error in ZhiPu executor: ", error);
  }
};
