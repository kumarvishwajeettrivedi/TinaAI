import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export interface GeminiChatMessage {
  role: "user" | "model";
  parts: string;
}

export class GeminiService {
  private model;

  constructor(modelName: string = "gemini-1.5-flash") {
    this.model = genAI.getGenerativeModel({ model: modelName });
  }

  async generateContent(prompt: string, systemPrompt?: string): Promise<string> {
    try {
      const fullPrompt = systemPrompt 
        ? `${systemPrompt}\n\n${prompt}` 
        : prompt;

      const result = await this.model.generateContent(fullPrompt);
      const response = await result.response;
      return response.text();
    } catch (error) {
      console.error("Gemini API Error:", error);
      throw error;
    }
  }

  async generateJSON(prompt: string, systemPrompt?: string): Promise<any> {
    try {
      const fullPrompt = systemPrompt 
        ? `${systemPrompt}\n\nIMPORTANT: Respond ONLY with valid JSON. No markdown, no code blocks, just the JSON object.\n\n${prompt}` 
        : `IMPORTANT: Respond ONLY with valid JSON. No markdown, no code blocks, just the JSON object.\n\n${prompt}`;

      const result = await this.model.generateContent(fullPrompt);
      const response = await result.response;
      let text = response.text();
      
      // Clean up response if it contains markdown code blocks
      text = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      
      return JSON.parse(text);
    } catch (error) {
      console.error("Gemini JSON API Error:", error);
      throw error;
    }
  }

  async chat(messages: GeminiChatMessage[]): Promise<string> {
    try {
      const chat = this.model.startChat({
        history: messages.slice(0, -1).map(msg => ({
          role: msg.role,
          parts: [{ text: msg.parts }],
        })),
      });

      const lastMessage = messages[messages.length - 1];
      const result = await chat.sendMessage(lastMessage.parts);
      const response = await result.response;
      return response.text();
    } catch (error) {
      console.error("Gemini Chat API Error:", error);
      throw error;
    }
  }
}

export default GeminiService;
