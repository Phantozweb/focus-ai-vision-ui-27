
import React from 'react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { HelpCircle, ArrowLeft, ArrowRight } from 'lucide-react';

interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

interface QuizInCaseQuestionProps {
  condition: string;
  questions: QuizQuestion[];
  currentQuestionIndex: number;
  userAnswers: (number | null)[];
  showExplanation: boolean;
  handleAnswerSelection: (optionIndex: number) => void;
  goToNextQuestion: () => void;
  goToPreviousQuestion: () => void;
  toggleExplanation: () => void;
}

const QuizInCaseQuestion: React.FC<QuizInCaseQuestionProps> = ({
  condition,
  questions,
  currentQuestionIndex,
  userAnswers,
  showExplanation,
  handleAnswerSelection,
  goToNextQuestion,
  goToPreviousQuestion,
  toggleExplanation
}) => {
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

export default QuizInCaseQuestion;
