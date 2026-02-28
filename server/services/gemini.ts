import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export interface GeminiAnalysis {
  strengths: string[];
  weaknesses: string[];
  suggestions: string[];
}

export async function getGeminiAnalysis(content: string, topic: string): Promise<GeminiAnalysis> {
  try {
    const model = "gemini-2.5-flash";
    const prompt = `
      You are an expert in Generative Engine Optimization (GEO). Analyze the content for the topic: "${topic}".
      
      Focus ONLY on qualitative feedback. Do not provide a score.
      
      Return a JSON object with:
      {
        "strengths": ["point 1", "point 2"],
        "weaknesses": ["point 1", "point 2"],
        "suggestions": ["actionable tip 1", "actionable tip 2"]
      }

      Content:
      "${content.substring(0, 10000)}"
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
    
    return JSON.parse(text) as GeminiAnalysis;
  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    // Fallback if AI fails
    return {
      strengths: ["Content analysis unavailable"],
      weaknesses: ["Could not connect to AI service"],
      suggestions: ["Please try again later"]
    };
  }
}

export async function rewriteContent(content: string, topic: string, suggestions: string[]): Promise<string> {
  try {
    const model = "gemini-2.5-flash";
    const prompt = `
      Rewrite the following content to rank better for "${topic}".
      Apply these improvements:
      ${suggestions.map(s => `- ${s}`).join('\n')}
      
      Content:
      "${content.substring(0, 10000)}"
    `;

    const response = await ai.models.generateContent({
      model: model,
      contents: prompt,
    });

    return response.text || "Failed to rewrite content.";
  } catch (error) {
    console.error("Gemini Rewrite Error:", error);
    throw error;
  }
}
