
import React, { useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/sonner';

const Assistant = () => {
  const [question, setQuestion] = useState('');
  const [chatHistory, setChatHistory] = useState<{ type: 'user' | 'bot', content: string }[]>([]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim()) return;
    
    // Add user's message to chat history
    setChatHistory(prev => [...prev, { type: 'user', content: question }]);
    
    // Simulate AI response (in a real app, you'd make an API call)
    setTimeout(() => {
      toast.success('Response generated');
      setChatHistory(prev => [
        ...prev, 
        { 
          type: 'bot', 
          content: `This is a simulated response to your question about "${question}". In a real application, this would be a detailed answer about optometry.` 
        }
      ]);
    }, 1000);
    
    setQuestion('');
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 flex flex-col">
        <div className="container mx-auto px-4 py-6">
          <h1 className="text-xl text-blue-400 font-medium mb-4">Focus.AI Assistant</h1>
          
          <div className="flex-1 flex flex-col bg-darkBg-card rounded-xl overflow-hidden border border-slate-800">
            <div className="flex-1 p-6 overflow-y-auto">
              {chatHistory.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-96 text-center">
                  <div className="mb-6 text-blue-500 w-16 h-16">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <h2 className="text-2xl font-bold text-white mb-2">How can I help with your optometry studies today?</h2>
                  <p className="text-gray-400 max-w-md">Ask questions about any optometry topic to enhance your learning.</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {chatHistory.map((item, i) => (
                    <div key={i} className={`flex ${item.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[80%] rounded-2xl p-4 ${
                        item.type === 'user' 
                          ? 'bg-blue-600 text-white' 
                          : 'bg-darkBg-lighter text-slate-200 border border-slate-800'
                      }`}>
                        {item.content}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="border-t border-slate-800 p-4">
              <form onSubmit={handleSubmit} className="flex gap-2">
                <Input
                  placeholder="Ask about any optometry topic..."
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  className="flex-1 bg-darkBg border-slate-700 focus:border-focusBlue text-white"
                />
                <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
                </Button>
              </form>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Assistant;
