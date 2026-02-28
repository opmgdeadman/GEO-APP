import { GoogleGenAI } from "@google/genai";

// Initialize the Gemini API client
// The API key is injected by the environment
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export interface GeoAnalysisResult {
  score: number;
  summary: string;
  strengths: string[];
  weaknesses: string[];
  suggestions: string[];
  keywords: string[];
}

export async function analyzeContentForGeo(content: string, targetTopic: string): Promise<GeoAnalysisResult> {
  try {
    const model = "gemini-2.5-flash";
    const prompt = `
      You are an expert in Generative Engine Optimization (GEO). Your task is to analyze the following content 
      to determine how well it might perform in AI-generated search results (like Google's AI Overviews, 
      ChatGPT, or Gemini) for the topic: "${targetTopic}".

      Analyze based on these GEO principles:
      1. Authority & Citations: Does it reference credible sources?
      2. Structure: Is it easy for an LLM to parse (headers, lists)?
      3. Directness: Does it answer questions directly?
      4. Comprehensive: Does it cover the topic depth?

      Return a JSON object with the following structure:
      {
        "score": number (0-100),
        "summary": "Brief overall assessment",
        "strengths": ["point 1", "point 2"],
        "weaknesses": ["point 1", "point 2"],
        "suggestions": ["actionable tip 1", "actionable tip 2"],
        "keywords": ["related entity 1", "related entity 2"]
      }

      Content to analyze:
      "${content.substring(0, 10000)}" // Limit content length
    `;

    const response = await ai.models.generateContent({
      model: model,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");
    
    return JSON.parse(text) as GeoAnalysisResult;
  } catch (error) {
    console.error("Error analyzing content:", error);
    throw error;
  }
}
