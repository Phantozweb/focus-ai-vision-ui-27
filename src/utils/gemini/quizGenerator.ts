
import { genAI, generationConfig, safetySettings } from './config';
import { QuestionType } from '@/utils/quiz.types';

// Create a type for quiz difficulty levels
export type QuizDifficulty = "easy" | "medium" | "hard";

// Function to generate quiz with answers for case studies
export const generateQuizWithAnswers = async (
  topic: string,
  numberOfQuestions: number = 5,
  difficulty: QuizDifficulty = "medium",
  questionTypes: QuestionType[] = [QuestionType.MultipleChoice]
): Promise<any[]> => {
  try {
    // Define how many of each question type we want
    const questionTypeDistribution = distributionByType(numberOfQuestions, questionTypes);
    
    let prompt = `Create a complete ${difficulty} difficulty quiz with exactly ${numberOfQuestions} questions about ${topic} for optometry students.\n\n`;
    
    prompt += `The quiz should include the following types of questions:\n`;
    for (const [type, count] of Object.entries(questionTypeDistribution)) {
      prompt += `- ${count} ${type} questions\n`;
    }
    
    prompt += `\nImportant: Generate ALL ${numberOfQuestions} questions in a single response. Don't split them across multiple responses.\n\n`;
    
    if (questionTypeDistribution[QuestionType.MultipleChoice] > 0) {
      prompt += `For multiple-choice questions:\n`;
      prompt += `1. Write a clear, specific question\n`;
      prompt += `2. Provide exactly 4 answer options labeled 0-3\n`;
      prompt += `3. Indicate which option is correct (as a number 0-3)\n`;
      prompt += `4. Include a detailed explanation\n\n`;
    }
    
    if (questionTypeDistribution[QuestionType.ShortAnswer] > 0) {
      prompt += `For short-answer questions:\n`;
      prompt += `1. Write a clear, specific question requiring a brief answer (1-2 sentences)\n`;
      prompt += `2. Provide the expected key points in the answer\n`;
      prompt += `3. Include a detailed explanation\n\n`;
    }
    
    if (questionTypeDistribution[QuestionType.LongAnswer] > 0) {
      prompt += `For long-answer questions:\n`;
      prompt += `1. Write a complex question requiring an essay-style response\n`;
      prompt += `2. Provide the expected key points in the answer\n`;
      prompt += `3. Include a comprehensive explanation\n\n`;
    }
    
    if (questionTypeDistribution[QuestionType.Matching] > 0) {
      prompt += `For matching questions:\n`;
      prompt += `1. Create a set of 4-6 terms and their corresponding definitions\n`;
      prompt += `2. Format as "left items" (terms) and "right items" (definitions)\n`;
      prompt += `3. Include the correct matching pairs\n\n`;
    }
    
    prompt += `Format your response as a structured list that can be easily parsed into JSON. Use clear headers for each question type.\n\n`;
    
    prompt += `For multiple-choice questions:\n`;
    prompt += `Question X (multiple-choice): [question text]\n`;
    prompt += `Options:\n`;
    prompt += `0. [option text]\n`;
    prompt += `1. [option text]\n`;
    prompt += `2. [option text]\n`;
    prompt += `3. [option text]\n`;
    prompt += `CorrectAnswer: [number 0-3]\n`;
    prompt += `Explanation: [explanation text]\n\n`;
    
    prompt += `For short/long-answer questions:\n`;
    prompt += `Question X (short-answer/long-answer): [question text]\n`;
    prompt += `ExpectedAnswer: [key points the answer should contain]\n`;
    prompt += `Explanation: [explanation text]\n`;
    prompt += `Marks: [number of marks, typically 5 for short, 10 for long]\n\n`;
    
    prompt += `For matching questions:\n`;
    prompt += `Question X (matching): [instruction text]\n`;
    prompt += `LeftItems:\n`;
    prompt += `0. [term 1]\n`;
    prompt += `1. [term 2]\n`;
    prompt += `... and so on\n`;
    prompt += `RightItems:\n`;
    prompt += `0. [definition 1]\n`;
    prompt += `1. [definition 2]\n`;
    prompt += `... and so on\n`;
    prompt += `CorrectMatching: [array of indices showing which right item matches each left item]\n`;
    prompt += `Explanation: [explanation of the matches]\n\n`;
    
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
    const questionBlocks = text.split(/Question \d+.*?:/g).filter(block => block.trim().length > 0);
    
    const questions = questionBlocks.map(block => {
      try {
        // Determine question type
        const typeMatch = block.match(/(multiple-choice|short-answer|long-answer|matching)/i);
        const questionType = typeMatch ? typeMatch[1].toLowerCase() : 'multiple-choice';
        
        // Extract the question text
        const questionText = block.trim().split('\n')[0].trim();
        
        if (questionType === 'multiple-choice') {
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
            explanation,
            questionType: QuestionType.MultipleChoice
          };
        } 
        else if (questionType === 'short-answer' || questionType === 'long-answer') {
          // Extract the expected answer
          const expectedAnswerMatch = block.match(/ExpectedAnswer:\s*([\s\S]+?)(?=(?:Explanation:|$))/);
          const expectedAnswer = expectedAnswerMatch ? expectedAnswerMatch[1].trim() : "";
          
          // Extract the explanation
          const explanationMatch = block.match(/Explanation:\s*([\s\S]+?)(?=(?:Marks:|Question \d+:|$))/);
          const explanation = explanationMatch ? explanationMatch[1].trim() : "No explanation provided";
          
          // Extract marks
          const marksMatch = block.match(/Marks:\s*(\d+)/);
          const marks = marksMatch ? parseInt(marksMatch[1]) : (questionType === 'short-answer' ? 5 : 10);
          
          return {
            question: questionText,
            correctAnswer: expectedAnswer,
            explanation,
            marks,
            options: [],
            questionType: questionType === 'short-answer' ? QuestionType.ShortAnswer : QuestionType.LongAnswer
          };
        }
        else if (questionType === 'matching') {
          // Extract left items
          const leftItemsBlock = block.substring(block.indexOf("LeftItems:") + 10, block.indexOf("RightItems:")).trim();
          const leftItems = leftItemsBlock.split(/\d+\.\s+/).filter(item => item.trim().length > 0).map(item => item.trim());
          
          // Extract right items
          const rightItemsBlock = block.substring(block.indexOf("RightItems:") + 11, block.indexOf("CorrectMatching:")).trim();
          const rightItems = rightItemsBlock.split(/\d+\.\s+/).filter(item => item.trim().length > 0).map(item => item.trim());
          
          // Extract the correct matching
          const correctMatchingMatch = block.match(/CorrectMatching:\s*\[([\d,\s]+)\]/);
          const correctMatchingString = correctMatchingMatch ? correctMatchingMatch[1] : "";
          const correctMatching = correctMatchingString.split(',').map(num => parseInt(num.trim()));
          
          // Extract the explanation
          const explanationMatch = block.match(/Explanation:\s*([\s\S]+?)(?=(?:Question \d+:|$))/);
          const explanation = explanationMatch ? explanationMatch[1].trim() : "No explanation provided";
          
          // Create matching items array
          const matchingItems = leftItems.map((left, index) => ({
            left,
            right: rightItems[correctMatching[index]] || ""
          }));
          
          return {
            question: questionText,
            matchingItems,
            correctMatching,
            explanation,
            options: [],
            questionType: QuestionType.Matching
          };
        }
        
        return null;
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

// Helper function to distribute questions across types
function distributionByType(totalQuestions: number, types: QuestionType[]): Record<QuestionType, number> {
  const distribution: Record<QuestionType, number> = {
    [QuestionType.MultipleChoice]: 0,
    [QuestionType.ShortAnswer]: 0,
    [QuestionType.LongAnswer]: 0,
    [QuestionType.Matching]: 0,
    [QuestionType.TrueFalse]: 0
  };
  
  if (types.length === 0) {
    distribution[QuestionType.MultipleChoice] = totalQuestions;
    return distribution;
  }
  
  // If only one type is selected, all questions are that type
  if (types.length === 1) {
    distribution[types[0]] = totalQuestions;
    return distribution;
  }
  
  // For multiple types, distribute evenly with preference for multiple choice
  let remaining = totalQuestions;
  const baseCount = Math.floor(totalQuestions / types.length);
  
  types.forEach(type => {
    distribution[type] = baseCount;
    remaining -= baseCount;
  });
  
  // Distribute any remaining questions
  let typeIndex = 0;
  while (remaining > 0) {
    distribution[types[typeIndex % types.length]]++;
    remaining--;
    typeIndex++;
  }
  
  return distribution;
}

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
