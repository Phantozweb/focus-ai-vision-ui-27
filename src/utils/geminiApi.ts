
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai';
import { config } from '@/config/api';

// Initialize the Gemini API client with your API key
const genAI = new GoogleGenerativeAI(config.geminiApiKey);

// Set up options for generation to avoid harmful content
const generationConfig = {
  temperature: 0.7,
  topK: 40,
  topP: 0.95,
  maxOutputTokens: 2048,
};

const safetySettings = [
  {
    category: HarmCategory.HARM_CATEGORY_HARASSMENT,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
];

// Function to check if API key is valid
export const checkApiKey = async (): Promise<boolean> => {
  try {
    // Simple test prompt to check if API is working
    const model = genAI.getGenerativeModel({ model: "gemini-1.0-pro" });
    await model.generateContent("Test");
    return true;
  } catch (error) {
    console.error("API key validation error:", error);
    return false;
  }
};

// Function to generate a response with better error handling for large responses
export const generateGeminiResponse = async (prompt: string): Promise<string> => {
  try {
    // Split large prompts if needed to avoid exceeding token limits
    const maxPromptLength = 10000;
    const promptToUse = prompt.length > maxPromptLength 
      ? prompt.substring(0, maxPromptLength) + "..."
      : prompt;
    
    // Get the Gemini model with our configuration
    const model = genAI.getGenerativeModel({ 
      model: "gemini-1.0-pro",
      generationConfig,
      safetySettings,
    });

    // Generate the response
    const result = await model.generateContent(promptToUse);
    const response = result.response;
    const text = response.text();
    
    return text;
  } catch (error: any) {
    console.error("Error generating Gemini response:", error);
    
    // Check for specific error types
    if (error.message && error.message.includes("too much response")) {
      return "I apologize, but the response was too large to process. Could you try asking a more specific question?";
    }
    
    throw new Error(`Failed to generate response: ${error.message || "Unknown error"}`);
  }
};

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
      model: "gemini-1.0-pro",
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

// Create a type for quiz difficulty levels
export type QuizDifficulty = "easy" | "medium" | "hard";

// Function to generate quiz with answers for case studies
export const generateQuizWithAnswers = async (
  topic: string,
  numberOfQuestions: number = 5,
  difficulty: QuizDifficulty = "medium"
): Promise<any[]> => {
  try {
    const prompt = `Create a ${difficulty} difficulty quiz with ${numberOfQuestions} multiple-choice questions about ${topic} for optometry students.
    
    For each question:
    1. Write a clear question about ${topic}
    2. Provide 4 answer options labeled 0-3
    3. Indicate which option is correct (as a number 0-3)
    4. Include a brief explanation of why the answer is correct
    
    Format your response as a structured list that can be easily parsed into JSON. The format should be:
    
    Question 1: [question text]
    Options:
    0. [option text]
    1. [option text]
    2. [option text]
    3. [option text]
    CorrectAnswer: [number 0-3]
    Explanation: [explanation text]
    
    Question 2: ...`;
    
    const model = genAI.getGenerativeModel({ 
      model: "gemini-1.0-pro",
      generationConfig: {
        ...generationConfig,
        temperature: 0.5, // More deterministic for factual content
      },
      safetySettings,
    });
    
    const result = await model.generateContent(prompt);
    const text = result.response.text();
    
    // Parse the quiz questions from the response
    const questionBlocks = text.split(/Question \d+:/g).filter(block => block.trim().length > 0);
    
    const questions = questionBlocks.map(block => {
      try {
        // Extract the question text
        const questionText = block.trim().split('\n')[0].trim();
        
        // Extract the options
        const optionsBlock = block.substring(block.indexOf("Options:") + 8, block.indexOf("CorrectAnswer:")).trim();
        const options = optionsBlock.split(/\d+\.\s+/).filter(opt => opt.trim().length > 0).map(opt => opt.trim());
        
        // Extract the correct answer
        const correctAnswerMatch = block.match(/CorrectAnswer:\s*(\d+)/);
        const correctAnswer = correctAnswerMatch ? parseInt(correctAnswerMatch[1]) : 0;
        
        // Extract the explanation
        const explanationMatch = block.match(/Explanation:\s*([\s\S]+?)(?=(?:Question \d+:|$))/);
        const explanation = explanationMatch ? explanationMatch[1].trim() : "No explanation provided";
        
        return {
          question: questionText,
          options,
          correctAnswer,
          explanation
        };
      } catch (parseError) {
        console.error("Error parsing quiz question:", parseError);
        return null;
      }
    }).filter(q => q !== null);
    
    return questions;
  } catch (error) {
    console.error("Error generating quiz:", error);
    return [];
  }
};
