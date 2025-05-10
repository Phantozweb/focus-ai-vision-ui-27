
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
    4. Include a detailed explanation of why the answer is correct and why the other options are incorrect
    
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

// Type for analysis data
interface QuizAnalysisData {
  topic: string;
  difficulty: string;
  questions: any[];
  userAnswers: (number | null)[];
  score: {
    correct: number;
    total: number;
  };
}

// Function to generate quiz analysis
export const generateQuizAnalysis = async (data: QuizAnalysisData) => {
  try {
    // Create a list of questions with user answers for the prompt
    const questionsList = data.questions.map((q, idx) => {
      const userAnswer = data.userAnswers[idx];
      const isCorrect = userAnswer === q.correctAnswer;
      
      return `
Question: ${q.question}
User's answer: ${userAnswer !== null ? q.options[userAnswer] : "No answer"}
Correct answer: ${q.options[q.correctAnswer]}
Result: ${isCorrect ? "Correct" : "Incorrect"}
      `;
    }).join("\n");
    
    const prompt = `
You are an optometry education expert analyzing a student's quiz performance.

Topic: ${data.topic}
Difficulty: ${data.difficulty}
Score: ${data.score.correct}/${data.score.total} (${Math.round(data.score.correct / data.score.total * 100)}%)

Here are the questions and the student's answers:
${questionsList}

Based on this performance, provide:
1. A concise analysis (2-3 sentences) of the student's overall understanding of ${data.topic}
2. Identify 3-4 specific focus areas or concepts the student should review to improve their understanding
3. Format your analysis in markdown with clear sections

Your response should be educational, supportive, and specific to the student's performance pattern.
`;

    const model = genAI.getGenerativeModel({
      model: "gemini-pro",
      generationConfig: {
        ...generationConfig,
        temperature: 0.3,
      },
      safetySettings,
    });
    
    const result = await model.generateContent(prompt);
    const analysisText = result.response.text();
    
    // Extract focus areas from the analysis
    const focusAreaRegex = /(?:focus areas|areas to focus on|review|improve)[\s\S]*?(?:[-•*]\s*)([^\n]+)/gi;
    const focusAreas: string[] = [];
    let match;
    
    while ((match = focusAreaRegex.exec(analysisText)) !== null) {
      if (match[1]) {
        focusAreas.push(match[1].trim());
      }
    }
    
    return {
      summary: analysisText,
      focusAreas: focusAreas.length > 0 ? focusAreas : ["Review core concepts", "Practice more questions", "Study clinical applications"]
    };
  } catch (error) {
    console.error("Error generating quiz analysis:", error);
    return {
      summary: "We couldn't generate a detailed analysis of your performance. Keep practicing to improve your understanding of the topic.",
      focusAreas: ["Review core concepts", "Practice more questions", "Study clinical applications"]
    };
  }
};
