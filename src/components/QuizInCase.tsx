
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { toast } from '@/components/ui/sonner';
import { Check, X, ArrowLeft, ArrowRight, HelpCircle } from 'lucide-react';
import { generateQuizWithAnswers } from '@/utils/geminiApi';
import QuizInCaseLoading from './quiz/QuizInCaseLoading';
import QuizInCaseQuestion from './quiz/QuizInCaseQuestion';
import QuizInCaseResults from './quiz/QuizInCaseResults';

interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

interface QuizInCaseProps {
  condition: string;
  onClose: () => void;
}

const QuizInCase = ({ condition, onClose }: QuizInCaseProps) => {
  const [isLoading, setIsLoading] = useState(true);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<(number | null)[]>([]);
  const [showExplanation, setShowExplanation] = useState(false);
  const [quizFinished, setQuizFinished] = useState(false);
  const [score, setScore] = useState({ correct: 0, total: 0 });

  useEffect(() => {
    generateQuiz();
  }, [condition]);

  useEffect(() => {
    if (quizFinished && questions.length > 0) {
      const correct = userAnswers.reduce((count, answer, index) => {
        return answer === questions[index].correctAnswer ? count + 1 : count;
      }, 0);
      setScore({ correct, total: questions.length });
    }
  }, [quizFinished, questions, userAnswers]);

  const generateQuiz = async () => {
    setIsLoading(true);
    try {
      const generatedQuestions = await generateQuizWithAnswers(condition, 5, 'medium');
      setQuestions(generatedQuestions);
      setUserAnswers(new Array(generatedQuestions.length).fill(null));
    } catch (error) {
      console.error('Error generating quiz:', error);
      toast.error('Failed to generate quiz questions');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnswerSelection = (optionIndex: number) => {
    if (quizFinished) return;
    
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

  const finishQuiz = () => {
    setQuizFinished(true);
  };

  const restartQuiz = () => {
    setUserAnswers(new Array(questions.length).fill(null));
    setCurrentQuestionIndex(0);
    setQuizFinished(false);
    setShowExplanation(false);
  };

  if (isLoading) {
    return <QuizInCaseLoading />;
  }

  if (questions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Unable to generate questions for this case.</p>
          <Button onClick={onClose}>Close</Button>
        </div>
      </div>
    );
  }

  if (quizFinished) {
    return (
      <QuizInCaseResults
        condition={condition}
        questions={questions}
        userAnswers={userAnswers}
        score={score}
        restartQuiz={restartQuiz}
        onClose={onClose}
      />
    );
  }

  return (
    <QuizInCaseQuestion
      condition={condition}
      questions={questions}
      currentQuestionIndex={currentQuestionIndex}
      userAnswers={userAnswers}
      showExplanation={showExplanation}
      handleAnswerSelection={handleAnswerSelection}
      goToNextQuestion={goToNextQuestion}
      goToPreviousQuestion={goToPreviousQuestion}
      toggleExplanation={toggleExplanation}
    />
  );
};

export default QuizInCase;
