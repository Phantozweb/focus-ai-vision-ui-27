
import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import useAssistantChat from '@/hooks/useAssistantChat';
import ChatHistory from '@/components/assistant/ChatHistory';
import ChatInput from '@/components/assistant/ChatInput';
import ExportLoadingIndicator from '@/components/assistant/ExportLoadingIndicator';
import PDFExportPreview from '@/components/assistant/PDFExportPreview';

const Assistant = () => {
  const assistantInstructions = `
    You are a knowledgeable AI assistant for optometry students. 
    You help answer questions about optometry concepts, eye conditions, clinical procedures, and patient care.
    Provide detailed and accurate information with references where relevant.
    Format your responses with clear headings, lists, and tables when appropriate to enhance readability.
    If asked about specific medical cases, provide educational information but remind that this cannot replace professional medical advice.
  `;

  const {
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
    generateSummary,
    generatePracticeQuestions,
    addToNotes,
    handleMagicWandOption,
    handleCopyConversation,
    downloadAsMarkdown,
    downloadAsPDF,
    executePDFExport,
    refreshSuggestions,
    handleSuggestionClick
  } = useAssistantChat(assistantInstructions);

  const getConversationTitle = () => {
    const firstUserQuestion = chatHistory.find(msg => msg.type === 'user')?.content;
    return firstUserQuestion ? 
      (firstUserQuestion.length > 30 ? firstUserQuestion.substring(0, 30) + '...' : firstUserQuestion) 
      : 'AI Assistant Conversation';
  };

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <Header />
      
      <main className="flex-1 flex flex-col">
        <div className="container max-w-4xl mx-auto flex-1 flex flex-col mb-8">
          <div className="py-6">
            <h1 className="text-2xl text-gray-800 font-bold mb-1">AI Assistant</h1>
            <p className="text-gray-500">Ask questions about optometry concepts and get detailed answers</p>
          </div>
          
          <div className="flex-1 flex flex-col bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
            <div className="flex-1 overflow-y-auto px-4 py-8">
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
      
      {/* Loading indicators */}
      {isFormatLoading && <ExportLoadingIndicator type="formatting" option={formatOption} />}
      {isExporting && <ExportLoadingIndicator type="exporting" />}
      
      {/* PDF Export Preview */}
      {showPDFPreview && (
        <PDFExportPreview
          chatHistory={chatHistory}
          title={getConversationTitle()}
          onClose={() => setShowPDFPreview(false)}
          onExport={executePDFExport}
        />
      )}
      
      <Footer />
    </div>
  );
};

export default Assistant;
