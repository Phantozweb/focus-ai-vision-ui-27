
// Types for quiz functionality
export interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

export interface QuizResultItem {
  question: string;
  userAnswer: number;
  correctAnswer: number;
  isCorrect: boolean;
  options: string[];
  explanation: string;
}

export interface QuizScore {
  correct: number;
  total: number;
  percentage: number;
}

export interface QuizAnalysis {
  strengths: string[];
  areas_for_improvement: string[];
  recommendation: string;
}

export enum QuestionType {
  MultipleChoice = 'multiple_choice',
  TrueFalse = 'true_false',
  ShortAnswer = 'short_answer'
}

export type QuizDifficulty = 'easy' | 'medium' | 'hard';
