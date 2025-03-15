import { GoogleGenerativeAI } from '@google/generative-ai';
import { config } from './config.js';

const genAI = new GoogleGenerativeAI(config.GEMINI_API_KEY);

export async function performGeminiVisionOCR(imageData) {
  try {
    console.log('Starting Gemini Vision OCR');
    
    const model = genAI.getGenerativeModel({
      model: "gemini-2.0-flash",
      generationConfig: {
        temperature: 0.1,
        maxOutputTokens: 8192,
      }
    });
    
    // Extract just the text
    const result = await model.generateContent({
      contents: [{
        role: "user",
        parts: [
          {
            inlineData: {
              mimeType: "image/jpeg",
              data: imageData
            }
          },
          {text: "Extract all text from this image. Return only the extracted text without any additional commentary."}
        ]
      }]
    });

    const response = await result.response;
    const extractedText = response.text().trim();
    
    console.log('Extracted text:', extractedText); // Debug log
    return extractedText;
    
  } catch (error) {
    console.error('Gemini Vision API Error:', error);
    throw error;
  }
}

export async function translateText(text, fromLanguage) {
  try {
    const model = genAI.getGenerativeModel({
      model: "gemini-2.0-flash",
      generationConfig: {
        temperature: 1,
        topP: 0.95,
        topK: 40,
        maxOutputTokens: 8192,
        responseMimeType: "text/plain",
      }
    });

    const translationSession = model.startChat();
    const translationResult = await translationSession.sendMessage(
      `Translate this text from ${fromLanguage} to English: "${text}"`
    );
    return await translationResult.response.text();
  } catch (error) {
    console.error('Translation Error:', error);
    throw error;
  }
} 