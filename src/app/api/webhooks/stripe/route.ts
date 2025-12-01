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
    const data = {
      eventId: body.id,
      eventType: body.type,
      timestamp: body.created,
      livemode: body.livemode,
      raw: body.data?.object,
    };
    // Trigger an inngest job
    await sendWorkflowExecution({ id, initialData: { stripe: data } });
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Failed to receive data from Stripe:", error);
    return NextResponse.json(
      { success: false, error: "Failed to process Stripe Event." },
      { status: 500 }
    );
  }
};
