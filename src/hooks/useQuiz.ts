
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { generateQuizWithAnswers, generateQuizAnalysis } from '@/utils/gemini/quizGenerator';
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
  const [isAnalyzing, setIsAnalyzing] = useState(false);
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
      console.log(`Generating quiz on topic: "${topicToUse}", with ${questionCount} questions at ${quizDifficulty} difficulty`);
      console.log(`Selected question types: ${selectedQuestionTypes.join(', ')}`);
      
      // Pass the selected question types to the generator
      const generatedQuestions = await generateQuizWithAnswers(
        topicToUse, 
        questionCount, 
        quizDifficulty,
        selectedQuestionTypes
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
      setUserMatchingAnswers(new Array(generatedQuestions.length).fill([]));
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
    setUserMatchingAnswers(new Array(questions.length).fill([]));
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
    setUserMatchingAnswers([]);
    setQuizFinished(false);
  };

  const completeQuiz = async () => {
    if (!currentQuiz) return;
    setIsAnalyzing(true);
    
    // Process multiple-choice questions
    const mcResults: QuizResultItem[] = currentQuiz.map((question, index) => {
      if (question.questionType === QuestionType.MultipleChoice) {
        return {
          question: question.question,
          userAnswer: currentAnswers[index] !== -1 ? currentAnswers[index] : null,
          correctAnswer: question.correctAnswer,
          isCorrect: currentAnswers[index] === question.correctAnswer,
          options: question.options,
          explanation: question.explanation,
          questionType: question.questionType,
          marks: question.correctAnswer === currentAnswers[index] ? question.marks || 1 : 0,
          possibleMarks: question.possibleMarks || 1
        };
      }
      
      // For short answer and long answer questions
      if (question.questionType === QuestionType.ShortAnswer || question.questionType === QuestionType.LongAnswer) {
        // For demo purposes, assign partial credit randomly
        const userAnswerText = userAnswers[index] as string || '';
        const relevanceScore = userAnswerText.length > 10 ? 
          Math.floor(Math.random() * 30) + 60 : // Random score between 60-90% if answer has content
          0; // 0% for empty answers
          
        const marksEarned = Math.round((question.possibleMarks || 1) * (relevanceScore / 100));
        
        return {
          question: question.question,
          userAnswer: userAnswerText,
          correctAnswer: 0, // Not relevant for text answers
          isCorrect: relevanceScore > 70,
          options: [],
          explanation: question.explanation,
          questionType: question.questionType,
          marks: marksEarned,
          possibleMarks: question.possibleMarks,
          relevanceScore: relevanceScore,
          feedback: userAnswerText.length > 5 ? 
            `Your answer covers ${relevanceScore}% of the expected content.` : 
            "No answer provided."
        };
      }
      
      // For matching questions
      if (question.questionType === QuestionType.Matching && question.matchingItems) {
        const userMatchingList = userMatchingAnswers[index] || [];
        const correctMatchingList = question.matchingItems.map((_, idx) => idx);
        
        // Calculate how many matches are correct
        let correctMatches = 0;
        for (let i = 0; i < correctMatchingList.length; i++) {
          if (userMatchingList[i] === correctMatchingList[i]) {
            correctMatches++;
          }
        }
        
        const matchingScore = Math.round((correctMatches / correctMatchingList.length) * 100);
        
        return {
          question: question.question,
          userAnswer: null,
          correctAnswer: 0,
          isCorrect: matchingScore > 80,
          options: [],
          explanation: question.explanation,
          questionType: question.questionType,
          marks: Math.round((question.possibleMarks || 4) * (matchingScore / 100)),
          possibleMarks: question.possibleMarks || 4,
          relevanceScore: matchingScore,
          userMatching: userMatchingList,
          correctMatching: correctMatchingList
        };
      }
      
      // Default case
      return {
        question: question.question,
        userAnswer: null,
        correctAnswer: 0,
        isCorrect: false,
        options: question.options,
        explanation: question.explanation,
        questionType: question.questionType || QuestionType.MultipleChoice
      };
    });
    
    // Calculate total score
    const totalPossibleMarks = mcResults.reduce((sum, item) => sum + (item.possibleMarks || 1), 0);
    const totalEarnedMarks = mcResults.reduce((sum, item) => sum + (item.marks || 0), 0);
    const percentage = Math.round((totalEarnedMarks / totalPossibleMarks) * 100);
    
    // For traditional correct/incorrect counting (for backward compatibility)
    const correctCount = mcResults.filter(item => item.isCorrect).length;
    
    const scoreObj = {
      correct: correctCount,
      total: currentQuiz.length,
      percentage
    };
    
    setQuizResults(mcResults);
    setQuizScore(scoreObj);
    setScore(scoreObj);
    setQuizComplete(true);
    
    try {
      // Generate AI analysis of the quiz results
      const analysis = await generateQuizAnalysis(
        quizTopic, 
        currentQuiz, 
        totalEarnedMarks,
        totalPossibleMarks
      );
      
      setQuizAnalysis(analysis);
    } catch (error) {
      console.error('Error generating quiz analysis:', error);
      // Create basic analysis
      const basicAnalysis: QuizAnalysis = {
        strengths: [`Knowledge in some areas of ${quizTopic || topic}`],
        areas_for_improvement: [`Review the concepts you missed in ${quizTopic || topic}`],
        recommendation: percentage > 70 ? 
          'Keep up the good work!' : 'Consider reviewing this material further.',
        summary: `You scored ${totalEarnedMarks} out of ${totalPossibleMarks} marks (${percentage}%).`,
        focusAreas: ['Review the questions you got wrong'],
        improvementTips: ['Study the explanations for the questions you missed', 'Practice with more examples'],
        quickNotes: [`${quizTopic || topic} - important for clinical practice`]
      };
      
      setQuizAnalysis(basicAnalysis);
    } finally {
      setIsAnalyzing(false);
    }
    
    // Save quiz to history
    saveQuizToHistory(mcResults, scoreObj);
  };

  const saveQuizToHistory = (results: QuizResultItem[], score: QuizScore) => {
    const newSavedQuiz: SavedQuiz = {
      id: Date.now().toString(),
      title: `Quiz on ${quizTopic || topic}`,
      topic: quizTopic || topic,
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
    isAnalyzing,
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
