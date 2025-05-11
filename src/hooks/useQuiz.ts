
import { useState, useEffect } from 'react';
import { toast } from '@/components/ui/sonner';
import { generateQuizWithAnswers } from '@/utils/geminiApi';
import { 
  QuizQuestion, 
  QuizResultItem, 
  QuizScore, 
  QuizAnalysis,
  QuestionType,
  QuizDifficulty
} from '@/utils/quiz.types';

export type { 
  QuizQuestion, 
  QuizResultItem, 
  QuizScore, 
  QuizAnalysis,
  QuestionType,
  QuizDifficulty
};

export interface SavedQuiz {
  id: string;
  title: string;
  topic: string;
  score: QuizScore;
  questions: QuizResultItem[];
  createdAt: number;
}

export function useQuiz() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentQuiz, setCurrentQuiz] = useState<QuizQuestion[] | null>(null);
  const [currentAnswers, setCurrentAnswers] = useState<number[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [quizComplete, setQuizComplete] = useState(false);
  const [quizResults, setQuizResults] = useState<QuizResultItem[]>([]);
  const [quizScore, setQuizScore] = useState<QuizScore>({ correct: 0, total: 0, percentage: 0 });
  const [quizAnalysis, setQuizAnalysis] = useState<QuizAnalysis | null>(null);
  const [savedQuizzes, setSavedQuizzes] = useState<SavedQuiz[]>([]);
  const [quizTopic, setQuizTopic] = useState('');
  const [quizDifficulty, setQuizDifficulty] = useState<QuizDifficulty>('medium');
  const [questionCount, setQuestionCount] = useState(5);
  const [generationError, setGenerationError] = useState('');

  useEffect(() => {
    // Load saved quizzes from localStorage
    const savedQuizzesData = localStorage.getItem('savedQuizzes');
    if (savedQuizzesData) {
      try {
        setSavedQuizzes(JSON.parse(savedQuizzesData));
      } catch (error) {
        console.error('Error loading saved quizzes:', error);
      }
    }
  }, []);

  const generateQuiz = async () => {
    if (!quizTopic.trim()) {
      toast.error('Please enter a quiz topic');
      return;
    }

    setIsGenerating(true);
    setGenerationError('');

    try {
      const questions = await generateQuizWithAnswers(
        quizTopic, 
        questionCount, 
        quizDifficulty
      );
      
      setCurrentQuiz(questions);
      setCurrentAnswers(new Array(questions.length).fill(-1));
      setCurrentQuestion(0);
      setQuizComplete(false);
      setQuizResults([]);
      toast.success('Quiz generated successfully');
    } catch (error) {
      console.error('Error generating quiz:', error);
      setGenerationError('Failed to generate quiz. Please try again or choose a different topic.');
      toast.error('Failed to generate quiz');
    } finally {
      setIsGenerating(false);
    }
  };

  const answerQuestion = (answerIndex: number) => {
    if (!currentQuiz) return;

    const newAnswers = [...currentAnswers];
    newAnswers[currentQuestion] = answerIndex;
    setCurrentAnswers(newAnswers);
  };

  const goToNextQuestion = () => {
    if (!currentQuiz) return;
    
    if (currentQuestion < currentQuiz.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const goToPreviousQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const completeQuiz = () => {
    if (!currentQuiz) return;
    
    const results: QuizResultItem[] = currentQuiz.map((question, index) => ({
      question: question.question,
      userAnswer: currentAnswers[index],
      correctAnswer: question.correctAnswer,
      isCorrect: currentAnswers[index] === question.correctAnswer,
      options: question.options,
      explanation: question.explanation
    }));
    
    const correctCount = results.filter(item => item.isCorrect).length;
    const total = currentQuiz.length;
    const percentage = Math.round((correctCount / total) * 100);
    
    const score: QuizScore = {
      correct: correctCount,
      total,
      percentage
    };
    
    setQuizResults(results);
    setQuizScore(score);
    setQuizComplete(true);
    
    // Generate basic analysis
    const strengths = [];
    const areas_for_improvement = [];
    
    if (percentage > 80) {
      strengths.push(`Strong understanding of ${quizTopic}`);
    }
    if (percentage < 50) {
      areas_for_improvement.push(`Review the core concepts of ${quizTopic}`);
    }
    
    const analysis: QuizAnalysis = {
      strengths: strengths.length ? strengths : [`Knowledge in some areas of ${quizTopic}`],
      areas_for_improvement: areas_for_improvement.length ? 
        areas_for_improvement : ['Focus on the questions you got wrong'],
      recommendation: percentage > 70 ? 
        'Keep up the good work!' : 'Consider reviewing the material and trying again.'
    };
    
    setQuizAnalysis(analysis);
    
    // Save quiz to history
    saveQuizToHistory(results, score);
  };

  const saveQuizToHistory = (results: QuizResultItem[], score: QuizScore) => {
    const newSavedQuiz: SavedQuiz = {
      id: Date.now().toString(),
      title: `Quiz on ${quizTopic}`,
      topic: quizTopic,
      score,
      questions: results,
      createdAt: Date.now()
    };
    
    const updatedQuizzes = [newSavedQuiz, ...savedQuizzes];
    setSavedQuizzes(updatedQuizzes);
    
    try {
      localStorage.setItem('savedQuizzes', JSON.stringify(updatedQuizzes));
    } catch (error) {
      console.error('Error saving quiz to history:', error);
    }
  };

  const resetQuiz = () => {
    setCurrentQuiz(null);
    setCurrentAnswers([]);
    setCurrentQuestion(0);
    setQuizComplete(false);
    setQuizResults([]);
    setQuizAnalysis(null);
  };

  const deleteQuiz = (id: string) => {
    const updatedQuizzes = savedQuizzes.filter(quiz => quiz.id !== id);
    setSavedQuizzes(updatedQuizzes);
    localStorage.setItem('savedQuizzes', JSON.stringify(updatedQuizzes));
    toast.success('Quiz deleted');
  };

  return {
    isGenerating,
    currentQuiz,
    currentAnswers,
    currentQuestion,
    quizComplete,
    quizResults,
    quizScore,
    quizAnalysis,
    savedQuizzes,
    quizTopic,
    setQuizTopic,
    quizDifficulty,
    setQuizDifficulty,
    questionCount,
    setQuestionCount,
    generationError,
    generateQuiz,
    answerQuestion,
    goToNextQuestion,
    goToPreviousQuestion,
    completeQuiz,
    resetQuiz,
    deleteQuiz
  };
}
