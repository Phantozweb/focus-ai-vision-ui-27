import { useState, useEffect } from 'react';
import { toast } from '@/components/ui/sonner';
import { generateGeminiResponse, generateFollowUpQuestions } from '@/utils/geminiApi';
import { config } from '@/config/api';

export interface ChatMessage {
  type: 'user' | 'bot';
  content: string;
  imageData?: string | null;
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
  const [savedCases, setSavedCases] = useState<SavedCase[]>([]);
  const [followUpLoading, setFollowUpLoading] = useState<boolean>(false);
  const [attachedImage, setAttachedImage] = useState<string | null>(null);
  const [thinkingPhase, setThinkingPhase] = useState<string>('');

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
    setChatHistory(prev => [...prev, { 
      type: 'user', 
      content: questionText,
      imageData: attachedImage 
    }]);
    
    // Show loading state
    setIsLoading(true);
    
    // Set appropriate thinking phase based on whether an image is attached
    if (attachedImage) {
      setThinkingPhase('Analyzing image...');
    } else {
      setThinkingPhase('Thinking...');
    }
    
    try {
      // Determine if we need to use the vision model based on image attachment
      const shouldUseVisionModel = !!attachedImage;
      
      // Create a focused prompt for the main question
      let prompt = `${assistantInstructions}\n\nUser Question: ${questionText}\n\n`;
      
      // Add special instructions for image analysis if needed
      if (shouldUseVisionModel && attachedImage) {
        prompt += `The user has attached an image. Please analyze this image thoroughly and provide detailed information about what you see, especially in relation to optometry. Focus on any relevant clinical findings, measurements, or diagnostic features visible in the image.\n\n`;
      }
      
      prompt += "Please provide a helpful response:";
      
      console.log("Sending prompt with image:", !!attachedImage);
      
      // Generate response using Gemini API with image if available
      const response = await generateGeminiResponse(prompt, attachedImage);
      
      console.log("Response received, length:", response.length);
      
      // Reset image after sending
      setAttachedImage(null);
      
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
      setTimeout(() => {
        generateSuggestions(questionText, response);
      }, 500);
      
      toast.success('Response generated');
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to get response from AI');
      
      // Add error message to chat history
      setChatHistory(prev => [
        ...prev, 
        { 
          type: 'bot', 
          content: 'Sorry, I encountered an error analyzing your question. Please try again.',
          suggestions: []
        }
      ]);
    } finally {
      setThinkingPhase('');
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
    if (!question.trim() && !attachedImage) return;
    
    handleQuestionSubmit(question);
    setQuestion('');
  };

  const handleImageAttachment = (imageData: string | null) => {
    setAttachedImage(imageData);
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
    const blob = new Blob([mdContent], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `focus-ai-${new Date().toISOString().slice(0, 10)}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast.success('Downloaded as Markdown');
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
        formatPrompt = `Rewrite the following optometry text in a student-friendly format with clear explanations, mnemonics if applicable, and organized points: "${content}"`;
        break;
      case 'Clinical Focus':
        formatPrompt = `Reformat the following optometry information with a clinical focus, emphasizing practical applications, diagnosis criteria, and treatment protocols: "${content}"`;
        break;
      case 'Add Tables':
        formatPrompt = `Restructure the following optometry information to include well-organized tables for better visual presentation. Use markdown table formatting: "${content}"`;
        break;
      case 'EMR Format':
        formatPrompt = `Convert the following optometry information into an Electronic Medical Record (EMR) style format with appropriate headers, bullet points, and clinical terminology: "${content}"`;
        break;
      default:
        formatPrompt = `Rewrite the following optometry information in a more organized format: "${content}"`;
    }
    
    generateGeminiResponse(formatPrompt)
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
    if (chatHistory[messageIndex].type !== 'bot' || messageIndex === 0) return;
    
    // Get the user's question and the bot's answer
    const userQuestion = chatHistory[messageIndex - 1].content;
    const botAnswer = chatHistory[messageIndex].content;
    
    // Generate new follow-up suggestions
    setFollowUpLoading(true);
    generateFollowUpQuestions(userQuestion, botAnswer)
      .then(newSuggestions => {
        const updatedHistory = [...chatHistory];
        updatedHistory[messageIndex] = {
          ...updatedHistory[messageIndex],
          suggestions: newSuggestions
        };
        setChatHistory(updatedHistory);
        toast.success('Generated new suggestions');
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
    // Don't automatically submit to give user chance to edit
    setTimeout(() => {
      document.querySelector('input')?.focus();
    }, 100);
  };

  const generatePracticeQuestions = (messageIndex: number) => {
    if (chatHistory[messageIndex].type !== 'bot') return;
    
    const content = chatHistory[messageIndex].content;
    const prompt = `Based on this optometry information: "${content}", generate 3 practice quiz questions with multiple-choice answers and explanations.`;
    
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
        console.error('Error generating questions:', error);
        toast.error('Failed to generate practice questions');
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  const addToNotes = (messageIndex: number) => {
    if (chatHistory[messageIndex].type !== 'bot') return;
    
    const noteContent = chatHistory[messageIndex].content;
    
    // Get existing notes from localStorage or initialize empty array
    const existingNotes = JSON.parse(localStorage.getItem('studyNotes') || '[]');
    
    // Add new note
    const newNote = {
      id: Date.now().toString(),
      title: `Note from AI Chat - ${new Date().toLocaleDateString()}`,
      content: noteContent,
      createdAt: Date.now(),
    };
    
    // Save updated notes
    localStorage.setItem('studyNotes', JSON.stringify([...existingNotes, newNote]));
    
    toast.success('Added to Study Notes');
  };

  return {
    question,
    setQuestion,
    chatHistory,
    isLoading,
    isFormatLoading,
    formatOption,
    followUpLoading,
    attachedImage,
    thinkingPhase,
    handleSubmit,
    handleSaveCase,
    handleCopyConversation,
    generateSummary,
    downloadAsMarkdown,
    handleMagicWandOption,
    refreshSuggestions,
    handleSuggestionClick,
    generatePracticeQuestions,
    addToNotes,
    handleImageAttachment
  };
}
