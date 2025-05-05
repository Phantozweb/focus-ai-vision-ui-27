
import React from 'react';
import QuizHistoryItem from './QuizHistoryItem';

const PastQuizzes: React.FC = () => {
  return (
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
  );
};

export default PastQuizzes;
