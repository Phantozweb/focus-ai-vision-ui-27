
import React from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { QuizDifficulty } from '@/utils/gemini';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Book, GraduationCap, CheckSquare } from 'lucide-react'; 
import { QuestionType } from '@/hooks/useQuiz';
import { Checkbox } from '@/components/ui/checkbox';

interface QuizGeneratorProps {
  topic: string;
  setTopic: (topic: string) => void;
  questionCount: number;
  setQuestionCount: (count: number) => void;
  difficulty: QuizDifficulty;
  setDifficulty: (difficulty: QuizDifficulty) => void;
  selectedQuestionTypes?: QuestionType[];
  setSelectedQuestionTypes?: (types: QuestionType[]) => void;
  generateQuiz: () => void;
  isGenerating: boolean;
}

const QuizGenerator: React.FC<QuizGeneratorProps> = ({
  topic,
  setTopic,
  questionCount,
  setQuestionCount,
  difficulty,
  setDifficulty,
  selectedQuestionTypes = ['multiple-choice'],
  setSelectedQuestionTypes = () => {},
  generateQuiz,
  isGenerating
}) => {
  const questionTypes: { value: QuestionType; label: string }[] = [
    { value: 'multiple-choice', label: 'Multiple Choice' },
    { value: 'short-answer', label: 'Short Answer' },
    { value: 'long-answer', label: 'Long Answer' },
    { value: 'matching', label: 'Matching' }
  ];

  const toggleQuestionType = (type: QuestionType) => {
    if (selectedQuestionTypes.includes(type)) {
      // Don't allow removing the last question type
      if (selectedQuestionTypes.length === 1) {
        return;
      }
      setSelectedQuestionTypes(selectedQuestionTypes.filter(t => t !== type));
    } else {
      setSelectedQuestionTypes([...selectedQuestionTypes, type]);
    }
  };

  return (
    <Card className="mb-8 border-t-4 border-t-sky-500 shadow-lg">
      <CardHeader className="bg-sky-50">
        <div className="flex items-center gap-2">
          <div>
            <GraduationCap className="h-8 w-8 text-sky-600" />
          </div>
          <div>
            <CardTitle className="text-sky-800">Generate a Quiz</CardTitle>
            <CardDescription>Create a custom quiz on any optometry topic</CardDescription>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6 pt-6">
        <div>
          <label htmlFor="topic" className="block text-sm font-medium text-gray-700 mb-1">Topic</label>
          <Input
            id="topic"
            placeholder="Enter an optometry topic (e.g., Glaucoma, Contact lenses, etc.)"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            className="w-full border-sky-200 focus:ring-sky-500 focus:border-sky-500"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Number of Questions</label>
          <div className="flex flex-wrap gap-2">
            {[5, 10, 15, 20, 30].map(count => (
              <Button
                key={count}
                type="button"
                variant={questionCount === count ? "default" : "outline"}
                onClick={() => setQuestionCount(count)}
                className={questionCount === count ? "bg-sky-500 hover:bg-sky-600" : "border-sky-300 text-sky-700 hover:bg-sky-50"}
                size="sm"
              >
                {count}
              </Button>
            ))}
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Difficulty Level</label>
          <div className="flex flex-wrap gap-2">
            {(['easy', 'medium', 'hard'] as const).map((level) => (
              <Button
                key={level}
                type="button"
                variant={difficulty === level ? "default" : "outline"}
                onClick={() => setDifficulty(level)}
                className={difficulty === level ? "bg-sky-500 hover:bg-sky-600" : "border-sky-300 text-sky-700 hover:bg-sky-50"}
                size="sm"
              >
                {level.charAt(0).toUpperCase() + level.slice(1)}
              </Button>
            ))}
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Question Types</label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {questionTypes.map((type) => (
              <div key={type.value} className="flex items-center space-x-2">
                <Checkbox 
                  id={`type-${type.value}`}
                  checked={selectedQuestionTypes.includes(type.value)}
                  onCheckedChange={() => toggleQuestionType(type.value)}
                  disabled={selectedQuestionTypes.length === 1 && selectedQuestionTypes.includes(type.value)}
                />
                <label 
                  htmlFor={`type-${type.value}`}
                  className={`text-sm ${selectedQuestionTypes.includes(type.value) ? 'font-medium text-sky-700' : 'text-gray-600'}`}
                >
                  {type.label}
                </label>
              </div>
            ))}
          </div>
          <div className="mt-2 text-xs text-gray-500">
            Select at least one question type for your quiz
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="bg-sky-50">
        <Button
          onClick={generateQuiz}
          className="w-full bg-sky-500 hover:bg-sky-600 flex items-center gap-2"
          disabled={isGenerating}
        >
          <GraduationCap className="h-5 w-5" />
          {isGenerating ? 'Generating Quiz...' : 'Generate Quiz'}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default QuizGenerator;
