import { GoogleGenAI, Chat } from "@google/genai";

if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const systemInstruction = "You are a world-class software development assistant chatbot. Your purpose is to assist and instruct users with their programming and software engineering questions. Provide clear, accurate, and concise answers. When appropriate, include well-formatted code examples. Respond in Markdown format.";

export function createChatSession(): Chat {
  return ai.chats.create({
    model: 'gemini-2.5-flash',
    config: {
      systemInstruction: systemInstruction,
      maxOutputTokens: 2048,
      // FIX: Per Gemini API guidelines, when setting maxOutputTokens for gemini-2.5-flash,
      // a thinkingBudget must also be set to reserve tokens for the final output.
      thinkingConfig: { thinkingBudget: 1024 },
    },
  });
}