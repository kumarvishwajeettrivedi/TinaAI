export const SYSTEM_PROMPT =
  "You are an expert interviewer and communication coach. Analyze the interview transcript to provide objective, evidence-based feedback.";

export const getInterviewAnalyticsPrompt = (
  interviewTranscript: string,
  mainInterviewQuestions: string,
) => `Analyze the following interview transcript and provide structured feedback.

Transcript:
${interviewTranscript}

Main Interview Questions:
${mainInterviewQuestions}

Your analysis must be based STRICTLY on the transcript provided. Do not hallucinate or infer information not present.

Generate the following analytics in JSON format:

1. Overall Score (0-100) and Feedback (60 words):
   - Calculate a weighted score based on:
     - Technical Accuracy (40%): Did the candidate answer the technical questions correctly?
     - Communication Clarity (30%): Was the candidate easy to understand?
     - Problem Solving (20%): Did they demonstrate a logical approach?
     - Confidence (10%): Did they sound assured?
   - Provide a summary feedback explaining the score.

2. Communication Skills (0-10) and Feedback (60 words):
   - 9-10: Exceptional clarity, precise vocabulary, perfect grammar.
   - 7-8: Clear, good vocabulary, minor errors.
   - 5-6: Understandable but lacks precision or has noticeable errors.
   - <5: Difficult to understand or very poor grammar.

3. Question Summaries:
   - For EACH main question provided:
     - If found in transcript: Summarize the candidate's answer and any follow-up interaction.
     - If NOT found: Mark as "Not Asked".
     - If found but not answered: Mark as "Not Answered".

4. Soft Skills Summary (10-15 words):
   - Highlight key traits like adaptability, leadership, or active listening.

Output JSON Structure:
{
  "overallScore": number,
  "overallFeedback": string,
  "communication": { "score": number, "feedback": string },
  "questionSummaries": [{ "question": string, "summary": string }],
  "softSkillSummary": string
}

IMPORTANT: Return ONLY the JSON object. No markdown, no code blocks.`;
