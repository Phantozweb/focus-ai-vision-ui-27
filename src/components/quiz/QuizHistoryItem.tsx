
import React from 'react';
import { toast } from '@/components/ui/sonner';

interface QuizHistoryItemProps {
  title: string;
  date: string;
  score: string;
  questions: number;
  difficulty: string;
}

const QuizHistoryItem: React.FC<QuizHistoryItemProps> = ({ 
  title, 
  date, 
  score, 
  questions, 
  difficulty 
}) => {
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

export default QuizHistoryItem;
