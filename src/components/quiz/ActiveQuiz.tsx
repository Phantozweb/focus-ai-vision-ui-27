
import React from 'react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { HelpCircle, ArrowLeft, ArrowRight } from 'lucide-react';
import { QuizQuestion } from '@/hooks/useQuiz';

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
  
  return (
    <div className="tool-card mb-8">
      <div className="mb-4">
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-lg font-semibold text-white">Quiz: {topic}</h3>
          <span className="text-slate-400">Question {currentQuestionIndex + 1} of {questions.length}</span>
        </div>
        <Progress value={(currentQuestionIndex + 1) / questions.length * 100} className="h-1.5" />
      </div>
      
      <div className="py-4">
        <h4 className="text-xl font-medium text-white mb-6">{currentQuestion.question}</h4>
        
        <div className="space-y-3">
          {currentQuestion.options.map((option, idx) => (
            <button
              key={idx}
              onClick={() => handleAnswerSelection(idx)}
              className={`w-full text-left p-4 rounded-lg border transition-colors ${
                currentAnswer === idx 
                  ? 'bg-blue-900/30 border-blue-500 text-white' 
                  : 'border-slate-700 text-slate-300 hover:bg-darkBg-lighter'
              }`}
            >
              <span className="font-medium mr-2">{String.fromCharCode(65 + idx)}.</span> {option}
            </button>
          ))}
        </div>
        
        {showExplanation && (
          <div className="mt-6 p-4 bg-slate-800 rounded-lg">
            <h5 className="font-medium text-blue-400 mb-2">Explanation:</h5>
            <p className="text-slate-300">{currentQuestion.explanation}</p>
          </div>
        )}
        
        <div className="flex justify-between mt-8">
          <div>
            <Button
              variant="outline"
              onClick={toggleExplanation}
              className="bg-transparent border-slate-700 text-slate-300 hover:bg-slate-800"
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
              className="bg-transparent border-slate-700 text-slate-300 hover:bg-slate-800"
            >
              <ArrowLeft className="mr-2 h-4 w-4" /> Previous
            </Button>
            
            <Button
              onClick={goToNextQuestion}
              disabled={currentAnswer === null}
              className="bg-blue-600 hover:bg-blue-700 text-white"
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

export default ActiveQuiz;
