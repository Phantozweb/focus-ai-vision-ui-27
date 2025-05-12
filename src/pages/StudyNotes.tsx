
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import CaseMarkdown from '@/components/CaseMarkdown';
import { generateGeminiResponse } from '@/utils/geminiApi';
import { toast } from 'sonner';
import { 
  Save, RefreshCw, BookOpen, FileText, Search, Tag, Pencil, 
  WandSparkles, X, Check, Plus, FileEdit
} from 'lucide-react';
import MagicWandMenu from '@/components/MagicWandMenu';

interface Note {
  id: string;
  title: string;
  content: string;
  createdAt: number;
  tags: string[];
  subject?: string;
  lastEditedAt?: number;
}

const StudyNotes = () => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [currentNote, setCurrentNote] = useState<Note | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editableContent, setEditableContent] = useState('');
  const [topic, setTopic] = useState('');
  const [subject, setSubject] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const [newTag, setNewTag] = useState('');
  const [isAiEditing, setIsAiEditing] = useState(false);
  const [aiEditPrompt, setAiEditPrompt] = useState('');
  
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

  // Get all unique tags across notes
  const allTags = Array.from(new Set(notes.flatMap(note => note.tags || [])));

  useEffect(() => {
    // Load saved notes from localStorage
    const savedNotes = localStorage.getItem('studyNotes');
    if (savedNotes) {
      try {
        const parsedNotes = JSON.parse(savedNotes);
        // Add tags array if not present in older notes
        const updatedNotes = parsedNotes.map((note: any) => ({
          ...note,
          tags: note.tags || []
        }));
        setNotes(updatedNotes);
      } catch (error) {
        console.error('Error parsing saved notes', error);
      }
    }
  }, []);
  
  // Filter notes based on search query and active tag
  const filteredNotes = notes.filter(note => {
    const matchesSearch = searchQuery === '' || 
      note.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
      note.content.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesTag = activeTag === null || note.tags.includes(activeTag);
    
    return matchesSearch && matchesTag;
  });

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
        subject,
        tags: [subject]
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
    setIsEditing(false);
    setIsAiEditing(false);
  };

  const handleDeleteNote = (id: string) => {
    const updatedNotes = notes.filter(note => note.id !== id);
    setNotes(updatedNotes);
    localStorage.setItem('studyNotes', JSON.stringify(updatedNotes));
    
    if (currentNote && currentNote.id === id) {
      setCurrentNote(null);
      setIsEditing(false);
      setIsAiEditing(false);
    }
    
    toast.success('Note deleted successfully');
  };

  const handleEditNote = () => {
    if (!currentNote) return;
    
    setEditableContent(currentNote.content);
    setIsEditing(true);
    setIsAiEditing(false);
  };

  const handleSaveEdit = () => {
    if (!currentNote) return;
    
    const updatedNote = {
      ...currentNote,
      content: editableContent,
      lastEditedAt: Date.now()
    };
    
    const updatedNotes = notes.map(note => 
      note.id === currentNote.id ? updatedNote : note
    );
    
    setNotes(updatedNotes);
    setCurrentNote(updatedNote);
    setIsEditing(false);
    
    localStorage.setItem('studyNotes', JSON.stringify(updatedNotes));
    toast.success('Note updated successfully');
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditableContent('');
  };

  const handleAiEdit = () => {
    if (!currentNote) return;
    setIsAiEditing(true);
    setIsEditing(false);
  };

  const handleExecuteAiEdit = async () => {
    if (!currentNote || !aiEditPrompt) {
      toast.error('Please enter an AI editing instruction');
      return;
    }
    
    setIsGenerating(true);
    try {
      const prompt = `
        I have study notes on "${currentNote.title}" for the subject "${currentNote.subject}" in optometry.
        
        Original content:
        ${currentNote.content}
        
        Please ${aiEditPrompt}. 
        Maintain the markdown formatting with proper headings, bullet points, numbered lists, and tables.
        Keep academic integrity and optometry professional standards. Return the entire edited content.
      `;
      
      const editedContent = await generateGeminiResponse(prompt);
      
      const updatedNote = {
        ...currentNote,
        content: editedContent,
        lastEditedAt: Date.now()
      };
      
      const updatedNotes = notes.map(note => 
        note.id === currentNote.id ? updatedNote : note
      );
      
      setNotes(updatedNotes);
      setCurrentNote(updatedNote);
      setIsAiEditing(false);
      setAiEditPrompt('');
      
      localStorage.setItem('studyNotes', JSON.stringify(updatedNotes));
      toast.success('Note updated with AI successfully!');
    } catch (error) {
      console.error('Error updating notes with AI:', error);
      toast.error('Failed to update notes. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleAddTag = () => {
    if (!currentNote || !newTag.trim()) return;
    
    if (currentNote.tags.includes(newTag.trim())) {
      toast.error('Tag already exists');
      return;
    }
    
    const updatedNote = {
      ...currentNote,
      tags: [...currentNote.tags, newTag.trim()]
    };
    
    const updatedNotes = notes.map(note => 
      note.id === currentNote.id ? updatedNote : note
    );
    
    setNotes(updatedNotes);
    setCurrentNote(updatedNote);
    setNewTag('');
    
    localStorage.setItem('studyNotes', JSON.stringify(updatedNotes));
  };

  const handleRemoveTag = (tagToRemove: string) => {
    if (!currentNote) return;
    
    const updatedNote = {
      ...currentNote,
      tags: currentNote.tags.filter(tag => tag !== tagToRemove)
    };
    
    const updatedNotes = notes.map(note => 
      note.id === currentNote.id ? updatedNote : note
    );
    
    setNotes(updatedNotes);
    setCurrentNote(updatedNote);
    
    localStorage.setItem('studyNotes', JSON.stringify(updatedNotes));
  };

  const handleMagicWandOption = async (option: string) => {
    if (!currentNote) return;
    
    setIsGenerating(true);
    try {
      const prompt = `
        I have study notes on "${currentNote.title}" for the subject "${currentNote.subject}" in optometry.
        
        Original content:
        ${currentNote.content}
        
        Please apply the "${option}" transformation to these notes. 
        ${option === 'Simplify' ? 'Make the content simpler and easier to understand while maintaining accuracy.' : ''}
        ${option === 'Add Details' ? 'Add more detailed information and examples to enrich the content.' : ''}
        ${option === 'Student Friendly' ? 'Reformat the content to be more digestible for students, adding mnemonics or memory aids where appropriate.' : ''}
        ${option === 'Clinical Focus' ? 'Emphasize clinical applications and practical use cases of the knowledge.' : ''}
        ${option === 'Add Tables' ? 'Organize appropriate information into tables for better visualization.' : ''}
        ${option === 'Summarize' ? 'Create a concise summary of the most important points.' : ''}
        ${option === 'Practice Questions' ? 'Add 5-7 practice questions with answers at the end of the notes.' : ''}
        ${option === 'Save to Notes' ? 'No changes needed, this will be handled separately.' : ''}
        
        Maintain the markdown formatting with proper headings, bullet points, numbered lists, and tables.
        Return the entire edited content.
      `;
      
      if (option === 'Save to Notes') {
        // This option was handled elsewhere, just show a toast
        toast.success('Note already saved in your collection');
        setIsGenerating(false);
        return;
      }
      
      const editedContent = await generateGeminiResponse(prompt);
      
      const updatedNote = {
        ...currentNote,
        content: editedContent,
        lastEditedAt: Date.now()
      };
      
      const updatedNotes = notes.map(note => 
        note.id === currentNote.id ? updatedNote : note
      );
      
      setNotes(updatedNotes);
      setCurrentNote(updatedNote);
      
      localStorage.setItem('studyNotes', JSON.stringify(updatedNotes));
      toast.success(`Applied "${option}" to your note!`);
    } catch (error) {
      console.error('Error applying transformation:', error);
      toast.error('Failed to transform notes. Please try again.');
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
            <FileText className="h-7 w-7 text-purple-500" />
            <h1 className="text-3xl font-bold text-purple-800">Study Notes</h1>
          </div>
        </div>
        
        <Tabs defaultValue="notes" className="w-full">
          <TabsList className="grid w-full md:w-[400px] mx-auto grid-cols-2 mb-8">
            <TabsTrigger value="notes">My Notes</TabsTrigger>
            <TabsTrigger value="generate">Generate New</TabsTrigger>
          </TabsList>
          
          <TabsContent value="notes" className="mt-0">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left sidebar - Notes list & filters */}
              <div className="lg:col-span-3">
                <div className="mb-4 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search notes..."
                    className="pl-10"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>

                <div className="mb-4">
                  <h3 className="text-sm font-medium text-gray-500 mb-2 flex items-center">
                    <Tag className="h-4 w-4 mr-1" /> Tags
                  </h3>
                  <div className="flex flex-wrap gap-2 mb-2">
                    <Badge
                      variant={activeTag === null ? "default" : "outline"}
                      className="cursor-pointer"
                      onClick={() => setActiveTag(null)}
                    >
                      All
                    </Badge>
                    {allTags.map(tag => (
                      <Badge
                        key={tag}
                        variant={activeTag === tag ? "default" : "outline"}
                        className="cursor-pointer"
                        onClick={() => setActiveTag(tag)}
                      >
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
                
                <div className="bg-purple-50 rounded-lg border border-purple-200 mb-4 shadow-sm">
                  <h2 className="text-lg font-semibold text-purple-800 p-3 border-b border-purple-200">Your Notes</h2>
                  
                  {filteredNotes.length === 0 ? (
                    <div className="p-4 text-center text-gray-500 text-sm">
                      {notes.length === 0 ? 
                        "No saved notes yet. Generate your first note!" :
                        "No notes match your search criteria."}
                    </div>
                  ) : (
                    <div className="space-y-1 max-h-[500px] overflow-y-auto p-2">
                      {filteredNotes.map(note => (
                        <div 
                          key={note.id}
                          className={`p-3 rounded-md cursor-pointer border ${
                            currentNote?.id === note.id 
                              ? 'bg-purple-100 border-purple-300 shadow-sm' 
                              : 'bg-white border-gray-200 hover:bg-gray-50'
                          }`}
                          onClick={() => handleSelectNote(note)}
                        >
                          <div className="flex justify-between items-start">
                            <div className="overflow-hidden">
                              <h3 className="font-medium text-gray-800 text-sm truncate">{note.title}</h3>
                              <p className="text-xs text-gray-500">
                                {note.subject} • {new Date(note.createdAt).toLocaleDateString()}
                              </p>
                              {note.tags.length > 0 && (
                                <div className="flex flex-wrap gap-1 mt-1">
                                  {note.tags.slice(0, 2).map(tag => (
                                    <span key={tag} className="bg-purple-100 text-purple-800 text-[10px] px-1.5 py-0.5 rounded">
                                      {tag}
                                    </span>
                                  ))}
                                  {note.tags.length > 2 && (
                                    <span className="bg-gray-100 text-gray-800 text-[10px] px-1.5 py-0.5 rounded">
                                      +{note.tags.length - 2}
                                    </span>
                                  )}
                                </div>
                              )}
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
                              <X className="h-4 w-4" />
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
                <div className="bg-white rounded-lg border border-purple-200 shadow-sm h-full">
                  {currentNote ? (
                    <div className="flex flex-col h-full">
                      <div className="border-b border-purple-200 p-4 bg-purple-50">
                        <div className="flex flex-wrap justify-between items-center gap-2">
                          <div>
                            <h2 className="text-xl font-semibold text-purple-800">{currentNote.title}</h2>
                            <div className="text-sm text-gray-500">
                              {currentNote.subject} • Created: {new Date(currentNote.createdAt).toLocaleDateString()}
                              {currentNote.lastEditedAt && ` • Edited: ${new Date(currentNote.lastEditedAt).toLocaleDateString()}`}
                            </div>
                          </div>
                          <div className="flex gap-2">
                            {!isEditing && !isAiEditing && (
                              <>
                                <Button
                                  onClick={handleEditNote}
                                  size="sm"
                                  variant="outline"
                                  className="gap-1"
                                >
                                  <Pencil className="h-4 w-4" /> Edit
                                </Button>
                                <Button
                                  onClick={handleAiEdit}
                                  size="sm"
                                  variant="outline"
                                  className="gap-1"
                                >
                                  <WandSparkles className="h-4 w-4" /> AI Edit
                                </Button>
                                <MagicWandMenu onOptionSelect={handleMagicWandOption} />
                              </>
                            )}
                          </div>
                        </div>
                        
                        {/* Tags section */}
                        <div className="mt-3 flex flex-wrap items-center gap-2">
                          <span className="text-xs text-gray-500">Tags:</span>
                          {currentNote.tags.map(tag => (
                            <Badge 
                              key={tag}
                              variant="secondary"
                              className="flex items-center gap-1 bg-purple-100 text-purple-800 hover:bg-purple-200"
                            >
                              {tag}
                              <X 
                                className="h-3 w-3 cursor-pointer" 
                                onClick={() => handleRemoveTag(tag)}
                              />
                            </Badge>
                          ))}
                          {!isEditing && !isAiEditing && (
                            <div className="flex items-center gap-1">
                              <Input
                                value={newTag}
                                onChange={(e) => setNewTag(e.target.value)}
                                placeholder="Add tag..."
                                className="h-6 text-xs px-2 py-1 w-24 min-w-0"
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') {
                                    e.preventDefault();
                                    handleAddTag();
                                  }
                                }}
                              />
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="h-6 w-6 p-0"
                                onClick={handleAddTag}
                              >
                                <Plus className="h-3 w-3" />
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      {isEditing ? (
                        <div className="p-4 flex-1 flex flex-col">
                          <Textarea 
                            value={editableContent}
                            onChange={(e) => setEditableContent(e.target.value)}
                            className="min-h-[500px] flex-1 font-mono text-sm"
                          />
                          <div className="flex justify-end gap-2 mt-4">
                            <Button
                              onClick={handleCancelEdit}
                              variant="outline"
                            >
                              Cancel
                            </Button>
                            <Button
                              onClick={handleSaveEdit}
                              className="bg-purple-600 hover:bg-purple-700"
                            >
                              <Save className="h-4 w-4 mr-2" /> Save Changes
                            </Button>
                          </div>
                        </div>
                      ) : isAiEditing ? (
                        <div className="p-4 flex-1">
                          <div className="mb-4">
                            <label htmlFor="ai-prompt" className="block text-sm font-medium text-gray-700 mb-1">
                              What would you like AI to do with your notes?
                            </label>
                            <Textarea
                              id="ai-prompt"
                              placeholder="e.g., 'Add more information about lens prescriptions', 'Simplify the section on accommodation', 'Add clinical examples'..."
                              value={aiEditPrompt}
                              onChange={(e) => setAiEditPrompt(e.target.value)}
                              className="h-24"
                            />
                          </div>
                          <div className="flex justify-end gap-2">
                            <Button
                              onClick={() => setIsAiEditing(false)}
                              variant="outline"
                            >
                              Cancel
                            </Button>
                            <Button
                              onClick={handleExecuteAiEdit}
                              disabled={isGenerating || !aiEditPrompt.trim()}
                              className="bg-purple-600 hover:bg-purple-700"
                            >
                              {isGenerating ? (
                                <>
                                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" /> Processing...
                                </>
                              ) : (
                                <>
                                  <WandSparkles className="h-4 w-4 mr-2" /> Apply AI Edit
                                </>
                              )}
                            </Button>
                          </div>
                          
                          <Collapsible className="mt-4">
                            <CollapsibleTrigger asChild>
                              <Button variant="ghost" className="gap-1 text-gray-500 hover:text-purple-500 p-0">
                                <FileEdit className="h-4 w-4" /> 
                                <span className="text-sm">View Original Content</span>
                              </Button>
                            </CollapsibleTrigger>
                            <CollapsibleContent className="mt-2 border rounded-md p-4 bg-gray-50 max-h-[300px] overflow-y-auto">
                              <CaseMarkdown content={currentNote.content} />
                            </CollapsibleContent>
                          </Collapsible>
                        </div>
                      ) : (
                        <div className="p-4 overflow-y-auto h-[600px]">
                          <CaseMarkdown content={currentNote.content} />
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="p-6 flex flex-col items-center justify-center h-[600px] text-center">
                      <FileText className="h-16 w-16 text-purple-200 mb-4" />
                      <h3 className="text-xl font-semibold text-purple-800 mb-2">No Note Selected</h3>
                      <p className="text-gray-600 mb-6 max-w-md">
                        Select a note from the sidebar or generate a new one to get started.
                      </p>
                      <Button 
                        onClick={() => document.querySelector('[data-value="generate"]')?.click()} 
                        className="bg-purple-600 hover:bg-purple-700"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Create New Note
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="generate">
            <div className="max-w-2xl mx-auto">
              <div className="bg-white rounded-lg border border-purple-200 p-6 shadow-sm">
                <h2 className="text-xl font-bold text-purple-800 mb-4">Generate New Study Notes</h2>
                
                <div className="space-y-4">
                  <div>
                    <label htmlFor="topic" className="block text-gray-700 font-medium mb-1">Topic</label>
                    <Input
                      id="topic"
                      placeholder="Enter a specific topic (e.g., Glaucoma Assessment)"
                      value={topic}
                      onChange={(e) => setTopic(e.target.value)}
                      className="bg-white border-purple-300 focus:border-purple-500"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="subject" className="block text-gray-700 font-medium mb-1">Subject Area</label>
                    <Select value={subject} onValueChange={setSubject}>
                      <SelectTrigger className="bg-white border-purple-300 focus:border-purple-500">
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
                    className="w-full bg-purple-600 hover:bg-purple-700 text-white mt-2"
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
            </div>
          </TabsContent>
        </Tabs>
      </div>
      
      <Footer />
    </div>
  );
};

export default StudyNotes;
