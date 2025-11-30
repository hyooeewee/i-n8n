import { NodeExecutor } from "@/features/executions/types";
import { httpRequestChannel } from "@/inngest/channels/http-request";
import Handlebars from "handlebars";
import { NonRetriableError } from "inngest";
import ky, { type Options } from "ky";

Handlebars.registerHelper("json", (context) => {
  const jsonString = JSON.stringify(context, null, 2);
  const safeString = new Handlebars.SafeString(jsonString);
  return safeString;
});

export type HttpRequestData = {
  variableName?: string;
  method?: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
  endpoint?: string;
  body?: string;
};

export const httpRequestExecutor: NodeExecutor<HttpRequestData> = async ({
  data,
  nodeId,
  context,
  step,
  publish,
}) => {
  await publish(
    httpRequestChannel().status({
      nodeId,
      status: "loading",
    })
  );
  const result = await step.run("http-request", async () => {
    if (!data.variableName) {
      await publish(
        httpRequestChannel().status({
          nodeId,
          status: "error",
        })
      );
      throw new NonRetriableError(
        "HTTP Request node: No variable name configured."
      );
    }
    if (!data.method) {
      await publish(
        httpRequestChannel().status({
          nodeId,
          status: "error",
        })
      );
      throw new NonRetriableError("HTTP Request node: No method configured.");
    }
    if (!data.endpoint) {
      await publish(
        httpRequestChannel().status({
          nodeId,
          status: "error",
        })
      );
      throw new NonRetriableError("HTTP Request node: No endpoint configured.");
    }
    const method = data.method;
    const endpoint = Handlebars.compile(data.endpoint)(context);
    const options: Options = { method };
    if (["POST", "PUT", "PATCH"].includes(method)) {
      const resolved = Handlebars.compile(data.body || "{}")(context);
      JSON.parse(resolved);
      if (data.body) options.body = resolved;
      options.headers = { "Content-Type": "application/json" };
    }
    const response = await ky(endpoint, options);
    const contentType = response.headers.get("content-type");
    const responseData = contentType?.includes("application/json")
      ? await response.json()
      : await response.text();
    const responsePayload = {
      httpResponse: {
        status: response.status,
        statusText: response.statusText,
        data: responseData,
      },
    };
    return {
      ...context,
      [data.variableName]: responsePayload,
    };
  });
  await publish(
    httpRequestChannel().status({
      nodeId,
      status: "success",
    })
  );
  return result;
};
