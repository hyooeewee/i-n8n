import { NodeExecutor } from "@/features/executions/types";
import { NonRetriableError } from "inngest";
import ky, { type Options } from "ky";

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
}) => {
  // TODO: Publish "loading" state for http request
  // TODO: Publish "error" state for http request
  if (!data.variableName)
    throw new NonRetriableError(
      "HTTP Request node: No variable name configured."
    );
  if (!data.endpoint)
    throw new NonRetriableError("HTTP Request node: No endpoint configured.");
  const result = await step.run("http-request", async () => {
    const method = data.method || "GET";
    const endpoint = data.endpoint!;
    const options: Options = { method };
    if (["POST", "PUT", "PATCH"].includes(method)) {
      if (data.body) options.body = data.body;
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
    if (data.variableName)
      return {
        ...context,
        [data.variableName]: responsePayload,
      };
    // Fallback to direct httpResponse for backward compatibility
    return {
      ...context,
      ...responsePayload,
    };
  });
  // TODO: Publish "success" state for http request
  return result;
};
