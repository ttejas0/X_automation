import { thinkingModleResponse } from "../services/geminiModel.js";
import {
  tweetEvaluationPrompt,
  tweetPrompt,
} from "../services/functions/prompts.js";
import { parseLLMOutput } from "../services/functions/parseLLM.js";
import { evaluationAndRegeneration } from "../services/functions/evaluationAndRegeneration.js";

export const generateTweets = async (req, res) => {
  try {
    const { number, researchData } = req.body;

    if (!number || !researchData) {
      return res
        .status(400)
        .json({ error: "Both number and researchData are required" });
    }

    const mainTweetGenerationPrompt = tweetPrompt(number, researchData);
    const responseText = await thinkingModleResponse(mainTweetGenerationPrompt); // use the corrected function name
    // Parse LLM output from string to JSON
    const tweets = await parseLLMOutput(responseText);

    const evaluationPrompt = tweetEvaluationPrompt(tweets, researchData);
    const evaluatedResponseText = await thinkingModleResponse(evaluationPrompt);
    // Parse LLM output from string to JSON
    const evaluatedTweets = await parseLLMOutput(evaluatedResponseText);

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

export const uploadTweets = async (req, res) => {
  try {
    const { tweets, researchData, number } = req.body;
    const evaluationPrompt = tweetEvaluationPrompt(
      tweets,
      researchData,
      number
    );
    const evaluatedResponseText = await thinkingModleResponse(evaluationPrompt);
    // Parse LLM output from string to JSON
    const evaluatedTweets = await parseLLMOutput(evaluatedResponseText);
    const finalTweets = await evaluationAndRegeneration(
      researchData,
      evaluatedTweets,
      tweets
    );
    res.status(200).json({
      success: true,
      message: "Tweets generated",
      finalTweets,
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({
      error: "Failed to generate tweets",
      details: error.message,
    });
  }
};
