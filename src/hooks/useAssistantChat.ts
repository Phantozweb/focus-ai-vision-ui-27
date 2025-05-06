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

  const generateDescriptiveTitle = async () => {
    if (chatHistory.length === 0) return 'Focus.AI Notes';

    const botResponses = chatHistory.filter(msg => msg.type === 'bot');
    if (botResponses.length === 0) return 'Focus.AI Notes';
    
    // Get the first response content (truncated to avoid token limits)
    const content = botResponses[0].content.substring(0, 1000);
    
    try {
      const titlePrompt = `Based on this optometry information, generate a concise, professional title (5-7 words) that describes the main topic or concept discussed. Make it specific rather than generic. Only output the title itself with no quotation marks or extra text:

${content}`;
      
      const title = await generateGeminiResponse(titlePrompt);
      // Clean up title (remove quotes, trim, etc.)
      return title.replace(/^["']|["']$/g, '').trim() || 'Optometry Study Notes';
    } catch (error) {
      console.error('Error generating title:', error);
      return 'Optometry Study Notes';
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

  const downloadAsPDF = async () => {
    if (chatHistory.length === 0) {
      toast.error('No conversation to download');
      return;
    }

    try {
      // Generate a descriptive title for the PDF
      const title = await generateDescriptiveTitle();
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
      
      // Create PDF document with appropriate margins for better content flow
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
      
      // Find the title element in the content
      const titleElement = contentElement.querySelector('.premium-pdf-header h1') as HTMLElement;
      const documentTitle = titleElement?.textContent || generatedTitle || 'Optometry Notes';
      
      // Optimized margins for content
      const margin = 10;
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      
      // Start with title directly on first page
      let yPosition = margin;
      
      // Add title to first page
      pdf.setFontSize(16);
      pdf.setTextColor(23, 113, 174);
      pdf.text(documentTitle, margin, yPosition + 8);
      yPosition += 12;
      
      // Add date
      pdf.setFontSize(9);
      pdf.setTextColor(100, 100, 100);
      pdf.text(`Generated on ${new Date().toLocaleDateString()}`, margin, yPosition);
      yPosition += 8;
      
      // Add a divider line after the header
      pdf.setDrawColor(200, 200, 200);
      pdf.setLineWidth(0.5);
      pdf.line(margin, yPosition, pageWidth - margin, yPosition);
      yPosition += 5;
      
      // Process each PDF section
      const sections = Array.from(contentElement.querySelectorAll('.pdf-section'));
      let pageCount = 1;
      
      for (const [index, section] of sections.entries()) {
        try {
          // Create a clone to modify for rendering
          const sectionElement = section as HTMLElement;
          const clone = sectionElement.cloneNode(true) as HTMLElement;
          
          // Prepare for capturing
          const tempDiv = document.createElement('div');
          tempDiv.style.position = 'absolute';
          tempDiv.style.left = '-9999px';
          // Set proper width for better text flow
          tempDiv.style.width = `${(pageWidth - (margin * 2)) * 3.78}px`;
          tempDiv.appendChild(clone);
          document.body.appendChild(tempDiv);
          
          // Enhance table styling for PDF
          const tables = Array.from(clone.querySelectorAll('table'));
          tables.forEach(table => {
            (table as HTMLElement).style.width = '100%';
            (table as HTMLElement).style.borderCollapse = 'collapse';
            (table as HTMLElement).style.margin = '6px 0';
            (table as HTMLElement).style.fontSize = '8px';
          });
          
          const thElements = Array.from(clone.querySelectorAll('th'));
          thElements.forEach(th => {
            (th as HTMLElement).style.backgroundColor = '#e6f0ff';
            (th as HTMLElement).style.color = '#1e3a8a';
            (th as HTMLElement).style.padding = '3px 5px';
            (th as HTMLElement).style.fontSize = '8px';
            (th as HTMLElement).style.fontWeight = 'bold';
            (th as HTMLElement).style.textAlign = 'left';
            (th as HTMLElement).style.borderBottom = '1px solid #ccc';
          });
          
          const tdElements = Array.from(clone.querySelectorAll('td'));
          tdElements.forEach(td => {
            (td as HTMLElement).style.padding = '3px 5px';
            (td as HTMLElement).style.fontSize = '8px';
            (td as HTMLElement).style.borderBottom = '1px solid #eee';
          });
          
          // For better rendering of headings and paragraphs
          const headings = Array.from(clone.querySelectorAll('h1, h2, h3, h4, h5, h6'));
          headings.forEach(heading => {
            (heading as HTMLElement).style.marginBottom = '3px';
            (heading as HTMLElement).style.marginTop = '5px';
            (heading as HTMLElement).style.pageBreakAfter = 'avoid';
            (heading as HTMLElement).style.pageBreakInside = 'avoid';
          });
          
          const paragraphs = Array.from(clone.querySelectorAll('p'));
          paragraphs.forEach(p => {
            (p as HTMLElement).style.margin = '2px 0';
            (p as HTMLElement).style.lineHeight = '1.3';
          });

          // Make lists more compact but still readable
          const lists = Array.from(clone.querySelectorAll('ul, ol'));
          lists.forEach(list => {
            (list as HTMLElement).style.margin = '3px 0';
            (list as HTMLElement).style.paddingLeft = '15px';
          });

          const listItems = Array.from(clone.querySelectorAll('li'));
          listItems.forEach(item => {
            (item as HTMLElement).style.margin = '2px 0';
            (item as HTMLElement).style.lineHeight = '1.3';
          });
          
          // Capture as image with high quality
          const canvas = await html2canvas(clone, {
            scale: 2,
            logging: false,
            useCORS: true,
            allowTaint: true,
            backgroundColor: '#ffffff'
          });
          
          // Remove temporary element
          document.body.removeChild(tempDiv);
          
          // Calculate dimensions for proper scaling
          const contentWidth = pageWidth - (margin * 2);
          const imgWidth = contentWidth;
          const imgHeight = (canvas.height * imgWidth) / canvas.width;
          
          // Check if this section needs to start on a new page (except first section)
          if (yPosition + imgHeight > pageHeight - (margin + 15) && yPosition > margin + 15) {
            pdf.addPage();
            pageCount++;
            yPosition = margin + 6; // Reset position on new page
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
          
          // Update position for next element
          yPosition += imgHeight + 5;
          
          // Add a divider after each section (except the last one)
          if (index < sections.length - 1) {
            pdf.setDrawColor(230, 230, 230);
            pdf.setLineWidth(0.3);
            pdf.line(margin, yPosition - 2, pageWidth - margin, yPosition - 2);
          }
        } catch (error) {
          console.error('Error processing section:', error);
          // Add text fallback
          pdf.setTextColor(0, 0, 0);
          pdf.setFontSize(10);
          pdf.text('Content could not be rendered correctly', margin, yPosition);
          yPosition += 6;
        }
      }
      
      // Add page numbers and footer to all pages
      const finalPageCount = pdf.getNumberOfPages();
      for (let i = 1; i <= finalPageCount; i++) {
        pdf.setPage(i);
        
        // Add page number at the bottom
        pdf.setFontSize(8);
        pdf.setTextColor(100, 100, 100);
        pdf.text(`Page ${i} of ${finalPageCount}`, pageWidth - 25, pageHeight - 10);
        
        // Add subtle footer
        pdf.setFontSize(8);
        pdf.setTextColor(120, 120, 120);
        pdf.text('Generated by Focus.AI', margin, pageHeight - 10);
      }
      
      // Add a minimalist footer on the last page
      pdf.setPage(finalPageCount);
      pdf.setFontSize(9);
      pdf.setTextColor(100, 100, 100);
      pdf.text('Generated by Focus.AI - An intelligent assistant for optometry students', pageWidth/2, pageHeight - 20, { align: 'center' });
      
      // Save the PDF
      pdf.save(`${filename || 'optometry-notes'}.pdf`);
      
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
