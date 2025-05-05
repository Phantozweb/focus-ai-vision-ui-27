import { useState, useEffect } from 'react';
import { toast } from '@/components/ui/sonner';
import { generateGeminiResponse, generateFollowUpQuestions } from '@/utils/geminiApi';
import jsPDF from 'jspdf';

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
      // Get only bot responses (answers)
      const botResponses = chatHistory.filter(msg => msg.type === 'bot');
      
      // Generate title from first user question
      const firstUserQuestion = chatHistory.find(msg => msg.type === 'user')?.content || 'Conversation';
      const title = firstUserQuestion.length > 30 ? 
        firstUserQuestion.substring(0, 30) + '...' : 
        firstUserQuestion;
      
      // Create PDF with proper dimensions
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      // Set default text properties
      pdf.setFont('helvetica');
      pdf.setFontSize(11);
      pdf.setTextColor(50, 50, 50);
      
      // Calculate dimensions
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 20; // mm
      const contentWidth = pageWidth - 2 * margin;
      let yPosition = margin;
      const lineHeight = 7; // mm
      
      // Add Focus.AI Header
      pdf.setFillColor(247, 250, 252); // Light blue background
      pdf.rect(0, 0, pageWidth, 25, 'F');
      
      pdf.setFillColor(51, 195, 240); // Sky blue for logo background
      pdf.roundedRect(margin, 10, 12, 12, 2, 2, 'F');
      
      pdf.setFontSize(8);
      pdf.setTextColor(255, 255, 255);
      pdf.text('AI', margin + 9, 17, { align: 'center' });
      
      pdf.setFontSize(16);
      pdf.setTextColor(36, 99, 235);
      pdf.text('Focus.AI', margin + 18, 19);
      
      // Add title and date
      pdf.setFontSize(14);
      pdf.setTextColor(30, 64, 175); // Blue title
      yPosition = 40;
      pdf.text(title, margin, yPosition);
      
      pdf.setFontSize(9);
      pdf.setTextColor(100, 100, 100);
      yPosition += 6;
      pdf.text(`Generated on ${new Date().toLocaleDateString()}`, margin, yPosition);
      
      yPosition += 10;
      
      // Add content
      botResponses.forEach((response, index) => {
        // Split content by section markers (## headings)
        const sections = response.content.split(/(?=^## )/gm);
        
        sections.forEach(section => {
          // Process each line in the section
          const lines = section.split('\n');
          
          lines.forEach(line => {
            // Check if page break needed
            if (yPosition > pageHeight - margin) {
              pdf.addPage();
              yPosition = margin;
              
              // Add page header
              pdf.setFillColor(247, 250, 252);
              pdf.rect(0, 0, pageWidth, 15, 'F');
              
              pdf.setFontSize(8);
              pdf.setTextColor(100, 100, 100);
              pdf.text('Focus.AI', margin, 10);
            }
            
            // Process different line types
            if (line.startsWith('# ')) {
              // H1 heading
              yPosition += 5;
              pdf.setFontSize(16);
              pdf.setTextColor(36, 99, 235); // Blue
              pdf.text(line.substring(2), margin, yPosition);
              yPosition += lineHeight;
            } else if (line.startsWith('## ')) {
              // H2 heading
              yPosition += 4;
              pdf.setFontSize(14);
              pdf.setTextColor(30, 64, 175); // Dark blue
              pdf.text(line.substring(3), margin, yPosition);
              yPosition += lineHeight;
            } else if (line.startsWith('### ')) {
              // H3 heading
              yPosition += 3;
              pdf.setFontSize(12);
              pdf.setTextColor(59, 130, 246); // Medium blue
              pdf.text(line.substring(4), margin, yPosition);
              yPosition += lineHeight;
            } else if (line.startsWith('- ')) {
              // Bullet point
              pdf.setFontSize(11);
              pdf.setTextColor(50, 50, 50);
              
              // Split text into wrapped lines
              const wrappedText = pdf.splitTextToSize(line, contentWidth - 10);
              
              wrappedText.forEach((wrappedLine: string, i: number) => {
                // Only add bullet for first line
                if (i === 0) {
                  pdf.text('•', margin, yPosition);
                  pdf.text(wrappedLine.substring(2), margin + 5, yPosition);
                } else {
                  pdf.text(wrappedLine, margin + 5, yPosition);
                }
                yPosition += lineHeight - 1;
              });
            } else if (line.match(/^\d+\.\s/)) {
              // Numbered list
              pdf.setFontSize(11);
              pdf.setTextColor(50, 50, 50);
              
              const number = line.match(/^\d+/)?.[0] || '';
              const text = line.substring(number.length + 2);
              
              // Split text into wrapped lines
              const wrappedText = pdf.splitTextToSize(text, contentWidth - 10);
              
              wrappedText.forEach((wrappedLine: string, i: number) => {
                // Only add number for first line
                if (i === 0) {
                  pdf.text(`${number}.`, margin, yPosition);
                  pdf.text(wrappedLine, margin + 5, yPosition);
                } else {
                  pdf.text(wrappedLine, margin + 5, yPosition);
                }
                yPosition += lineHeight - 1;
              });
            } else if (line.startsWith('```')) {
              // Code block start/end
              yPosition += 2;
            } else if (line.startsWith('|') && line.endsWith('|')) {
              // Table row
              const cells = line.split('|').filter(cell => cell !== '');
              
              // Calculate cell width
              const cellWidth = contentWidth / cells.length;
              
              // Check if this is a header separator row (contains only dashes and colons)
              if (cells.every(cell => cell.trim().match(/^[-:]+$/))) {
                // Draw a line
                pdf.setDrawColor(200, 200, 200);
                pdf.line(margin, yPosition - 2, margin + contentWidth, yPosition - 2);
                yPosition += 2;
              } else {
                // Determine if this is a header row
                const isHeader = line === cells[0] && lines.indexOf(line) < 3;
                
                if (isHeader) {
                  pdf.setFontSize(11);
                  pdf.setTextColor(36, 99, 235);
                  pdf.setFont('helvetica', 'bold');
                } else {
                  pdf.setFontSize(10);
                  pdf.setTextColor(50, 50, 50);
                  pdf.setFont('helvetica', 'normal');
                }
                
                // Draw cells
                cells.forEach((cell, i) => {
                  const cellText = cell.trim();
                  const xPos = margin + i * cellWidth;
                  
                  // Draw cell text
                  pdf.text(cellText, xPos + 2, yPosition);
                });
                
                yPosition += lineHeight;
              }
            } else if (line.trim() === '') {
              // Empty line
              yPosition += lineHeight - 3;
            } else {
              // Regular paragraph text
              pdf.setFontSize(11);
              pdf.setTextColor(50, 50, 50);
              pdf.setFont('helvetica', 'normal');
              
              // Bold and italic formatting
              let formattedText = line;
              
              // Handle strong/bold text
              formattedText = formattedText.replace(/\*\*(.*?)\*\*/g, '$1');
              
              // Handle italic text
              formattedText = formattedText.replace(/\*(.*?)\*/g, '$1');
              
              // Split text into wrapped lines
              const wrappedText = pdf.splitTextToSize(formattedText, contentWidth);
              
              wrappedText.forEach((wrappedLine: string) => {
                pdf.text(wrappedLine, margin, yPosition);
                yPosition += lineHeight - 1;
              });
            }
          });
          
          // Add some space between sections
          yPosition += lineHeight - 3;
        });
        
        // Add separator between responses
        if (index < botResponses.length - 1) {
          pdf.setDrawColor(220, 220, 220);
          pdf.line(margin, yPosition, margin + contentWidth, yPosition);
          yPosition += lineHeight;
        }
      });
      
      // Add footer to each page
      const totalPages = pdf.getNumberOfPages();
      for (let i = 1; i <= totalPages; i++) {
        pdf.setPage(i);
        
        // Add page numbers
        pdf.setTextColor(150, 150, 150);
        pdf.setFontSize(8);
        pdf.text(`Page ${i} of ${totalPages}`, pageWidth - margin, pageHeight - 10);
        
        // Add Focus.AI footer link
        pdf.setTextColor(59, 130, 246);
        pdf.text('Visit Focus.AI', margin, pageHeight - 10);
        pdf.link(margin, pageHeight - 12, 30, 6, { url: 'https://focusai.netlify.app' });
      }
      
      // Sanitize filename and ensure it has .pdf extension
      const sanitizedFilename = filename.replace(/[^a-z0-9]/gi, '-').toLowerCase();
      const finalFilename = sanitizedFilename.endsWith('.pdf') ? 
        sanitizedFilename : 
        `${sanitizedFilename}.pdf`;
      
      // Download the PDF
      pdf.save(finalFilename);
      
      toast.success('PDF downloaded successfully');
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast.error('Failed to generate PDF');
    } finally {
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
