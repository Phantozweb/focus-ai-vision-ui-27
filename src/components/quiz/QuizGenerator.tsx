
import React from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { QuizDifficulty } from '@/utils/gemini';

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
    <div className="tool-card mb-8">
      <h2 className="text-2xl font-bold text-white mb-2">Create a Custom Quiz</h2>
      <p className="text-slate-400 mb-6">Generate practice questions on any optometry topic</p>
      
      <div className="space-y-4">
        <div>
          <label htmlFor="topic" className="block text-white mb-2">Topic</label>
          <Input
            id="topic"
            placeholder="Enter a specific optometry topic"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            className="w-full bg-darkBg border-slate-700 focus:border-focusBlue text-white"
          />
        </div>
        
        <div>
          <label htmlFor="questionCount" className="block text-white mb-2">Number of Questions</label>
          <div className="flex gap-2">
            {[5, 10, 15, 20].map(count => (
              <Button
                key={count}
                type="button"
                variant={questionCount === count ? "default" : "outline"}
                className={questionCount === count ? "bg-sky-500 text-white" : "bg-darkBg border-slate-700 text-slate-300"}
                onClick={() => setQuestionCount(count)}
              >
                {count}
              </Button>
            ))}
          </div>
        </div>
        
        <div>
          <label htmlFor="difficulty" className="block text-white mb-2">Difficulty Level</label>
          <div className="flex gap-2">
            {['easy', 'medium', 'hard'].map(level => (
              <Button
                key={level}
                type="button"
                variant={difficulty === level as QuizDifficulty ? "default" : "outline"}
                className={difficulty === level ? "bg-sky-500 text-white" : "bg-darkBg border-slate-700 text-slate-300"}
                onClick={() => setDifficulty(level as QuizDifficulty)}
              >
                {level.charAt(0).toUpperCase() + level.slice(1)}
              </Button>
            ))}
          </div>
        </div>
        
        <Button
          onClick={generateQuiz}
          className="w-full bg-sky-500 hover:bg-sky-600 text-white mt-4"
          disabled={isGenerating}
        >
          {isGenerating ? 'Generating...' : 'Generate Quiz'}
        </Button>
      </div>
    </div>
  );
};

export default QuizGenerator;
