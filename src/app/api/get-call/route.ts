import { logger } from "@/lib/logger";
import { generateInterviewAnalytics } from "@/services/analytics.service";
import { ResponseService } from "@/services/responses.service";
import { Response } from "@/types/response";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  logger.info("get-call request received");
  const body = await req.json();

  const callDetails: Response = await ResponseService.getResponseByCallId(
    body.id,
  );

  let callResponse = callDetails.details;

  if (callDetails.is_analysed) {
    return NextResponse.json(
      {
        callResponse,
        analytics: callDetails.analytics,
      },
      { status: 200 },
    );
  }

  // Mock call output - in real implementation, this would come from Web Speech API
  const mockCallOutput = {
    call_id: body.id,
    start_timestamp: callDetails.created_at ? new Date(callDetails.created_at).getTime() : Date.now() - 300000,
    end_timestamp: Date.now(),
    transcript: callResponse?.transcript || "Mock interview transcript",
    call_analysis: callResponse?.call_analysis || {},
  };

  const interviewId = callDetails?.interview_id;
  callResponse = mockCallOutput;

  const duration = Math.round(
    (callResponse.end_timestamp - callResponse.start_timestamp) / 1000,
  );

  const payload = {
    callId: body.id,
    interviewId: interviewId,
    transcript: callResponse.transcript,
  };

  const result = await generateInterviewAnalytics(payload);
  const analytics = result.analytics;

  await ResponseService.saveResponse(
    {
      details: callResponse,
      is_analysed: true,
      duration: duration,
      analytics: analytics,
    },
    body.id,
  );

  logger.info("Call analysed successfully");

  return NextResponse.json(
    {
      callResponse,
      analytics,
    },
    { status: 200 },
  );
}
