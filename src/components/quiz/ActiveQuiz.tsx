
import React from 'react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { HelpCircle, ArrowLeft, ArrowRight, Book, RotateCw, AwardIcon } from 'lucide-react';
import { QuizQuestion, QuestionType } from '@/hooks/useQuiz';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { RadioGroup } from '@/components/ui/radio-group';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import CaseMarkdown from '@/components/CaseMarkdown';
import { Badge } from '@/components/ui/badge';

interface ActiveQuizProps {
  topic: string;
  difficulty: string;
  questions: QuizQuestion[];
  currentQuestionIndex: number;
  userAnswers: (number | null | string)[];
  userMatchingAnswers: number[][];
  showExplanation: boolean;
  handleAnswerSelection: (optionIndex: number) => void;
  handleTextAnswer: (answer: string) => void;
  handleMatchingAnswer: (leftIndex: number, rightIndex: number) => void;
  goToNextQuestion: () => void;
  goToPreviousQuestion: () => void;
  toggleExplanation: () => void;
}

const ActiveQuiz: React.FC<ActiveQuizProps> = ({
  topic,
  difficulty,
  questions,
  currentQuestionIndex,
  userAnswers,
  userMatchingAnswers,
  showExplanation,
  handleAnswerSelection,
  handleTextAnswer,
  handleMatchingAnswer,
  goToNextQuestion,
  goToPreviousQuestion,
  toggleExplanation,
}) => {
  const currentQuestion = questions[currentQuestionIndex];
  const currentAnswer = userAnswers[currentQuestionIndex];
  const currentMatching = userMatchingAnswers[currentQuestionIndex] || [];
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;
  
  const renderQuestionContent = () => {
    if (!currentQuestion) return <div>Question not found</div>;
    
    switch (currentQuestion.questionType) {
      case 'multiple-choice':
        return (
          <div className="space-y-3">
            {currentQuestion.options?.map((option, idx) => (
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
        );
        
      case 'short-answer':
        return (
          <div className="space-y-3">
            <div className="p-1 bg-sky-50 rounded-md text-xs text-sky-600">
              {currentQuestion.marks} mark question - Short answer required
            </div>
            <Textarea 
              value={typeof currentAnswer === 'string' ? currentAnswer : ''}
              onChange={(e) => handleTextAnswer(e.target.value)}
              placeholder="Type your answer here..."
              className="min-h-[100px]"
            />
          </div>
        );
        
      case 'long-answer':
        return (
          <div className="space-y-3">
            <div className="p-1 bg-sky-50 rounded-md text-xs text-sky-600">
              {currentQuestion.marks} mark question - Detailed answer required
            </div>
            <Textarea 
              value={typeof currentAnswer === 'string' ? currentAnswer : ''}
              onChange={(e) => handleTextAnswer(e.target.value)}
              placeholder="Type your detailed answer here..."
              className="min-h-[200px]"
            />
          </div>
        );
        
      case 'matching':
        return (
          <div className="space-y-5">
            <div className="p-1 bg-sky-50 rounded-md text-xs text-sky-600">
              Match each item on the left with its corresponding item on the right
            </div>
            <div className="grid grid-cols-1 gap-4">
              {currentQuestion.matchingItems?.map((item, leftIndex) => (
                <div key={leftIndex} className="flex items-center gap-3 border p-3 rounded-md">
                  <span className="font-medium text-gray-800">{item.left}</span>
                  <span className="flex-grow text-center">→</span>
                  <Select
                    value={currentMatching[leftIndex]?.toString() || ''}
                    onValueChange={(value) => handleMatchingAnswer(leftIndex, parseInt(value))}
                  >
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Select matching item" />
                    </SelectTrigger>
                    <SelectContent>
                      {currentQuestion.matchingItems?.map((rightItem, rightIndex) => (
                        <SelectItem key={rightIndex} value={rightIndex.toString()}>
                          {String.fromCharCode(65 + rightIndex)}. {rightItem.right}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              ))}
            </div>
          </div>
        );
        
      default:
        return <div>Unknown question type</div>;
    }
  };
  
  // Check if the current question can proceed to next
  const canProceed = () => {
    if (!currentQuestion) return false;
    
    switch (currentQuestion.questionType) {
      case 'multiple-choice':
        return currentAnswer !== null;
      case 'short-answer':
      case 'long-answer':
        return typeof currentAnswer === 'string' && currentAnswer.trim().length > 0;
      case 'matching':
        return currentMatching.filter(m => m !== undefined).length === 
               (currentQuestion.matchingItems?.length || 0);
      default:
        return false;
    }
  };
  
  // If questions array is empty or currentQuestion is undefined, show a loading state
  if (!currentQuestion) {
    return (
      <Card className="mb-8 border-t-4 border-t-sky-500 shadow-lg">
        <CardContent className="pt-6">
          <div className="text-center py-8">
            <p>Loading quiz questions...</p>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card className="mb-8 border-t-4 border-t-sky-500 shadow-lg">
      <CardHeader className="bg-sky-50 border-b border-sky-100 pb-2">
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="text-sky-800">{topic}</CardTitle>
            <div className="flex items-center mt-1 gap-2">
              <Badge variant="outline" className="font-normal text-xs flex items-center gap-1">
                <AwardIcon className="h-3 w-3" />
                {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)} Difficulty
              </Badge>
              <Badge variant="outline" className="font-normal text-xs">
                {currentQuestion.questionType === 'multiple-choice' ? 'Multiple Choice' : 
                 currentQuestion.questionType === 'short-answer' ? 'Short Answer' :
                 currentQuestion.questionType === 'long-answer' ? 'Long Answer' : 'Matching'}
              </Badge>
            </div>
          </div>
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
        
        {renderQuestionContent()}
        
        {showExplanation && (
          <div className="mt-6 p-4 bg-sky-50 border border-sky-100 rounded-md">
            <h3 className="font-medium text-sky-800 mb-2">Explanation:</h3>
            <CaseMarkdown content={currentQuestion.explanation} />
          </div>
        )}
      </CardContent>
      
      <CardFooter className="pt-4 flex justify-between flex-wrap gap-2 border-t border-gray-100 bg-gray-50">
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
            disabled={!canProceed()}
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
