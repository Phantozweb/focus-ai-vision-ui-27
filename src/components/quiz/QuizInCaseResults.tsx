
import React from 'react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Check, X } from 'lucide-react';

interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

interface QuizInCaseResultsProps {
  condition: string;
  questions: QuizQuestion[];
  userAnswers: (number | null)[];
  score: { correct: number, total: number };
  restartQuiz: () => void;
  onClose: () => void;
}

const QuizInCaseResults: React.FC<QuizInCaseResultsProps> = ({
  condition,
  questions,
  userAnswers,
  score,
  restartQuiz,
  onClose
}) => {
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
          className="flex-1 bg-sky-500 hover:bg-sky-600 text-white"
        >
          Close
        </Button>
      </div>
    </div>
  );
};

export default QuizInCaseResults;
