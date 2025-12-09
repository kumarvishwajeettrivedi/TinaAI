import Groq from "groq-sdk";

const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY,
});

export interface GroqChatMessage {
    role: "user" | "system" | "assistant";
    content: string;
}

export class GroqService {
    private model: string;

    constructor(modelName: string = "llama-3.3-70b-versatile") {
        this.model = modelName;
    }

    async generateContent(prompt: string, systemPrompt?: string): Promise<string> {
        try {
            const messages: GroqChatMessage[] = [];
            if (systemPrompt) {
                messages.push({ role: "system", content: systemPrompt });
            }
            messages.push({ role: "user", content: prompt });

            const completion = await groq.chat.completions.create({
                messages: messages,
                model: this.model,
            });

            return completion.choices[0]?.message?.content || "";
        } catch (error) {
            console.error("Groq API Error:", error);
            throw error;
        }
    }

    async generateJSON(prompt: string, systemPrompt?: string): Promise<any> {
        try {
            const fullSystemPrompt = systemPrompt
                ? `${systemPrompt}\n\nIMPORTANT: Respond ONLY with valid JSON. No markdown, no code blocks, just the JSON object.`
                : `IMPORTANT: Respond ONLY with valid JSON. No markdown, no code blocks, just the JSON object.`;

            const messages: GroqChatMessage[] = [
                { role: "system", content: fullSystemPrompt },
                { role: "user", content: prompt },
            ];

            const completion = await groq.chat.completions.create({
                messages: messages,
                model: this.model,
                response_format: { type: "json_object" },
            });

            const content = completion.choices[0]?.message?.content || "{}";
            return JSON.parse(content);
        } catch (error) {
            console.error("Groq JSON API Error:", error);
            throw error;
        }
    }
}

export default GroqService;
