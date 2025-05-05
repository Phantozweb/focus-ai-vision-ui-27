
import { genAI, generationConfig, safetySettings } from './config';

// Function to generate follow-up questions
export const generateFollowUpQuestions = async (
  question: string,
  answer: string
): Promise<string[]> => {
  try {
    // Prepare a prompt for generating follow-up questions
    const prompt = `Based on this optometry question: "${question.substring(0, 200)}..." 
    and its answer, generate 3 follow-up questions that would be useful for students.
    Make each question concise (under 10 words if possible).
    Format the response as a simple list with each question on a new line.`;
    
    const model = genAI.getGenerativeModel({ 
      model: "gemini-pro",
      generationConfig: {
        ...generationConfig,
        maxOutputTokens: 256, // Lower token count for follow-up questions
      },
      safetySettings,
    });
    
    const result = await model.generateContent(prompt);
    const text = result.response.text();
    
    // Parse the questions from the response
    const questions = text
      .split('\n')
      .filter(line => line.trim().length > 0)
      .map(line => line.replace(/^[0-9-.*]\s*/, '').trim())
      .filter(q => q.length > 0)
      .slice(0, 3); // Ensure we only take up to 3 questions
    
    return questions;
  } catch (error) {
    console.error("Error generating follow-up questions:", error);
    return [];
  }
};
