
// This file is maintained for backward compatibility
// It re-exports all functionality from the gemini folder
export { 
  checkApiKey,
  generateGeminiResponse,
  generateFollowUpQuestions,
  generateQuizWithAnswers
} from './gemini';
export type { QuizDifficulty } from './gemini';
