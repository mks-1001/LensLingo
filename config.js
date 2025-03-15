export const config = {
  GEMINI_API_KEY: 'AIzaSyCXJLLAQC-07E6AgLkPiPydHSLMkwiy2z8',
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