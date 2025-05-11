
import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ChatHistory from '@/components/assistant/ChatHistory';
import ChatInput from '@/components/assistant/ChatInput';
import ThinkingIndicator from '@/components/assistant/ThinkingIndicator';
import { useAssistantChat } from '@/hooks/useAssistantChat';
import ExportLoadingIndicator from '@/components/assistant/ExportLoadingIndicator';

const Assistant = () => {
  const assistantInstructions = `
    You are Focus.AI, a specialized AI assistant for optometry students. Your responses should be:
    
    1. Accurate and evidence-based, using current optometric knowledge
    2. Educational, explaining concepts clearly with clinical relevance
    3. Organized with clear sections, bullet points, and tables where appropriate
    4. Student-focused, helping with exam preparation and clinical understanding
    5. Ethical, noting when certain questions require professional judgment
    
    You can answer questions about eye anatomy, disease pathology, diagnosis techniques, treatment options, 
    optical principles, contact lenses, and other topics relevant to optometry students.

    Always format your responses using markdown for readability. Include tables when comparing conditions or treatments,
    and use bullet points for lists of symptoms or procedures.
    
    If the user uploads an image, carefully analyze the image and provide detailed explanations about what you see,
    including any relevant clinical findings, measurements, anomalies, or diagnostic features. If the image shows 
    eye conditions, provide detailed assessment of the visible symptoms, potential diagnoses, and relevant treatment
    approaches when appropriate.
    
    Provide comprehensive answers. Don't cut your responses short. If explaining a complex topic, make sure to cover
    all relevant aspects thoroughly. Be concise with general information but detailed with specific technical content
    that would be valuable for optometry students.
  `;
  
  const {
    question,
    setQuestion,
    chatHistory,
    isLoading,
    isFormatLoading,
    formatOption,
    followUpLoading,
    thinkingPhase,
    handleSubmit,
    handleCopyConversation,
    downloadAsMarkdown,
    generateSummary,
    handleMagicWandOption,
    refreshSuggestions,
    handleSuggestionClick,
    generatePracticeQuestions,
    addToNotes,
    handleImageAttachment
  } = useAssistantChat(assistantInstructions);

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-6">
        <div className="border border-gray-200 rounded-lg shadow-sm overflow-hidden flex flex-col h-[calc(100vh-200px)]">
          <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-gradient-to-r from-blue-50 to-white">
            <h1 className="text-xl font-bold text-gray-800">AI Assistant</h1>
            <span className="text-sm text-gray-500">Optometry Learning Assistant</span>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 bg-white" id="exportContainer">
            <ChatHistory 
              chatHistory={chatHistory}
              isLoading={false} // We don't use this loading state anymore
              followUpLoading={followUpLoading}
              generateSummary={generateSummary}
              generatePracticeQuestions={generatePracticeQuestions}
              addToNotes={addToNotes}
              handleMagicWandOption={handleMagicWandOption}
              handleCopyConversation={handleCopyConversation}
              downloadAsMarkdown={downloadAsMarkdown}
              refreshSuggestions={refreshSuggestions}
              handleSuggestionClick={handleSuggestionClick}
            />
            
            {isLoading && <ThinkingIndicator phase={thinkingPhase} />}
          </div>
          
          <ChatInput 
            question={question} 
            setQuestion={setQuestion} 
            handleSubmit={handleSubmit} 
            isLoading={isLoading}
            onImageAttach={handleImageAttachment}
          />
        </div>
      </main>
      
      <Footer />
      
      {isFormatLoading && (
        <ExportLoadingIndicator type="formatting" option={formatOption} />
      )}
    </div>
  );
};

export default Assistant;
