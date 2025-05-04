
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { toast } from '@/components/ui/sonner';
import { Check, X, ArrowLeft, ArrowRight, HelpCircle } from 'lucide-react';
import { generateQuizWithAnswers } from '@/utils/geminiApi';

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
    return (
      <div className="flex flex-col items-center justify-center p-8">
        <div className="text-center">
          <div className="mb-4">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
          </div>
          <p className="text-gray-600">Generating case-specific questions...</p>
        </div>
      </div>
    );
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
      <div className="p-6">
        <h3 className="text-xl font-bold text-gray-800 mb-4">Quiz Results</h3>
        
        <div className="bg-gray-50 p-6 rounded-lg border border-gray-200 mb-6">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h4 className="text-lg font-medium text-gray-800">Your Score</h4>
              <p className="text-gray-500">Case Quiz: {condition}</p>
            </div>
            <div className="text-right">
              <span className="text-3xl font-bold text-blue-600">{score.correct}/{score.total}</span>
              <p className="text-gray-500">{Math.round(score.correct / score.total * 100)}%</p>
            </div>
          </div>
          
          <Progress 
            value={score.correct / score.total * 100} 
            className="h-2.5 bg-gray-200" 
          />
        </div>
        
        <div className="space-y-4">
          {questions.map((question, idx) => (
            <div 
              key={idx} 
              className={`p-4 rounded-lg border ${
                userAnswers[idx] === question.correctAnswer 
                  ? 'border-green-200 bg-green-50' 
                  : 'border-red-200 bg-red-50'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className={`p-1 rounded-full ${
                  userAnswers[idx] === question.correctAnswer 
                    ? 'bg-green-100 text-green-500' 
                    : 'bg-red-100 text-red-500'
                }`}>
                  {userAnswers[idx] === question.correctAnswer 
                    ? <Check className="h-4 w-4" /> 
                    : <X className="h-4 w-4" />
                  }
                </div>
                
                <div className="flex-1">
                  <p className="font-medium text-gray-800 mb-2">{question.question}</p>
                  
                  <div className="text-sm text-gray-600 mb-1">
                    <span className="font-medium">Your answer:</span> {
                      userAnswers[idx] !== null
                        ? `${String.fromCharCode(65 + userAnswers[idx])}. ${question.options[userAnswers[idx]]}`
                        : 'No answer selected'
                    }
                  </div>
                  
                  {userAnswers[idx] !== question.correctAnswer && (
                    <div className="text-sm text-blue-600 mb-1">
                      <span className="font-medium">Correct answer:</span> {
                        `${String.fromCharCode(65 + question.correctAnswer)}. ${question.options[question.correctAnswer]}`
                      }
                    </div>
                  )}
                  
                  <div className="mt-2 pt-2 border-t border-gray-200">
                    <p className="text-gray-700 text-sm">{question.explanation}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        <div className="flex gap-4 mt-6">
          <Button
            onClick={restartQuiz}
            variant="outline"
            className="flex-1"
          >
            Retake Quiz
          </Button>
          
          <Button
            onClick={onClose}
            className="flex-1"
          >
            Close
          </Button>
        </div>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];
  const currentAnswer = userAnswers[currentQuestionIndex];

  return (
    <div className="p-6">
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-lg font-semibold text-gray-800">Case Quiz: {condition}</h3>
          <span className="text-gray-500">Question {currentQuestionIndex + 1} of {questions.length}</span>
        </div>
        <Progress value={(currentQuestionIndex + 1) / questions.length * 100} className="h-1.5 bg-gray-200" />
      </div>
      
      <div className="py-4">
        <h4 className="text-xl font-medium text-gray-800 mb-6">{currentQuestion.question}</h4>
        
        <div className="space-y-3">
          {currentQuestion.options.map((option, idx) => (
            <button
              key={idx}
              onClick={() => handleAnswerSelection(idx)}
              className={`w-full text-left p-4 rounded-lg border transition-colors ${
                currentAnswer === idx 
                  ? 'bg-blue-50 border-blue-300 text-gray-800' 
                  : 'border-gray-200 text-gray-700 hover:bg-gray-50'
              }`}
            >
              <span className="font-medium mr-2">{String.fromCharCode(65 + idx)}.</span> {option}
            </button>
          ))}
        </div>
        
        {showExplanation && (
          <div className="mt-6 p-4 bg-gray-50 border border-gray-200 rounded-lg">
            <h5 className="font-medium text-blue-600 mb-2">Explanation:</h5>
            <p className="text-gray-700">{currentQuestion.explanation}</p>
          </div>
        )}
        
        <div className="flex justify-between mt-8">
          <div>
            <Button
              variant="outline"
              onClick={toggleExplanation}
              className="text-gray-700"
            >
              <HelpCircle className="mr-2 h-4 w-4" /> 
              {showExplanation ? 'Hide Explanation' : 'Show Explanation'}
            </Button>
          </div>
          
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={goToPreviousQuestion}
              disabled={currentQuestionIndex === 0}
              className="text-gray-700"
            >
              <ArrowLeft className="mr-2 h-4 w-4" /> Previous
            </Button>
            
            <Button
              onClick={goToNextQuestion}
              disabled={currentAnswer === null}
            >
              {currentQuestionIndex < questions.length - 1 ? (
                <>Next <ArrowRight className="ml-2 h-4 w-4" /></>
              ) : (
                'Finish Quiz'
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuizInCase;
