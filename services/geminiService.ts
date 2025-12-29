
import { GoogleGenAI } from "@google/genai";

export const generateBio = async (
    name: string, 
    job: string, 
    company: string, 
    tone: string = "professional"
): Promise<string> => {
    try {
        // Correct initialization using process.env.API_KEY directly as a named parameter
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const prompt = `Write a high-impact, professional bio (max 35 words) for a digital business card. 
        Name: ${name}
        Title: ${job}
        Company: ${company}
        Tone: ${tone}
        Return only the bio text.`;

        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: prompt,
        });

        // Use the .text property of the response
        return response.text || "";
    } catch (error) {
        console.error("Gemini Error:", error);
        throw error;
    }
};
