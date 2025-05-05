
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

  const executePDFExport = async (filename: string = 'untitled') => {
    setIsExporting(true);
    
    try {
      // Use html2canvas to capture the PDF preview content
      const content = document.getElementById('pdf-export-content');
      
      if (!content) {
        throw new Error('PDF content element not found');
      }
      
      // Create canvas from HTML content - improved for text-based output
      const canvas = await html2canvas(content, {
        scale: 2, // Higher scale for better quality
        useCORS: true,
        logging: false,
        backgroundColor: '#FFFFFF'
      });
      
      // Create PDF with proper dimensions
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });
      
      // Calculate dimensions
      const imgData = canvas.toDataURL('image/png');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      
      // Calculate scaling to fit width
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;
      const ratio = Math.min(pageWidth / imgWidth, pageHeight / imgHeight);
      
      // Add image to PDF, ensuring text-based rendering
      const imgWidthMM = imgWidth * ratio;
      const imgHeightMM = imgHeight * ratio;
      
      // If content is too tall, split it across multiple pages
      if (imgHeightMM <= pageHeight) {
        // Content fits on one page
        pdf.addImage(imgData, 'PNG', 0, 0, imgWidthMM, imgHeightMM);
      } else {
        // Content needs multiple pages
        let heightLeft = imgHeight;
        let position = 0;
        const pageHeightPx = (pageHeight / ratio);
        
        // First page
        pdf.addImage(imgData, 'PNG', 0, 0, imgWidthMM, imgHeightMM, '', 'FAST');
        heightLeft -= pageHeightPx;
        
        // Additional pages if needed
        while (heightLeft >= 0) {
          position = -pageHeightPx * (imgHeight - heightLeft) / imgHeight;
          pdf.addPage();
          pdf.addImage(imgData, 'PNG', 0, position, imgWidthMM, imgHeightMM, '', 'FAST');
          heightLeft -= pageHeightPx;
        }
      }
      
      // Save the PDF
      const finalFilename = filename || 'untitled';
      pdf.save(`${finalFilename}.pdf`);
      
      setShowPDFPreview(false);
      toast.success('PDF downloaded successfully');
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast.error('Failed to generate PDF');
    } finally {
      setIsExporting(false);
    }
  };

  const handleMagicWandOption = (messageIndex: number, option: string) => {
    if (chatHistory[messageIndex].type !== 'bot') return;
    
    const content = chatHistory[messageIndex].content;
    
    setIsFormatLoading(true);
    setFormatOption(option);
    
    let prompt = '';
    
    switch (option) {
      case 'Simplify':
        prompt = `Rewrite the following content using much simpler language, appropriate for a first-year optometry student: "${content}"`;
        break;
      case 'Add Details':
        prompt = `Expand the following content with more detailed explanations, clinical examples, and scientific references where appropriate: "${content}"`;
        break;
      case 'Student Friendly':
        prompt = `Reformat the following content to be more accessible for optometry students, adding study notes, key points, and mnemonics where helpful: "${content}"`;
        break;
      case 'Clinical Focus':
        prompt = `Reformat the following content with a stronger clinical focus, emphasizing diagnostic procedures, treatment plans, and patient management: "${content}"`;
        break;
      case 'Add Tables':
        prompt = `Reformat the following content by adding organized tables to summarize key information where appropriate: "${content}"`;
        break;
      case 'EMR Format':
        prompt = `Reformat the following content into a professional Electronic Medical Record (EMR) format with appropriate sections like History, Examination, Assessment, and Plan: "${content}"`;
        break;
      default:
        prompt = `Reformat the following content to improve readability and organization: "${content}"`;
    }
    
    generateGeminiResponse(prompt)
      .then(formattedContent => {
        const updatedHistory = [...chatHistory];
        updatedHistory[messageIndex] = {
          ...updatedHistory[messageIndex],
          content: formattedContent
        };
        setChatHistory(updatedHistory);
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

  const generatePracticeQuestions = (messageIndex: number) => {
    if (chatHistory[messageIndex].type !== 'bot') return;
    
    const content = chatHistory[messageIndex].content;
    const prompt = `Based on the following content, generate 3 practice quiz questions with answers and explanations to test understanding: "${content}"`;
    
    setIsLoading(true);
    generateGeminiResponse(prompt)
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
    
    const content = chatHistory[messageIndex].content;
    
    // Get existing notes from localStorage or initialize empty array
    const existingNotes = JSON.parse(localStorage.getItem('studyNotes') || '[]');
    
    // Get title from the first user message
    const title = chatHistory.find(msg => msg.type === 'user')?.content || 'Untitled Note';
    
    // Create new note object
    const newNote = {
      id: Date.now().toString(),
      title: title.length > 30 ? title.substring(0, 30) + '...' : title,
      content: content,
      createdAt: new Date().toISOString()
    };
    
    // Add new note to existing notes
    const updatedNotes = [...existingNotes, newNote];
    
    // Save to localStorage
    localStorage.setItem('studyNotes', JSON.stringify(updatedNotes));
    
    toast.success('Added to study notes');
  };

  const refreshSuggestions = (messageIndex: number) => {
    if (chatHistory[messageIndex].type !== 'bot') return;
    
    const userQuestion = chatHistory.find((msg, idx) => msg.type === 'user' && idx < messageIndex)?.content;
    const botResponse = chatHistory[messageIndex].content;
    
    if (!userQuestion) return;
    
    setFollowUpLoading(true);
    
    generateFollowUpQuestions(userQuestion, botResponse)
      .then(suggestions => {
        // Update the specific bot message with new suggestions
        setChatHistory(prevHistory => {
          const updatedHistory = [...prevHistory];
          updatedHistory[messageIndex] = {
            ...updatedHistory[messageIndex],
            suggestions
          };
          return updatedHistory;
        });
      })
      .catch(error => {
        console.error('Error refreshing suggestions:', error);
        toast.error('Failed to refresh suggestions');
      })
      .finally(() => {
        setFollowUpLoading(false);
      });
  };

  const handleSuggestionClick = (suggestion: string) => {
    setQuestion(suggestion);
    // Fix the focus method call with proper type assertion
    const inputElement = document.querySelector('input[placeholder*="optometry"]');
    if (inputElement && inputElement instanceof HTMLElement) {
      inputElement.focus();
    }
  };

  return {
    question,
    setQuestion,
    chatHistory,
    isLoading,
    isFormatLoading,
    formatOption,
    isExporting,
    showPDFPreview,
    setShowPDFPreview,
    followUpLoading,
    handleSubmit,
    handleQuestionSubmit,
    handleCopyConversation,
    handleSaveCase,
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
