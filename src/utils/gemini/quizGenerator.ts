
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
    const prompt = `Create a complete ${difficulty} difficulty quiz with exactly ${numberOfQuestions} multiple-choice questions about ${topic} for optometry students. 
    
    Important: Generate ALL ${numberOfQuestions} questions in a single response. Don't split them across multiple responses.
    
    For each question:
    1. Write a clear, specific question about ${topic}
    2. Provide exactly 4 answer options labeled 0-3
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
    
    Question 2: ...
    
    Continue until you've generated all ${numberOfQuestions} questions.`;
    
    const model = genAI.getGenerativeModel({ 
      model: "gemini-1.5-flash",
      generationConfig: {
        ...generationConfig,
        temperature: 0.5,
        maxOutputTokens: 8192, // Increased token limit to handle larger responses
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
    
    // If we didn't get the requested number of questions, log an error
    if (questions.length < numberOfQuestions) {
      console.warn(`Only generated ${questions.length} out of ${numberOfQuestions} requested questions`);
    }
    
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
  userAnswers: (number | null | string)[];
  userMatchingAnswers?: number[][];
  score: {
    correct: number;
    total: number;
    earnedMarks?: number;
    possibleMarks?: number;
  };
}

// Function to analyze written answers
export const analyzeWrittenAnswer = async (
  question: string,
  correctAnswer: string,
  userAnswer: string,
  marks: number
): Promise<{
  isCorrect: boolean;
  feedback: string;
  earnedMarks: number;
}> => {
  try {
    const prompt = `
    As an optometry education expert, evaluate this student's written answer:
    
    Question: ${question}
    
    Correct key points: ${correctAnswer}
    
    Student's answer: "${userAnswer}"
    
    This is a ${marks}-mark question. Please evaluate:
    1. How many marks (out of ${marks}) should the answer receive?
    2. Is the answer generally correct? (yes/no)
    3. What specific feedback would help the student improve?
    
    Format your response as JSON:
    {
      "earnedMarks": [number between 0 and ${marks}],
      "isCorrect": [boolean - true if generally correct, false if not],
      "feedback": [specific constructive feedback]
    }
    `;

    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
      generationConfig: {
        ...generationConfig,
        temperature: 0.2,
        maxOutputTokens: 1024,
      },
      safetySettings,
    });
    
    const result = await model.generateContent(prompt);
    const analysisText = result.response.text();
    
    // Extract the JSON object
    try {
      // Find JSON in the response
      const jsonMatch = analysisText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const analysis = JSON.parse(jsonMatch[0]);
        return {
          isCorrect: analysis.isCorrect === true,
          feedback: analysis.feedback,
          earnedMarks: analysis.earnedMarks
        };
      }
    } catch (e) {
      console.error("Failed to parse analysis JSON:", e);
    }
    
    // Fallback response if parsing fails
    return {
      isCorrect: false,
      feedback: "Your answer was partially correct. Review the key concepts in this topic.",
      earnedMarks: Math.floor(marks / 2)
    };
  } catch (error) {
    console.error("Error analyzing written answer:", error);
    return {
      isCorrect: false,
      feedback: "We couldn't analyze your answer. Please review the explanation.",
      earnedMarks: 0
    };
  }
};

// Function to generate quiz analysis
export const generateQuizAnalysis = async (data: QuizAnalysisData) => {
  try {
    // Create a list of questions with user answers for the prompt
    const questionsList = data.questions.map((q, idx) => {
      const userAnswer = data.userAnswers[idx];
      let isCorrect = false;
      let answerDisplay = "";
      
      if (q.questionType === 'multiple-choice') {
        isCorrect = userAnswer === q.correctAnswer;
        answerDisplay = q.options[userAnswer as number] || "No answer";
      } else if (q.questionType === 'matching') {
        const userMatching = data.userMatchingAnswers?.[idx] || [];
        isCorrect = userMatching.every((rightIndex, leftIndex) => rightIndex === q.correctMatching?.[leftIndex]);
        answerDisplay = `Matched ${userMatching.length} of ${q.matchingItems?.length || 0} items correctly`;
      } else if (q.questionType === 'short-answer' || q.questionType === 'long-answer') {
        answerDisplay = typeof userAnswer === 'string' ? 
                        `"${userAnswer.substring(0, 100)}${userAnswer.length > 100 ? '...' : ''}"` : 
                        "No answer";
      }
      
      return `
Question: ${q.question}
Question Type: ${q.questionType}
User's answer: ${answerDisplay}
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
1. A concise analysis (3-4 sentences) of the student's overall understanding of ${data.topic}
2. Identify 3-5 specific focus areas or concepts the student should review to improve their understanding
3. Provide 2-3 specific tips for improvement, especially for written answers
4. Format your analysis in markdown with clear sections

Your response should be educational, supportive, and specific to the student's performance pattern.
`;

    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
      generationConfig: {
        ...generationConfig,
        temperature: 0.3,
        maxOutputTokens: 2048,
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
    
    // Extract improvement tips from the analysis
    const tipsRegex = /(?:tips|advice|suggestions|recommendations)[\s\S]*?(?:[-•*]\s*)([^\n]+)/gi;
    const improvementTips: string[] = [];
    
    while ((match = tipsRegex.exec(analysisText)) !== null) {
      if (match[1]) {
        improvementTips.push(match[1].trim());
      }
    }
    
    return {
      summary: analysisText,
      focusAreas: focusAreas.length > 0 ? focusAreas : ["Review core concepts", "Practice more questions", "Study clinical applications"],
      improvementTips: improvementTips.length > 0 ? improvementTips : ["Take detailed notes while studying", "Practice explaining concepts out loud", "Create your own study questions"]
    };
  } catch (error) {
    console.error("Error generating quiz analysis:", error);
    return {
      summary: "We couldn't generate a detailed analysis of your performance. Keep practicing to improve your understanding of the topic.",
      focusAreas: ["Review core concepts", "Practice more questions", "Study clinical applications"],
      improvementTips: ["Take detailed notes while studying", "Practice explaining concepts out loud", "Create your own study questions"]
    };
  }
};
