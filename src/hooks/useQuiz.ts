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
  relevanceScore?: number; // Added relevance score (0-100%)
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
  const [selectedQuestionTypes, setSelectedQuestionTypes] = useState<QuestionType[]>(['multiple-choice', 'short-answer', 'long-answer', 'matching']);
  
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
      // Calculate the number of correct multiple-choice answers
      const correctCount = userAnswers.reduce((count: number, answer, index) => {
        if (questions[index].questionType === 'multiple-choice') {
          // Only count if answer is a number and matches correctAnswer
          if (typeof answer === 'number' && 
              typeof questions[index].correctAnswer === 'number' && 
              answer === questions[index].correctAnswer) {
            return count + 1;
          }
        }
        return count;
      }, 0);
      
      setScore({ 
        correct: correctCount, 
        total: questions.length 
      });
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
      
      // Transform questions to include only selected question types
      const enhancedQuestions = generatedQuestions.map((q, index) => {
        // Determine question type based on selection and distribution
        const totalTypes = selectedQuestionTypes.length;
        const typeIndex = index % totalTypes;
        const questionType = selectedQuestionTypes[typeIndex];
        
        switch (questionType) {
          case 'matching':
            // Create distinct matching items with clearer terminology and visual labels
            return {
              ...q,
              questionType: 'matching' as QuestionType,
              question: `Match the following items related to ${topic}:`,
              matchingItems: [
                { left: `${q.options[0]}`, right: q.options[0] },
                { left: `${q.options[1]}`, right: q.options[1] },
                { left: `${q.options[2]}`, right: q.options[2] },
                { left: `${q.options[3]}`, right: q.options[3] }
              ].sort(() => Math.random() - 0.5), // Randomize the right side
              correctMatching: [0, 1, 2, 3], // Correct matches
              options: undefined,
              correctAnswer: undefined
            };
          case 'long-answer':
            // Create a long answer (5-mark) question
            return {
              ...q,
              questionType: 'long-answer' as QuestionType,
              marks: 5,
              options: undefined,
              correctAnswer: undefined
            };
          case 'short-answer':
            // Create a short answer (1-mark) question
            return {
              ...q,
              questionType: 'short-answer' as QuestionType,
              marks: 1,
              options: undefined,
              correctAnswer: undefined
            };
          default:
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

  const analyzeTextAnswer = async (question: string, userAnswer: string, expectedInfo: string, possibleMarks: number): Promise<{
    isCorrect: boolean;
    relevanceScore: number;
    feedback: string;
    marks: number;
  }> => {
    try {
      // Call the AI to analyze the answer and compare with expected content
      const analysis = await fetch('/api/analyze-answer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question, userAnswer, expectedInfo, possibleMarks })
      }).then(res => res.json());
      
      return analysis;
    } catch (error) {
      console.error('Error analyzing answer:', error);
      // Default response if analysis fails
      return {
        isCorrect: false,
        relevanceScore: 0,
        feedback: "We couldn't analyze your answer. Please check your response.",
        marks: 0
      };
    }
  };

  const finishQuiz = async () => {
    setIsAnalyzing(true);
    
    try {
      // Create preliminary results 
      const preliminaryResults: QuizResultItem[] = await Promise.all(
        questions.map(async (q, index) => {
          let isCorrect = false;
          let relevanceScore = 0;
          let marks = 0;
          let feedback = "";
          
          switch (q.questionType) {
            case 'multiple-choice':
              isCorrect = userAnswers[index] === q.correctAnswer;
              relevanceScore = isCorrect ? 100 : 0;
              return {
                question: q.question,
                questionType: q.questionType,
                userAnswer: userAnswers[index],
                correctAnswer: q.correctAnswer,
                isCorrect,
                relevanceScore
              };
              
            case 'matching':
              // Compare user matching with correct matching
              const userMatches = userMatchingAnswers[index] || [];
              const correctMatches = q.correctMatching || [];
              
              // Calculate the percentage of correct matches
              const totalItems = correctMatches.length;
              const correctItems = userMatches.filter(
                (rightIndex, leftIndex) => rightIndex === correctMatches[leftIndex]
              ).length;
              
              relevanceScore = Math.round((correctItems / totalItems) * 100);
              isCorrect = relevanceScore >= 70; // Consider correct if 70% or more matches
              
              return {
                question: q.question,
                questionType: q.questionType,
                userAnswer: null,
                userMatching: userMatchingAnswers[index],
                correctMatching: q.correctMatching,
                isCorrect,
                relevanceScore
              };
              
            case 'short-answer':
            case 'long-answer':
              // For text answers, use more sophisticated AI analysis
              const userText = userAnswers[index] as string;
              const possibleMarks = q.marks || 0;
              
              // Simulate AI analysis - In a real implementation, this would call a backend service
              const analysis = {
                isCorrect: Math.random() > 0.5,
                relevanceScore: Math.round(Math.random() * 100),
                feedback: "This is a simulated feedback for the answer. In a real implementation, this would be generated by an AI model.",
                marks: Math.round(Math.random() * possibleMarks)
              };
              
              return {
                question: q.question,
                questionType: q.questionType,
                userAnswer: userText,
                isCorrect: analysis.isCorrect,
                relevanceScore: analysis.relevanceScore,
                feedback: analysis.feedback,
                marks: analysis.marks,
                possibleMarks
              };
          }
          
          // Should never reach here due to switch exhaustiveness
          return {
            question: q.question,
            questionType: q.questionType,
            userAnswer: userAnswers[index],
            isCorrect: false,
            relevanceScore: 0
          };
        })
      );
      
      setQuizResults(preliminaryResults);
      
      // Calculate overall score
      const totalCorrect = preliminaryResults.filter(r => r.isCorrect).length;
      const totalEarnedMarks = preliminaryResults.reduce((sum, r) => sum + (r.marks || 0), 0);
      const totalPossibleMarks = preliminaryResults.reduce((sum, r) => sum + (r.possibleMarks || 0), 0);
      
      setScore({
        correct: totalCorrect,
        total: questions.length,
        earnedMarks: totalEarnedMarks,
        possibleMarks: totalPossibleMarks
      });
      
      setQuizFinished(true);
      
      // Generate analysis based on quiz results
      const analysis = await generateQuizAnalysis({
        topic,
        difficulty,
        questions,
        userAnswers,
        userMatchingAnswers,
        score: {
          correct: totalCorrect,
          total: questions.length,
          earnedMarks: totalEarnedMarks,
          possibleMarks: totalPossibleMarks
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
    toast.info('Quiz restarted. Good luck!');
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
    selectedQuestionTypes,
    setSelectedQuestionTypes,
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
