import { evaluationBasedRegenerationPrompt } from "../../prompts/standardPrompts.js";
import { parseLLMOutput } from "./parseLLM.js";
import { thinkingModleResponse } from "../../services/aiModels/geminiModel.js";

export async function evaluationAndRegeneration(
  researchData,
  evaluatedTweets,
  tweets
) {
  const { overall_average_ratings } = evaluatedTweets;
  const {
    Readability: readability,
    "Engagement Potential": engagementPotential,
    "Quality & Insight": qualityInsight,
  } = overall_average_ratings;

  if (readability < 8 || engagementPotential < 8 || qualityInsight < 8) {
    // Regenerate tweets
    const prompt = evaluationBasedRegenerationPrompt(
      evaluatedTweets,
      tweets,
      researchData
    );
    const regeneratedTweets = await thinkingModleResponse(prompt);
    const formattedRegeneratedTweets = await parseLLMOutput(regeneratedTweets);
    return formattedRegeneratedTweets;
  } else {
    return tweets;
  }
}
