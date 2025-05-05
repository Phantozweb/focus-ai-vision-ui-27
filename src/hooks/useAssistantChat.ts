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
    
    // Convert the chat history to HTML with proper compact formatting
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Focus.AI - ${title}</title>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
          
          :root {
            --primary-color: #3b82f6;
            --primary-dark: #2563eb;
            --primary-light: #60a5fa;
            --primary-bg: #eff6ff;
            --text-dark: #222222;
            --text-medium: #444444;
            --text-light: #666666;
            --border-color: #e2e8f0;
            --border-light: #f1f5f9;
            --shadow-sm: 0 1px 2px rgba(0,0,0,0.05);
            --shadow-md: 0 2px 4px rgba(0,0,0,0.05);
          }
          
          body { 
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            max-width: 800px; 
            margin: 0 auto; 
            padding: 0;
            color: var(--text-dark);
            line-height: 1.5;
            font-size: 11px;
          }
          
          * {
            box-sizing: border-box;
          }
          
          .page-container {
            padding: 1.5rem;
          }
          
          .header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 20px;
            padding: 15px;
            border-radius: 8px;
            background: linear-gradient(to right, #f0f7ff, #ffffff);
            border: 1px solid #e2e8f0;
            box-shadow: var(--shadow-sm);
          }
          
          .logo {
            display: flex;
            align-items: center;
            gap: 8px;
            font-weight: bold;
            font-size: 18px;
            color: var(--primary-color);
          }
          
          .logo-icon {
            width: 32px;
            height: 32px;
            background: linear-gradient(to bottom right, var(--primary-color), var(--primary-light));
            border-radius: 6px;
            color: white;
            display: flex;
            align-items: center;
            justify-content: center;
            position: relative;
            box-shadow: 0 2px 4px rgba(59, 130, 246, 0.2);
          }
          
          .logo-badge {
            position: absolute;
            right: -4px;
            bottom: -4px;
            background-color: var(--primary-dark);
            color: white;
            font-size: 8px;
            font-weight: bold;
            padding: 1px 3px;
            border-radius: 3px;
            box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
          }
          
          .logo-text {
            background-image: linear-gradient(to right, var(--primary-dark), var(--primary-light));
            -webkit-background-clip: text;
            background-clip: text;
            color: transparent;
            font-weight: 700;
          }
          
          .report-info {
            margin-bottom: 20px;
          }
          
          .visit-button {
            padding: 5px 10px;
            background-color: var(--primary-color);
            color: white;
            text-decoration: none;
            border-radius: 4px;
            font-weight: 500;
            font-size: 11px;
            box-shadow: 0 1px 2px rgba(59, 130, 246, 0.2);
            border: none;
            display: inline-block;
          }
          
          h1 { 
            font-size: 20px;
            font-weight: 700;
            margin: 0 0 8px 0;
            color: var(--text-dark);
            line-height: 1.3;
          }
          
          .date {
            color: var(--text-light);
            font-size: 11px;
            margin-bottom: 20px;
          }
          
          h2 { 
            font-size: 16px;
            font-weight: 600;
            margin: 20px 0 10px 0;
            padding-bottom: 5px;
            border-bottom: 1px solid var(--border-color);
            color: var(--primary-color);
          }
          
          h3 { 
            font-size: 14px;
            font-weight: 600;
            margin: 16px 0 8px 0;
            color: var(--primary-color);
          }
          
          p { 
            margin: 0 0 10px 0;
            line-height: 1.5;
            font-size: 11px;
          }
          
          .answer {
            margin-bottom: 20px;
            padding-bottom: 15px;
            border-bottom: 1px solid var(--border-light);
            font-size: 11px;
          }
          
          .answer:last-child {
            border-bottom: none;
            margin-bottom: 0;
          }
          
          table {
            border-collapse: collapse;
            width: 100%;
            margin: 15px 0;
            font-size: 10px;
            overflow: hidden;
            border-radius: 4px;
            box-shadow: var(--shadow-sm);
          }
          
          table, th, td {
            border: 1px solid var(--border-color);
          }
          
          th {
            background-color: var(--primary-bg);
            font-weight: 600;
            color: var(--primary-dark);
            text-align: left;
            padding: 8px;
            font-size: 10px;
          }
          
          td {
            padding: 8px;
            background-color: white;
            font-size: 10px;
          }
          
          tr:nth-child(even) td {
            background-color: #fafbff;
          }
          
          ul, ol {
            padding-left: 20px;
            margin: 10px 0;
          }
          
          li {
            margin-bottom: 5px;
            line-height: 1.5;
            font-size: 11px;
          }
          
          strong {
            font-weight: 600;
            color: var(--text-dark);
          }
          
          em {
            font-style: italic;
            color: var(--primary-color);
          }
          
          pre {
            background-color: #f8fafc;
            padding: 8px;
            border-radius: 4px;
            overflow-x: auto;
            font-size: 10px;
            font-family: 'Courier New', Courier, monospace;
            border: 1px solid var(--border-light);
            margin: 10px 0;
            white-space: pre-wrap;
          }
          
          code {
            font-family: 'Courier New', Courier, monospace;
            background-color: #f1f5f9;
            padding: 1px 3px;
            border-radius: 3px;
            font-size: 10px;
            color: var(--primary-dark);
          }
          
          blockquote {
            border-left: 3px solid var(--primary-color);
            padding: 8px 12px;
            margin: 10px 0;
            background-color: var(--primary-bg);
            border-radius: 0 4px 4px 0;
            color: var(--text-medium);
            font-style: italic;
            font-size: 11px;
          }
          
          hr {
            border: 0;
            border-top: 1px solid var(--border-light);
            margin: 15px 0;
          }
          
          .footer {
            margin-top: 30px;
            padding-top: 15px;
            border-top: 1px solid var(--border-color);
            text-align: center;
          }
          
          .footer-logo {
            display: flex;
            justify-content: center;
            margin-bottom: 10px;
          }
          
          .disclaimer {
            background-color: var(--border-light);
            padding: 10px;
            border-radius: 6px;
            font-size: 10px;
            color: var(--text-medium);
            margin: 15px 0;
          }
          
          a {
            color: var(--primary-color);
            text-decoration: none;
          }
          
          /* End of page notice */
          .end-page-notice {
            page-break-before: always;
            height: 100vh;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            text-align: center;
            padding: 20px;
          }
          
          .end-page-notice p {
            margin-bottom: 15px;
            font-size: 14px;
            color: var(--text-medium);
          }

          @media print {
            body {
              -webkit-print-color-adjust: exact !important;
              color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
            
            .page-break {
              page-break-after: always;
            }
            
            .header {
              position: running(header);
            }
            
            .footer {
              position: running(footer);
            }
            
            @page {
              size: A4;
              margin: 1.5cm 1cm;
              @top-center { content: element(header) }
              @bottom-center { content: element(footer) }
            }
            
            h1, h2, h3 {
              page-break-after: avoid;
            }
            
            table, img, pre {
              page-break-inside: avoid;
            }
          }
          
          /* Custom rounded tables */
          .rounded-table {
            border-collapse: separate;
            border-spacing: 0;
            border-radius: 8px;
            overflow: hidden;
          }
          
          .rounded-table th:first-child {
            border-top-left-radius: 8px;
          }
          
          .rounded-table th:last-child {
            border-top-right-radius: 8px;
          }
          
          .rounded-table tr:last-child td:first-child {
            border-bottom-left-radius: 8px;
          }
          
          .rounded-table tr:last-child td:last-child {
            border-bottom-right-radius: 8px;
          }
        </style>
      </head>
      <body>
        <div class="page-container">
          <div class="header">
            <div class="logo">
              <div class="logo-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M12 8V4H8"></path>
                  <rect width="16" height="12" x="4" y="8" rx="2"></rect>
                  <path d="M2 14h2"></path>
                  <path d="M20 14h2"></path>
                  <path d="M15 13v2"></path>
                  <path d="M9 13v2"></path>
                </svg>
                <div class="logo-badge">AI</div>
              </div>
              <div class="logo-text">Focus.AI</div>
            </div>
            <a href="https://focusai.netlify.app" target="_blank" class="visit-button">Visit Focus.AI</a>
          </div>
          
          <div class="report-info">
            <h1>${title}</h1>
            <div class="date">Generated on ${new Date().toLocaleDateString()} by Focus.AI</div>
          </div>
          
          <div class="content">
            ${botResponses.map((response, index) => `
              <div class="answer">
                ${response.content
                  .replace(/\n/g, '<br>')
                  .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                  .replace(/\*(.*?)\*/g, '<em>$1</em>')
                  .replace(/```([\s\S]*?)```/g, '<pre><code>$1</code></pre>')
                  .replace(/`([^`]+)`/g, '<code>$1</code>')
                  .replace(/<br>#/g, '<br><strong>#')
                  .replace(/<br>##/g, '<br><h2>')
                  .replace(/<br>###/g, '<br><h3>')
                  .replace(/<h2>(.*?)<br>/g, '$1</h2>')
                  .replace(/<h3>(.*?)<br>/g, '$1</h3>')
                  .replace(/<strong>#(.*?)<br>/g, '$1</strong><br>')
                  .replace(/<table>/g, '<table class="rounded-table">')
                }
              </div>
            `).join('')}
          </div>
          
          <div class="footer">
            <div class="footer-logo">
              <div class="logo">
                <div class="logo-icon" style="width: 24px; height: 24px;">
                  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M12 8V4H8"></path>
                    <rect width="16" height="12" x="4" y="8" rx="2"></rect>
                    <path d="M2 14h2"></path>
                    <path d="M20 14h2"></path>
                    <path d="M15 13v2"></path>
                    <path d="M9 13v2"></path>
                  </svg>
                  <div class="logo-badge" style="font-size: 6px; right: -3px; bottom: -3px; padding: 1px 2px;">AI</div>
                </div>
                <div class="logo-text" style="font-size: 14px;">Focus.AI</div>
              </div>
            </div>
            <p class="text-xs" style="font-size: 10px; color: #666;">
              This is AI-generated content. While we strive for accuracy, please verify any critical information.
            </p>
            <a href="https://focusai.netlify.app" target="_blank" style="font-size: 10px; color: #3b82f6; display: inline-block; margin-top: 5px;">
              Visit Focus.AI
            </a>
          </div>
        </div>
        
        <!-- End page notice that will always be on a new page -->
        <div class="end-page-notice">
          <div class="logo" style="margin-bottom: 20px;">
            <div class="logo-icon" style="width: 40px; height: 40px;">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M12 8V4H8"></path>
                <rect width="16" height="12" x="4" y="8" rx="2"></rect>
                <path d="M2 14h2"></path>
                <path d="M20 14h2"></path>
                <path d="M15 13v2"></path>
                <path d="M9 13v2"></path>
              </svg>
              <div class="logo-badge">AI</div>
            </div>
            <div class="logo-text" style="font-size: 24px;">Focus.AI</div>
          </div>
          
          <p style="font-size: 16px; max-width: 500px; margin: 0 auto 15px auto; line-height: 1.5;">
            Thank you for using Focus.AI for your optometry studies.
          </p>
          
          <p style="font-size: 14px; color: #666; max-width: 500px; margin: 0 auto 20px auto;">
            This AI-generated content is provided for educational purposes.
            Always consult with professional resources for clinical practice.
          </p>
          
          <a href="https://focusai.netlify.app" target="_blank" class="visit-button" style="font-size: 14px; padding: 8px 16px;">
            Visit Focus.AI for more resources
          </a>
        </div>
      </body>
      </html>
    `;

    // Create a temporary iframe to generate the PDF
    const iframe = document.createElement('iframe');
    iframe.style.display = 'none';
    document.body.appendChild(iframe);
    iframe.contentDocument?.open();
    iframe.contentDocument?.write(htmlContent);
    iframe.contentDocument?.close();

    // Give the browser time to process the HTML
    setTimeout(() => {
      try {
        // Print the iframe content to PDF
        iframe.contentWindow?.print();
        
        // Clean up the iframe
        setTimeout(() => {
          document.body.removeChild(iframe);
          setIsExporting(false);
          setShowPDFPreview(false);
          toast.success('PDF export initiated');
        }, 1000);
      } catch (error) {
        console.error('Error exporting PDF:', error);
        toast.error('Failed to export PDF');
        document.body.removeChild(iframe);
        setIsExporting(false);
        setShowPDFPreview(false);
      }
    }, 1000);
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
