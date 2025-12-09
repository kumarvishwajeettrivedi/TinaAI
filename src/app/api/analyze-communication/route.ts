import GroqService from "@/services/groq.service";
import { NextResponse } from "next/server";
import { logger } from "@/lib/logger";
import {
  SYSTEM_PROMPT,
  getCommunicationAnalysisPrompt,
} from "@/lib/prompts/communication-analysis";

export async function POST(req: Request) {
  logger.info("analyze-communication request received");

  try {
    const body = await req.json();
    const { transcript } = body;

    if (!transcript) {
      return NextResponse.json(
        { error: "Transcript is required" },
        { status: 400 },
      );
    }

    const groq = new GroqService("llama-3.3-70b-versatile");

    const analysis = await groq.generateJSON(
      getCommunicationAnalysisPrompt(transcript),
      SYSTEM_PROMPT
    );

    logger.info("Communication analysis completed successfully");

    return NextResponse.json(
      { analysis },
      { status: 200 },
    );
  } catch (error) {
    logger.error("Error analyzing communication skills");

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
