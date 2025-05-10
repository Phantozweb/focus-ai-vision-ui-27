
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import CaseMarkdown from '@/components/CaseMarkdown';
import { generateGeminiResponse } from '@/utils/geminiApi';
import { toast } from 'sonner';
import { Save, RefreshCw, BookOpen } from 'lucide-react';
import IndianOptometryCurriculum from '@/components/IndianOptometryCurriculum';

interface Note {
  id: string;
  title: string;
  content: string;
  createdAt: number;
  subject?: string;
}

const StudyNotes = () => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [currentNote, setCurrentNote] = useState<Note | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [topic, setTopic] = useState('');
  const [subject, setSubject] = useState('');
  const [activeTab, setActiveTab] = useState<'custom' | 'curriculum'>('custom');

  const optometrySubjects = [
    'Anatomy and Physiology',
    'Optics',
    'Clinical Procedures',
    'Clinical Management',
    'Ocular Disease',
    'Contact Lenses',
    'Low Vision',
    'Pediatric Optometry',
    'Vision Therapy',
    'Pharmacology'
  ];

  useEffect(() => {
    // Load saved notes from localStorage
    const savedNotes = localStorage.getItem('studyNotes');
    if (savedNotes) {
      setNotes(JSON.parse(savedNotes));
    }
  }, []);

  const handleGenerateContent = async () => {
    if (!topic || !subject) {
      toast.error('Please enter a topic and select a subject');
      return;
    }
    
    setIsGenerating(true);
    try {
      const prompt = `
        Create comprehensive study notes on "${topic}" within the field of "${subject}" in optometry.
        
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
        title: topic,
        content,
        createdAt: Date.now(),
        subject
      };
      
      setCurrentNote(newNote);
      
      // Save the new note
      const updatedNotes = [...notes, newNote];
      setNotes(updatedNotes);
      localStorage.setItem('studyNotes', JSON.stringify(updatedNotes));
      
      toast.success('Study notes generated successfully!');
    } catch (error) {
      console.error('Error generating study notes:', error);
      toast.error('Failed to generate study notes. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSelectNote = (note: Note) => {
    setCurrentNote(note);
  };

  const handleDeleteNote = (id: string) => {
    const updatedNotes = notes.filter(note => note.id !== id);
    setNotes(updatedNotes);
    localStorage.setItem('studyNotes', JSON.stringify(updatedNotes));
    
    if (currentNote && currentNote.id === id) {
      setCurrentNote(null);
    }
    
    toast.success('Note deleted successfully');
  };

  const handleTopicSelect = (selectedTopic: string, selectedSubject: string) => {
    setTopic(selectedTopic);
    setSubject(selectedSubject);
    setActiveTab('custom');
    handleGenerateContent();
  };

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <Header />
      
      <div className="flex-1 container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-sky-800 mb-2">Study Notes</h1>
          <p className="text-gray-600">Create and review your optometry study materials</p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left sidebar - Notes list */}
          <div className="lg:col-span-3">
            <div className="p-4 bg-sky-50 rounded-lg border border-sky-200 mb-4 shadow-sm">
              <h2 className="text-lg font-semibold text-sky-800 mb-3">Your Notes</h2>
              
              {notes.length === 0 ? (
                <p className="text-gray-500 text-sm">No saved notes yet. Generate your first note!</p>
              ) : (
                <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
                  {notes.map(note => (
                    <div 
                      key={note.id}
                      className={`p-3 rounded-md cursor-pointer border ${
                        currentNote?.id === note.id 
                          ? 'bg-sky-100 border-sky-300 shadow-sm' 
                          : 'bg-white border-gray-200 hover:bg-gray-50'
                      }`}
                      onClick={() => handleSelectNote(note)}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-medium text-gray-800 truncate">{note.title}</h3>
                          <p className="text-xs text-gray-500">
                            {note.subject} • {new Date(note.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 text-gray-500 hover:text-red-500 hover:bg-red-50"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteNote(note.id);
                          }}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          
          {/* Main content area */}
          <div className="lg:col-span-9">
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
                <div className="p-6">
                  <div className="flex space-x-4 mb-6">
                    <Button 
                      variant={activeTab === 'custom' ? 'default' : 'outline'} 
                      onClick={() => setActiveTab('custom')}
                      className={activeTab === 'custom' ? 'bg-sky-600 hover:bg-sky-700 text-white' : 'border-sky-300 text-sky-700 hover:bg-sky-50'}
                    >
                      Custom Topic
                    </Button>
                    <Button 
                      variant={activeTab === 'curriculum' ? 'default' : 'outline'} 
                      onClick={() => setActiveTab('curriculum')}
                      className={activeTab === 'curriculum' ? 'bg-sky-600 hover:bg-sky-700 text-white' : 'border-sky-300 text-sky-700 hover:bg-sky-50'}
                    >
                      Indian Optometry Curriculum
                    </Button>
                  </div>

                  {activeTab === 'custom' ? (
                    <div className="bg-sky-50 rounded-lg border border-sky-200 p-6">
                      <h2 className="text-xl font-bold text-sky-800 mb-4">Generate New Study Notes</h2>
                      
                      <div className="space-y-4">
                        <div>
                          <label htmlFor="topic" className="block text-gray-700 font-medium mb-1">Topic</label>
                          <Input
                            id="topic"
                            placeholder="Enter a specific topic (e.g., Glaucoma Assessment)"
                            value={topic}
                            onChange={(e) => setTopic(e.target.value)}
                            className="bg-white border-sky-300 focus:border-sky-500"
                          />
                        </div>
                        
                        <div>
                          <label htmlFor="subject" className="block text-gray-700 font-medium mb-1">Subject Area</label>
                          <Select value={subject} onValueChange={setSubject}>
                            <SelectTrigger className="bg-white border-sky-300 focus:border-sky-500">
                              <SelectValue placeholder="Select subject area" />
                            </SelectTrigger>
                            <SelectContent className="bg-white">
                              {optometrySubjects.map((subj) => (
                                <SelectItem key={subj} value={subj}>
                                  {subj}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <Button
                          onClick={handleGenerateContent}
                          disabled={isGenerating}
                          className="w-full bg-sky-600 hover:bg-sky-700 text-white"
                        >
                          {isGenerating ? (
                            <>
                              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                              Generating...
                            </>
                          ) : (
                            <>
                              <BookOpen className="mr-2 h-4 w-4" />
                              Generate Study Notes
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <IndianOptometryCurriculum onTopicSelect={handleTopicSelect} />
                  )}
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

export default StudyNotes;
