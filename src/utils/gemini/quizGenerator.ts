import { GoogleGenerativeAI } from '@google/generative-ai';
import { config } from '@/config/api';
import { QuestionType, QuizDifficulty } from '@/utils/quiz.types';
import { QuizQuestion, QuizAnalysis } from '@/utils/quiz.types';

const API_KEY = config.geminiApiKey;
const MODEL = config.geminiModel || "gemini-1.5-flash";

// Initialize Gemini
const genAI = new GoogleGenerativeAI(API_KEY);

/**
 * Generate quiz questions with answers based on specified question types
 */
export const generateQuizWithAnswers = async (
  topic: string,
  questionCount: number = 5,
  difficulty: QuizDifficulty = 'medium',
  questionTypes: QuestionType[] = [QuestionType.MultipleChoice]
): Promise<QuizQuestion[]> => {
  try {
    // Ensure topic is valid
    if (!topic || topic.trim() === '') {
      throw new Error('Please provide a valid topic');
    }
    
    console.log(`Generating quiz on topic: "${topic}", with ${questionCount} questions at ${difficulty} difficulty`);
    console.log(`Question types selected: ${questionTypes.join(', ')}`);
    
    // If no question types are selected, default to Multiple Choice
    if (!questionTypes.length) {
      questionTypes = [QuestionType.MultipleChoice];
    }
    
    // Prepare instructions based on selected question types
    const typeInstructions = questionTypes.map(type => {
      switch (type) {
        case QuestionType.MultipleChoice:
          return "Multiple Choice: Include 4 options with one correct answer";
        case QuestionType.ShortAnswer:
          return "Short Answer: Include a brief (1-2 sentences) expected answer and a marks value (typically 1-2)";
        case QuestionType.LongAnswer:
          return "Long Answer: Include an extensive model answer and a marks value (typically 3-5)";
        case QuestionType.Matching:
          return "Matching: Include pairs of items that should be matched together";
        default:
          return "Multiple Choice: Include 4 options with one correct answer";
      }
    }).join("\n");
    
    // Calculate how many questions of each type to generate
    const typeCounts = distributeQuestionTypes(questionCount, questionTypes);
    
    const prompt = `
    Generate a ${difficulty} difficulty quiz about ${topic} in optometry with ${questionCount} questions.
    
    The quiz should include the following question types:
    ${Object.entries(typeCounts).map(([type, count]) => `- ${count} ${type} questions`).join("\n")}
    
    Question type details:
    ${typeInstructions}
    
    For each question, provide:
    1. The question text
    2. The question type (one of: multiple-choice, short-answer, long-answer, matching)
    3. For multiple-choice: Four answer options, the correct answer (as a number 0-3), and explanation
    4. For short/long-answer: The model answer and marks value
    5. For matching: The items to match (left and right sides) and correct pairings
    
    Every question must have a detailed explanation that provides educational value.
    Format as a JSON array with appropriate structure for each question type.
    
    Example structure:
    [
      {
        "question": "Multiple choice question?",
        "questionType": "multiple-choice",
        "options": ["Option A", "Option B", "Option C", "Option D"],
        "correctAnswer": 0,
        "explanation": "Detailed explanation"
      },
      {
        "question": "Short answer question?",
        "questionType": "short-answer",
        "marks": 2,
        "possibleMarks": 2,
        "correctAnswer": 0,
        "explanation": "Expected answer and explanation"
      },
      {
        "question": "Matching question?",
        "questionType": "matching",
        "matchingItems": [
          {"left": "Item 1", "right": "Definition 1"},
          {"left": "Item 2", "right": "Definition 2"}
        ],
        "correctAnswer": 0,
        "explanation": "Explanation of the correct matches"
      }
    ]
    `;

    // Using Gemini API SDK for improved stability
    const model = genAI.getGenerativeModel({ model: MODEL });
    
    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.2,
        maxOutputTokens: 4096
      }
    });

    const responseText = result.response.text();
    
    // Extract JSON from the response
    const jsonMatch = responseText.match(/\[\s*\{.*\}\s*\]/s);
    if (!jsonMatch) {
      throw new Error('Invalid quiz format returned');
    }
    
    try {
      // Parse the JSON and validate the structure
      const parsedQuestions = JSON.parse(jsonMatch[0]);
      
      // Process and validate each question
      const validatedQuestions = parsedQuestions.map((q: any) => {
        // Ensure consistent question type format
        const questionType = q.questionType?.toLowerCase?.() || QuestionType.MultipleChoice;
        
        // Set defaults based on question type
        const baseQuestion: Partial<QuizQuestion> = {
          question: q.question,
          questionType: questionType,
          explanation: q.explanation || "No explanation provided",
          correctAnswer: q.correctAnswer || 0
        };
        
        switch (questionType) {
          case QuestionType.MultipleChoice:
            return {
              ...baseQuestion,
              options: q.options || ["Option A", "Option B", "Option C", "Option D"],
              correctAnswer: q.correctAnswer || 0,
              marks: 1,
              possibleMarks: 1
            };
            
          case QuestionType.ShortAnswer:
          case QuestionType.LongAnswer:
            return {
              ...baseQuestion,
              options: [],
              marks: q.marks || (questionType === QuestionType.ShortAnswer ? 2 : 5),
              possibleMarks: q.possibleMarks || (questionType === QuestionType.ShortAnswer ? 2 : 5)
            };
            
          case QuestionType.Matching:
            return {
              ...baseQuestion,
              options: [],
              matchingItems: q.matchingItems || [
                {left: "Item 1", right: "Definition 1"},
                {left: "Item 2", right: "Definition 2"}
              ],
              marks: q.marks || 4,
              possibleMarks: q.possibleMarks || 4
            };
            
          default:
            return {
              ...baseQuestion,
              options: q.options || ["Option A", "Option B", "Option C", "Option D"],
              correctAnswer: q.correctAnswer || 0
            };
        }
      });
      
      return validatedQuestions;
    } catch (e) {
      console.error('Failed to parse quiz JSON:', e);
      throw new Error('Invalid quiz format');
    }
  } catch (error) {
    console.error('Error generating quiz:', error);
    throw error;
  }
};

/**
 * Helper function to distribute question counts across selected types
 */
function distributeQuestionTypes(
  totalQuestions: number, 
  selectedTypes: QuestionType[]
): Record<QuestionType, number> {
  const result: Record<QuestionType, number> = {
    [QuestionType.MultipleChoice]: 0,
    [QuestionType.ShortAnswer]: 0,
    [QuestionType.LongAnswer]: 0,
    [QuestionType.Matching]: 0,
    [QuestionType.TrueFalse]: 0
  };
  
  if (selectedTypes.length === 0) {
    result[QuestionType.MultipleChoice] = totalQuestions;
    return result;
  }
  
  // Basic distribution - each type gets an equal share
  const baseCount = Math.floor(totalQuestions / selectedTypes.length);
  let remaining = totalQuestions % selectedTypes.length;
  
  // Distribute the base count
  for (const type of selectedTypes) {
    result[type] = baseCount;
  }
  
  // Distribute remaining questions
  for (let i = 0; i < remaining && i < selectedTypes.length; i++) {
    result[selectedTypes[i]]++;
  }
  
  return result;
}

/**
 * Generate a detailed analysis of quiz results
 */
export const generateQuizAnalysis = async (
  topic: string,
  questions: QuizQuestion[],
  correctCount: number,
  totalCount: number
): Promise<QuizAnalysis> => {
  try {
    // If quiz is empty or topic is empty, return default analysis
    if (questions.length === 0 || !topic) {
      return createDefaultAnalysis(topic, correctCount, totalCount);
    }
    
    // Prepare prompt for Gemini
    const prompt = `
    Analyze this optometry quiz performance:
    
    Topic: ${topic}
    Score: ${correctCount} out of ${totalCount} (${Math.round((correctCount / totalCount) * 100)}%)
    
    Questions summary:
    ${questions.slice(0, 5).map((q, i) => `${i + 1}. ${q.question.substring(0, 100)}...`).join('\n')}
    ${questions.length > 5 ? `...and ${questions.length - 5} more questions` : ''}
    
    Based on this performance, provide:
    1. 3-4 specific strengths shown in this quiz
    2. 3-4 areas that need improvement
    3. A personalized recommendation on next steps 
    4. 4-5 concrete study tips for better understanding this topic
    5. 3 quick memory-aid notes or mnemonics for key concepts in this topic
    
    Format your response as a JSON object with these keys:
    {
      "strengths": ["strength1", "strength2", ...],
      "areas_for_improvement": ["area1", "area2", ...],
      "recommendation": "detailed recommendation",
      "summary": "performance summary",
      "focusAreas": ["specific topic to study", ...],
      "improvementTips": ["concrete tip1", ...],
      "quickNotes": ["mnemonic1", ...]
    }
    `;

    // Using Gemini API SDK for improved stability
    const model = genAI.getGenerativeModel({ model: MODEL });
    
    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.2,
        maxOutputTokens: 2048
      }
    });

    const responseText = result.response.text();
    
    // Extract JSON from the response
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return createDefaultAnalysis(topic, correctCount, totalCount);
    }
    
    try {
      // Parse the JSON
      const analysis = JSON.parse(jsonMatch[0]);
      
      // Ensure all required fields are present
      return {
        strengths: analysis.strengths || [`Knowledge in some areas of ${topic}`],
        areas_for_improvement: analysis.areas_for_improvement || [`Deeper understanding of ${topic} concepts`],
        recommendation: analysis.recommendation || getDefaultRecommendation(correctCount, totalCount, topic),
        summary: analysis.summary || `You scored ${correctCount} out of ${totalCount}.`,
        focusAreas: analysis.focusAreas || [`Key concepts in ${topic}`],
        improvementTips: analysis.improvementTips || ["Review the explanations for questions you got wrong"],
        quickNotes: analysis.quickNotes || [`${topic} - key topic in optometry`]
      };
    } catch (e) {
      console.error('Failed to parse analysis JSON:', e);
      return createDefaultAnalysis(topic, correctCount, totalCount);
    }
  } catch (error) {
    console.error('Error generating quiz analysis:', error);
    return createDefaultAnalysis(topic, correctCount, totalCount);
  }
};

/**
 * Create a default analysis when generation fails
 */
function createDefaultAnalysis(topic: string, correctCount: number, totalCount: number): QuizAnalysis {
  const percentage = Math.round((correctCount / totalCount) * 100);
  
  const strengths = [];
  const areas = [];
  
  if (percentage > 80) {
    strengths.push(`Strong understanding of ${topic} fundamentals`);
    strengths.push(`Good recall of key ${topic} concepts`);
  } else if (percentage > 60) {
    strengths.push(`Basic understanding of ${topic}`);
    strengths.push(`Familiar with some ${topic} concepts`);
  } else {
    strengths.push(`Beginning to learn about ${topic}`);
  }
  
  if (percentage < 70) {
    areas.push(`Deepen understanding of core ${topic} principles`);
    areas.push(`Practice applying ${topic} concepts in clinical scenarios`);
    areas.push(`Review detailed mechanisms related to ${topic}`);
  } else {
    areas.push(`Further refine advanced ${topic} knowledge`);
    areas.push(`Connect ${topic} concepts with related clinical areas`);
  }
  
  return {
    strengths,
    areas_for_improvement: areas,
    recommendation: getDefaultRecommendation(correctCount, totalCount, topic),
    summary: `You scored ${correctCount} out of ${totalCount} (${percentage}%).`,
    focusAreas: [`Key concepts in ${topic}`, `Clinical applications of ${topic}`, `Recent developments in ${topic}`],
    improvementTips: [
      "Review lecture notes and textbook chapters on this topic",
      "Practice with additional quiz questions",
      "Create concept maps connecting related ideas",
      "Discuss challenging concepts with peers"
    ],
    quickNotes: [
      `Remember to relate ${topic} to clinical cases`,
      `Connect ${topic} with anatomy and physiology concepts`,
      `Look for pattern recognition in ${topic} presentations`
    ]
  };
}

/**
 * Get a default recommendation based on score
 */
function getDefaultRecommendation(correct: number, total: number, topic: string): string {
  const percentage = (correct / total) * 100;
  
  if (percentage >= 90) {
    return `Excellent work! You have a strong grasp of ${topic}. Consider exploring more advanced aspects or related topics to further enhance your expertise.`;
  } else if (percentage >= 70) {
    return `Good job! You have a solid understanding of ${topic}. Focus on the few areas you missed to reach mastery.`;
  } else if (percentage >= 50) {
    return `You're making progress with ${topic}. Review the topics you missed and consider using different study methods to strengthen your understanding.`;
  } else {
    return `This topic needs more attention. Consider revisiting the fundamentals of ${topic}, using different learning resources, and practicing with more examples.`;
  }
}

export type { QuizDifficulty };
