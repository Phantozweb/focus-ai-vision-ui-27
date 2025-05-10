
import React from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { QuizDifficulty } from '@/utils/gemini';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';

interface QuizGeneratorProps {
  topic: string;
  setTopic: (topic: string) => void;
  questionCount: number;
  setQuestionCount: (count: number) => void;
  difficulty: QuizDifficulty;
  setDifficulty: (difficulty: QuizDifficulty) => void;
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
  generateQuiz,
  isGenerating
}) => {
  return (
    <Card className="mb-8 border-t-4 border-t-blue-500">
      <CardHeader>
        <CardTitle>Generate a Quiz</CardTitle>
        <CardDescription>Create a custom quiz on any optometry topic</CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        <div>
          <label htmlFor="topic" className="block text-sm font-medium text-gray-700 mb-1">Topic</label>
          <Input
            id="topic"
            placeholder="Enter an optometry topic (e.g., Glaucoma, Contact lenses, etc.)"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            className="w-full"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Number of Questions</label>
          <div className="flex gap-2">
            {[5, 10, 15, 20].map(count => (
              <Button
                key={count}
                type="button"
                variant={questionCount === count ? "default" : "outline"}
                onClick={() => setQuestionCount(count)}
                className={questionCount === count ? "bg-blue-600 hover:bg-blue-700" : ""}
                size="sm"
              >
                {count}
              </Button>
            ))}
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Difficulty Level</label>
          <div className="flex gap-2">
            {(['easy', 'medium', 'hard'] as const).map((level) => (
              <Button
                key={level}
                type="button"
                variant={difficulty === level ? "default" : "outline"}
                onClick={() => setDifficulty(level)}
                className={difficulty === level ? "bg-blue-600 hover:bg-blue-700" : ""}
                size="sm"
              >
                {level.charAt(0).toUpperCase() + level.slice(1)}
              </Button>
            ))}
          </div>
        </div>
      </CardContent>
      
      <CardFooter>
        <Button
          onClick={generateQuiz}
          className="w-full bg-blue-600 hover:bg-blue-700"
          disabled={isGenerating}
        >
          {isGenerating ? 'Generating Quiz...' : 'Generate Quiz'}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default QuizGenerator;
