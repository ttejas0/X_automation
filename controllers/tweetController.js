import {
  tweetEvaluationPrompt,
  tweetPrompt,
} from "../prompts/standardPrompts.js";
import { parseLLMOutput } from "../work_flows/tweet_gen_standard/parseLLM.js";
import { evaluationAndRegeneration } from "../work_flows/tweet_gen_standard/evaluationAndRegeneration.js";
import { uploadToGoogleSheets } from "../services/googleSheets/uploadToGoogleSheets.js";
import { TwitterApi } from "twitter-api-v2";
import { thinkingModleResponse } from "../services/aiModels/geminiModel.js";

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

  const client = new TwitterApi({
    appKey: apiKey,
    appSecret: apiSecret,
    accessToken,
    accessSecret: accessTokenSecret,
  });
  const rwClient = client.readWrite;

  try {
    // 2. Extract payload
    const { text, mediaUrls } = req.body;
    if (!text || typeof text !== "string") {
      return res.status(400).json({ error: "Missing or invalid `text` field" });
    }

    let mediaIds = [];

    if (Array.isArray(mediaUrls) && mediaUrls.length > 0) {
      const uploadPromises = mediaUrls.map(async (url) => {
        const resp = await fetch(url);
        if (!resp.ok) throw new Error(`Failed to fetch media from ${url}`);

        const buffer = Buffer.from(await resp.arrayBuffer());

        // Try to get content-type from headers, fallback to extension-based guess
        let contentType = resp.headers.get("content-type");
        if (!contentType) {
          if (url.endsWith(".gif")) contentType = "image/gif";
          else if (url.endsWith(".png")) contentType = "image/png";
          else if (url.endsWith(".jpg") || url.endsWith(".jpeg"))
            contentType = "image/jpeg";
          else contentType = "application/octet-stream"; // fallback
        }

        const mediaId = await rwClient.v1.uploadMedia(buffer, {
          type: contentType,
        });
        return mediaId;
      });

      mediaIds = await Promise.all(uploadPromises);
    }

    // 4. Post the tweet
    let tweetResponse;
    if (mediaIds.length > 0) {
      tweetResponse = await rwClient.v2.tweet({
        text,
        media: { media_ids: mediaIds },
      });
    } else {
      tweetResponse = await rwClient.v2.tweet(text);
    }

    // 5. Return the posted tweet payload
    return res.status(201).json(tweetResponse);
  } catch (error) {
    console.error("Error posting tweet:", error);
    return res.status(500).json({ error: error.message });
  }
};
