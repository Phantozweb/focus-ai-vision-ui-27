
import React, { useRef, useEffect } from 'react';
import ChatMessageComponent from './ChatMessage';
import EmptyChatState from './EmptyChatState';
import LoadingIndicator from './LoadingIndicator';

export interface ChatMessage {
  type: 'user' | 'bot';
  content: string;
  imageData?: string | null;
  suggestions?: string[];
}

interface ChatHistoryProps {
  chatHistory: ChatMessage[];
  isLoading: boolean;
  followUpLoading: boolean;
  generateSummary: (index: number) => void;
  generatePracticeQuestions: (index: number) => void;
  addToNotes: (index: number) => void;
  handleMagicWandOption: (index: number, option: string) => void;
  handleCopyConversation: () => void;
  downloadAsMarkdown: () => void;
  refreshSuggestions: (index: number) => void;
  handleSuggestionClick: (suggestion: string) => void;
}

const ChatHistory: React.FC<ChatHistoryProps> = ({
  chatHistory,
  isLoading,
  followUpLoading,
  generateSummary,
  generatePracticeQuestions,
  addToNotes,
  handleMagicWandOption,
  handleCopyConversation,
  downloadAsMarkdown,
  refreshSuggestions,
  handleSuggestionClick
}) => {
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Scroll to bottom of chat when new messages are added
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatHistory]);

  if (chatHistory.length === 0) {
    return <EmptyChatState />;
  }

  return (
    <div className="space-y-8 px-1 pb-4"> {/* Added bottom padding for better spacing */}
      {chatHistory.map((item, i) => (
        <ChatMessageComponent
          key={i}
          type={item.type}
          content={item.content}
          imageData={item.imageData}
          index={i}
          suggestions={item.suggestions}
          onMagicWandOption={handleMagicWandOption}
          onSuggestionClick={handleSuggestionClick}
          onRefreshSuggestions={refreshSuggestions}
          generateSummary={generateSummary}
          generatePracticeQuestions={generatePracticeQuestions}
          addToNotes={addToNotes}
        />
      ))}
      <LoadingIndicator isVisible={isLoading} />
      <div ref={chatEndRef} />
    </div>
  );
};

export default ChatHistory;
