import axios from "axios";
import { NextRequest, NextResponse } from "next/server";
import { logger } from "@/lib/logger";

export async function POST(req: NextRequest) {
  if (req.method !== "POST") {
    return NextResponse.json({ error: "Method not allowed" }, { status: 405 });
  }

  try {
    const body = await req.json();
    const { event, call } = body as { event: string; call: any };

    switch (event) {
      case "call_started":
        logger.info("Call started event received", call.call_id);
        break;
      case "call_ended":
        logger.info("Call ended event received", call.call_id);
        break;
      case "call_analyzed":
        const result = await axios.post("/api/get-call", {
          id: call.call_id,
        });
        logger.info("Call analyzed event received", call.call_id);
        break;
      default:
        logger.info("Received an unknown event:", event);
    }

    // Acknowledge the receipt of the event
    return NextResponse.json({ status: 204 });
  } catch (error: any) {
    logger.error("Error processing webhook:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
