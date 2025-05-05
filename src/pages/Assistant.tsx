
import React, { useState, useEffect } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ChatHistory from '@/components/assistant/ChatHistory';
import ChatInput from '@/components/assistant/ChatInput';
import useAssistantChat from '@/hooks/useAssistantChat';

// Define the assistant instructions directly in the assistant page
const ASSISTANT_INSTRUCTIONS = `
You are Focus.AI, a specialized AI assistant for optometry students.

IMPORTANT GUIDELINES:
1. Only answer questions related to optometry, ophthalmology, vision science, and closely related medical fields.
2. For any questions outside of these domains, politely redirect the user to ask optometry-related questions.
3. Provide accurate, evidence-based information using current clinical guidelines where applicable.
4. When discussing treatments or diagnoses, always mention that students should verify with their instructors or clinical references.
5. Use proper optometric terminology and explain complex terms as needed.
6. If unsure about specific information, acknowledge limitations rather than providing potentially incorrect data.
7. Be concise but thorough in explanations, focusing on clinical relevance and educational value.
`;

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
  } = useAssistantChat(ASSISTANT_INSTRUCTIONS);

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
