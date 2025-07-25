
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { GEMINI_MODEL_TEXT, IMAGEN_MODEL } from '../constants';
import { GeminiResponse } from '../types';

let ai: GoogleGenAI;

const getAi = (): GoogleGenAI => {
  if (!ai) {
    if (!process.env.API_KEY) {
      console.error("API_KEY environment variable not set.");
      throw new Error("API_KEY environment variable not set. Please ensure it is configured.");
    }
    ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  }
  return ai;
};

const parseGeminiJsonResponse = (responseText: string): GeminiResponse | null => {
  let jsonStr = responseText.trim();
  const fenceRegex = /^```(\w*)?\s*\n?(.*?)\n?\s*```$/s; // Matches ```json ... ``` or ``` ... ```
  const match = jsonStr.match(fenceRegex);
  if (match && match[2]) {
    jsonStr = match[2].trim(); 
  }

  try {
    const parsedData = JSON.parse(jsonStr);
    // Basic validation of the parsed structure
    if (parsedData && 
        typeof parsedData.new_description === 'string' && 
        typeof parsedData.image_prompt === 'string' && 
        Array.isArray(parsedData.player_options)) {
      return parsedData as GeminiResponse;
    }
    console.error("Parsed JSON does not match expected GeminiResponse structure:", parsedData);
    return null;
  } catch (e) {
    console.error("Failed to parse JSON response from Gemini:", e, "Raw response was:", jsonStr);
    return null;
  }
};

export const fetchStoryUpdate = async (prompt: string): Promise<GeminiResponse | null> => {
  try {
    const genAI = getAi();
    const response: GenerateContentResponse = await genAI.models.generateContent({
      model: GEMINI_MODEL_TEXT,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        // Omitting thinkingConfig to use default (enabled) for higher quality story
      },
    });

    const textResponse = response.text;
    if (!textResponse) {
      console.error("No text response from Gemini");
      return null;
    }
    return parseGeminiJsonResponse(textResponse);
  } catch (error) {
    console.error("Error fetching story update from Gemini:", error);
    if (error instanceof Error && error.message.includes("API_KEY")) {
        throw error; // Re-throw to be caught by UI
    }
    return null;
  }
};

export const generateSceneImage = async (prompt: string): Promise<string | null> => {
  try {
    const genAI = getAi();
    // Sanitize prompt for Imagen: keep it concise and descriptive.
    const imageGenPrompt = `Photorealistic fantasy art: ${prompt.substring(0, 200)}.`; // Max length for safety

    const response = await genAI.models.generateImages({
      model: IMAGEN_MODEL,
      prompt: imageGenPrompt,
      config: { numberOfImages: 1, outputMimeType: "image/jpeg" },
    });

    if (response.generatedImages && response.generatedImages.length > 0 && response.generatedImages[0].image.imageBytes) {
      const base64ImageBytes: string = response.generatedImages[0].image.imageBytes;
      return `data:image/jpeg;base64,${base64ImageBytes}`;
    }
    console.error("No image generated or image data missing from Imagen response:", response);
    return null;
  } catch (error) {
    console.error("Error generating image with Imagen:", error);
    if (error instanceof Error && error.message.includes("API_KEY")) {
        throw error; // Re-throw to be caught by UI
    }
    return null;
  }
};
