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
  const [generatedTitle, setGeneratedTitle] = useState<string>('');

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

  // Simplified function for title generation that doesn't require API call
  const getSimpleTitle = (): string => {
    if (chatHistory.length === 0) return 'Optometry Notes';
    
    // Find first user question
    const firstUserMessage = chatHistory.find(msg => msg.type === 'user');
    if (!firstUserMessage) return 'Optometry Notes';
    
    // Create a clean title from the first question (max 30 chars)
    const questionText = firstUserMessage.content;
    const shortTitle = questionText.length > 30 
      ? questionText.substring(0, 30) + '...' 
      : questionText;
      
    return `Optometry Notes: ${shortTitle}`;
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

  const downloadAsPDF = async () => {
    if (chatHistory.length === 0) {
      toast.error('No conversation to download');
      return;
    }

    try {
      // Generate a simple title without API call
      const title = getSimpleTitle();
      setGeneratedTitle(title);
      
      // Show the PDF preview with the generated title
      setShowPDFPreview(true);
    } catch (error) {
      console.error('Error preparing PDF export:', error);
      toast.error('Failed to prepare PDF export');
    }
  };

  const executePDFExport = async (filename: string = 'untitled') => {
    setIsExporting(true);
    
    try {
      // Get the PDF export content element
      const contentElement = document.getElementById('pdf-export-content');
      
      if (!contentElement) {
        throw new Error('PDF content element not found');
      }
      
      // Create PDF document with appropriate margins
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
        compress: true
      });
      
      // Set document properties
      pdf.setProperties({
        title: generatedTitle || 'Optometry Notes',
        subject: 'Optometry AI Assistant Export',
        creator: 'Focus.AI',
        author: 'Focus.AI'
      });
      
      // Essential dimensions
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 10; // Smaller margins for more content
      
      // Add title to first page
      let yPosition = margin;
      pdf.setFontSize(14);
      pdf.setTextColor(23, 113, 174);
      pdf.text(generatedTitle || 'Optometry Notes', margin, yPosition + 7);
      yPosition += 10;
      
      // Add date
      pdf.setFontSize(8);
      pdf.setTextColor(100, 100, 100);
      pdf.text(`Generated on ${new Date().toLocaleDateString()}`, margin, yPosition);
      yPosition += 5;
      
      // Add a divider line
      pdf.setDrawColor(200, 200, 200);
      pdf.setLineWidth(0.5);
      pdf.line(margin, yPosition, pageWidth - margin, yPosition);
      yPosition += 5;
      
      // Get all content sections
      const sections = Array.from(contentElement.querySelectorAll('.pdf-section'));
      let pageCount = 1;
      
      for (const [index, section] of sections.entries()) {
        try {
          const sectionElement = section as HTMLElement;
          
          // Create temporary element for HTML to canvas conversion
          const tempDiv = document.createElement('div');
          tempDiv.style.position = 'absolute';
          tempDiv.style.left = '-9999px';
          tempDiv.style.width = `${(pageWidth - (margin * 2)) * 3.78}px`;
          document.body.appendChild(tempDiv);
          
          // Clone the section to manipulate for better rendering
          const clone = sectionElement.cloneNode(true) as HTMLElement;
          tempDiv.appendChild(clone);
          
          // Style enhancements for PDF
          const tables = Array.from(clone.querySelectorAll('table'));
          tables.forEach(table => {
            (table as HTMLElement).style.width = '100%';
            (table as HTMLElement).style.borderCollapse = 'collapse';
            (table as HTMLElement).style.margin = '4px 0';
            (table as HTMLElement).style.fontSize = '8px';
          });
          
          // Style table headers and cells
          Array.from(clone.querySelectorAll('th')).forEach(th => {
            (th as HTMLElement).style.backgroundColor = '#e6f0ff';
            (th as HTMLElement).style.padding = '3px 5px';
            (th as HTMLElement).style.fontSize = '8px';
            (th as HTMLElement).style.fontWeight = 'bold';
            (th as HTMLElement).style.borderBottom = '1px solid #ccc';
          });
          
          Array.from(clone.querySelectorAll('td')).forEach(td => {
            (td as HTMLElement).style.padding = '3px 5px';
            (td as HTMLElement).style.fontSize = '8px';
            (td as HTMLElement).style.borderBottom = '1px solid #eee';
          });
          
          // Style headings
          Array.from(clone.querySelectorAll('h1, h2, h3, h4, h5, h6')).forEach(heading => {
            (heading as HTMLElement).style.marginBottom = '2px';
            (heading as HTMLElement).style.marginTop = '4px';
            (heading as HTMLElement).style.pageBreakAfter = 'avoid';
          });
          
          // Style paragraphs and lists
          Array.from(clone.querySelectorAll('p')).forEach(p => {
            (p as HTMLElement).style.margin = '2px 0';
            (p as HTMLElement).style.lineHeight = '1.2';
          });
          
          Array.from(clone.querySelectorAll('ul, ol')).forEach(list => {
            (list as HTMLElement).style.margin = '2px 0';
            (list as HTMLElement).style.paddingLeft = '12px';
          });
          
          // Capture as image
          const canvas = await html2canvas(clone, {
            scale: 2,
            logging: false,
            useCORS: true,
            allowTaint: true,
            backgroundColor: '#ffffff'
          });
          
          // Remove temporary element
          document.body.removeChild(tempDiv);
          
          // Calculate dimensions
          const contentWidth = pageWidth - (margin * 2);
          const imgWidth = contentWidth;
          const imgHeight = (canvas.height * imgWidth) / canvas.width;
          
          // Determine if we need a page break
          if (yPosition + imgHeight > pageHeight - margin && yPosition > margin + 10) {
            pdf.addPage();
            pageCount++;
            yPosition = margin;
          }
          
          // Add image to PDF
          pdf.addImage(
            canvas.toDataURL('image/png'), 
            'PNG', 
            margin, 
            yPosition, 
            imgWidth, 
            imgHeight
          );
          
          // Update position and add divider if needed
          yPosition += imgHeight + 4;
          if (index < sections.length - 1) {
            pdf.setDrawColor(220, 220, 220);
            pdf.setLineWidth(0.3);
            pdf.line(margin, yPosition - 2, pageWidth - margin, yPosition - 2);
          }
        } catch (error) {
          console.error('Error processing section:', error);
          // Fallback text
          pdf.setTextColor(0, 0, 0);
          pdf.setFontSize(9);
          pdf.text('Content could not be rendered properly', margin, yPosition);
          yPosition += 5;
        }
      }
      
      // Add page numbers and footer to all pages
      const totalPages = pdf.getNumberOfPages();
      for (let i = 1; i <= totalPages; i++) {
        pdf.setPage(i);
        
        // Add page number
        pdf.setFontSize(8);
        pdf.setTextColor(100, 100, 100);
        pdf.text(`Page ${i} of ${totalPages}`, pageWidth - 25, pageHeight - 8);
        
        // Add footer
        pdf.setFontSize(8);
        pdf.setTextColor(120, 120, 120);
        pdf.text('Generated by Focus.AI', margin, pageHeight - 8);
      }
      
      // Add minimal footer on last page
      pdf.setPage(totalPages);
      pdf.setFontSize(8);
      pdf.setTextColor(100, 100, 100);
      pdf.text('Generated by Focus.AI', pageWidth/2, pageHeight - 15, { align: 'center' });
      
      // Force download the PDF - using a different approach
      const pdfBlob = pdf.output('blob');
      const pdfUrl = URL.createObjectURL(pdfBlob);
      
      // Create an invisible anchor and trigger download
      const downloadLink = document.createElement('a');
      downloadLink.href = pdfUrl;
      downloadLink.download = `${filename || 'optometry-notes'}.pdf`;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
      URL.revokeObjectURL(pdfUrl);
      
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
    handleQuestionSubmit,
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
    handleSuggestionClick,
    generatedTitle
  };
}
