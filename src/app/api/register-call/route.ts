import { logger } from "@/lib/logger";
import { InterviewerService } from "@/services/interviewers.service";
import { NextResponse } from "next/server";
import { nanoid } from "nanoid";

export async function POST(req: Request) {
  logger.info("register-call request received");

  const body = await req.json();

  const interviewerId = body.interviewer_id;
  const interviewer = await InterviewerService.getInterviewer(interviewerId);

  // Create a mock call registration response
  const registerCallResponse = {
    call_id: `call_${nanoid(16)}`,
    access_token: `token_${nanoid(32)}`,
    agent_id: interviewer?.agent_id,
    sample_rate: 24000,
    // Web Speech API doesn't need these, but keeping structure for compatibility
    web_call_link: `${process.env.NEXT_PUBLIC_LIVE_URL || 'http://localhost:3000'}/call/${body.interview_id}`,
  };

  logger.info("Call registered successfully (mock mode)");

  return NextResponse.json(
    {
      registerCallResponse,
    },
    { status: 200 },
  );
}
