import { thinkingModleResponse } from "../geminiModel.js";
import { evaluationBasedRegenerationPrompt } from "./prompts.js";
import { parseLLMOutput } from "./parseLLM.js";

export async function evaluationAndRegeneration(
  researchData,
  evaluatedTweets,
  tweets
) {
  const { overall_average_ratings } = evaluatedTweets;
  const {
    "Grammatical Accuracy": grammaticalAccuracy,
    Readability: readability,
    "Engagement Potential": engagementPotential,
    "Quality & Insight": qualityInsight,
    "Factual Accuracy": factualAccuracy,
  } = overall_average_ratings;

  if (
    grammaticalAccuracy < 9 ||
    readability < 9 ||
    engagementPotential < 9 ||
    qualityInsight < 9 ||
    factualAccuracy < 9
  ) {
    // Regenerate tweets
    const prompt = evaluationBasedRegenerationPrompt(
      evaluatedTweets,
      researchData
    );
    const regeneratedTweets = await thinkingModleResponse(prompt);
    const formattedRegeneratedTweets = await parseLLMOutput(regeneratedTweets);
    return formattedRegeneratedTweets;
  } else {
    return tweets;
  }
}
