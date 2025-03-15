export const config = {
  GEMINI_API_KEY: '<YOUR_GEMINI_API_KEY>',
  MODEL_CONFIG: {
    model: "gemini-2.0-flash",
    generationConfig: {
      temperature: 1,
      topP: 0.95,
      topK: 40,
      maxOutputTokens: 8192,
      responseMimeType: "text/plain"
    }
  }
}; 