import { NodeExecutor } from "@/features/executions/types";
import { slackChannel } from "@/inngest/channels/slack";
import Handlebars from "handlebars";
import { decode } from "html-entities";
import { NonRetriableError } from "inngest";
import ky from "ky";

Handlebars.registerHelper("json", (context) => {
  try {
    const jsonString = JSON.stringify(context, null, 2);
    return new Handlebars.SafeString(jsonString);
  } catch (error) {
    console.error("Failed to serialize: " + error);
    return new Handlebars.SafeString("");
  }
});

export type SlackData = {
  variableName?: string;
  webhookUrl?: string;
  content?: string;
};

export const slackExecutor: NodeExecutor<SlackData> = async ({
  data,
  nodeId,
  context,
  step,
  publish,
}) => {
  try {
    await publish(
      slackChannel().status({
        nodeId,
        status: "loading",
      })
    );
    if (!data.variableName) {
      await publish(
        slackChannel().status({
          nodeId,
          status: "error",
        })
      );
      throw new NonRetriableError("Slack node: No variable name configured.");
    }
    if (!data.webhookUrl) {
      await publish(
        slackChannel().status({
          nodeId,
          status: "error",
        })
      );
      throw new NonRetriableError("Slack node: No webhook url configured.");
    }
    if (!data.content) {
      await publish(
        slackChannel().status({
          nodeId,
          status: "error",
        })
      );
      throw new NonRetriableError("Slack node: No message content configured.");
    }
    const content = decode(Handlebars.compile(data.content)(context));
    await step.run("slack-webhook", async () => {
      await ky.post(data.webhookUrl!, {
        json: {
          content,
        },
      });
    });
    await publish(
      slackChannel().status({
        nodeId,
        status: "success",
      })
    );
    return {
      ...context,
      [data.variableName]: {
        ...data,
      },
    };
  } catch (error) {
    await publish(
      slackChannel().status({
        nodeId,
        status: "error",
      })
    );
    console.error("Error in Slack executor: ", error);
    throw error;
  }
};
