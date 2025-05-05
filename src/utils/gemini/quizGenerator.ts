
import { genAI, generationConfig, safetySettings } from './config';

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
      model: "gemini-pro",
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
