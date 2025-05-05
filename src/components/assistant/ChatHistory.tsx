
import React, { useRef, useEffect } from 'react';
import ChatMessageComponent, { ChatMessage } from './ChatMessage';
import EmptyChatState from './EmptyChatState';
import LoadingIndicator from './LoadingIndicator';

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
  downloadAsPDF: () => void;
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
  downloadAsPDF,
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
    <div className="space-y-8 px-1"> {/* Increased vertical spacing and reduced horizontal padding */}
      {chatHistory.map((item, i) => (
        <ChatMessageComponent
          key={i}
          message={item}
          index={i}
          generateSummary={generateSummary}
          generatePracticeQuestions={generatePracticeQuestions}
          addToNotes={addToNotes}
          handleMagicWandOption={handleMagicWandOption}
          handleCopyConversation={handleCopyConversation}
          downloadAsMarkdown={downloadAsMarkdown}
          downloadAsPDF={downloadAsPDF}
          refreshSuggestions={refreshSuggestions}
          handleSuggestionClick={handleSuggestionClick}
          followUpLoading={followUpLoading}
        />
      ))}
      <LoadingIndicator isVisible={isLoading} />
      <div ref={chatEndRef} />
    </div>
  );
};

export default ChatHistory;
