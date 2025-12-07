import { NodeExecutor } from "@/features/executions/types";
import { discordChannel } from "@/inngest/channels/discord";
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

export type DiscordData = {
  variableName?: string;
  webhookUrl?: string;
  content?: string;
  username?: string;
};

export const discordExecutor: NodeExecutor<DiscordData> = async ({
  data,
  nodeId,
  context,
  step,
  publish,
}) => {
  await publish(
    discordChannel().status({
      nodeId,
      status: "loading",
    })
  );
  if (!data.variableName) {
    await publish(
      discordChannel().status({
        nodeId,
        status: "error",
      })
    );
    throw new NonRetriableError("Discord node: No variable name configured.");
  }
  if (!data.webhookUrl) {
    await publish(
      discordChannel().status({
        nodeId,
        status: "error",
      })
    );
    throw new NonRetriableError("Discord node: No webhook url configured.");
  }
  if (!data.content) {
    await publish(
      discordChannel().status({
        nodeId,
        status: "error",
      })
    );
    throw new NonRetriableError("Discord node: No message content configured.");
  }
  try {
    const content = decode(Handlebars.compile(data.content)(context));
    const username = data.username
      ? decode(Handlebars.compile(data.username)(context))
      : undefined;
    await step.run("discord-webhook", async () => {
      await ky.post(data.webhookUrl!, {
        json: {
          content,
          username,
        },
      });
    });
    await publish(
      discordChannel().status({
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
      discordChannel().status({
        nodeId,
        status: "error",
      })
    );
    console.error("Error in Discord executor: ", error);
    throw error;
  }
};
