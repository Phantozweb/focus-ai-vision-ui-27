
import { useState, useEffect } from 'react';
import { toast } from '@/components/ui/sonner';
import { generateQuizWithAnswers, generateQuizAnalysis, QuizDifficulty } from '@/utils/gemini';

export interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

export interface QuizResultItem {
  question: string;
  userAnswer: number | null;
  correctAnswer: number;
  isCorrect: boolean;
}

export interface QuizScore {
  correct: number;
  total: number;
}

export interface QuizAnalysis {
  summary: string;
  focusAreas: string[];
}

export const useQuiz = () => {
  const [topic, setTopic] = useState('');
  const [questionCount, setQuestionCount] = useState(5);
  const [difficulty, setDifficulty] = useState<QuizDifficulty>("medium");
  const [isGenerating, setIsGenerating] = useState(false);
  
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<(number | null)[]>([]);
  const [showExplanation, setShowExplanation] = useState(false);
  const [quizFinished, setQuizFinished] = useState(false);
  const [quizResults, setQuizResults] = useState<QuizResultItem[]>([]);
  const [score, setScore] = useState<QuizScore>({ correct: 0, total: 0 });
  const [quizAnalysis, setQuizAnalysis] = useState<QuizAnalysis | null>(null);

  // When answers change, update the score
  useEffect(() => {
    if (quizFinished && questions.length > 0) {
      const correct = userAnswers.reduce((count, answer, index) => {
        return answer === questions[index].correctAnswer ? count + 1 : count;
      }, 0);
      setScore({ correct, total: questions.length });
    }
  }, [quizFinished, questions, userAnswers]);

  const generateQuiz = async () => {
    if (!topic.trim()) {
      toast.error('Please enter a topic');
      return;
    }

    setIsGenerating(true);
    setQuestions([]);
    setUserAnswers([]);
    setCurrentQuestionIndex(0);
    setQuizFinished(false);
    setShowExplanation(false);
    setQuizAnalysis(null);
    
    try {
      const generatedQuestions = await generateQuizWithAnswers(topic, questionCount, difficulty);
      setQuestions(generatedQuestions);
      setUserAnswers(new Array(generatedQuestions.length).fill(null));
      toast.success(`Generated ${questionCount} ${difficulty} questions about ${topic}`);
    } catch (error) {
      console.error('Error generating quiz:', error);
      toast.error('Failed to generate quiz. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleAnswerSelection = (optionIndex: number) => {
    const newAnswers = [...userAnswers];
    newAnswers[currentQuestionIndex] = optionIndex;
    setUserAnswers(newAnswers);
  };

  const goToNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setShowExplanation(false);
    } else {
      finishQuiz();
    }
  };

  const goToPreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
      setShowExplanation(false);
    }
  };

  const toggleExplanation = () => {
    setShowExplanation(!showExplanation);
  };

  const finishQuiz = async () => {
    const results = questions.map((q, index) => ({
      question: q.question,
      userAnswer: userAnswers[index],
      correctAnswer: q.correctAnswer,
      isCorrect: userAnswers[index] === q.correctAnswer
    }));
    
    setQuizResults(results);
    setQuizFinished(true);
    
    try {
      // Generate analysis based on quiz results
      const analysis = await generateQuizAnalysis({
        topic,
        difficulty,
        questions,
        userAnswers,
        score: {
          correct: results.filter(r => r.isCorrect).length,
          total: questions.length
        }
      });
      setQuizAnalysis(analysis);
    } catch (error) {
      console.error('Error generating quiz analysis:', error);
      toast.error('Unable to generate performance analysis');
    }
  };

  const restartQuiz = () => {
    setUserAnswers(new Array(questions.length).fill(null));
    setCurrentQuestionIndex(0);
    setQuizFinished(false);
    setShowExplanation(false);
    setQuizAnalysis(null);
  };

  const createNewQuiz = () => {
    setQuestions([]);
    setUserAnswers([]);
    setCurrentQuestionIndex(0);
    setQuizFinished(false);
    setShowExplanation(false);
    setQuizAnalysis(null);
  };

  return {
    topic,
    setTopic,
    questionCount,
    setQuestionCount,
    difficulty,
    setDifficulty,
    isGenerating,
    questions,
    currentQuestionIndex,
    userAnswers,
    showExplanation,
    quizFinished,
    quizResults,
    score,
    quizAnalysis,
    generateQuiz,
    handleAnswerSelection,
    goToNextQuestion,
    goToPreviousQuestion,
    toggleExplanation,
    restartQuiz,
    createNewQuiz
  };
};
