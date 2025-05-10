
import React, { useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import IndianOptometryCurriculum from '@/components/IndianOptometryCurriculum';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { generateGeminiResponse } from '@/utils/geminiApi';
import CaseMarkdown from '@/components/CaseMarkdown';
import { RefreshCw, BookOpen } from 'lucide-react';

interface Note {
  id: string;
  title: string;
  content: string;
  createdAt: number;
  subject?: string;
}

const IndianCurriculum = () => {
  const [currentNote, setCurrentNote] = useState<Note | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleTopicSelect = async (selectedTopic: string, selectedSubject: string) => {
    setIsGenerating(true);
    try {
      const prompt = `
        Create comprehensive study notes on "${selectedTopic}" within the field of "${selectedSubject}" in optometry.
        
        Format the content with the following structure:
        1. Begin with a clear, concise introduction to the topic
        2. Include key definitions, concepts, and terminology
        3. Explain relevant anatomy or physiological mechanisms where appropriate
        4. Include clinical relevance and applications
        5. Discuss diagnostic procedures or assessments if applicable
        6. Mention treatment options or management strategies where relevant
        7. Include visual illustrations described in text when helpful
        8. Summarize with 3-4 key takeaway points
        
        Format using markdown with proper headings, bullet points, numbered lists, and tables where appropriate.
        Keep content accurate, evidence-based, and at a professional optometry student level.
      `;
      
      const content = await generateGeminiResponse(prompt);
      
      const newNote = {
        id: Date.now().toString(),
        title: selectedTopic,
        content,
        createdAt: Date.now(),
        subject: selectedSubject
      };
      
      setCurrentNote(newNote);
      
      // Save note to local storage
      const savedNotes = localStorage.getItem('studyNotes');
      const notes = savedNotes ? JSON.parse(savedNotes) : [];
      const updatedNotes = [...notes, newNote];
      localStorage.setItem('studyNotes', JSON.stringify(updatedNotes));
      
      toast.success('Study notes generated successfully!');
    } catch (error) {
      console.error('Error generating study notes:', error);
      toast.error('Failed to generate study notes. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <Header />
      
      <div className="flex-1 container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-2">
            <BookOpen className="h-7 w-7 text-sky-500" />
            <h1 className="text-3xl font-bold text-sky-800">Indian Optometry Curriculum</h1>
          </div>
          <p className="text-gray-600">Standardized one-nation one-syllabus for BSc Optometry</p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left side - Curriculum browser */}
          <div className="lg:col-span-5">
            <div className="bg-white rounded-lg border border-sky-200 p-6 shadow-sm">
              <h2 className="text-xl font-bold text-sky-800 mb-4">Browse Curriculum</h2>
              <p className="text-gray-600 mb-6">
                Explore the standardized 5-year BSc Optometry curriculum. Select any topic to generate
                comprehensive study notes.
              </p>

              <IndianOptometryCurriculum 
                onTopicSelect={handleTopicSelect} 
              />
            </div>
          </div>
          
          {/* Right side - Content display */}
          <div className="lg:col-span-7">
            <div className="bg-white rounded-lg border border-sky-200 overflow-hidden shadow-sm">
              {currentNote ? (
                <div className="flex flex-col h-full">
                  <div className="border-b border-sky-200 p-4 bg-sky-50">
                    <div className="flex justify-between items-center">
                      <h2 className="text-xl font-semibold text-sky-800">{currentNote.title}</h2>
                      <div className="text-sm text-gray-500">
                        {currentNote.subject} • {new Date(currentNote.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  <div className="p-4 overflow-y-auto h-[600px]">
                    <CaseMarkdown content={currentNote.content} />
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center p-12 text-center h-[600px] bg-sky-50">
                  <div className="mb-4">
                    <BookOpen className="h-16 w-16 text-sky-300" />
                  </div>
                  <h3 className="text-xl font-semibold text-sky-800 mb-2">No Topic Selected</h3>
                  <p className="text-gray-600 mb-6">Browse the curriculum on the left and select a topic to generate study notes.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default IndianCurriculum;
