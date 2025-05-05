import React, { useState, useEffect, useRef } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/sonner';
import { generateGeminiResponse, generateFollowUpQuestions, checkApiKey } from '@/utils/geminiApi';
import { Bot, Save, Copy, Download, FileText, RefreshCw, List } from 'lucide-react';
import MagicWandMenu from '@/components/MagicWandMenu';
import ReactMarkdown from 'react-markdown';
import ApiKeyModal from '@/components/ApiKeyModal';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface ChatMessage {
  type: 'user' | 'bot';
  content: string;
  suggestions?: string[];
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
  const [followUpLoading, setFollowUpLoading] = useState<boolean>(false);
  const [showApiKeyModal, setShowApiKeyModal] = useState<boolean>(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Check if API key is valid on load
    checkApiKey()
      .then(isValid => {
        if (!isValid) {
          setShowApiKeyModal(true);
        }
      })
      .catch(() => {
        setShowApiKeyModal(true);
      });

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

  useEffect(() => {
    // Scroll to bottom of chat when new messages are added
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatHistory]);

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
          content: response,
          suggestions: [] // Initialize empty suggestions
        }
      ]);
      
      // Generate follow-up questions
      generateSuggestions(questionText, response);
      
      toast.success('Response generated');
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to get response');
      
      // Add error message to chat history
      setChatHistory(prev => [
        ...prev, 
        { 
          type: 'bot', 
          content: 'Sorry, I encountered an error. Please try again later.',
          suggestions: []
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const generateSuggestions = async (question: string, answer: string) => {
    setFollowUpLoading(true);
    try {
      const suggestions = await generateFollowUpQuestions(question, answer);
      
      // Update the latest bot message with suggestions
      setChatHistory(prevHistory => {
        const updatedHistory = [...prevHistory];
        const lastBotIndex = updatedHistory.findIndex(
          msg => msg.type === 'bot' && !msg.suggestions?.length
        );
        
        if (lastBotIndex !== -1) {
          updatedHistory[lastBotIndex] = {
            ...updatedHistory[lastBotIndex],
            suggestions
          };
        }
        
        return updatedHistory;
      });
    } catch (error) {
      console.error('Error generating suggestions:', error);
    } finally {
      setFollowUpLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim()) return;
    
    handleQuestionSubmit(question);
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

  const generateSummary = (messageIndex: number) => {
    if (chatHistory[messageIndex].type !== 'bot') return;
    
    const content = chatHistory[messageIndex].content;
    const summaryRequest = `Create a concise summary (3-4 bullet points) of the following optometry information: "${content}"`;
    
    setIsLoading(true);
    generateGeminiResponse(summaryRequest)
      .then(summary => {
        const updatedHistory = [...chatHistory];
        updatedHistory[messageIndex] = {
          ...updatedHistory[messageIndex],
          content: content + "\n\n## Summary\n" + summary
        };
        setChatHistory(updatedHistory);
        toast.success('Summary generated');
      })
      .catch(error => {
        console.error('Error generating summary:', error);
        toast.error('Failed to generate summary');
      })
      .finally(() => {
        setIsLoading(false);
      });
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

  const addToNotes = (messageIndex: number) => {
    if (chatHistory[messageIndex].type !== 'bot') return;
    
    const content = chatHistory[messageIndex].content;
    const title = chatHistory[messageIndex - 1]?.content || 'AI Assistant Note';
    
    // Get existing study notes
    const savedNotes = localStorage.getItem('studyNotes');
    let studyNotes = savedNotes ? JSON.parse(savedNotes) : [];
    
    // Create a new note
    const newNote = {
      id: Date.now().toString(),
      title: title.length > 30 ? title.substring(0, 30) + '...' : title,
      content: content,
      lastUpdated: Date.now(),
      tags: ['ai-assistant', 'optometry']
    };
    
    // Add to study notes
    studyNotes = [newNote, ...studyNotes];
    localStorage.setItem('studyNotes', JSON.stringify(studyNotes));
    
    toast.success('Added to Study Notes');
  };

  const handleMagicWandOption = (messageIndex: number, option: string) => {
    if (chatHistory[messageIndex].type === 'bot') {
      let modifiedContent = chatHistory[messageIndex].content;
      
      switch(option) {
        case 'Simplify':
          modifiedContent = `${modifiedContent}\n\n[Simplified version would appear here]`;
          break;
        case 'Add Details':
          modifiedContent = `${modifiedContent}\n\n[More detailed version would appear here]`;
          break;
        case 'Student Friendly':
          modifiedContent = `${modifiedContent}\n\n[Student-friendly version would appear here]`;
          break;
        case 'Clinical Focus':
          modifiedContent = `${modifiedContent}\n\n[Clinically-focused version would appear here]`;
          break;
        default:
          break;
      }
      
      const updatedHistory = [...chatHistory];
      updatedHistory[messageIndex] = {
        ...updatedHistory[messageIndex],
        content: modifiedContent
      };
      
      setChatHistory(updatedHistory);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    handleQuestionSubmit(suggestion);
  };

  const refreshSuggestions = (messageIndex: number) => {
    const botMessage = chatHistory[messageIndex];
    // Find the related user message that came before this bot message
    let userMessageIndex = messageIndex - 1;
    while (userMessageIndex >= 0) {
      if (chatHistory[userMessageIndex].type === 'user') {
        break;
      }
      userMessageIndex--;
    }

    if (userMessageIndex >= 0) {
      const userQuestion = chatHistory[userMessageIndex].content;
      const botAnswer = botMessage.content;
      
      setFollowUpLoading(true);
      
      generateFollowUpQuestions(userQuestion, botAnswer)
        .then(suggestions => {
          const updatedHistory = [...chatHistory];
          updatedHistory[messageIndex] = {
            ...updatedHistory[messageIndex],
            suggestions
          };
          setChatHistory(updatedHistory);
        })
        .catch(error => {
          console.error('Error refreshing suggestions:', error);
          toast.error('Failed to refresh suggestions');
        })
        .finally(() => {
          setFollowUpLoading(false);
        });
    }
  };

  const generatePracticeQuestions = (messageIndex: number) => {
    if (chatHistory[messageIndex].type !== 'bot') return;
    
    const content = chatHistory[messageIndex].content;
    const mcqRequest = `Based on this optometry information: "${content.substring(0, 500)}...", 
    create 3 multiple choice questions (MCQs) with 4 options each and indicate the correct answer. 
    Format as markdown with clear question numbering, options as A, B, C, D, and show the correct answer at the end.`;
    
    setIsLoading(true);
    generateGeminiResponse(mcqRequest)
      .then(mcqs => {
        const updatedHistory = [...chatHistory];
        updatedHistory[messageIndex] = {
          ...updatedHistory[messageIndex],
          content: content + "\n\n## Practice Questions\n" + mcqs
        };
        setChatHistory(updatedHistory);
        toast.success('Practice questions generated');
      })
      .catch(error => {
        console.error('Error generating practice questions:', error);
        toast.error('Failed to generate practice questions');
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />
      
      <main className="flex-1 flex flex-col">
        <div className="container mx-auto px-4 py-6">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-xl text-blue-500 font-medium">Focus.AI Assistant</h1>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowApiKeyModal(true)}
              className="flex items-center gap-2"
            >
              AI Information
            </Button>
          </div>
          
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
                        {item.type === 'user' ? (
                          <div>{item.content}</div>
                        ) : (
                          <div className="markdown-content">
                            <ReactMarkdown>{item.content}</ReactMarkdown>
                            
                            {/* Follow-up suggestions */}
                            {item.suggestions && item.suggestions.length > 0 && (
                              <div className="mt-4 pt-3 border-t border-gray-200">
                                <div className="flex items-center justify-between mb-2">
                                  <h4 className="text-sm font-medium text-gray-700">Follow-up questions</h4>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Button 
                                        variant="ghost" 
                                        size="icon" 
                                        className="h-6 w-6 text-gray-500 hover:text-blue-500"
                                        onClick={() => refreshSuggestions(i)}
                                        disabled={followUpLoading}
                                      >
                                        <RefreshCw className="h-4 w-4" />
                                      </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      <p>Generate new suggestions</p>
                                    </TooltipContent>
                                  </Tooltip>
                                </div>
                                <div className="flex overflow-x-auto pb-2 gap-2">
                                  {item.suggestions.map((suggestion, idx) => (
                                    <Button 
                                      key={idx} 
                                      variant="outline" 
                                      size="sm"
                                      className="text-xs whitespace-nowrap bg-white text-blue-600 hover:bg-blue-50 mb-2"
                                      onClick={() => handleSuggestionClick(suggestion)}
                                    >
                                      {suggestion}
                                    </Button>
                                  ))}
                                </div>
                              </div>
                            )}
                            
                            {/* Action buttons */}
                            {item.type === 'bot' && (
                              <div className="flex flex-wrap justify-end gap-2 mt-3 pt-2 border-t border-gray-200">
                                <Button
                                  type="button"
                                  size="sm"
                                  variant="outline"
                                  className="bg-white border-gray-300 text-blue-500 hover:bg-blue-50 text-xs flex items-center gap-1"
                                  onClick={() => generateSummary(i)}
                                >
                                  <List className="h-3 w-3" />
                                  Summary
                                </Button>
                                
                                <Button
                                  type="button"
                                  size="sm"
                                  variant="outline"
                                  className="bg-white border-gray-300 text-blue-500 hover:bg-blue-50 text-xs flex items-center gap-1"
                                  onClick={() => generatePracticeQuestions(i)}
                                >
                                  <FileText className="h-3 w-3" />
                                  MCQs
                                </Button>
                                
                                <Button
                                  type="button"
                                  size="sm"
                                  variant="outline"
                                  className="bg-white border-gray-300 text-blue-500 hover:bg-blue-50 text-xs flex items-center gap-1"
                                  onClick={() => addToNotes(i)}
                                >
                                  <Save className="h-3 w-3" />
                                  To Notes
                                </Button>
                                
                                <MagicWandMenu onOptionSelect={(option) => handleMagicWandOption(i, option)} />
                                
                                <Button
                                  type="button"
                                  size="icon"
                                  variant="outline"
                                  className="bg-white border-gray-300 text-blue-500 hover:bg-blue-50 h-6 w-6"
                                  onClick={handleCopyConversation}
                                  title="Copy Conversation"
                                >
                                  <Copy className="h-3 w-3" />
                                </Button>
                                
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button
                                      type="button"
                                      size="icon"
                                      variant="outline"
                                      className="bg-white border-gray-300 text-blue-500 hover:bg-blue-50 h-6 w-6"
                                      title="Download"
                                    >
                                      <Download className="h-3 w-3" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end" className="bg-white">
                                    <DropdownMenuItem onClick={downloadAsMarkdown} className="cursor-pointer">
                                      Download as Markdown
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={downloadAsPDF} className="cursor-pointer">
                                      Download as PDF
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                  <div ref={chatEndRef} />
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
      
      {/* API Key Modal */}
      <ApiKeyModal isOpen={showApiKeyModal} onClose={() => setShowApiKeyModal(false)} />
    </div>
  );
};

export default Assistant;
