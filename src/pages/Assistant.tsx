
import React, { useState, useEffect } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/sonner';
import { generateGeminiResponse } from '@/utils/geminiApi';
import { Bot } from 'lucide-react';

const Assistant = () => {
  const [question, setQuestion] = useState('');
  const [chatHistory, setChatHistory] = useState<{ type: 'user' | 'bot', content: string }[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Check if there's a question from the QuickQuestion component
    const quickQuestion = sessionStorage.getItem('quickQuestion');
    if (quickQuestion) {
      handleQuestionSubmit(quickQuestion);
      sessionStorage.removeItem('quickQuestion');
    }
  }, []);

  const handleQuestionSubmit = async (questionText: string) => {
    // Add user's message to chat history
    setChatHistory(prev => [...prev, { type: 'user', content: questionText }]);
    
    // Show loading state
    setIsLoading(true);
    
    try {
      // Generate response using Gemini API
      const response = await generateGeminiResponse(questionText);
      
      // Add bot's response to chat history
      setChatHistory(prev => [
        ...prev, 
        { 
          type: 'bot', 
          content: response
        }
      ]);
      
      toast.success('Response generated');
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to get response');
      
      // Add error message to chat history
      setChatHistory(prev => [
        ...prev, 
        { 
          type: 'bot', 
          content: 'Sorry, I encountered an error. Please try again.'
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim()) return;
    
    await handleQuestionSubmit(question);
    setQuestion('');
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />
      
      <main className="flex-1 flex flex-col">
        <div className="container mx-auto px-4 py-6">
          <h1 className="text-xl text-blue-500 font-medium mb-4">Focus.AI Assistant (Powered by Google Gemini)</h1>
          
          <div className="flex-1 flex flex-col bg-white rounded-xl overflow-hidden border border-gray-200 shadow-sm">
            <div className="flex-1 p-6 overflow-y-auto">
              {chatHistory.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-96 text-center">
                  <div className="mb-6 text-blue-500">
                    <Bot className="mx-auto h-12 w-12 text-blue-500/70" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-800 mb-2">How can I help with your optometry studies today?</h2>
                  <p className="text-gray-600 max-w-md">Ask questions about any optometry topic to enhance your learning.</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {chatHistory.map((item, i) => (
                    <div key={i} className={`flex ${item.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[80%] rounded-2xl p-4 ${
                        item.type === 'user' 
                          ? 'bg-blue-600 text-white' 
                          : 'bg-gray-100 text-gray-800 border border-gray-200'
                      }`}>
                        {item.content}
                      </div>
                    </div>
                  ))}
                </div>
              )}
              
              {isLoading && (
                <div className="flex justify-start mt-6">
                  <div className="max-w-[80%] rounded-2xl p-4 bg-gray-100 text-gray-800 border border-gray-200">
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                      <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse delay-100"></div>
                      <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse delay-200"></div>
                      <span className="text-sm text-gray-600">Thinking...</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
            <div className="border-t border-gray-200 p-4">
              <form onSubmit={handleSubmit} className="flex gap-2">
                <Input
                  placeholder="Ask about any optometry topic..."
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  className="flex-1 bg-white border-gray-300 focus:border-blue-500 text-gray-800"
                  disabled={isLoading}
                />
                <Button 
                  type="submit" 
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                  disabled={isLoading}
                >
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
