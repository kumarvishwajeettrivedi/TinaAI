import { logger } from "@/lib/logger";
import { InterviewerService } from "@/services/interviewers.service";
import { NextResponse, NextRequest } from "next/server";
import { INTERVIEWERS } from "@/lib/constants";
import { nanoid } from "nanoid";

export async function GET(req: NextRequest) {
  logger.info("create-interviewer request received");

  try {
    // Create Tina with a mock agent ID
    const tinaAgentId = `agent_tina_${nanoid(10)}`;
    const newInterviewer = await InterviewerService.createInterviewer({
      agent_id: tinaAgentId,
      ...INTERVIEWERS.TINA,
    });

    // Create Sameer with a mock agent ID
    const sameerAgentId = `agent_sameer_${nanoid(10)}`;
    const newSecondInterviewer = await InterviewerService.createInterviewer({
      agent_id: sameerAgentId,
      ...INTERVIEWERS.SAMEER,
    });

    logger.info("Interviewers created successfully");

    return NextResponse.json(
      {
        newInterviewer,
        newSecondInterviewer,
      },
      { status: 200 },
    );
  } catch (error: any) {
    logger.error("Error creating interviewers:", error);

    return NextResponse.json(
      { error: "Failed to create interviewers" },
      { status: 500 },
    );
  }
}
