import { NextResponse } from "next/server";
import { ResponseService } from "@/services/responses.service";
import { InterviewService } from "@/services/interviews.service";
import GroqService from "@/services/groq.service";
import {
  SYSTEM_PROMPT,
  createUserPrompt,
} from "@/lib/prompts/generate-insights";
import { logger } from "@/lib/logger";

export async function POST(req: Request) {
  logger.info("generate-insights request received");
  const body = await req.json();

  const responses = await ResponseService.getAllResponses(body.interviewId);
  const interview = await InterviewService.getInterviewById(body.interviewId);

  let callSummaries = "";
  if (responses) {
    responses.forEach((response) => {
      callSummaries += response.details?.call_analysis?.call_summary;
    });
  }


  try {
    const groq = new GroqService("llama-3.3-70b-versatile");

    const insights = await groq.generateJSON(
      createUserPrompt(
        callSummaries,
        interview.name,
        interview.objective,
        interview.description
      ),
      SYSTEM_PROMPT
    );

    await InterviewService.updateInterview(
      { insights: insights.insights },
      body.interviewId,
    );

    logger.info("Insights generated successfully");

    return NextResponse.json(
      { insights: insights.insights },
      { status: 200 },
    );
  } catch (error) {
    logger.error("Error generating insights");

    return NextResponse.json(
      { error: "internal server error" },
      { status: 500 },
    );
  }
}
