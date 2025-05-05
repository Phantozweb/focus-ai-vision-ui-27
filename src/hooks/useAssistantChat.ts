
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
      
      // Create a new jsPDF instance
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });
      
      // Set up document properties
      pdf.setProperties({
        title: filename || 'Focus.AI Export',
        subject: 'Optometry AI Assistant Export',
        creator: 'Focus.AI',
        author: 'Focus.AI'
      });
      
      // Get content to export - only bot responses
      const botResponses = Array.from(content.querySelectorAll('.markdown-content'));
      const title = document.querySelector('.premium-pdf-header h1')?.textContent || 'Focus.AI Conversation';
      
      // Set initial position
      let yPos = 20;
      const margin = 20;
      const pageWidth = pdf.internal.pageSize.getWidth();
      const contentWidth = pageWidth - (margin * 2);
      
      // Add header with Focus.AI branding
      pdf.setFillColor(240, 249, 255); // Light blue background
      pdf.rect(0, 0, pageWidth, 15, 'F');
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(23, 113, 174); // Blue color for Focus.AI
      pdf.setFontSize(14);
      pdf.text('Focus.AI', margin, 10);
      
      // Add title
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(23, 113, 174); // Blue color
      pdf.setFontSize(16);
      pdf.text(title, margin, yPos);
      yPos += 10;
      
      // Add date
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(100, 100, 100); // Gray
      pdf.setFontSize(10);
      pdf.text(`Generated on ${new Date().toLocaleDateString()}`, margin, yPos);
      yPos += 10;
      
      // Add separator
      pdf.setDrawColor(200, 200, 200);
      pdf.line(margin, yPos, pageWidth - margin, yPos);
      yPos += 8;
      
      // Helper function to process and add markdown content
      const processMarkdownContent = (element: HTMLElement, startY: number): number => {
        let currentY = startY;
        
        // Function to add text with proper line breaks
        const addText = (text: string, y: number, fontSize: number, isHeading = false, isBold = false): number => {
          pdf.setFont('helvetica', isBold ? 'bold' : 'normal');
          pdf.setFontSize(fontSize);
          
          // Set text color based on content type
          if (isHeading) {
            pdf.setTextColor(23, 113, 174); // Blue for headings
          } else {
            pdf.setTextColor(0, 0, 0); // Black for regular text
          }
          
          // Split text into lines that fit within content width
          const lines = pdf.splitTextToSize(text, contentWidth);
          
          // Check if we need a new page
          if (y + (lines.length * (fontSize * 0.35)) > pdf.internal.pageSize.getHeight() - 30) {
            pdf.addPage();
            // Add page header
            pdf.setFillColor(240, 249, 255);
            pdf.rect(0, 0, pageWidth, 15, 'F');
            pdf.setFont('helvetica', 'bold');
            pdf.setTextColor(23, 113, 174);
            pdf.setFontSize(14);
            pdf.text('Focus.AI', margin, 10);
            
            // Reset position
            y = 20;
          }
          
          pdf.text(lines, margin, y);
          return y + (lines.length * (fontSize * 0.35)) + 2;
        };
        
        // Extract content from the element
        const headings = element.querySelectorAll('h1, h2, h3, h4, h5, h6');
        const paragraphs = element.querySelectorAll('p');
        const lists = element.querySelectorAll('ul, ol');
        const tables = element.querySelectorAll('table');
        
        // Process headings
        headings.forEach(heading => {
          const level = parseInt(heading.tagName.substring(1));
          const fontSize = 16 - (level - 1) * 2; // Decrease font size based on heading level
          currentY = addText(heading.textContent || '', currentY, fontSize, true, true);
          currentY += 2;
        });
        
        // Process paragraphs
        paragraphs.forEach(paragraph => {
          if (paragraph.parentElement?.tagName !== 'LI') {
            currentY = addText(paragraph.textContent || '', currentY, 10);
            currentY += 2;
          }
        });
        
        // Process lists
        lists.forEach(list => {
          const items = list.querySelectorAll('li');
          items.forEach((item, i) => {
            const prefix = list.tagName === 'OL' ? `${i + 1}. ` : '• ';
            currentY = addText(prefix + (item.textContent || ''), currentY, 10);
            currentY += 1;
          });
          currentY += 2;
        });
        
        // Process tables (simplified table rendering)
        tables.forEach(table => {
          // Add some space before table
          currentY += 5;
          
          // Check if we need to add a new page for the table
          if (currentY + 10 > pdf.internal.pageSize.getHeight() - 30) {
            pdf.addPage();
            // Add page header
            pdf.setFillColor(240, 249, 255);
            pdf.rect(0, 0, pageWidth, 15, 'F');
            pdf.setFont('helvetica', 'bold');
            pdf.setTextColor(23, 113, 174);
            pdf.setFontSize(14);
            pdf.text('Focus.AI', margin, 10);
            
            // Reset position
            currentY = 20;
          }
          
          const rows = table.querySelectorAll('tr');
          const headerCells = table.querySelectorAll('th');
          const dataCells = table.querySelectorAll('td');
          
          // Calculate table dimensions
          const numCols = headerCells.length > 0 ? headerCells.length : 
            (rows.length > 0 ? rows[0].querySelectorAll('td').length : 0);
          
          if (numCols === 0) return currentY;
          
          const colWidth = contentWidth / numCols;
          
          // Draw table headers
          pdf.setFillColor(240, 249, 255); // Light blue background
          pdf.setFont('helvetica', 'bold');
          pdf.setTextColor(23, 113, 174); // Blue color for headers
          pdf.setFontSize(10);
          
          // Process header row
          if (headerCells.length > 0) {
            let xPos = margin;
            
            // Draw header background
            pdf.rect(margin, currentY - 4, contentWidth, 8, 'F');
            
            // Add header cells
            headerCells.forEach((cell, i) => {
              pdf.text(cell.textContent?.trim() || '', xPos + 2, currentY);
              xPos += colWidth;
            });
            
            currentY += 6;
          }
          
          // Process data rows
          pdf.setFont('helvetica', 'normal');
          pdf.setTextColor(0, 0, 0); // Black text for data
          
          // Group cells by rows
          let rowIndex = 0;
          let cellsInCurrentRow = 0;
          
          for (let i = 0; i < dataCells.length; i++) {
            // Check if we need to start a new row
            if (cellsInCurrentRow === numCols) {
              cellsInCurrentRow = 0;
              rowIndex++;
              currentY += 6;
              
              // Check if we need a new page
              if (currentY > pdf.internal.pageSize.getHeight() - 30) {
                pdf.addPage();
                // Add page header
                pdf.setFillColor(240, 249, 255);
                pdf.rect(0, 0, pageWidth, 15, 'F');
                pdf.setFont('helvetica', 'bold');
                pdf.setTextColor(23, 113, 174);
                pdf.setFontSize(14);
                pdf.text('Focus.AI', margin, 10);
                
                // Reset position
                currentY = 20;
              }
            }
            
            // Draw alternating row background
            if (cellsInCurrentRow === 0 && rowIndex % 2 === 1) {
              pdf.setFillColor(249, 250, 251); // Very light gray
              pdf.rect(margin, currentY - 4, contentWidth, 6, 'F');
            }
            
            // Add cell text
            const xPos = margin + (cellsInCurrentRow * colWidth);
            const cellText = dataCells[i].textContent?.trim() || '';
            
            // Handle text that might be too long
            const cellLines = pdf.splitTextToSize(cellText, colWidth - 4);
            pdf.text(cellLines.slice(0, 2), xPos + 2, currentY); // Show only first 2 lines max
            
            cellsInCurrentRow++;
          }
          
          // Add some space after table
          currentY += 10;
        });
        
        return currentY;
      };
      
      // Process each bot response section
      botResponses.forEach((response, index) => {
        // Add section heading
        pdf.setFont('helvetica', 'bold');
        pdf.setTextColor(23, 113, 174);
        pdf.setFontSize(12);
        pdf.text(`Content Section ${index + 1}`, margin, yPos);
        yPos += 6;
        
        // Process the markdown content in this section
        yPos = processMarkdownContent(response as HTMLElement, yPos);
        
        // Add separator between sections
        if (index < botResponses.length - 1) {
          pdf.setDrawColor(230, 230, 230);
          pdf.line(margin, yPos, pageWidth - margin, yPos);
          yPos += 8;
        }
      });
      
      // Add footer to all pages
      const lastPage = pdf.internal.pages.length - 1; // -1 because pages array is 0-indexed with an empty first page
      
      for (let i = 1; i <= lastPage; i++) {
        pdf.setPage(i);
        
        // Add footer separator
        pdf.setDrawColor(230, 230, 230);
        pdf.line(margin, pdf.internal.pageSize.getHeight() - 15, pageWidth - margin, pdf.internal.pageSize.getHeight() - 15);
        
        // Add footer text
        pdf.setFont('helvetica', 'normal');
        pdf.setTextColor(150, 150, 150);
        pdf.setFontSize(9);
        pdf.text('Generated by Focus.AI - An intelligent assistant for optometry students', margin, pdf.internal.pageSize.getHeight() - 10);
        pdf.text(`Page ${i} of ${lastPage}`, pageWidth - margin - 20, pdf.internal.pageSize.getHeight() - 10, { align: 'right' });
      }
      
      // Save the PDF with provided filename or "untitled"
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
