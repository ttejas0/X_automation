import { GoogleGenAI } from "@google/genai";

export async function thinkingModleResponse(prompt) {
  const ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_API_KEY });
  const response = await ai.models.generateContent({
    model: "gemini-2.5-pro-exp-03-25",
    contents: prompt,
  });
  const responseText = response.text;
  const cleanText = responseText
    .replace(/\n/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  return cleanText;
}
export async function normalModleResponse(prompt) {
  const ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_API_KEY });
  const response = await ai.models.generateContent({
    model: "gemini-2.0-flash",
    contents: prompt,
  });
  const responseText = response.text;
  const cleanText = responseText
    .replace(/\n/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  return cleanText;
}
