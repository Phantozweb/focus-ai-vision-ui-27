
import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
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
    handleSubmit,
    generateSummary,
    generatePracticeQuestions,
    addToNotes,
    handleMagicWandOption,
    handleCopyConversation,
    downloadAsMarkdown,
    downloadAsPDF,
    refreshSuggestions,
    handleSuggestionClick
  } = useAssistantChat();

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1">
        <div className="container mx-auto px-4 py-6">
          <h1 className="text-xl text-gray-800 font-medium mb-6">AI Assistant</h1>
          
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden mb-6">
            <div className="p-4 flex-1 overflow-auto">
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
    </div>
  );
};

export default Assistant;
