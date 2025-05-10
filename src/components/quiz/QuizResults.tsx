
import React from 'react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Check, X, BookOpen, BarChart } from 'lucide-react';
import { QuizResultItem, QuizScore, QuizAnalysis } from '@/hooks/useQuiz';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import CaseMarkdown from '@/components/CaseMarkdown';

interface QuizResultsProps {
  topic: string;
  difficulty: string;
  quizResults: QuizResultItem[];
  score: QuizScore;
  questions: any[];
  restartQuiz: () => void;
  createNewQuiz: () => void;
  analysis: QuizAnalysis | null;
}

const QuizResults: React.FC<QuizResultsProps> = ({
  topic,
  difficulty,
  quizResults,
  score,
  questions,
  restartQuiz,
  createNewQuiz,
  analysis
}) => {
  return (
    <div className="space-y-8">
      <Card className="shadow-lg">
        <CardHeader className="bg-sky-50 border-b border-sky-100">
          <CardTitle className="flex justify-between items-center">
            <div>
              <h3 className="text-2xl font-bold text-sky-800">Quiz Results</h3>
              <p className="text-gray-500 text-sm mt-1">{topic} - {difficulty} difficulty</p>
            </div>
            <div className="text-right">
              <span className="text-3xl font-bold text-sky-600">{score.correct}/{score.total}</span>
              <p className="text-gray-500">{Math.round(score.correct / score.total * 100)}%</p>
            </div>
          </CardTitle>
        </CardHeader>
        
        <CardContent className="pt-4">
          <Progress 
            value={score.correct / score.total * 100} 
            className="h-2.5 mb-6 bg-sky-100"
          />
          
          {analysis && (
            <div className="bg-sky-50 p-4 rounded-lg mb-6 border border-sky-100">
              <div className="flex gap-2 items-center mb-3">
                <BarChart className="h-5 w-5 text-sky-600" />
                <h4 className="font-medium text-sky-800">Performance Analysis</h4>
              </div>
              <CaseMarkdown content={analysis.summary} />
              
              <div className="mt-4">
                <h5 className="font-medium text-sky-700 mb-2">Focus Areas:</h5>
                <ul className="list-disc pl-5 space-y-1">
                  {analysis.focusAreas.map((area, idx) => (
                    <li key={idx} className="text-gray-700">{area}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
      
      <div className="space-y-6">
        <h4 className="text-xl font-semibold text-sky-800 flex items-center gap-2">
          <BookOpen className="h-5 w-5 text-sky-600" />
          Question Review
        </h4>
        
        {quizResults.map((result, idx) => (
          <Card key={idx} className={`overflow-hidden border-l-4 shadow-md ${
            result.isCorrect ? 'border-l-green-500' : 'border-l-red-500'
          }`}>
            <CardContent className="pt-6">
              <div className="flex items-start gap-4">
                <div className={`p-2 rounded-full ${
                  result.isCorrect ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                }`}>
                  {result.isCorrect ? <Check className="h-5 w-5" /> : <X className="h-5 w-5" />}
                </div>
                
                <div className="flex-1">
                  <h5 className="text-lg font-medium text-gray-800 mb-3">{result.question}</h5>
                  
                  <RadioGroup 
                    value={result.userAnswer !== null ? result.userAnswer.toString() : ''} 
                    className="space-y-2 mb-4"
                  >
                    {questions[idx].options.map((option: string, optIdx: number) => (
                      <div 
                        key={optIdx} 
                        className={`flex items-center space-x-2 p-3 rounded-md ${
                          optIdx === result.correctAnswer && optIdx === result.userAnswer
                            ? 'bg-green-50 border border-green-200'
                            : optIdx === result.correctAnswer
                            ? 'bg-green-50 border border-green-200'
                            : optIdx === result.userAnswer
                            ? 'bg-red-50 border border-red-200'
                            : 'bg-gray-50 border border-gray-200'
                        }`}
                      >
                        <RadioGroupItem value={optIdx.toString()} disabled id={`option-${idx}-${optIdx}`} />
                        <label 
                          htmlFor={`option-${idx}-${optIdx}`}
                          className="flex-1 text-sm font-medium cursor-pointer"
                        >
                          <div className="flex justify-between">
                            <span>{String.fromCharCode(65 + optIdx)}. {option}</span>
                            {optIdx === result.correctAnswer && (
                              <Check className="h-4 w-4 text-green-600" />
                            )}
                            {optIdx === result.userAnswer && optIdx !== result.correctAnswer && (
                              <X className="h-4 w-4 text-red-600" />
                            )}
                          </div>
                        </label>
                      </div>
                    ))}
                  </RadioGroup>
                  
                  <div className="bg-sky-50 p-4 rounded-md border border-sky-100">
                    <h6 className="font-medium text-sky-800 mb-1">Explanation:</h6>
                    <CaseMarkdown content={questions[idx].explanation} />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      
      <div className="flex gap-4 py-4">
        <Button
          onClick={restartQuiz}
          variant="outline"
          className="flex-1 border-sky-300 text-sky-700 hover:bg-sky-50"
        >
          Retake Quiz
        </Button>
        
        <Button
          onClick={createNewQuiz}
          className="flex-1 bg-sky-500 hover:bg-sky-600"
        >
          Create New Quiz
        </Button>
      </div>
    </div>
  );
};

export default QuizResults;
