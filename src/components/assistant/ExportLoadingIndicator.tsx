
import React from 'react';

interface ExportLoadingIndicatorProps {
  type: 'formatting' | 'exporting';
  option?: string;
}

const ExportLoadingIndicator: React.FC<ExportLoadingIndicatorProps> = ({ type, option }) => {
  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full shadow-lg">
        <div className="flex flex-col items-center">
          <div className="mb-4">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
          </div>
          
          <div className="text-center">
            <h3 className="text-xl font-bold text-gray-800 mb-2">
              {type === 'formatting' 
                ? `Applying ${option || 'formatting'}...` 
                : 'Preparing export...'}
            </h3>
            <p className="text-gray-600">
              {type === 'formatting' 
                ? 'Enhancing your content for better readability.' 
                : 'Generating a professional document with your conversation.'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExportLoadingIndicator;
