
import React from 'react';

const QuizInCaseLoading: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center p-8">
      <div className="text-center">
        <div className="mb-4">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
        </div>
        <p className="text-gray-600">Generating case-specific questions...</p>
      </div>
    </div>
  );
};

export default QuizInCaseLoading;
