import { NodeExecutor } from "@/features/executions/types";
import { anthropicChannel } from "@/inngest/channels/anthropic";
import { createAnthropic } from "@ai-sdk/anthropic";
import { generateText } from "ai";
import Handlebars from "handlebars";
import { NonRetriableError } from "inngest";
import { AVAILABLE_MODELS } from "./dialog";

Handlebars.registerHelper("json", (context) => {
  const jsonString = JSON.stringify(context, null, 2);
  const safeString = new Handlebars.SafeString(jsonString);
  return safeString;
});

export type AnthropicData = {
  variableName?: string;
  model?: (typeof AVAILABLE_MODELS)[number];
  systemPrompt?: string;
  userPrompt?: string;
};

export const anthropicExecutor: NodeExecutor<AnthropicData> = async ({
  data,
  nodeId,
  context,
  step,
  publish,
}) => {
  await publish(
    anthropicChannel().status({
      nodeId,
      status: "loading",
    })
  );
  if (!data.variableName) {
    await publish(
      anthropicChannel().status({
        nodeId,
        status: "error",
      })
    );
    throw new NonRetriableError("Anthropic node: No variable name configured.");
  }
  if (!data.model) {
    await publish(
      anthropicChannel().status({
        nodeId,
        status: "error",
      })
    );
    throw new NonRetriableError("Anthropic node: No model configured.");
  }
  // TODO: Throw if credential is not set.
  if (!data.userPrompt) {
    await publish(
      anthropicChannel().status({
        nodeId,
        status: "error",
      })
    );
    throw new NonRetriableError("Anthropic node: No user prompt configured.");
  }
  const systemPrompt = data.systemPrompt
    ? Handlebars.compile(data.systemPrompt)(context)
    : "You are a helpful assistant.";
  const userPrompt = Handlebars.compile(data.userPrompt)(context);
  // TODO: Fetch credential from user selected.
  const credentialValue = process.env.ANTHROPIC_API_KEY;
  const anthropic = createAnthropic({
    apiKey: credentialValue,
  });
  try {
    const { steps } = await step.ai.wrap(
      "anthropic-generate-text",
      generateText,
      {
        model: anthropic(data.model || AVAILABLE_MODELS[0]),
        system: systemPrompt,
        prompt: userPrompt,
        experimental_telemetry: {
          isEnabled: true,
          recordInputs: true,
          recordOutputs: true,
        },
      }
    );
    const text =
      steps[0].content[0].type === "text" ? steps[0].content[0].text : "";
    await publish(
      anthropicChannel().status({
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
      anthropicChannel().status({
        nodeId,
        status: "error",
      })
    );
    console.error("Error in Anthropic executor: ", error);
    throw error;
  }
};
