import { useState, useEffect } from 'react';
import { toast } from '@/components/ui/sonner';
import { generateGeminiResponse, generateFollowUpQuestions } from '@/utils/geminiApi';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export interface ChatMessage {
  type: 'user' | 'bot';
  content: string;
  suggestions?: string[];
}

export interface SavedCase {
  id: string;
  title: string;
  messages: ChatMessage[];
  createdAt: number;
}

export function useAssistantChat(assistantInstructions: string) {
  const [question, setQuestion] = useState('');
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isFormatLoading, setIsFormatLoading] = useState(false);
  const [formatOption, setFormatOption] = useState<string>('');
  const [isExporting, setIsExporting] = useState(false);
  const [showPDFPreview, setShowPDFPreview] = useState(false);
  const [savedCases, setSavedCases] = useState<SavedCase[]>([]);
  const [followUpLoading, setFollowUpLoading] = useState<boolean>(false);

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
      // Create a focused prompt for the main question
      const prompt = `${assistantInstructions}\n\nUser Question: ${questionText}\n\nPlease provide a helpful response:`;
      
      // Generate response using Gemini API
      const response = await generateGeminiResponse(prompt);
      
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
    const summaryPrompt = `Create a concise summary (3-4 bullet points) of the following optometry information: "${content}"`;
    
    setIsLoading(true);
    generateGeminiResponse(summaryPrompt)
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

    // Only export bot responses (answers)
    const botResponses = chatHistory.filter(msg => msg.type === 'bot');
    
    // Generate title from first user question
    const firstUserQuestion = chatHistory.find(msg => msg.type === 'user')?.content || 'Conversation';
    const title = firstUserQuestion.length > 30 ? 
      firstUserQuestion.substring(0, 30) + '...' : 
      firstUserQuestion;
    
    // Create markdown content with proper formatting
    const mdContent = `# ${title}\n\n_Generated by Focus.AI on ${new Date().toLocaleDateString()}_\n\n` + 
      botResponses.map(msg => msg.content).join('\n\n---\n\n');

    // Create and download file
    setIsExporting(true);
    setTimeout(() => {
      const blob = new Blob([mdContent], { type: 'text/markdown' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `focus-ai-${new Date().toISOString().slice(0, 10)}.md`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      setIsExporting(false);
      toast.success('Downloaded as Markdown');
    }, 1000);
  };

  const downloadAsPDF = () => {
    if (chatHistory.length === 0) {
      toast.error('No conversation to download');
      return;
    }

    // Show the PDF preview first
    setShowPDFPreview(true);
  };

  const executePDFExport = async () => {
    setIsExporting(true);
    
    try {
      // Generate a title from first user question
      const firstUserQuestion = chatHistory.find(msg => msg.type === 'user')?.content || 'Conversation';
      const title = firstUserQuestion.length > 30 ? 
        firstUserQuestion.substring(0, 30) + '...' : 
        firstUserQuestion;
        
      // Only export bot responses (answers)
      const botResponses = chatHistory.filter(msg => msg.type === 'bot');
      
      // Create a new jsPDF instance (A4 size by default)
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });
      
      // Get the PDF export preview element
      const element = document.getElementById('pdf-export-content');
      if (!element) {
        throw new Error('PDF export element not found');
      }
      
      // Convert the export preview to canvas
      const canvas = await html2canvas(element, {
        scale: 2, // Higher scale for better quality
        useCORS: true,
        logging: false,
        backgroundColor: '#FFFFFF'
      });
      
      // The width and height of the canvas
      const imgWidth = 210; // A4 width in mm
      const pageHeight = 297; // A4 height in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      const heightLeft = imgHeight;
      
      // Add content to PDF
      const imgData = canvas.toDataURL('image/png');
      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
      
      // Add Focus.AI watermark
      pdf.setTextColor(230, 230, 230);
      pdf.setFontSize(60);
      pdf.setFont('helvetica', 'bold', 'italic');
      pdf.text('Focus.AI', 110, 160, { align: 'center', angle: 45 });
      
      // Download the PDF
      pdf.save(`focus-ai-export-${new Date().toISOString().slice(0, 10)}.pdf`);
      
      setIsExporting(false);
      setShowPDFPreview(false);
      toast.success('PDF downloaded successfully');
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast.error('Failed to generate PDF');
      setIsExporting(false);
      setShowPDFPreview(false);
    }
  };

  const generatePracticeQuestions = (messageIndex: number) => {
    if (chatHistory[messageIndex].type !== 'bot') return;
    
    const content = chatHistory[messageIndex].content;
    const questionsPrompt = `Based on this optometry information: "${content}", generate 3 practice questions with multiple-choice answers and explanations.`;
    
    setIsLoading(true);
    generateGeminiResponse(questionsPrompt)
      .then(questions => {
        const updatedHistory = [...chatHistory];
        updatedHistory[messageIndex] = {
          ...updatedHistory[messageIndex],
          content: content + "\n\n## Practice Questions\n" + questions
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

  const addToNotes = (messageIndex: number) => {
    if (chatHistory[messageIndex].type !== 'bot') return;
    
    const existingNotes = localStorage.getItem('studyNotes') || '[]';
    const parsedNotes = JSON.parse(existingNotes);
    
    // Create note title from the first user message or a default
    const relatedUserMessage = chatHistory
      .filter(msg => msg.type === 'user')
      .map(msg => msg.content)
      .find((_, idx) => idx === Math.floor(messageIndex / 2));
    
    const noteTitle = relatedUserMessage && relatedUserMessage.length <= 50 
      ? relatedUserMessage 
      : relatedUserMessage?.substring(0, 47) + '...' || 'Untitled Note';
    
    const newNote = {
      id: Date.now().toString(),
      title: noteTitle,
      content: chatHistory[messageIndex].content,
      createdAt: Date.now(),
      tags: ['AI Generated']
    };
    
    const updatedNotes = [...parsedNotes, newNote];
    localStorage.setItem('studyNotes', JSON.stringify(updatedNotes));
    
    toast.success('Added to study notes');
  };

  const handleMagicWandOption = (messageIndex: number, option: string) => {
    if (chatHistory[messageIndex].type !== 'bot') return;
    
    const content = chatHistory[messageIndex].content;
    setIsFormatLoading(true);
    setFormatOption(option);
    
    let promptPrefix = '';
    switch (option) {
      case 'Simplify':
        promptPrefix = `Simplify and make more understandable for a beginner optometry student:`;
        break;
      case 'Add Details':
        promptPrefix = `Elaborate on this information with more clinical details:`;
        break;
      case 'Student Friendly':
        promptPrefix = `Reformat this into student-friendly notes with clear headings, bullet points, and examples:`;
        break;
      case 'Clinical Focus':
        promptPrefix = `Reformat this with a clinical focus, highlighting diagnosis and treatment aspects:`;
        break;
      case 'Add Tables':
        promptPrefix = `Enhance this information by adding markdown tables to organize key data points:`;
        break;
      case 'EMR Format':
        promptPrefix = `Reformat this into an Electronic Medical Record (EMR) style format:`;
        break;
      default:
        promptPrefix = `Reformat and enhance this information:`;
    }
    
    const formattingPrompt = `${promptPrefix}\n\n${content}\n\nMake sure to maintain all the factual information, but present it in a ${option.toLowerCase()} format.`;
    
    generateGeminiResponse(formattingPrompt)
      .then(formattedContent => {
        const updatedHistory = [...chatHistory];
        updatedHistory[messageIndex] = {
          ...updatedHistory[messageIndex],
          content: formattedContent
        };
        setChatHistory(updatedHistory);
        toast.success(`Applied "${option}" formatting`);
      })
      .catch(error => {
        console.error('Error formatting content:', error);
        toast.error('Failed to format content');
      })
      .finally(() => {
        setIsFormatLoading(false);
        setFormatOption('');
      });
  };

  const refreshSuggestions = (messageIndex: number) => {
    if (chatHistory[messageIndex].type !== 'bot') return;
    
    const userMessages = chatHistory.filter(msg => msg.type === 'user');
    const lastUserMessage = userMessages[userMessages.length - 1]?.content || '';
    
    if (!lastUserMessage) {
      toast.error('No user question found');
      return;
    }
    
    const botContent = chatHistory[messageIndex].content;
    generateSuggestions(lastUserMessage, botContent);
    toast.success('Generating new suggestions');
  };

  const handleSuggestionClick = (suggestion: string) => {
    setQuestion(suggestion);
  };

  return {
    question,
    setQuestion,
    chatHistory,
    setChatHistory,
    isLoading,
    isFormatLoading,
    formatOption,
    isExporting,
    showPDFPreview,
    setShowPDFPreview,
    followUpLoading,
    handleQuestionSubmit,
    handleSubmit,
    handleSaveCase,
    handleCopyConversation,
    generateSummary,
    generatePracticeQuestions,
    addToNotes,
    handleMagicWandOption,
    downloadAsMarkdown,
    downloadAsPDF,
    executePDFExport,
    refreshSuggestions,
    handleSuggestionClick
  };
}
