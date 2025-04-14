export function tweetPrompt(number, researchData) {
  const prompt = `Please generate ${number} distinct tweets based on the provided ${researchData}. Each tweet must be strictly under 270 characters. Structure each tweet using approximately 3 sentences to ensure it forms a complete and valuable piece of content:
  
  Sentence 1: Provide brief context and frame the point from a personal perspective, naturally conveying what you found noteworthy, surprising, or significant about this specific piece of information (avoid starting with generic phrases like 'Interesting finding:' or 'Key takeaway:').
  
  Sentences 2 & 3: Deliver the crucial statistic, finding, or core information, along with its immediate implication or significance. Ensure the final sentence provides a clean conclusion for that specific point, avoiding an abrupt cutoff.
  
  Focus on extracting the most compelling insights. Craft these tweets with an authentic voice reflecting genuine engagement with or reaction to the research findings, rather than using overly formal or generic language. Ensure accuracy, use accessible language, and cover a variety of points from the data. Your final output must be a single JSON object where keys are sequentially named 'tweet 1', 'tweet 2', ..., 'tweet N' (matching the requested ${number}) and the corresponding value for each key is the generated tweet text string.`;

  return prompt;
}
export function tweetEvaluationPrompt(researchData, tweets) {
  const prompt = `Act as an expert Social Media Content Analyst and Fact-Checker. Your task is to evaluate a set of tweets based on the provided research data. You will be given two inputs: Research Data, provided in ${researchData}, which serves as the ground truth for factual accuracy checks, and Tweet JSON Data, provided in ${tweets}, a JSON object containing the tweets to be evaluated with keys like 'tweet 1', 'tweet 2', etc. Parse the Tweet JSON Data to extract the tweet texts from these keys. For each tweet, assign ratings from 1 to 10 for the following metrics: Grammatical Accuracy (1 for numerous significant errors hindering understanding, 10 for flawless grammar, punctuation, and spelling), Readability (1 for very dense, jargon-filled, difficult text, 10 for clear, concise, flowing text that retains technical substance), Engagement Potential (1 for dry, uninteresting content, 10 for compelling, thought-provoking content likely to generate interaction), Quality & Insight (1 for superficial content missing research nuances, 10 for high-value, insightful summaries of the research), and Factual Accuracy (1 for significant errors misrepresenting the research, 10 for perfect alignment with the research data, evaluated strictly based on ${researchData}). If the Factual Accuracy rating is less than 9, include brief notes explaining the discrepancies with the Research Data. Calculate the overall average ratings for each metric across all tweets. Provide at least three actionable suggestions for improving the tweets, focusing on common weaknesses in clarity, engagement, or adherence to the research. Structure the output as a JSON object with the following keys: 'overall_average_ratings' (a dictionary with average scores for each metric), 'tweets' (a list of dictionaries, each containing 'tweet_id' (the key from the input JSON), 'tweet_text', 'ratings' (a dictionary with the five metric ratings), 'factual_accuracy_notes' (if applicable), and 'suggestion' (a specific actionable suggestion for that tweet)), and 'improvement_suggestions' (a list of at least three actionable suggestions addressing common weaknesses across all tweets). Ensure the output JSON is correctly formatted and includes all required fields.`;

  return prompt;
}

export function evaluationBasedRegenerationPrompt(
  researchData,
  evaluatedTweets,
  number
) {
  const prompt = `Please generate the tweets based on ${evaluatedTweets} and ${researchData}. Each tweet must be strictly under 270 characters. Structure each tweet using approximately 3 sentences to ensure it forms a complete and valuable piece of content:
  Sentence 1: Provide brief context and frame the point from a personal perspective, naturally conveying what you found noteworthy, surprising, or significant about this specific piece of information (avoid starting with generic phrases like 'Interesting finding:' or 'Key takeaway:').
  
  Sentences 2 & 3: Deliver the crucial statistic, finding, or core information, along with its immediate implication or significance. Ensure the final sentence provides a clean conclusion for that specific point, avoiding an abrupt cutoff.
  
  Focus on extracting the most compelling insights. Craft these tweets with an authentic voice reflecting genuine engagement with or reaction to the research findings, rather than using overly formal or generic language. Ensure accuracy, use accessible language, and cover a variety of points from the data. Your final output must be a single JSON object where keys are sequentially named 'tweet 1', 'tweet 2', ..., 'tweet N' (matching the requested ${number}) and the corresponding value for each key is the generated tweet text string.`;

  return prompt;
}
