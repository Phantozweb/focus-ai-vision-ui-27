
import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import ApiKeyModal from '@/components/ApiKeyModal';
import ChatHistory from '@/components/assistant/ChatHistory';
import ChatInput from '@/components/assistant/ChatInput';
import useAssistantChat from '@/hooks/useAssistantChat';

const Assistant = () => {
  const {
    question,
    setQuestion,
    chatHistory,
    isLoading,
    followUpLoading,
    showApiKeyModal,
    setShowApiKeyModal,
    handleSubmit,
    handleCopyConversation,
    generateSummary,
    downloadAsMarkdown,
    downloadAsPDF,
    addToNotes,
    handleMagicWandOption,
    handleSuggestionClick,
    refreshSuggestions,
    generatePracticeQuestions
  } = useAssistantChat();

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />
      
      <main className="flex-1 flex flex-col">
        <div className="container mx-auto px-4 py-6">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-xl text-blue-500 font-medium">Focus.AI Assistant</h1>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowApiKeyModal(true)}
              className="flex items-center gap-2"
            >
              AI Information
            </Button>
          </div>
          
          <div className="flex-1 flex flex-col bg-white rounded-xl overflow-hidden border border-gray-200 shadow-sm">
            <div className="flex-1 p-6 overflow-y-auto">
              <ChatHistory 
                chatHistory={chatHistory}
                isLoading={isLoading}
                followUpLoading={followUpLoading}
                generateSummary={generateSummary}
                generatePracticeQuestions={generatePracticeQuestions}
                addToNotes={addToNotes}
                handleMagicWandOption={handleMagicWandOption}
                handleCopyConversation={handleCopyConversation}
                downloadAsMarkdown={downloadAsMarkdown}
                downloadAsPDF={downloadAsPDF}
                refreshSuggestions={refreshSuggestions}
                handleSuggestionClick={handleSuggestionClick}
              />
            </div>
            
            <ChatInput 
              question={question}
              setQuestion={setQuestion}
              handleSubmit={handleSubmit}
              isLoading={isLoading}
            />
          </div>
        </div>
      </main>

      <Footer />
      
      {/* API Key Modal */}
      <ApiKeyModal isOpen={showApiKeyModal} onClose={() => setShowApiKeyModal(false)} />
    </div>
  );
};

export default Assistant;
