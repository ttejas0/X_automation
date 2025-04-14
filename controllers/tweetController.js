import { modleResponse } from "../services/geminiModel.js";
import { tweetPrompt } from "../services/prompts.js";

export const generateTweets = async (req, res) => {
  try {
    const { number, researchData } = req.body;
    console.log("Received request:", req.body);

    if (!number || !researchData) {
      return res
        .status(400)
        .json({ error: "Both number and researchData are required" });
    }

    const prompt = tweetPrompt(number, researchData);
    const responseText = await modleResponse(prompt); // use the corrected function name

    // Parse LLM output from string to JSON
    let tweets;
    try {
      const formatText = responseText.replace(/```json|```/g, "").trim();
      tweets = JSON.parse(formatText);
    } catch (parseError) {
      console.error("Failed to parse LLM response as JSON:", responseText);
      return res.status(500).json({
        error: "LLM response was not valid JSON",
        details: parseError.message,
        raw: responseText,
      });
    }

    res.status(200).json({
      success: true,
      message: "Tweets generated",
      tweets,
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({
      error: "Failed to generate tweets",
      details: error.message,
    });
  }
};

export const uploadTweets = (req, res) => {
  res.send("Upload tweets");
};
