import { GoogleGenAI, Chat, GenerateContentResponse } from "@google/genai";
import type { UserLocation, GroundingSource } from '../components/types';

if (!process.env.API_KEY) {
  throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const careerMateSystemInstruction = `
You are CareerMate, an expert career advisor AI. Your goal is to help users with interview preparation and resume enhancement.

Your capabilities are:
1.  **Interview Preparation**: When a user wants to prepare for an interview, you MUST first ask for the company name and the specific job role. Once you have this information, generate a list of 5-7 relevant behavioral and technical interview questions tailored to that role and company. For each question, provide concise, actionable tips on how to answer it effectively. Structure your response clearly using markdown.

2.  **Resume Enhancement**: When a user wants to enhance their resume, you MUST first ask about their work experience, education, and key skills. If they mention a specific job role or industry they are targeting, tailor your advice accordingly. Provide specific suggestions on how to rephrase bullet points, incorporate relevant keywords, and format their resume to attract recruiters. Present your feedback in a structured, easy-to-read format using markdown.

3. **General Conversation**: Engage in a friendly, professional, and encouraging tone. If the user asks a question outside of interview prep or resumes that is not about a location, answer it to the best of your ability.

You DO NOT handle location-based queries like "restaurants nearby" or "directions to...". The application will handle those separately.
`;

export const startChatSession = (): Chat => {
  const chat = ai.chats.create({
    model: 'gemini-2.5-flash',
    config: {
      systemInstruction: careerMateSystemInstruction,
    },
  });
  return chat;
};

interface GroundedResponse {
  text: string;
  sources: GroundingSource[];
}

export const getMapsGroundedResponse = async (prompt: string, location: UserLocation): Promise<GroundedResponse> => {
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
              longitude: location.longitude
            }
          }
        }
      },
    });

    const text = response.text;
    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    
    const sources: GroundingSource[] = groundingChunks
      .filter(chunk => chunk.maps?.uri && chunk.maps?.title)
      .map(chunk => ({
        uri: chunk.maps.uri!,
        title: chunk.maps.title!,
      }));

    return { text, sources };

  } catch (error) {
    console.error("Error getting maps grounded response:", error);
    return { text: "Sorry, I encountered an error while fetching map data. Please try again later.", sources: [] };
  }
};
