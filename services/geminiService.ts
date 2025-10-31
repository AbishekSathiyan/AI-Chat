/// <reference types="vite/client" />

import { GoogleGenAI, Chat, GenerateContentResponse } from "@google/genai";
import type { UserLocation, GroundingSource } from "../components/types";

// ✅ Use Vite's built-in environment variable
const API_KEY = import.meta.env.VITE_API_KEY;

if (!API_KEY) {
  throw new Error("VITE_API_KEY is missing. Please define it in your .env file.");
}

// ✅ Initialize GoogleGenAI
const ai = new GoogleGenAI({ apiKey: API_KEY });

// 🧠 System instruction for CareerMate AI
const careerMateSystemInstruction = `
You are CareerMate, an expert career advisor AI. Your goal is to help users with interview preparation and resume enhancement.

Your capabilities are:
1. **Interview Preparation**: Ask for the company name and job role, then generate 5–7 relevant behavioral and technical interview questions with concise, actionable tips. Use markdown for clarity.

2. **Resume Enhancement**: Ask for work experience, education, and key skills. If the user mentions a job role or industry, tailor your feedback. Suggest how to rephrase points, add keywords, and format resumes effectively. Use markdown for clarity.

3. **General Conversation**: Be friendly, professional, and helpful. Ignore location-based queries ("restaurants nearby", etc.) — those will be handled by the app.
`;

// ✅ Start chat session
export const startChatSession = (): Chat => {
  return ai.chats.create({
    model: "gemini-2.5-flash",
    config: { systemInstruction: careerMateSystemInstruction },
  });
};

// ✅ Response type
interface GroundedResponse {
  text: string;
  sources: GroundingSource[];
}

// ✅ Get grounded (Google Maps-based) response
export const getMapsGroundedResponse = async (
  prompt: string,
  location: UserLocation
): Promise<GroundedResponse> => {
  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        tools: [{ googleMaps: {} }],
        toolConfig: {
          retrievalConfig: {
            latLng: {
              latitude: location.latitude,
              longitude: location.longitude,
            },
          },
        },
      },
    });

    const text = response.text || "No response from model.";
    const groundingChunks =
      response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];

    const sources: GroundingSource[] = groundingChunks
      .filter((chunk) => chunk.maps?.uri && chunk.maps?.title)
      .map((chunk) => ({
        uri: chunk.maps.uri!,
        title: chunk.maps.title!,
      }));

    return { text, sources };
  } catch (error) {
    console.error("Error getting maps grounded response:", error);
    return {
      text: "Sorry, I encountered an error while fetching map data. Please try again later.",
      sources: [],
    };
  }
};
