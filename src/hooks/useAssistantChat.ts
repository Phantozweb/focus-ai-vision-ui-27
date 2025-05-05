import { useState, useEffect } from 'react';
import { toast } from '@/components/ui/sonner';
import { generateGeminiResponse, generateFollowUpQuestions } from '@/utils/geminiApi';

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

  const executePDFExport = () => {
    setIsExporting(true);
    
    // Only export bot responses (answers)
    const botResponses = chatHistory.filter(msg => msg.type === 'bot');
    
    // Generate title from first user question
    const firstUserQuestion = chatHistory.find(msg => msg.type === 'user')?.content || 'Conversation';
    const title = firstUserQuestion.length > 30 ? 
      firstUserQuestion.substring(0, 30) + '...' : 
      firstUserQuestion;
    
    // Convert the chat history to HTML with proper formatting and branding
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Focus.AI - ${title}</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
          body { 
            font-family: 'Inter', sans-serif; 
            max-width: 800px; 
            margin: 0 auto; 
            padding: 20px;
            color: #333;
          }
          .header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 40px;
            padding-bottom: 20px;
            border-bottom: 1px solid #e2e8f0;
          }
          .logo {
            display: flex;
            align-items: center;
            gap: 10px;
            font-weight: bold;
            font-size: 24px;
          }
          .logo-icon {
            width: 40px;
            height: 40px;
            background-color: #3b82f6;
            border-radius: 8px;
            color: white;
            display: flex;
            align-items: center;
            justify-content: center;
            position: relative;
          }
          .logo-badge {
            position: absolute;
            right: -5px;
            bottom: -5px;
            background-color: #3b82f6;
            color: white;
            font-size: 10px;
            font-weight: bold;
            padding: 2px 4px;
            border-radius: 4px;
          }
          .report-info {
            margin-bottom: 30px;
          }
          h1 { 
            font-size: 28px;
            margin-bottom: 8px;
            color: #111827;
          }
          h2 { 
            font-size: 22px;
            margin-top: 30px;
            margin-bottom: 15px;
            padding-bottom: 8px;
            border-bottom: 1px solid #e2e8f0;
            color: #1e3a8a;
          }
          h3 { 
            font-size: 18px;
            margin-top: 25px;
            margin-bottom: 12px;
            color: #1e3a8a;
          }
          p { 
            margin: 12px 0;
            line-height: 1.6;
          }
          table {
            border-collapse: collapse;
            width: 100%;
            margin: 16px 0;
            font-size: 14px;
          }
          table, th, td {
            border: 1px solid #e2e8f0;
          }
          th, td {
            padding: 10px;
            text-align: left;
          }
          th {
            background-color: #f8fafc;
            font-weight: 600;
          }
          tr:nth-child(even) {
            background-color: #f8fafc;
          }
          ul, ol {
            padding-left: 24px;
            margin: 12px 0;
          }
          li {
            margin-bottom: 6px;
            line-height: 1.6;
          }
          .footer {
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid #e2e8f0;
            text-align: center;
            font-size: 12px;
            color: #64748b;
          }
          .visit-button {
            display: inline-block;
            margin-top: 10px;
            padding: 8px 16px;
            background-color: #3b82f6;
            color: white;
            text-decoration: none;
            border-radius: 4px;
            font-weight: 500;
            font-size: 14px;
          }
          .visit-button:hover {
            background-color: #2563eb;
          }
          a {
            color: #3b82f6;
            text-decoration: none;
          }
          a:hover {
            text-decoration: underline;
          }
          pre {
            background-color: #f8fafc;
            padding: 12px;
            border-radius: 6px;
            overflow-x: auto;
            font-size: 14px;
            font-family: monospace;
          }
          code {
            background-color: #f1f5f9;
            padding: 2px 4px;
            border-radius: 4px;
            font-size: 0.9em;
            font-family: monospace;
          }
          blockquote {
            border-left: 4px solid #3b82f6;
            padding-left: 16px;
            margin-left: 0;
            color: #475569;
          }
          hr {
            border: 0;
            border-top: 1px solid #e2e8f0;
            margin: 24px 0;
          }
          .answer {
            margin-bottom: 30px;
            padding-bottom: 20px;
            border-bottom: 1px solid #e2e8f0;
          }
          .answer:last-child {
            border-bottom: none;
          }
          .disclaimer {
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid #e2e8f0;
            text-align: center;
          }
          .disclaimer-logo {
            display: flex;
            align-items: center;
            justify-content: center;
            margin-bottom: 10px;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="logo">
            <div class="logo-icon">
              AI
              <div class="logo-badge">AI</div>
            </div>
            Focus.AI
          </div>
          <div>
            <a class="visit-button" href="https://focusai.netlify.app" target="_blank">Visit Focus.AI</a>
          </div>
        </div>
        
        <div class="report-info">
          <h1>${title}</h1>
          <p>Generated on ${new Date().toLocaleDateString()} by Focus.AI</p>
        </div>
        
        ${botResponses.map((response, index) => `
          <div class="answer">
            ${response.content
              .replace(/\n/g, '<br>')
              .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
              .replace(/\*(.*?)\*/g, '<em>$1</em>')
              .replace(/```([\s\S]*?)```/g, '<pre><code>$1</code></pre>')
              .replace(/`([^`]+)`/g, '<code>$1</code>')
              .replace(/^### (.*$)/gm, '<h3>$1</h3>')
              .replace(/^## (.*$)/gm, '<h2>$1</h2>')
              .replace(/^# (.*$)/gm, '<h1>$1</h1>')
              .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2">$1</a>')
              .replace(/\n\n/g, '</p><p>')
              // Improved table handling
              .replace(/\|(.+)\|/g, function(match) {
                const cells = match.split('|').filter(cell => cell.trim() !== '');
                const isHeader = cells.every(cell => cell.trim().startsWith('-'));
                
                if (isHeader) {
                  return '';
                }
                
                return '<tr><td>' + cells.join('</td><td>') + '</td></tr>';
              })
              .replace(/<tr><td>(.+)<\/td><\/tr>/g, '<table><tr><th>$1</th></tr>')
              .replace(/<\/tr>\s*<tr>/g, '</tr><tr>')
              .replace(/<\/td><\/tr>\s*<\/table>/g, '</td></tr></table>')
            }
          </div>
        `).join('')}
        
        <div class="disclaimer">
          <div class="disclaimer-logo">
            <div class="logo-icon" style="width: 30px; height: 30px; font-size: 14px;">
              AI
              <div class="logo-badge" style="font-size: 8px;">AI</div>
            </div>
            <span style="margin-left: 8px; font-weight: bold;">Focus.AI</span>
          </div>
          <p>This is AI-generated content. While we strive for accuracy, please verify any critical information.</p>
          <a class="visit-button" href="https://focusai.netlify.app" target="_blank">Visit Focus.AI</a>
          <p style="margin-top: 20px; font-size: 12px;">Focus.AI &copy; ${new Date().getFullYear()} - Helping optometry students learn better.</p>
        </div>
      </body>
      </html>
    `;

    setTimeout(() => {
      // Create a Blob from the HTML content
      const blob = new Blob([htmlContent], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      
      // Open the HTML in a new window for printing to PDF
      const pdfWindow = window.open(url);
      
      // Wait for the window to load before triggering print
      if (pdfWindow) {
        pdfWindow.addEventListener('load', () => {
          pdfWindow.print();
          // Revoke the object URL after printing
          setTimeout(() => URL.revokeObjectURL(url), 100);
        });
      } else {
        toast.error('Unable to open print window. Please check your popup blocker settings.');
        URL.revokeObjectURL(url);
      }
      
      setShowPDFPreview(false);
      setIsExporting(false);
    }, 1500);
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
      const content = chatHistory[messageIndex].content;
      let modificationPrompt = '';
      
      setFormatOption(option);
      setIsFormatLoading(true);
      
      switch(option) {
        case 'Simplify':
          modificationPrompt = `Rewrite the following optometry content in simpler terms for a beginner student:\n\n${content}`;
          break;
        case 'Add Details':
          modificationPrompt = `Expand on the following optometry content with more detailed information and examples:\n\n${content}`;
          break;
        case 'Student Friendly':
          modificationPrompt = `Reformat the following optometry content to be more student-friendly with learning objectives and key points:\n\n${content}`;
          break;
        case 'Clinical Focus':
          modificationPrompt = `Rewrite the following content with a focus on clinical application and patient care:\n\n${content}`;
          break;
        case 'Add Tables':
          modificationPrompt = `Reformat the following optometry content to include well-structured tables to organize the information better:\n\n${content}`;
          break;
        case 'EMR Format':
          modificationPrompt = `Reformat the following content to resemble a professional EMR (Electronic Medical Record) format:\n\n${content}`;
          break;
        default:
          setIsFormatLoading(false);
          return;
      }
      
      setTimeout(() => {
        generateGeminiResponse(modificationPrompt)
          .then(modifiedContent => {
            const updatedHistory = [...chatHistory];
            updatedHistory[messageIndex] = {
              ...updatedHistory[messageIndex],
              content: modifiedContent
            };
            setChatHistory(updatedHistory);
            toast.success(`Content ${option.toLowerCase()} successfully`);
          })
          .catch(error => {
            console.error(`Error applying ${option}:`, error);
            toast.error(`Failed to ${option.toLowerCase()} content`);
          })
          .finally(() => {
            setIsFormatLoading(false);
            setFormatOption('');
          });
      }, 1000);
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
    const mcqPrompt = `Based on this optometry information: "${content.substring(0, 500)}...", 
    create 3 multiple choice questions (MCQs) with 4 options each and indicate the correct answer. 
    Format as markdown with clear question numbering, options as A, B, C, D, and show the correct answer at the end.`;
    
    setIsLoading(true);
    generateGeminiResponse(mcqPrompt)
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
    savedCases,
    followUpLoading,
    handleQuestionSubmit,
    handleSubmit,
    handleSaveCase,
    handleCopyConversation,
    generateSummary,
    downloadAsMarkdown,
    downloadAsPDF,
    executePDFExport,
    addToNotes,
    handleMagicWandOption,
    handleSuggestionClick,
    refreshSuggestions,
    generatePracticeQuestions
  };
}

export default useAssistantChat;
