import {
  tweetEvaluationPrompt,
  tweetPrompt,
} from "../prompts/standardPrompts.js";
import { parseLLMOutput } from "../work_flows/tweet_gen_standard/parseLLM.js";
import { evaluationAndRegeneration } from "../work_flows/tweet_gen_standard/evaluationAndRegeneration.js";
import { uploadToGoogleSheets } from "../services/googleSheets/uploadToGoogleSheets.js";

import { thinkingModleResponse } from "../services/aiModels/geminiModel.js";
import { uploadToX } from "../work_flows/tweet_gen_standard/uploadToX.js";

export const generateTweets = async (req, res) => {
  try {
    const { researchData } = req.body;

    if (!researchData) {
      return res.status(400).json({ error: "researchData is required" });
    }

    // Respond immediately to avoid timeouts
    res.status(202).json({
      success: true,
      message: "Tweet generation started in background",
    });

    // Run in background
    setImmediate(async () => {
      try {
        console.log("🧠 Generating initial tweets...");
        const mainTweetResponseText = await thinkingModleResponse(
          tweetPrompt(researchData)
        );
        const tweets = await parseLLMOutput(mainTweetResponseText);
        console.log("📤 Generated Tweets:", tweets);

        console.log("🔍 Evaluating tweets...");
        const evaluatedResponseText = await thinkingModleResponse(
          tweetEvaluationPrompt(tweets, researchData)
        );
        const evaluatedTweets = await parseLLMOutput(evaluatedResponseText);
        console.log("📊 Evaluated Tweets:", evaluatedTweets);

        console.log("🔁 Refining tweets with evaluation...");
        const finalTweets = await evaluationAndRegeneration(
          researchData,
          evaluatedTweets,
          tweets
        );
        console.log("🎯 Final Refined Tweets:", finalTweets);

        await uploadToGoogleSheets(finalTweets);
        console.log("✅ Tweets uploaded to Google Sheets");
      } catch (innerErr) {
        console.error("❌ Background process failed:", innerErr.message);
      }
    });
  } catch (error) {
    console.error("❌ Request handler failed:", error.message);
    res.status(500).json({
      error: "Failed to start tweet generation",
      details: error.message,
    });
  }
};

export const uploadTweets = async (req, res) => {
  // 1. Load credentials

  const apiKey = process.env.TWITTER_API_KEY;
  const apiSecret = process.env.TWITTER_API_SECRET;
  const accessToken = process.env.TWITTER_ACCESS_TOKEN;
  const accessTokenSecret = process.env.TWITTER_ACCESS_TOKEN_SECRET;

  if (!apiKey || !apiSecret || !accessToken || !accessTokenSecret) {
    console.error("FATAL ERROR: Missing Twitter API credentials in .env");
    return res
      .status(500)
      .json({ error: "Twitter credentials not configured" });
  }
  // Extract payload
  const { text, mediaUrls } = req.body;
  try {
    const tweetResponse = await uploadToX(
      apiKey,
      apiSecret,
      accessToken,
      accessTokenSecret,
      text,
      mediaUrls
    );
    return res.status(201).json(tweetResponse);
  } catch (error) {
    console.error("Error posting tweet:", error);
    return res.status(500).json({ error: error.message });
  }
};
