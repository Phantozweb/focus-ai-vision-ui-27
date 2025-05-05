
import React from 'react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Check, X } from 'lucide-react';
import { QuizResultItem, QuizScore } from '@/hooks/useQuiz';

interface QuizResultsProps {
  topic: string;
  difficulty: string;
  quizResults: QuizResultItem[];
  score: QuizScore;
  questions: any[];
  restartQuiz: () => void;
  createNewQuiz: () => void;
}

const QuizResults: React.FC<QuizResultsProps> = ({
  topic,
  difficulty,
  quizResults,
  score,
  questions,
  restartQuiz,
  createNewQuiz
}) => {
  return (
    <div className="tool-card mb-8">
      <h3 className="text-2xl font-bold text-white mb-4">Quiz Results</h3>
      
      <div className="bg-darkBg-lighter p-6 rounded-lg mb-6">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h4 className="text-lg font-medium text-white">Your Score</h4>
            <p className="text-slate-400">{topic} - {difficulty} difficulty</p>
          </div>
          <div className="text-right">
            <span className="text-3xl font-bold text-blue-400">{score.correct}/{score.total}</span>
            <p className="text-slate-400">{Math.round(score.correct / score.total * 100)}%</p>
          </div>
        </div>
        
        <Progress 
          value={score.correct / score.total * 100} 
          className="h-2.5" 
        />
      </div>
      
      <div className="space-y-6">
        <h4 className="text-lg font-medium text-white mb-2">Question Summary</h4>
        
        {quizResults.map((result, idx) => (
          <div 
            key={idx} 
            className={`p-4 rounded-lg border ${
              result.isCorrect 
                ? 'border-green-500/50 bg-green-950/20' 
                : 'border-red-500/50 bg-red-950/20'
            }`}
          >
            <div className="flex items-start gap-3">
              <div className={`p-1.5 rounded-full ${
                result.isCorrect ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
              }`}>
                {result.isCorrect ? <Check className="h-5 w-5" /> : <X className="h-5 w-5" />}
              </div>
              
              <div className="flex-1">
                <h5 className="font-medium text-white mb-2">{result.question}</h5>
                
                <div className="text-sm text-slate-400 mb-1">
                  <span className="font-medium">Your answer:</span> {
                    result.userAnswer !== null
                      ? `${String.fromCharCode(65 + result.userAnswer)}. ${questions[idx].options[result.userAnswer]}`
                      : 'No answer selected'
                  }
                </div>
                
                {!result.isCorrect && (
                  <div className="text-sm text-blue-400 mb-1">
                    <span className="font-medium">Correct answer:</span> {
                      `${String.fromCharCode(65 + result.correctAnswer)}. ${questions[idx].options[result.correctAnswer]}`
                    }
                  </div>
                )}
                
                <div className="mt-3 pt-3 border-t border-slate-700/50">
                  <p className="text-slate-300 text-sm">{questions[idx].explanation}</p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      <div className="flex gap-4 mt-8">
        <Button
          onClick={restartQuiz}
          variant="outline"
          className="flex-1 bg-transparent border-slate-700 text-slate-300 hover:bg-slate-800"
        >
          Retake Quiz
        </Button>
        
        <Button
          onClick={createNewQuiz}
          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
        >
          Create New Quiz
        </Button>
      </div>
    </div>
  );
};

export default QuizResults;
