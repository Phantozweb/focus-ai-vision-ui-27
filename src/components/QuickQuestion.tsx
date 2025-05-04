
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from '@/components/ui/sonner';

const QuickQuestion = () => {
  const [question, setQuestion] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim()) return;
    
    // In a real app, you would send this to your API
    console.log('Question submitted:', question);
    toast.success('Question sent! Redirecting to AI assistant...');
    setQuestion('');
    // In a real app, you might redirect to the assistant page
  };

  return (
    <div className="tool-card">
      <div className="flex items-center gap-3 mb-4">
        <div className="feature-icon bg-sky-500">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-black">Quick Question</h2>
      </div>
      <p className="text-gray-700 mb-4">Get instant answers to your optometry questions</p>
      <form className="flex gap-2" onSubmit={handleSubmit}>
        <Input 
          placeholder="Ask anything about optometry..." 
          className="flex-1 bg-white border-gray-300 focus:border-sky-500 text-black"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
        />
        <Button type="submit" className="bg-sky-500 hover:bg-sky-600 text-white">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
          </svg>
          Ask
        </Button>
      </form>
    </div>
  );
};

export default QuickQuestion;
