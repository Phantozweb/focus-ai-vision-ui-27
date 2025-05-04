
import React, { useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/sonner';

const Quizzes = () => {
  const [topic, setTopic] = useState('');
  const [questionCount, setQuestionCount] = useState(5);
  const [difficulty, setDifficulty] = useState('medium');
  const [isGenerating, setIsGenerating] = useState(false);

  const generateQuiz = () => {
    if (!topic.trim()) {
      toast.error('Please enter a topic');
      return;
    }

    setIsGenerating(true);
    
    // Simulate quiz generation (in a real app, you'd make an API call)
    setTimeout(() => {
      toast.success(`Generated ${questionCount} ${difficulty} questions about ${topic}`);
      setIsGenerating(false);
      // In a real app, you'd display the quiz or navigate to it
    }, 1500);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1">
        <div className="container mx-auto px-4 py-6">
          <h1 className="text-xl text-blue-400 font-medium mb-6">Quiz Generator</h1>
          
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
                      className={questionCount === count ? "bg-blue-600 text-white" : "bg-darkBg border-slate-700 text-slate-300"}
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
                      variant={difficulty === level ? "default" : "outline"}
                      className={difficulty === level ? "bg-blue-600 text-white" : "bg-darkBg border-slate-700 text-slate-300"}
                      onClick={() => setDifficulty(level)}
                    >
                      {level.charAt(0).toUpperCase() + level.slice(1)}
                    </Button>
                  ))}
                </div>
              </div>
              
              <Button
                onClick={generateQuiz}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white mt-4"
                disabled={isGenerating}
              >
                {isGenerating ? 'Generating...' : 'Generate Quiz'}
              </Button>
            </div>
          </div>
          
          <div className="tool-card">
            <h2 className="text-2xl font-bold text-white mb-4">Past Quizzes</h2>
            
            <div className="space-y-4">
              <QuizHistoryItem
                title="Glaucoma Diagnosis"
                date="May 3, 2025"
                score="8/10"
                questions={10}
                difficulty="Medium"
              />
              <QuizHistoryItem
                title="Retina Pathology"
                date="May 1, 2025"
                score="7/10"
                questions={10}
                difficulty="Hard"
              />
              <QuizHistoryItem
                title="Contact Lens Fitting"
                date="Apr 28, 2025"
                score="9/10" 
                questions={10}
                difficulty="Easy"
              />
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

interface QuizHistoryItemProps {
  title: string;
  date: string;
  score: string;
  questions: number;
  difficulty: string;
}

const QuizHistoryItem = ({ title, date, score, questions, difficulty }: QuizHistoryItemProps) => {
  return (
    <div 
      className="flex justify-between items-center p-4 border border-slate-800 rounded-lg hover:bg-darkBg-lighter transition-colors cursor-pointer"
      onClick={() => toast.info(`This would open the "${title}" quiz results`)}
    >
      <div>
        <h3 className="text-white font-medium">{title}</h3>
        <p className="text-sm text-slate-500">{date} • {questions} questions • {difficulty}</p>
      </div>
      <div className="text-right">
        <span className="text-blue-400 font-bold">{score}</span>
      </div>
    </div>
  );
};

export default Quizzes;
