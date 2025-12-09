"use server";

import GroqService from "@/services/groq.service";
import { ResponseService } from "@/services/responses.service";
import { InterviewService } from "@/services/interviews.service";
import { Question } from "@/types/interview";
import { Analytics } from "@/types/response";
import {
  getInterviewAnalyticsPrompt,
  SYSTEM_PROMPT,
} from "@/lib/prompts/analytics";

export const generateInterviewAnalytics = async (payload: {
  callId: string;
  interviewId: string;
  transcript: string;
}) => {
  const { callId, interviewId, transcript } = payload;

  try {
    const response = await ResponseService.getResponseByCallId(callId);
    const interview = await InterviewService.getInterviewById(interviewId);

    if (response.analytics) {
      return { analytics: response.analytics as Analytics, status: 200 };
    }

    const interviewTranscript = transcript || response.details?.transcript;
    console.log("Analytics Service - Transcript to analyze:", interviewTranscript?.substring(0, 200) + "...");

    const questions = interview?.questions || [];
    const mainInterviewQuestions = questions
      .map((q: Question, index: number) => `${index + 1}. ${q.question}`)
      .join("\n");

    const groq = new GroqService("llama-3.3-70b-versatile");

    const prompt = getInterviewAnalyticsPrompt(
      interviewTranscript,
      mainInterviewQuestions,
    );

    const analyticsResponse = await groq.generateJSON(prompt, SYSTEM_PROMPT);
    console.log("Analytics Service - Groq Response:", JSON.stringify(analyticsResponse, null, 2));

    analyticsResponse.mainInterviewQuestions = questions.map(
      (q: Question) => q.question,
    );

    return { analytics: analyticsResponse, status: 200 };
  } catch (error) {
    console.error("Error in Gemini request:", error);

    return { error: "internal server error", status: 500 };
  }
};
