import { NodeExecutor } from "@/features/executions/types";
import { geminiChannel } from "@/inngest/channels/gemini";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { generateText } from "ai";
import Handlebars from "handlebars";
import { NonRetriableError } from "inngest";
import { AVAILABLE_MODELS } from "./dialog";

Handlebars.registerHelper("json", (context) => {
  const jsonString = JSON.stringify(context, null, 2);
  const safeString = new Handlebars.SafeString(jsonString);
  return safeString;
});

export type GeminiData = {
  variableName?: string;
  model?: (typeof AVAILABLE_MODELS)[number];
  systemPrompt?: string;
  userPrompt?: string;
};

export const geminiExecutor: NodeExecutor<GeminiData> = async ({
  data,
  nodeId,
  context,
  step,
  publish,
}) => {
  await publish(
    geminiChannel().status({
      nodeId,
      status: "loading",
    })
  );
  if (!data.variableName) {
    await publish(
      geminiChannel().status({
        nodeId,
        status: "error",
      })
    );
    throw new NonRetriableError("Gemini node: No variable name configured.");
  }
  if (!data.model) {
    await publish(
      geminiChannel().status({
        nodeId,
        status: "error",
      })
    );
    throw new NonRetriableError("Gemini node: No model configured.");
  }
  // TODO: Throw if credential is not set.
  if (!data.userPrompt) {
    await publish(
      geminiChannel().status({
        nodeId,
        status: "error",
      })
    );
    throw new NonRetriableError("Gemini node: No user prompt configured.");
  }
  const systemPrompt = data.systemPrompt
    ? Handlebars.compile(data.systemPrompt)(context)
    : "You are a helpful assistant.";
  const userPrompt = Handlebars.compile(data.userPrompt)(context);
  // TODO: Fetch credential from user selected.
  const credentialValue = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
  const google = createGoogleGenerativeAI({
    apiKey: credentialValue,
  });
  try {
    const { steps } = await step.ai.wrap("gemini-generate-text", generateText, {
      model: google(data.model || AVAILABLE_MODELS[0]),
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
      geminiChannel().status({
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
      geminiChannel().status({
        nodeId,
        status: "error",
      })
    );
    console.error("Error in Gemini executor: ", error);
  }
};
