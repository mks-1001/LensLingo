import { GoogleGenerativeAI } from '@google/generative-ai';
import { config } from './config.js';

const genAI = new GoogleGenerativeAI(config.GEMINI_API_KEY);

export async function detectAndTranslate(text) {
  try {
    const model = genAI.getGenerativeModel({
      model: "gemini-2.0-flash",
      generationConfig: {
        temperature: 0.1, // Lower temperature for more accurate results
        maxOutputTokens: 8192,
      }
    });

    const prompt = `Analyze this text and respond with ONLY a raw JSON object (no markdown, no code blocks) in this exact format:
{"detectedLanguage": "language name", "translation": "English translation if needed"}
If the text is already in English, set translation to null.

Text: "${text}"`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const responseText = response.text().trim()
      // Remove any markdown code block markers if present
      .replace(/```json\n?/g, '')
      .replace(/```\n?/g, '')
      .trim();
    
    try {
      const jsonResponse = JSON.parse(responseText);
      return {
        detectedLanguage: jsonResponse.detectedLanguage,
        translatedText: jsonResponse.translation || text
      };
    } catch (parseError) {
      console.error('JSON parse error:', parseError, 'Response was:', responseText);
      throw new Error('Invalid response format from translation service');
    }
  } catch (error) {
    console.error('Translation error:', error);
    throw error;
  }
} 