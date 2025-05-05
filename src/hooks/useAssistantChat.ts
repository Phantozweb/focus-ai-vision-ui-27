
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
      // Get the PDF export content from the preview
      const content = document.getElementById('pdf-export-content');
      
      if (!content) {
        throw new Error('PDF content element not found');
      }
      
      // Create PDF document with proper formatting
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });
      
      // Set document properties
      pdf.setProperties({
        title: filename || 'Focus.AI Export',
        subject: 'Optometry AI Assistant Export',
        creator: 'Focus.AI',
        author: 'Focus.AI'
      });
      
      // Adding header with logo
      pdf.setFillColor(240, 249, 255);
      pdf.rect(0, 0, pdf.internal.pageSize.getWidth(), 20, 'F');
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(23, 113, 174);
      pdf.setFontSize(16);
      pdf.text('Focus.AI', 20, 12);
      
      // Get title from content
      const title = content.querySelector('.premium-pdf-header h1')?.textContent || 'Focus.AI Conversation';
      
      // Create an array from the markdown-content elements
      const contentElements = Array.from(content.querySelectorAll('.markdown-content'));
      
      // We'll capture each content element as an image to preserve formatting
      let currentY = 30; // Start position after header
      const pageWidth = pdf.internal.pageSize.getWidth();
      const margin = 15;
      const contentWidth = pageWidth - (2 * margin);
      
      // Add title
      pdf.setFontSize(18);
      pdf.setTextColor(23, 113, 174);
      pdf.text(title, margin, currentY);
      currentY += 10;
      
      // Add date
      pdf.setFontSize(10);
      pdf.setTextColor(100, 100, 100);
      pdf.text(`Generated on ${new Date().toLocaleDateString()}`, margin, currentY);
      currentY += 10;
      
      // Process each content element
      for (let i = 0; i < contentElements.length; i++) {
        const element = contentElements[i] as HTMLElement; // Cast to HTMLElement
        
        try {
          // Capture the element as canvas
          const canvas = await html2canvas(element, {
            scale: 2, // Higher scale for better quality
            logging: false,
            useCORS: true,
            allowTaint: true,
          });
          
          // Convert canvas to image
          const imgData = canvas.toDataURL('image/png');
          
          // Calculate height to maintain aspect ratio
          const imgWidth = contentWidth;
          const imgHeight = (canvas.height * imgWidth) / canvas.width;
          
          // Check if we need a new page
          if (currentY + imgHeight > pdf.internal.pageSize.getHeight() - 20) {
            pdf.addPage();
            
            // Add header to new page
            pdf.setFillColor(240, 249, 255);
            pdf.rect(0, 0, pdf.internal.pageSize.getWidth(), 20, 'F');
            pdf.setFont('helvetica', 'bold');
            pdf.setTextColor(23, 113, 174);
            pdf.setFontSize(16);
            pdf.text('Focus.AI', 20, 12);
            
            currentY = 30; // Reset position
          }
          
          // Add image to PDF
          pdf.addImage(imgData, 'PNG', margin, currentY, imgWidth, imgHeight);
          currentY += imgHeight + 15; // Add some spacing
          
        } catch (error) {
          console.error('Error processing content element:', error);
          // Add text fallback if image capture fails
          pdf.setTextColor(0);
          pdf.setFontSize(10);
          pdf.text('Content could not be rendered correctly', margin, currentY);
          currentY += 10;
        }
      }
      
      // Add footer
      const footerText = 'Generated by Focus.AI - An intelligent assistant for optometry students';
      pdf.setFontSize(8);
      pdf.setTextColor(100, 100, 100);
      
      // Center the footer text
      const footerWidth = pdf.getStringUnitWidth(footerText) * 8 / pdf.internal.scaleFactor;
      const footerX = (pageWidth - footerWidth) / 2;
      
      const pageCount = pdf.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        pdf.setPage(i);
        pdf.text(footerText, footerX, pdf.internal.pageSize.getHeight() - 10);
        pdf.text(`Page ${i} of ${pageCount}`, pageWidth - 25, pdf.internal.pageSize.getHeight() - 10);
      }
      
      // Save PDF
      pdf.save(`${filename || 'focus-ai-export'}.pdf`);
      
      toast.success('PDF downloaded successfully');
      setShowPDFPreview(false);
    } catch (error) {
      console.error('Error exporting PDF:', error);
      toast.error('Failed to export PDF');
    } finally {
      setIsExporting(false);
    }
  };

  const handleMagicWandOption = (messageIndex: number, option: string) => {
    if (chatHistory[messageIndex].type !== 'bot') return;
    
    const content = chatHistory[messageIndex].content;
    
    setIsFormatLoading(true);
    setFormatOption(option);
    
    let formatPrompt = '';
    
    switch (option) {
      case 'Simplify':
        formatPrompt = `Simplify the following text for a first-year optometry student without losing critical information: "${content}"`;
        break;
      case 'Add Details':
        formatPrompt = `Enhance the following optometry text with more detailed explanations, clinically relevant information, and examples: "${content}"`;
        break;
      case 'Student Friendly':
        formatPrompt = `Reformat this optometry content to be more student-friendly with clear explanations, better organization, learning objectives, and study tips: "${content}"`;
        break;
      case 'Clinical Focus':
        formatPrompt = `Reformat this content with a clinical focus for practicing optometrists, emphasizing diagnostic and treatment considerations: "${content}"`;
        break;
      case 'Add Tables':
        formatPrompt = `Reformat this optometry information to include relevant comparison tables, diagnostic criteria tables, or treatment option tables where appropriate: "${content}"`;
        break;
      case 'EMR Format':
        formatPrompt = `Reformat this optometry information as if it were a professional Electronic Medical Record (EMR) entry: "${content}"`;
        break;
      default:
        formatPrompt = `Reformat this content for better readability and organization: "${content}"`;
    }
    
    generateGeminiResponse(formatPrompt)
      .then(response => {
        const updatedHistory = [...chatHistory];
        updatedHistory[messageIndex] = {
          ...updatedHistory[messageIndex],
          content: response
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

  const generatePracticeQuestions = (messageIndex: number) => {
    if (chatHistory[messageIndex].type !== 'bot') return;
    
    const content = chatHistory[messageIndex].content;
    const promptForQuestions = `Based on this optometry information: "${content}", generate 3-5 practice quiz questions (with answers) that would be useful for testing comprehension.`;
    
    setIsLoading(true);
    generateGeminiResponse(promptForQuestions)
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
    
    // We'll store the note in localStorage
    const existingNotes = JSON.parse(localStorage.getItem('savedNotes') || '[]');
    const newNote = {
      id: Date.now().toString(),
      title: chatHistory[0]?.content.slice(0, 30) + '...' || 'Untitled Note',
      content: content,
      createdAt: Date.now()
    };
    
    const updatedNotes = [newNote, ...existingNotes];
    localStorage.setItem('savedNotes', JSON.stringify(updatedNotes));
    
    toast.success('Saved to notes');
  };

  const refreshSuggestions = (messageIndex: number) => {
    if (chatHistory[messageIndex].type !== 'bot') return;
    
    // Find the user question that preceded this bot response
    let userQuestion = '';
    for (let i = messageIndex - 1; i >= 0; i--) {
      if (chatHistory[i].type === 'user') {
        userQuestion = chatHistory[i].content;
        break;
      }
    }
    
    if (!userQuestion) {
      toast.error('Cannot find the original question');
      return;
    }
    
    const botResponse = chatHistory[messageIndex].content;
    generateSuggestions(userQuestion, botResponse);
  };

  const handleSuggestionClick = (suggestion: string) => {
    setQuestion(suggestion);
    handleQuestionSubmit(suggestion);
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
    handleQuestionSubmit, // Make sure this is included in the return
    handleSubmit,
    handleSaveCase,
    generateSummary,
    generatePracticeQuestions,
    addToNotes,
    handleMagicWandOption,
    handleCopyConversation,
    downloadAsMarkdown,
    downloadAsPDF,
    executePDFExport,
    refreshSuggestions,
    handleSuggestionClick
  };
}
