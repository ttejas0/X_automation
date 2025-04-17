import { thinkingModleResponse } from "../services/geminiModel.js";
import {
  tweetEvaluationPrompt,
  tweetPrompt,
} from "../services/functions/prompts.js";
import { parseLLMOutput } from "../services/functions/parseLLM.js";
import { evaluationAndRegeneration } from "../services/functions/evaluationAndRegeneration.js";
import { uploadToGoogleSheets } from "../services/googleSheets/uploadToGoogleSheets.js";

export const generateTweets = async (req, res) => {
  try {
    const { researchData } = req.body;

    if (!researchData) {
      return res
        .status(400)
        .json({ error: "Both number and researchData are required" });
    }

    const mainTweetResponseText = await thinkingModleResponse(
      tweetPrompt(researchData)
    );
    // Parse LLM output from string to JSON
    const tweets = await parseLLMOutput(mainTweetResponseText);

    const evaluatedResponseText = await thinkingModleResponse(
      tweetEvaluationPrompt(tweets, researchData)
    );
    // Parse LLM output from string to JSON
    const evaluatedTweets = await parseLLMOutput(evaluatedResponseText);

    const finalTweets = await evaluationAndRegeneration(
      researchData,
      evaluatedTweets,
      tweets
    );

    // const evaluateFinalTweetsReasponse = await thinkingModleResponse(
    //   tweetEvaluationPrompt(finalTweets, researchData)
    // );
    // const finalEvaluatedTweets = await parseLLMOutput(
    //   evaluateFinalTweetsReasponse
    // );

    await uploadToGoogleSheets(finalTweets);

    res.status(200).json({
      success: true,
      message: "Tweets generated",
      tweets,
      evaluatedTweets,
      finalTweets,
      // finalEvaluatedTweets,
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({
      error: "Failed to generate tweets",
      details: error.message,
    });
  }
};

export const uploadTweets = async (req, res) => {};
