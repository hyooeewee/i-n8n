import { NodeExecutor } from "@/features/executions/types";
import Handlebars from "handlebars";
import { NonRetriableError } from "inngest";
import ky, { type Options } from "ky";

Handlebars.registerHelper("json", context => {
  const jsonString = JSON.stringify(context, null, 2);
  const safeString = new Handlebars.SafeString(jsonString);
  return safeString;
});

export type HttpRequestData = {
  variableName: string;
  method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
  endpoint: string;
  body?: string;
};

export const httpRequestExecutor: NodeExecutor<HttpRequestData> = async ({
  data,
  nodeId,
  context,
  step,
}) => {
  // TODO: Publish "loading" state for http request
  // TODO: Publish "error" state for http request
  if (!data.variableName)
    throw new NonRetriableError(
      "HTTP Request node: No variable name configured."
    );
  if (!data.method)
    throw new NonRetriableError("HTTP Request node: No method configured.");
  if (!data.endpoint)
    throw new NonRetriableError("HTTP Request node: No endpoint configured.");
  const result = await step.run("http-request", async () => {
    const method = data.method;
    const endpoint = Handlebars.compile(data.endpoint)(context);
    console.log({ endpoint });
    const options: Options = { method };
    if (["POST", "PUT", "PATCH"].includes(method)) {
      console.log("data.body", data.body);
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
  // TODO: Publish "success" state for http request
  return result;
};
