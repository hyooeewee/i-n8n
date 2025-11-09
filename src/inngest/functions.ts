import { anthropic } from "@ai-sdk/anthropic";
import { google } from "@ai-sdk/google";
import { createOpenAI, openai } from "@ai-sdk/openai";
import * as Sentry from "@sentry/nextjs";
import { generateText } from "ai";
import { inngest } from "./client";

const zhipu = createOpenAI({
  baseURL: "https://open.bigmodel.cn/api/paas/v4/",
  apiKey: process.env.ZHIPU_API_KEY,
});

export const execute = inngest.createFunction(
  { id: "execute-ai" },
  { event: "execute/ai" },
  async ({ event, step }) => {
    Sentry.logger.info("User triggered test log", {
      log_source: "sentry_test",
    });
    console.log("User triggered test log");
    console.warn("User triggered test warn");
    console.error("User triggered test error");

    await step.sleep("pretend", "5s");
    const { steps: zhipuSteps } = await step.ai.wrap(
      "zhipu-generate-text",
      generateText,
      {
        model: zhipu.chat("glm-4.5-flash"),
        system: "You are a helpful assistant.",
        prompt: "What is 2 + 2?",
        experimental_telemetry: {
          isEnabled: true,
          recordInputs: true,
          recordOutputs: true,
        },
      }
    );
    const { steps: geminiSteps } = await step.ai.wrap(
      "gemini-generate-text",
      generateText,
      {
        model: google("gemini-2.5-flash"),
        system: "You are a helpful assistant.",
        prompt: "What is 2 + 2?",
        experimental_telemetry: {
          isEnabled: true,
          recordInputs: true,
          recordOutputs: true,
        },
      }
    );
    const { steps: openaiSteps } = await step.ai.wrap(
      "openai-generate-text",
      generateText,
      {
        model: openai("gpt-4o"),
        system: "You are a helpful assistant.",
        prompt: "What is 2 + 2?",
        experimental_telemetry: {
          isEnabled: true,
          recordInputs: true,
          recordOutputs: true,
        },
      }
    );
    const { steps: anthropicSteps } = await step.ai.wrap(
      "anthropic-generate-text",
      generateText,
      {
        model: anthropic("claude-sonnet-4-5-20250929"),
        system: "You are a helpful assistant.",
        prompt: "What is 2 + 2?",
        experimental_telemetry: {
          isEnabled: true,
          recordInputs: true,
          recordOutputs: true,
        },
      }
    );
    return { zhipuSteps, geminiSteps, openaiSteps, anthropicSteps };
  }
);
