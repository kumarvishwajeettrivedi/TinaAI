import GroqService from "@/services/groq.service";
import { NextResponse } from "next/server";
import {
  SYSTEM_PROMPT,
  generateQuestionsPrompt,
} from "@/lib/prompts/generate-questions";
import { logger } from "@/lib/logger";

export const maxDuration = 60;

export async function POST(req: Request) {
  logger.info("generate-interview-questions request received");
  const body = await req.json();

  const groq = new GroqService("llama-3.3-70b-versatile");

  try {
    const content = await groq.generateJSON(
      generateQuestionsPrompt(body),
      SYSTEM_PROMPT
    );

    logger.info("Interview questions generated successfully");

    return NextResponse.json(
      {
        response: JSON.stringify(content),
      },
      { status: 200 },
    );
  } catch (error) {
    logger.error("Error generating interview questions:", error as any);

    return NextResponse.json(
      { error: "internal server error" },
      { status: 500 },
    );
  }
}
