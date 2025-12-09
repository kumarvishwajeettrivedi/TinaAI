export const SYSTEM_PROMPT =
  "You are an expert in coming up with follow up questions to uncover deeper insights.";

export const generateQuestionsPrompt = (body: {
  name: string;
  objective: string;
  number: number;
  context: string;
}) => `You are an expert technical interviewer. Create ${body.number} interview questions for a candidate.

Interview Details:
- Title: ${body.name}
- Objective: ${body.objective}
- Context: ${body.context}

Guidelines:
1. Focus on technical expertise and project experience.
2. Questions should be open-ended and encourage detailed responses.
3. Keep questions concise (under 30 words).

Output Format:
Return ONLY a valid JSON object with this exact structure:
{
  "questions": [
    { "question": "Question text here" }
  ],
  "description": "A short description (max 50 words) of the interview for the candidate, written in second person (e.g., 'In this interview, you will...'). Do not mention the specific objective."
}

Do not include any markdown formatting, code blocks, or extra text. Just the JSON string.`;
