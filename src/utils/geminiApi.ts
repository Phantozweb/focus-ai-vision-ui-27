
import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize the Google Generative AI with the API key
const genAI = new GoogleGenerativeAI('AIzaSyB6RHAgIkXqpRaOAjm8i-U4YqLyHT5BmLE');
const model = genAI.getGenerativeModel({ model: 'gemini-1.0-pro' }); // Updated model name

export const generateGeminiResponse = async (prompt: string): Promise<string> => {
  try {
    const result = await model.generateContent(prompt);
    const response = result.response;
    return response.text();
  } catch (error) {
    console.error('Error generating content with Gemini:', error);
    return 'Sorry, I encountered an error while generating a response. Please try again.';
  }
};
