export function parseLLMOutput(responseText) {
  if (typeof responseText !== "string" || responseText.trim() === "") {
    console.error("Input Error: responseText must be a non-empty string.");
    return null;
  }

  const trimmedResponse = responseText.trim();
  let jsonString = null;

  // --- Strategy 1: Attempt direct parse (Optimistic case - LLM followed instructions) ---
  try {
    // Basic check: does it start/end like a JSON object/array?
    if (
      (trimmedResponse.startsWith("{") && trimmedResponse.endsWith("}")) ||
      (trimmedResponse.startsWith("[") && trimmedResponse.endsWith("]"))
    ) {
      // If it looks like JSON, try parsing it directly.
      return JSON.parse(trimmedResponse);
    }
    // If not, don't attempt direct parse, fall through to other strategies.
    console.warn(
      "Input doesn't start/end like JSON. Skipping direct parse attempt."
    );
  } catch (e) {
    // Direct parse failed even though it looked like JSON. Log warning and proceed.
    console.warn(
      "Direct parse failed even though input seemed like JSON. Error:",
      e.message
    );
  }

  // --- Strategy 2: Look for JSON within markdown code fences (Common failure mode) ---
  // Regex captures content within ```json ... ``` or ``` ... ```
  const codeBlockRegex = /```(?:json)?\s*([\s\S]*?)\s*```/;
  const match = trimmedResponse.match(codeBlockRegex);

  if (match && match[1]) {
    jsonString = match[1].trim();
    // Check if the extracted content looks like JSON before parsing
    if (
      (jsonString.startsWith("{") && jsonString.endsWith("}")) ||
      (jsonString.startsWith("[") && jsonString.endsWith("]"))
    ) {
      try {
        // Attempt to parse the content extracted from the code block
        console.log("Attempting parse from extracted code block content.");
        return JSON.parse(jsonString);
      } catch (e) {
        console.warn(
          "Parsing content within code block failed. Error:",
          e.message
        );
        // Log the problematic string for debugging if needed
        // console.error("Failed fenced content:", jsonString);
        jsonString = null; // Reset jsonString to ensure Strategy 3 runs if needed
      }
    } else {
      console.warn(
        "Content within code block doesn't look like JSON. Extracted:",
        jsonString
      );
      jsonString = null; // Reset jsonString
    }
  }

  // --- Strategy 3: Find the first '{' or '[' and the last '}' or ']' (Last Resort) ---
  // This runs if direct parse failed AND no parsable fenced block was found.
  if (jsonString === null) {
    console.log("Attempting last resort: finding first/last JSON delimiters.");
    let startIndex = -1;
    const firstBrace = trimmedResponse.indexOf("{");
    const firstBracket = trimmedResponse.indexOf("[");

    // Determine the start index
    if (
      firstBrace !== -1 &&
      (firstBracket === -1 || firstBrace < firstBracket)
    ) {
      startIndex = firstBrace;
    } else if (firstBracket !== -1) {
      startIndex = firstBracket;
    }

    if (startIndex !== -1) {
      let endIndex = -1;
      const lastBrace = trimmedResponse.lastIndexOf("}");
      const lastBracket = trimmedResponse.lastIndexOf("]");

      // Determine the end index, prefer matching delimiter type
      if (startIndex === firstBrace && lastBrace > startIndex) {
        endIndex = lastBrace;
      } else if (startIndex === firstBracket && lastBracket > startIndex) {
        endIndex = lastBracket;
      } else {
        // Fallback: take the last closing delimiter found after start
        endIndex = Math.max(lastBrace, lastBracket);
      }

      if (endIndex > startIndex) {
        jsonString = trimmedResponse.substring(startIndex, endIndex + 1);
        try {
          // Final attempt to parse the extracted substring
          return JSON.parse(jsonString);
        } catch (parseError) {
          console.error("Final extraction parse failed:", parseError.message);
          // Log context for debugging
          console.error(
            "Original Response Text (first 500 chars):",
            responseText.substring(0, 500) +
              (responseText.length > 500 ? "..." : "")
          );
          console.error("Attempted Extracted String:", jsonString);
          return null; // Final failure
        }
      } else {
        console.warn(
          "Could not find a valid last delimiter after the first one."
        );
      }
    } else {
      console.warn("Could not find any starting JSON delimiter '{' or '['.");
    }
  }

  // If none of the strategies yielded parsable JSON
  console.error("Could not find or parse valid JSON using any strategy.");
  console.error(
    "Original Response Text (first 500 chars):",
    responseText.substring(0, 500) + (responseText.length > 500 ? "..." : "")
  );
  return null; // Indicate failure
}
