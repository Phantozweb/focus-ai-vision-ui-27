
import { useState, useEffect } from 'react';
import { toast } from '@/components/ui/sonner';
import { generateQuizWithAnswers, generateQuizAnalysis, QuizDifficulty } from '@/utils/gemini';

export type QuestionType = 'multiple-choice' | 'short-answer' | 'long-answer' | 'matching';

export interface MatchingItem {
  left: string;
  right: string;
}

export interface QuizQuestion {
  question: string;
  questionType: QuestionType;
  options?: string[];
  correctAnswer?: number;
  matchingItems?: MatchingItem[];
  correctMatching?: number[];
  explanation: string;
  marks?: number; // 1 for short answers, 5 for long answers
}

export interface QuizResultItem {
  question: string;
  questionType: QuestionType;
  userAnswer: number | null | string;
  userMatching?: number[];
  correctAnswer?: number;
  correctMatching?: number[];
  isCorrect: boolean;
  feedback?: string; // AI feedback for written answers
  marks?: number; // Assigned marks for written answers
  possibleMarks?: number; // Total possible marks
}

export interface QuizScore {
  correct: number;
  total: number;
  earnedMarks?: number; // Total marks earned
  possibleMarks?: number; // Total marks possible
}

export interface QuizAnalysis {
  summary: string;
  focusAreas: string[];
  improvementTips?: string[];
}

export const useQuiz = () => {
  const [topic, setTopic] = useState('');
  const [questionCount, setQuestionCount] = useState(5);
  const [difficulty, setDifficulty] = useState<QuizDifficulty>("medium");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<(number | null | string)[]>([]);
  const [userMatchingAnswers, setUserMatchingAnswers] = useState<number[][]>([]);
  const [showExplanation, setShowExplanation] = useState(false);
  const [quizFinished, setQuizFinished] = useState(false);
  const [quizResults, setQuizResults] = useState<QuizResultItem[]>([]);
  const [score, setScore] = useState<QuizScore>({ correct: 0, total: 0 });
  const [quizAnalysis, setQuizAnalysis] = useState<QuizAnalysis | null>(null);

  // When answers change, update the score
  useEffect(() => {
    if (quizFinished && questions.length > 0) {
      const correct = userAnswers.reduce((count, answer, index) => {
        if (questions[index].questionType === 'multiple-choice') {
          return typeof answer === 'number' && answer === questions[index].correctAnswer ? count + 1 : count;
        }
        // For other question types, we rely on AI analysis
        return count;
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
    setUserMatchingAnswers([]);
    setCurrentQuestionIndex(0);
    setQuizFinished(false);
    setShowExplanation(false);
    setQuizAnalysis(null);
    
    try {
      const generatedQuestions = await generateQuizWithAnswers(topic, questionCount, difficulty);
      
      // Transform questions to include the new question types
      const enhancedQuestions = generatedQuestions.map((q, index) => {
        // Every third question will be a short answer, every fourth a long answer, 
        // and every fifth a matching question (for demonstration)
        if (index % 5 === 4) {
          // Create a matching question
          return {
            ...q,
            questionType: 'matching' as QuestionType,
            matchingItems: [
              { left: q.options[0], right: q.options[0] },
              { left: q.options[1], right: q.options[1] },
              { left: q.options[2], right: q.options[2] },
              { left: q.options[3], right: q.options[3] }
            ].sort(() => Math.random() - 0.5), // Randomize the right side
            correctMatching: [0, 1, 2, 3], // Correct matches
            options: undefined,
            correctAnswer: undefined
          };
        } else if (index % 4 === 3) {
          // Create a long answer (5-mark) question
          return {
            ...q,
            questionType: 'long-answer' as QuestionType,
            marks: 5,
            options: undefined,
            correctAnswer: undefined
          };
        } else if (index % 3 === 2) {
          // Create a short answer (1-mark) question
          return {
            ...q,
            questionType: 'short-answer' as QuestionType,
            marks: 1,
            options: undefined,
            correctAnswer: undefined
          };
        } else {
          // Keep as multiple-choice
          return {
            ...q,
            questionType: 'multiple-choice' as QuestionType
          };
        }
      });
      
      setQuestions(enhancedQuestions);
      
      // Initialize arrays for different answer types
      setUserAnswers(new Array(enhancedQuestions.length).fill(null));
      setUserMatchingAnswers(new Array(enhancedQuestions.length).fill([]));
      
      toast.success(`Generated ${questionCount} ${difficulty} questions about ${topic}`);
    } catch (error) {
      console.error('Error generating quiz:', error);
      toast.error('Failed to generate quiz. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleAnswerSelection = (optionIndex: number) => {
    if (questions[currentQuestionIndex].questionType === 'multiple-choice') {
      const newAnswers = [...userAnswers];
      newAnswers[currentQuestionIndex] = optionIndex;
      setUserAnswers(newAnswers);
    }
  };

  const handleTextAnswer = (answer: string) => {
    const newAnswers = [...userAnswers];
    newAnswers[currentQuestionIndex] = answer;
    setUserAnswers(newAnswers);
  };

  const handleMatchingAnswer = (leftIndex: number, rightIndex: number) => {
    const newMatchingAnswers = [...userMatchingAnswers];
    if (!newMatchingAnswers[currentQuestionIndex]) {
      newMatchingAnswers[currentQuestionIndex] = [];
    }
    newMatchingAnswers[currentQuestionIndex][leftIndex] = rightIndex;
    setUserMatchingAnswers(newMatchingAnswers);
  };

  const goToNextQuestion = () => {
    // Check if current question has been answered
    const currentQuestion = questions[currentQuestionIndex];
    const currentAnswer = userAnswers[currentQuestionIndex];
    const currentMatching = userMatchingAnswers[currentQuestionIndex];
    
    // Validation based on question type
    let isAnswered = false;
    switch (currentQuestion?.questionType) {
      case 'multiple-choice':
        isAnswered = currentAnswer !== null;
        break;
      case 'short-answer':
      case 'long-answer':
        isAnswered = typeof currentAnswer === 'string' && currentAnswer.trim().length > 0;
        break;
      case 'matching':
        isAnswered = Array.isArray(currentMatching) && 
                    currentMatching.filter(m => m !== undefined).length === 
                    currentQuestion.matchingItems?.length;
        break;
    }
    
    if (!isAnswered) {
      toast.warning("Please answer the question before continuing");
      return;
    }
    
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
    setIsAnalyzing(true);
    
    try {
      // Create preliminary results
      const results: QuizResultItem[] = questions.map((q, index) => {
        let isCorrect = false;
        switch (q.questionType) {
          case 'multiple-choice':
            isCorrect = userAnswers[index] === q.correctAnswer;
            return {
              question: q.question,
              questionType: q.questionType,
              userAnswer: userAnswers[index],
              correctAnswer: q.correctAnswer,
              isCorrect
            };
          case 'matching':
            // Compare user matching with correct matching
            isCorrect = userMatchingAnswers[index]?.every((rightIndex, leftIndex) => 
              rightIndex === q.correctMatching?.[leftIndex]) ?? false;
            return {
              question: q.question,
              questionType: q.questionType,
              userAnswer: null,
              userMatching: userMatchingAnswers[index],
              correctMatching: q.correctMatching,
              isCorrect
            };
          case 'short-answer':
          case 'long-answer':
            // Text answers need AI analysis
            return {
              question: q.question,
              questionType: q.questionType,
              userAnswer: userAnswers[index] as string,
              isCorrect: false, // Temporary until analyzed
              marks: 0, // Will be updated after analysis
              possibleMarks: q.marks
            };
        }
      });
      
      setQuizResults(results);
      setQuizFinished(true);
      
      // Generate analysis based on quiz results
      const analysis = await generateQuizAnalysis({
        topic,
        difficulty,
        questions,
        userAnswers,
        userMatchingAnswers,
        score: {
          correct: results.filter(r => r.isCorrect).length,
          total: questions.length
        }
      });
      
      setQuizAnalysis(analysis);
    } catch (error) {
      console.error('Error generating quiz analysis:', error);
      toast.error('Unable to generate performance analysis');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const restartQuiz = () => {
    setUserAnswers(new Array(questions.length).fill(null));
    setUserMatchingAnswers(new Array(questions.length).fill([]));
    setCurrentQuestionIndex(0);
    setQuizFinished(false);
    setShowExplanation(false);
    setQuizAnalysis(null);
  };

  const createNewQuiz = () => {
    setQuestions([]);
    setUserAnswers([]);
    setUserMatchingAnswers([]);
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
    isAnalyzing,
    questions,
    currentQuestionIndex,
    userAnswers,
    userMatchingAnswers,
    showExplanation,
    quizFinished,
    quizResults,
    score,
    quizAnalysis,
    generateQuiz,
    handleAnswerSelection,
    handleTextAnswer,
    handleMatchingAnswer,
    goToNextQuestion,
    goToPreviousQuestion,
    toggleExplanation,
    restartQuiz,
    createNewQuiz
  };
};
