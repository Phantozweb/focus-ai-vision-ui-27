
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from '@/components/ui/sonner';
import { useNavigate } from 'react-router-dom';

const QuickQuestion = () => {
  const [question, setQuestion] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim()) return;
    
    setIsLoading(true);
    
    // Store the question in sessionStorage to retrieve it on the Assistant page
    sessionStorage.setItem('quickQuestion', question);
    
    toast.success('Redirecting to AI assistant...');
    setQuestion('');
    
    // Navigate to the assistant page
    setTimeout(() => {
      navigate('/assistant');
      setIsLoading(false);
    }, 1000);
  };

  return (
    <div className="tool-card shadow-button">
      <div className="flex items-center gap-3 mb-4">
        <div className="feature-icon bg-sky-500">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-black">Quick Question</h2>
      </div>
      <p className="text-gray-800 mb-4">Get instant answers to your optometry questions</p>
      <form className="flex gap-2" onSubmit={handleSubmit}>
        <Input 
          placeholder="Ask anything about optometry..." 
          className="flex-1 bg-white border-gray-300 focus:border-sky-500 text-black shadow-sm"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          disabled={isLoading}
        />
        <Button 
          type="submit" 
          className="bg-sky-500 hover:bg-sky-600 text-black shadow-button"
          disabled={isLoading}
        >
          {isLoading ? (
            <span className="flex items-center">
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-black" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Processing
            </span>
          ) : (
            <>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
              Ask
            </>
          )}
        </Button>
      </form>
    </div>
  );
};

export default QuickQuestion;
