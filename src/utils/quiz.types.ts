
// Types for quiz functionality
export interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  questionType: QuestionType | string;
  marks?: number;
  possibleMarks?: number;
  matchingItems?: Array<{left: string, right: string}>;
}

export interface QuizResultItem {
  question: string;
  userAnswer: number | string | null;
  correctAnswer: number;
  isCorrect: boolean;
  options: string[];
  explanation: string;
  questionType?: QuestionType | string;
  marks?: number; 
  possibleMarks?: number;
  relevanceScore?: number;
  feedback?: string;
  userMatching?: number[];
  correctMatching?: number[];
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
  summary?: string;
  focusAreas?: string[];
  improvementTips?: string[];
  quickNotes?: string[];
}

export enum QuestionType {
  MultipleChoice = 'multiple-choice',
  TrueFalse = 'true_false',
  ShortAnswer = 'short-answer',
  LongAnswer = 'long-answer',
  Matching = 'matching'
}

export type QuizDifficulty = 'easy' | 'medium' | 'hard';
