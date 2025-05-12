import { useState, useEffect } from 'react';
import { toast } from 'sonner';
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
  
  // For compatibility with components that expect these properties
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [quizFinished, setQuizFinished] = useState(false);
  const [userAnswers, setUserAnswers] = useState<(number | string | null)[]>([]);
  const [showExplanation, setShowExplanation] = useState(false);
  const [selectedQuestionTypes, setSelectedQuestionTypes] = useState<QuestionType[]>([QuestionType.MultipleChoice]);
  const [topic, setTopic] = useState('');
  const [difficulty, setDifficulty] = useState<QuizDifficulty>('medium');
  const [userMatchingAnswers, setUserMatchingAnswers] = useState<number[][]>([]);
  const [score, setScore] = useState<QuizScore>({ correct: 0, total: 0, percentage: 0 });
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

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
    if (!quizTopic.trim() && !topic.trim()) {
      toast.error('Please enter a quiz topic');
      return;
    }

    // Ensure topic and quizTopic are in sync
    const topicToUse = quizTopic.trim() || topic.trim();
    setQuizTopic(topicToUse);
    setTopic(topicToUse);
    
    setIsGenerating(true);
    setGenerationError('');

    try {
      console.log(`Attempting to generate quiz on topic: "${topicToUse}"`);
      const generatedQuestions = await generateQuizWithAnswers(
        topicToUse, 
        questionCount, 
        quizDifficulty
      );
      
      setCurrentQuiz(generatedQuestions);
      setCurrentAnswers(new Array(generatedQuestions.length).fill(-1));
      setCurrentQuestion(0);
      setQuizComplete(false);
      setQuizResults([]);
      
      // Set values for component compatibility
      setQuestions(generatedQuestions);
      setQuizFinished(false);
      setUserAnswers(new Array(generatedQuestions.length).fill(null));
      setCurrentQuestionIndex(0);
      
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
    
    // Update user answers for component compatibility
    const newUserAnswers = [...userAnswers];
    newUserAnswers[currentQuestionIndex] = answerIndex;
    setUserAnswers(newUserAnswers);
  };

  const handleAnswerSelection = answerQuestion;
  
  const handleTextAnswer = (answer: string) => {
    if (!currentQuiz) return;
    
    const newUserAnswers = [...userAnswers];
    newUserAnswers[currentQuestionIndex] = answer;
    setUserAnswers(newUserAnswers);
  };
  
  const handleMatchingAnswer = (leftIndex: number, rightIndex: number) => {
    if (!currentQuiz) return;
    
    const newMatching = [...userMatchingAnswers];
    if (!newMatching[currentQuestionIndex]) {
      newMatching[currentQuestionIndex] = [];
    }
    newMatching[currentQuestionIndex][leftIndex] = rightIndex;
    setUserMatchingAnswers(newMatching);
  };

  const goToNextQuestion = () => {
    if (!currentQuiz) return;
    
    if (currentQuestion < currentQuiz.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setCurrentQuestionIndex(currentQuestion + 1);
    } else {
      completeQuiz();
      setQuizFinished(true);
    }
  };

  const goToPreviousQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
      setCurrentQuestionIndex(currentQuestion - 1);
    }
  };
  
  const toggleExplanation = () => {
    setShowExplanation(!showExplanation);
  };
  
  const restartQuiz = () => {
    if (!currentQuiz) return;
    
    setCurrentAnswers(new Array(currentQuiz.length).fill(-1));
    setCurrentQuestion(0);
    setQuizComplete(false);
    setQuizResults([]);
    
    // Reset component compatibility values
    setUserAnswers(new Array(questions.length).fill(null));
    setQuizFinished(false);
    setCurrentQuestionIndex(0);
    setShowExplanation(false);
  };
  
  const createNewQuiz = () => {
    setCurrentQuiz(null);
    setCurrentAnswers([]);
    setCurrentQuestion(0);
    setQuizComplete(false);
    setQuizResults([]);
    setQuizAnalysis(null);
    setQuizTopic('');
    setTopic('');
    
    // Reset component compatibility values
    setQuestions([]);
    setUserAnswers([]);
    setQuizFinished(false);
  };

  const completeQuiz = () => {
    if (!currentQuiz) return;
    
    const results: QuizResultItem[] = currentQuiz.map((question, index) => ({
      question: question.question,
      userAnswer: currentAnswers[index],
      correctAnswer: question.correctAnswer,
      isCorrect: currentAnswers[index] === question.correctAnswer,
      options: question.options,
      explanation: question.explanation,
      questionType: question.questionType
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
    setScore(score);
    
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
        'Keep up the good work!' : 'Consider reviewing the material and trying again.',
      summary: `You scored ${correctCount} out of ${total} (${percentage}%).`,
      focusAreas: areas_for_improvement,
      improvementTips: ['Review the explanations for questions you got wrong']
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
    deleteQuiz,
    // Additional properties for component compatibility
    questions,
    userAnswers,
    quizFinished,
    showExplanation,
    selectedQuestionTypes,
    setSelectedQuestionTypes,
    topic,
    setTopic,
    difficulty, 
    setDifficulty,
    userMatchingAnswers,
    handleAnswerSelection,
    handleTextAnswer,
    handleMatchingAnswer,
    toggleExplanation,
    currentQuestionIndex,
    score,
    restartQuiz,
    createNewQuiz
  };
}
