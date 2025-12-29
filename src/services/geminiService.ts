
import { GoogleGenAI } from "@google/genai";

export const generateBio = async (
    name: string, 
    job: string, 
    company: string, 
    tone: string = "professional"
): Promise<string> => {
    try {
        // Initialize the client directly with the API key from process.env as per guidelines
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        
        const prompt = `Write a short, engaging professional bio (max 40 words) for a digital business card. 
        Name: ${name}
        Job: ${job}
        Company: ${company}
        Tone: ${tone}
        Return only the bio text.`;

        // Using gemini-3-flash-preview for basic text tasks (bio generation)
        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: prompt,
        });

        // Directly accessing the .text property of the response
        return response.text || "";
    } catch (error) {
        console.error("Gemini API Error:", error);
        throw error;
    }
};
