
import React from 'react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { HelpCircle, ArrowLeft, ArrowRight, Book } from 'lucide-react';
import { QuizQuestion } from '@/hooks/useQuiz';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { RadioGroup } from '@/components/ui/radio-group';
import CaseMarkdown from '@/components/CaseMarkdown';

interface ActiveQuizProps {
  topic: string;
  questions: QuizQuestion[];
  currentQuestionIndex: number;
  userAnswers: (number | null)[];
  showExplanation: boolean;
  handleAnswerSelection: (optionIndex: number) => void;
  goToNextQuestion: () => void;
  goToPreviousQuestion: () => void;
  toggleExplanation: () => void;
}

const ActiveQuiz: React.FC<ActiveQuizProps> = ({
  topic,
  questions,
  currentQuestionIndex,
  userAnswers,
  showExplanation,
  handleAnswerSelection,
  goToNextQuestion,
  goToPreviousQuestion,
  toggleExplanation,
}) => {
  const currentQuestion = questions[currentQuestionIndex];
  const currentAnswer = userAnswers[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;
  
  return (
    <Card className="mb-8 border-t-4 border-t-sky-500 shadow-lg">
      <CardHeader className="bg-sky-50 border-b border-sky-100 pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="text-sky-800">{topic}</CardTitle>
          <span className="text-sm text-gray-500 font-medium">
            Question {currentQuestionIndex + 1} of {questions.length}
          </span>
        </div>
        <Progress 
          value={progress} 
          className="h-2 mt-2 bg-sky-100" 
        />
      </CardHeader>
      
      <CardContent className="pt-6">
        <h2 className="text-xl font-medium text-gray-800 mb-6">{currentQuestion.question}</h2>
        
        <div className="space-y-3">
          {currentQuestion.options.map((option, idx) => (
            <div 
              key={idx} 
              className={`flex items-center space-x-2 p-4 rounded-md border cursor-pointer transition-all ${
                currentAnswer === idx 
                  ? 'bg-sky-50 border-sky-300 shadow-sm' 
                  : 'border-gray-200 hover:bg-gray-50'
              }`}
              onClick={() => handleAnswerSelection(idx)}
            >
              <div className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ${
                currentAnswer === idx 
                  ? 'border-sky-500 text-sky-600' 
                  : 'border-gray-300'
              }`}>
                {currentAnswer === idx && <div className="h-2.5 w-2.5 rounded-full bg-sky-500" />}
              </div>
              <label className="flex-1 text-gray-700 cursor-pointer">
                {String.fromCharCode(65 + idx)}. {option}
              </label>
            </div>
          ))}
        </div>
        
        {showExplanation && (
          <div className="mt-6 p-4 bg-sky-50 border border-sky-100 rounded-md">
            <h3 className="font-medium text-sky-800 mb-2">Explanation:</h3>
            <CaseMarkdown content={currentQuestion.explanation} />
          </div>
        )}
      </CardContent>
      
      <CardFooter className="pt-4 flex justify-between border-t border-gray-100 bg-gray-50">
        <Button
          variant="outline"
          onClick={toggleExplanation}
          size="sm"
          className="gap-1 border-sky-300 text-sky-700 hover:bg-sky-50"
        >
          <HelpCircle className="h-4 w-4" /> 
          {showExplanation ? 'Hide Explanation' : 'Show Explanation'}
        </Button>
        
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={goToPreviousQuestion}
            disabled={currentQuestionIndex === 0}
            size="sm"
            className="gap-1 border-sky-300 text-sky-700 hover:bg-sky-50"
          >
            <ArrowLeft className="h-4 w-4" /> Previous
          </Button>
          
          <Button
            onClick={goToNextQuestion}
            disabled={currentAnswer === null}
            size="sm"
            className="gap-1 bg-sky-500 hover:bg-sky-600"
          >
            {currentQuestionIndex < questions.length - 1 ? (
              <>Next <ArrowRight className="h-4 w-4" /></>
            ) : (
              'Finish Quiz'
            )}
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};

export default ActiveQuiz;
