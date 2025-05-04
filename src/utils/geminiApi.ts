
import { GoogleGenerativeAI } from '@google/generative-ai';
import ReactMarkdown from 'react-markdown';

// Initialize the Google Generative AI with the API key
const genAI = new GoogleGenerativeAI('AIzaSyB6RHAgIkXqpRaOAjm8i-U4YqLyHT5BmLE');
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro' }); // Updated to the latest model

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

export const generateFollowUpQuestions = async (currentQuestion: string, currentAnswer: string): Promise<string[]> => {
  try {
    const followUpPrompt = `
      Based on this optometry question and answer:
      
      Question: ${currentQuestion}
      
      Answer: ${currentAnswer}
      
      Generate 3 related follow-up optometry questions that would help the student learn more about this topic.
      Only generate questions about optometry topics. Return them as a simple list without numbering or bullets.
    `;
    
    const result = await model.generateContent(followUpPrompt);
    const response = result.response.text();
    
    // Split the text into an array of questions
    const questions = response
      .split('\n')
      .map(q => q.trim())
      .filter(q => q.length > 0 && q.endsWith('?'));
    
    return questions.slice(0, 3); // Ensure we only return up to 3 questions
  } catch (error) {
    console.error('Error generating follow-up questions:', error);
    return [
      'What are the most common refractive errors in optometry?',
      'How do contact lenses differ from eyeglasses in visual correction?',
      'What are the signs and symptoms of glaucoma?'
    ];
  }
};
