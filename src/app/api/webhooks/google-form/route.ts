import { sendWorkflowExecution } from "@/inngest/utils";
import { type NextRequest, NextResponse } from "next/server";

export const POST = async (request: NextRequest) => {
  try {
    const url = new URL(request.url);
    const id = url.searchParams.get("id");
    if (!id) {
      return NextResponse.json(
        { success: false, error: "Workflow id is required." },
        { status: 400 }
      );
    }
    const body = await request.json();
    const formData = {
      formId: body.formId,
      formTitle: body.formTitle,
      responseId: body.responseId,
      timestamp: body.timestamp,
      respondentEmail: body.respondentEmail,
      responses: body.responses,
      raw: body,
    };
    // Trigger an inngest job
    await sendWorkflowExecution({ id, initialData: { googleForm: formData } });

    return NextResponse.json(
      { success: true, message: "Workflow triggered successfully." },
      { status: 200 }
    );
  } catch (error) {
    console.error("Failed to receive data from Google:", error);
    return NextResponse.json(
      { success: false, error: "Failed to process Google Form submission." },
      { status: 500 }
    );
  }
};
