export function parseLLMOutput(responseText) {
  try {
    const formatText = responseText.replace(/```json|```/g, "").trim();
    const result = JSON.parse(formatText);
    return result;
  } catch (error) {
    console.log("failed to parse LLM output", responseText);
    return res.status(500).json({
      error: "LLM response was not valid JSON",
      details: parseError.message,
      raw: responseText,
    });
  }
}
