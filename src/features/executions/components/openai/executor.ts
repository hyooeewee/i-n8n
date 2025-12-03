import { NodeExecutor } from "@/features/executions/types";
import { openaiChannel } from "@/inngest/channels/openai";
import { createOpenAI } from "@ai-sdk/openai";
import { generateText } from "ai";
import Handlebars from "handlebars";
import { NonRetriableError } from "inngest";
import { AVAILABLE_MODELS } from "./dialog";

Handlebars.registerHelper("json", (context) => {
  const jsonString = JSON.stringify(context, null, 2);
  const safeString = new Handlebars.SafeString(jsonString);
  return safeString;
});

export type OpenAiData = {
  variableName?: string;
  model?: (typeof AVAILABLE_MODELS)[number];
  systemPrompt?: string;
  userPrompt?: string;
};

export const openaiExecutor: NodeExecutor<OpenAiData> = async ({
  data,
  nodeId,
  context,
  step,
  publish,
}) => {
  await publish(
    openaiChannel().status({
      nodeId,
      status: "loading",
    })
  );
  if (!data.variableName) {
    await publish(
      openaiChannel().status({
        nodeId,
        status: "error",
      })
    );
    throw new NonRetriableError("OpenAi node: No variable name configured.");
  }
  if (!data.model) {
    await publish(
      openaiChannel().status({
        nodeId,
        status: "error",
      })
    );
    throw new NonRetriableError("OpenAi node: No model configured.");
  }
  // TODO: Throw if credential is not set.
  if (!data.userPrompt) {
    await publish(
      openaiChannel().status({
        nodeId,
        status: "error",
      })
    );
    throw new NonRetriableError("OpenAi node: No user prompt configured.");
  }
  const systemPrompt = data.systemPrompt
    ? Handlebars.compile(data.systemPrompt)(context)
    : "You are a helpful assistant.";
  const userPrompt = Handlebars.compile(data.userPrompt)(context);
  // TODO: Fetch credential from user selected.
  const credentialValue = process.env.OPENAI_API_KEY;
  const openai = createOpenAI({
    apiKey: credentialValue,
  });
  try {
    const { steps } = await step.ai.wrap("openai-generate-text", generateText, {
      model: openai(data.model || AVAILABLE_MODELS[0]),
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
      openaiChannel().status({
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
      openaiChannel().status({
        nodeId,
        status: "error",
      })
    );
    console.error("Error in OpenAi executor: ", error);
  }
};
