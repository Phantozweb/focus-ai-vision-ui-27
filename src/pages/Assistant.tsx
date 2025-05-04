
import React, { useState, useEffect } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/sonner';
import { generateGeminiResponse } from '@/utils/geminiApi';
import { Bot, WandSparkles, Save, Copy, Download, FileText } from 'lucide-react';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface ChatMessage {
  type: 'user' | 'bot';
  content: string;
}

interface SavedCase {
  id: string;
  title: string;
  messages: ChatMessage[];
  createdAt: number;
}

const Assistant = () => {
  const [question, setQuestion] = useState('');
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [savedCases, setSavedCases] = useState<SavedCase[]>([]);
  const [showSavedCases, setShowSavedCases] = useState(false);

  useEffect(() => {
    // Load saved cases from localStorage
    const savedCasesFromStorage = localStorage.getItem('savedCases');
    if (savedCasesFromStorage) {
      setSavedCases(JSON.parse(savedCasesFromStorage));
    }

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

  const handleSaveCase = () => {
    if (chatHistory.length === 0) {
      toast.error('No conversation to save');
      return;
    }

    const newCase: SavedCase = {
      id: Date.now().toString(),
      title: chatHistory[0]?.content.slice(0, 30) + '...' || 'Untitled Case',
      messages: [...chatHistory],
      createdAt: Date.now()
    };

    const updatedCases = [...savedCases, newCase];
    setSavedCases(updatedCases);
    localStorage.setItem('savedCases', JSON.stringify(updatedCases));
    toast.success('Case saved successfully');
  };

  const handleLoadCase = (caseId: string) => {
    const caseToLoad = savedCases.find(c => c.id === caseId);
    if (caseToLoad) {
      setChatHistory(caseToLoad.messages);
      setShowSavedCases(false);
      toast.success('Case loaded');
    }
  };

  const handleDeleteCase = (caseId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updatedCases = savedCases.filter(c => c.id !== caseId);
    setSavedCases(updatedCases);
    localStorage.setItem('savedCases', JSON.stringify(updatedCases));
    toast.success('Case deleted');
  };

  const handleCopyConversation = () => {
    if (chatHistory.length === 0) {
      toast.error('No conversation to copy');
      return;
    }

    const text = chatHistory.map(msg => 
      `${msg.type === 'user' ? 'You' : 'Assistant'}: ${msg.content}`
    ).join('\n\n');

    navigator.clipboard.writeText(text)
      .then(() => toast.success('Conversation copied to clipboard'))
      .catch(() => toast.error('Failed to copy conversation'));
  };

  const downloadAsMarkdown = () => {
    if (chatHistory.length === 0) {
      toast.error('No conversation to download');
      return;
    }

    const mdContent = chatHistory.map(msg => 
      `${msg.type === 'user' ? '## You' : '## Assistant'}\n\n${msg.content}`
    ).join('\n\n');

    const blob = new Blob([mdContent], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `conversation-${new Date().toISOString().slice(0, 10)}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast.success('Downloaded as Markdown');
  };

  const downloadAsPDF = () => {
    toast.info('PDF download functionality would be implemented here');
    // In a real implementation, we would use a library like jsPDF to generate the PDF
  };

  const handleAutocomplete = () => {
    if (question.trim() === '') {
      toast.error('Please enter a question first');
      return;
    }
    
    setQuestion(prev => `${prev} (Please provide a detailed explanation)`);
    toast.success('Added completion prompt');
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />
      
      <main className="flex-1 flex flex-col">
        <div className="container mx-auto px-4 py-6">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-xl text-blue-500 font-medium">Focus.AI Assistant</h1>
            <div className="flex gap-2">
              <Button
                variant="outline" 
                size="sm"
                className="text-gray-700 border-gray-200"
                onClick={() => setShowSavedCases(!showSavedCases)}
              >
                <FileText className="w-4 h-4 mr-1" />
                {showSavedCases ? 'Hide Cases' : 'View Cases'}
              </Button>
            </div>
          </div>
          
          {showSavedCases ? (
            <div className="bg-white rounded-xl overflow-hidden border border-gray-200 shadow-sm p-4 mb-4">
              <h2 className="text-lg font-semibold mb-3">Saved Cases</h2>
              {savedCases.length === 0 ? (
                <p className="text-gray-500">No saved cases yet</p>
              ) : (
                <div className="space-y-2">
                  {savedCases.map(savedCase => (
                    <div 
                      key={savedCase.id}
                      onClick={() => handleLoadCase(savedCase.id)}
                      className="flex justify-between items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer"
                    >
                      <div>
                        <h3 className="font-medium">{savedCase.title}</h3>
                        <p className="text-xs text-gray-500">
                          {new Date(savedCase.createdAt).toLocaleString()}
                        </p>
                      </div>
                      <button
                        onClick={(e) => handleDeleteCase(savedCase.id, e)}
                        className="text-red-500 hover:text-red-700"
                      >
                        Delete
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : null}
          
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
              <div className="flex justify-between mb-3">
                <div className="flex gap-2">
                  <Button
                    type="button"
                    size="icon"
                    variant="outline"
                    className="bg-white border-gray-300 text-blue-500 hover:bg-blue-50"
                    onClick={handleAutocomplete}
                    title="Magic Wand (Auto-complete)"
                  >
                    <WandSparkles className="h-5 w-5" />
                  </Button>
                  <Button
                    type="button"
                    size="icon"
                    variant="outline"
                    className="bg-white border-gray-300 text-blue-500 hover:bg-blue-50"
                    onClick={handleSaveCase}
                    title="Save Conversation"
                    disabled={chatHistory.length === 0}
                  >
                    <Save className="h-5 w-5" />
                  </Button>
                  <Button
                    type="button"
                    size="icon"
                    variant="outline"
                    className="bg-white border-gray-300 text-blue-500 hover:bg-blue-50"
                    onClick={handleCopyConversation}
                    title="Copy Conversation"
                    disabled={chatHistory.length === 0}
                  >
                    <Copy className="h-5 w-5" />
                  </Button>
                  
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        type="button"
                        size="icon"
                        variant="outline"
                        className="bg-white border-gray-300 text-blue-500 hover:bg-blue-50"
                        disabled={chatHistory.length === 0}
                        title="Download"
                      >
                        <Download className="h-5 w-5" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start" className="bg-white">
                      <DropdownMenuItem onClick={downloadAsMarkdown} className="cursor-pointer">
                        Download as Markdown
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={downloadAsPDF} className="cursor-pointer">
                        Download as PDF
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
              
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
