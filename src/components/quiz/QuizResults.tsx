import React from 'react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Check, X, BookOpen, BarChart, FileText, FileCheck, Award, RotateCw } from 'lucide-react';
import { QuizResultItem, QuizScore, QuizAnalysis, QuestionType } from '@/hooks/useQuiz';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import CaseMarkdown from '@/components/CaseMarkdown';
import { Badge } from '@/components/ui/badge';

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
  // Helper function to render different result types
  const renderResultContent = (result: QuizResultItem, idx: number) => {
    switch (result.questionType) {
      case 'multiple-choice':
        return (
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
        );
      
      case 'short-answer':
      case 'long-answer':
        return (
          <div className="space-y-3 mb-4">
            <div className="flex justify-between items-center">
              <Badge variant={result.isCorrect ? "success" : "destructive"}>
                {result.marks}/{result.possibleMarks} marks
              </Badge>
              
              <div className="flex items-center gap-1">
                <span className="text-xs text-gray-500">Relevance:</span>
                <Badge variant={
                  result.relevanceScore && result.relevanceScore >= 80 ? "success" :
                  result.relevanceScore && result.relevanceScore >= 50 ? "outline" : "destructive"
                } className="text-xs">
                  {result.relevanceScore}%
                </Badge>
              </div>
            </div>
            
            <div className="border rounded-md p-3 bg-gray-50">
              <h6 className="text-sm font-medium text-gray-700 mb-1">Your Answer:</h6>
              <div className="whitespace-pre-wrap text-gray-600">
                {typeof result.userAnswer === 'string' ? result.userAnswer : 'No answer provided'}
              </div>
            </div>
            
            {result.feedback && (
              <div className="border rounded-md p-3 bg-blue-50 border-blue-100">
                <h6 className="text-sm font-medium text-blue-700 mb-1">Feedback:</h6>
                <CaseMarkdown content={result.feedback} />
              </div>
            )}
          </div>
        );
      
      case 'matching':
        return (
          <div className="space-y-3 mb-4">
            <div className="flex justify-between items-center">
              <Badge variant={result.relevanceScore && result.relevanceScore >= 70 ? "success" : "destructive"}>
                {result.relevanceScore}% match
              </Badge>
            </div>
            
            <h6 className="text-sm font-medium">Your Matching:</h6>
            {questions[idx].matchingItems?.map((item: any, leftIdx: number) => {
              // Check if this matching has a user answer
              const userMatchingIndex = result.userMatching?.[leftIdx];
              const isCorrectMatch = userMatchingIndex === leftIdx;
              
              return (
                <div 
                  key={leftIdx} 
                  className={`flex flex-col sm:flex-row items-start sm:items-center gap-2 p-2 rounded-md ${
                    isCorrectMatch ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
                  }`}
                >
                  <div className="flex-shrink-0 w-6">
                    {isCorrectMatch ? (
                      <Check className="h-4 w-4 text-green-600" />
                    ) : (
                      <X className="h-4 w-4 text-red-600" />
                    )}
                  </div>
                  
                  <span className="font-medium">{String.fromCharCode(65 + leftIdx)}. {item.left}</span>
                  <span className="hidden sm:block flex-grow text-center">→</span>
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-1 ml-4 sm:ml-0">
                    <span className="text-sm">
                      {userMatchingIndex !== undefined
                        ? questions[idx].matchingItems[userMatchingIndex]?.right || 'Unknown'
                        : 'No selection'}
                    </span>
                    {!isCorrectMatch && (
                      <span className="text-sm text-red-600 sm:ml-2">
                        (Correct: {questions[idx].matchingItems[leftIdx]?.right || 'Unknown'})
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        );
        
      default:
        return <div>Unknown question type</div>;
    }
  };
  
  // Calculate the marks-based score if available
  const hasMarksSystem = quizResults.some(r => r.possibleMarks !== undefined);
  const totalEarnedMarks = quizResults.reduce((sum, r) => sum + (r.marks || 0), 0);
  const totalPossibleMarks = quizResults.reduce((sum, r) => sum + (r.possibleMarks || 0), 0);
  
  // Calculate average relevance score
  const totalRelevanceScore = quizResults.reduce((sum, r) => sum + (r.relevanceScore || 0), 0);
  const relevanceItems = quizResults.filter(r => r.relevanceScore !== undefined).length;
  const averageRelevanceScore = relevanceItems > 0 ? 
    Math.round(totalRelevanceScore / relevanceItems) : 0;
  
  return (
    <div className="space-y-8">
      <Card className="shadow-lg">
        <CardHeader className="bg-sky-50 border-b border-sky-100">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
            <div>
              <CardTitle className="text-2xl font-bold text-sky-800">Quiz Results</CardTitle>
              <div className="flex flex-wrap items-center mt-2 gap-2">
                <p className="text-gray-500 text-sm">{topic}</p>
                <Badge variant="outline" className="font-normal flex items-center gap-1">
                  <Award className="h-3 w-3" />
                  {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)} Difficulty
                </Badge>
              </div>
            </div>
            
            <div className="text-right mt-3 sm:mt-0">
              {hasMarksSystem ? (
                <>
                  <span className="text-3xl font-bold text-sky-600">{totalEarnedMarks}/{totalPossibleMarks}</span>
                  <p className="text-gray-500">{Math.round(totalEarnedMarks / totalPossibleMarks * 100)}% marks</p>
                </>
              ) : (
                <>
                  <span className="text-3xl font-bold text-sky-600">{score.correct}/{score.total}</span>
                  <p className="text-gray-500">{Math.round(score.correct / score.total * 100)}%</p>
                </>
              )}
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="pt-4">
          <Progress 
            value={hasMarksSystem 
                ? (totalEarnedMarks / totalPossibleMarks * 100) 
                : (score.correct / score.total * 100)} 
            className="h-2.5 mb-6 bg-sky-100"
          />
          
          <div className="flex flex-wrap items-center gap-2 mb-4">
            {relevanceItems > 0 && (
              <Badge variant="outline" className="bg-sky-50">
                Relevance: {averageRelevanceScore}%
              </Badge>
            )}
            
            <Badge variant="outline" className="bg-sky-50">
              Questions: {quizResults.length}
            </Badge>
            
            <Badge variant="outline" className="bg-sky-50">
              {hasMarksSystem ? `Marks: ${totalEarnedMarks}/${totalPossibleMarks}` : `Correct: ${score.correct}`}
            </Badge>
          </div>
          
          {analysis && (
            <div className="bg-sky-50 p-4 rounded-lg mb-6 border border-sky-100">
              <div className="flex gap-2 items-center mb-3">
                <BarChart className="h-5 w-5 text-sky-600" />
                <h4 className="font-medium text-sky-800">Performance Analysis</h4>
              </div>
              
              <div className="prose prose-sm max-w-none">
                <CaseMarkdown content={analysis.summary || `You scored ${hasMarksSystem ? totalEarnedMarks : score.correct} out of ${hasMarksSystem ? totalPossibleMarks : score.total}.`} />
              </div>
              
              <div className="mt-4 grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div>
                  <h5 className="font-medium text-sky-700 mb-2 flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-600" />
                    Strengths:
                  </h5>
                  <ul className="list-disc pl-5 space-y-1">
                    {analysis.strengths.map((strength, idx) => (
                      <li key={idx} className="text-gray-700">{strength}</li>
                    ))}
                  </ul>
                </div>
                
                <div>
                  <h5 className="font-medium text-sky-700 mb-2 flex items-center gap-2">
                    <X className="h-4 w-4 text-amber-600" />
                    Areas for Improvement:
                  </h5>
                  <ul className="list-disc pl-5 space-y-1">
                    {analysis.areas_for_improvement.map((area, idx) => (
                      <li key={idx} className="text-gray-700">{area}</li>
                    ))}
                  </ul>
                </div>
              </div>
              
              <div className="mt-4">
                <h5 className="font-medium text-sky-700 mb-2 flex items-center gap-2">
                  <BookOpen className="h-4 w-4 text-sky-600" />
                  Focus Areas:
                </h5>
                <ul className="list-disc pl-5 space-y-1">
                  {analysis.focusAreas?.map((area, idx) => (
                    <li key={idx} className="text-gray-700">{area}</li>
                  ))}
                </ul>
              </div>
              
              {analysis.improvementTips && (
                <div className="mt-4 p-3 bg-blue-50 rounded-md border border-blue-100">
                  <h5 className="font-medium text-blue-700 mb-2 flex items-center gap-2">
                    <FileCheck className="h-4 w-4" />
                    Tips for Improvement:
                  </h5>
                  <ul className="list-disc pl-5 space-y-1 text-gray-700">
                    {analysis.improvementTips.map((tip, idx) => (
                      <li key={idx}>{tip}</li>
                    ))}
                  </ul>
                </div>
              )}
              
              {analysis.quickNotes && (
                <div className="mt-4 p-3 bg-amber-50 rounded-md border border-amber-100">
                  <h5 className="font-medium text-amber-700 mb-2 flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Quick Notes:
                  </h5>
                  <ul className="list-disc pl-5 space-y-1 text-gray-700">
                    {analysis.quickNotes.map((note, idx) => (
                      <li key={idx}>{note}</li>
                    ))}
                  </ul>
                </div>
              )}
              
              <div className="mt-4 p-3 bg-green-50 rounded-md border border-green-100">
                <h5 className="font-medium text-green-700 mb-2 flex items-center gap-2">
                  <Award className="h-4 w-4" />
                  Recommendation:
                </h5>
                <p className="text-gray-700">{analysis.recommendation}</p>
              </div>
            </div>
          )}
          
          <div className="flex flex-col sm:flex-row gap-4 mt-6">
            <Button
              onClick={restartQuiz}
              variant="outline"
              className="w-full sm:flex-1 border-sky-300 text-sky-700 hover:bg-sky-50 gap-2"
            >
              <RotateCw className="h-4 w-4" />
              Retake Quiz
            </Button>
            
            <Button
              onClick={createNewQuiz}
              className="w-full sm:flex-1 bg-sky-500 hover:bg-sky-600 gap-2"
            >
              <BookOpen className="h-4 w-4" />
              Create New Quiz
            </Button>
          </div>
        </CardContent>
      </Card>
      
      <div className="space-y-6">
        <h4 className="text-xl font-semibold text-sky-800 flex items-center gap-2">
          <BookOpen className="h-5 w-5 text-sky-600" />
          Question Review
        </h4>
        
        {quizResults.map((result, idx) => {
          // Determine question type icon
          let TypeIcon = BookOpen;
          let typeLabel = "Multiple Choice";
          
          switch (result.questionType) {
            case 'short-answer':
              TypeIcon = FileText;
              typeLabel = `Short Answer (${result.possibleMarks} mark)`;
              break;
            case 'long-answer':
              TypeIcon = FileText;
              typeLabel = `Long Answer (${result.possibleMarks} marks)`;
              break;
            case 'matching':
              TypeIcon = FileCheck;
              typeLabel = "Matching";
              break;
          }
          
          return (
            <Card key={idx} className={`overflow-hidden border-l-4 shadow-md ${
              result.isCorrect ? 'border-l-green-500' : 'border-l-red-500'
            }`}>
              <CardContent className="pt-6">
                <div className="flex flex-col sm:flex-row items-start gap-4">
                  <div className={`p-2 rounded-full ${
                    result.isCorrect ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                  }`}>
                    {result.isCorrect ? <Check className="h-5 w-5" /> : <X className="h-5 w-5" />}
                  </div>
                  
                  <div className="flex-1 w-full">
                    <div className="flex flex-col sm:flex-row justify-between mb-3 gap-2">
                      <h5 className="text-lg font-medium text-gray-800">{result.question}</h5>
                      <Badge variant="outline" className="sm:ml-2 flex items-center gap-1 w-fit">
                        <TypeIcon className="h-3 w-3" />
                        <span>{typeLabel}</span>
                      </Badge>
                    </div>
                    
                    {renderResultContent(result, idx)}
                    
                    <div className="bg-sky-50 p-4 rounded-md border border-sky-100">
                      <h6 className="font-medium text-sky-800 mb-1">Explanation:</h6>
                      <CaseMarkdown content={questions[idx].explanation} />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default QuizResults;
