import { GoogleGenAI } from "@google/genai";

export const generateTweets = async (req, res) => {
  try {
    const { prompt } = req.body; // Get prompt from request body
    console.log("Received request:", req.body);

    if (!prompt) {
      return res.status(400).json({ error: "Prompt is required" });
    }

    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    const response = await ai.models.generateContent({
      model: "gemini-2.5-pro-exp-03-25",
      contents: prompt,
    });

    res.send({
      success: true,
      response: response.text, // send the text of the response
    });
  } catch (error) {
    console.error("Error:", error);
    res
      .status(500)
      .json({ error: "Failed to generate response", details: error.message });
  }
};
export const uploadTweets = (req, res) => {
  res.send("Upload tweets");
};
