
import React, { useState, useEffect } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from '@/components/ui/sonner';
import { 
  PlusCircle, FileText, Save, WandSparkles, Pencil, 
  Eye, BrainCircuit, Contact, Heart, ListChecks
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent
} from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { generateGeminiResponse } from '@/utils/gemini';
import { studyNotesInstructions, optometrySubjects } from '@/utils/studyNotesInstructions';
import { Textarea } from '@/components/ui/textarea';
import CaseMarkdown from '@/components/CaseMarkdown';

interface StudyNote {
  id: string;
  title: string;
  content: string;
  lastUpdated: number;
  tags: string[];
}

const noteTemplates = [
  "Comprehensive Overview",
  "Study Guide",
  "Clinical Application",
  "Exam Preparation",
  "Quick Reference"
];

const StudyNotes = () => {
  const [notes, setNotes] = useState<StudyNote[]>([]);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [selectedNote, setSelectedNote] = useState<StudyNote | null>(null);
  const [noteTitle, setNoteTitle] = useState('');
  const [noteContent, setNoteContent] = useState('');
  const [noteTags, setNoteTags] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [topic, setTopic] = useState('');
  const [templateType, setTemplateType] = useState('Comprehensive Overview');
  const [showPreview, setShowPreview] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedSpecificTopic, setSelectedSpecificTopic] = useState('');
  const [activeTab, setActiveTab] = useState('topics');

  useEffect(() => {
    // Load notes from localStorage
    const savedNotes = localStorage.getItem('studyNotes');
    if (savedNotes) {
      setNotes(JSON.parse(savedNotes));
    } else {
      // If no notes found, set the sample notes
      const sampleNotes = [
        {
          id: "1",
          title: "Ocular Anatomy",
          content: "The eye is composed of three main layers: the outer layer (sclera and cornea), the middle layer (iris, ciliary body, and choroid), and the inner layer (retina)...",
          lastUpdated: Date.now() - 3 * 24 * 60 * 60 * 1000,
          tags: ["anatomy", "basics"]
        },
        {
          id: "2",
          title: "Refractive Errors",
          content: "Common refractive errors include myopia (nearsightedness), hyperopia (farsightedness), astigmatism, and presbyopia...",
          lastUpdated: Date.now() - 2 * 24 * 60 * 60 * 1000,
          tags: ["clinical", "refraction"]
        },
        {
          id: "3",
          title: "Glaucoma Classification",
          content: "Types of glaucoma include open-angle glaucoma, angle-closure glaucoma, normal-tension glaucoma, and secondary glaucoma...",
          lastUpdated: Date.now() - 24 * 60 * 60 * 1000,
          tags: ["pathology", "clinical"]
        }
      ];
      setNotes(sampleNotes);
      localStorage.setItem('studyNotes', JSON.stringify(sampleNotes));
    }
  }, []);

  const saveNotes = (updatedNotes: StudyNote[]) => {
    setNotes(updatedNotes);
    localStorage.setItem('studyNotes', JSON.stringify(updatedNotes));
  };

  const handleCreateNote = () => {
    if (!noteTitle.trim()) {
      toast.error('Please enter a title for your note');
      return;
    }

    const newNote: StudyNote = {
      id: Date.now().toString(),
      title: noteTitle,
      content: noteContent,
      lastUpdated: Date.now(),
      tags: noteTags.split(',').map(tag => tag.trim()).filter(tag => tag)
    };

    const updatedNotes = [newNote, ...notes];
    saveNotes(updatedNotes);
    toast.success('Note created successfully');
    setShowCreateDialog(false);
    resetNoteForm();
  };

  const handleUpdateNote = () => {
    if (!selectedNote) return;
    
    const updatedNote: StudyNote = {
      ...selectedNote,
      title: noteTitle,
      content: noteContent,
      lastUpdated: Date.now(),
      tags: noteTags.split(',').map(tag => tag.trim()).filter(tag => tag)
    };

    const updatedNotes = notes.map(note => 
      note.id === selectedNote.id ? updatedNote : note
    );
    
    saveNotes(updatedNotes);
    toast.success('Note updated successfully');
    setShowEditDialog(false);
    setSelectedNote(null);
  };

  const handleDeleteNote = (id: string) => {
    const updatedNotes = notes.filter(note => note.id !== id);
    saveNotes(updatedNotes);
    toast.success('Note deleted');
  };

  const openNote = (note: StudyNote) => {
    setSelectedNote(note);
    setNoteTitle(note.title);
    setNoteContent(note.content);
    setNoteTags(note.tags.join(', '));
    setShowEditDialog(true);
  };

  const resetNoteForm = () => {
    setNoteTitle('');
    setNoteContent('');
    setNoteTags('');
    setShowPreview(false);
    setSelectedSubject('');
    setSelectedSpecificTopic('');
    setActiveTab('topics');
    setTopic('');
  };

  const openCreateForm = () => {
    resetNoteForm();
    setShowCreateDialog(true);
  };

  const generateNote = async () => {
    // Validate we have either a custom topic or a subject selection
    if (!topic.trim() && !selectedSpecificTopic) {
      toast.error('Please enter a topic or select a subject and specific topic');
      return;
    }

    setIsGenerating(true);
    
    try {
      // Create a structured prompt for the AI
      const topicToUse = topic.trim() || selectedSpecificTopic;
      let subjectContext = '';
      
      if (selectedSubject) {
        const subject = optometrySubjects.find(s => s.id === selectedSubject);
        if (subject) {
          subjectContext = `Subject Area: ${subject.name}\n`;
        }
      }
      
      const prompt = `${studyNotesInstructions}
      
      ${subjectContext}
      Topic: ${topicToUse}
      Template Type: ${templateType}
      
      Please generate detailed, well-structured study notes on this optometry topic.`;
      
      // Call the Gemini API
      const generatedContent = await generateGeminiResponse(prompt);
      
      // Set the generated content
      setNoteTitle(topicToUse);
      setNoteContent(generatedContent);
      
      // Add tags based on subject and template
      let tags = [templateType.toLowerCase()];
      
      if (selectedSubject) {
        const subject = optometrySubjects.find(s => s.id === selectedSubject);
        if (subject) {
          tags.push(subject.id);
        }
      }
      
      setNoteTags(tags.join(', '));
      
      toast.success(`Generated ${templateType} note for ${topicToUse}`);
      setShowPreview(true);
    } catch (error) {
      console.error('Error generating notes:', error);
      toast.error('Failed to generate notes. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const applyNoteModification = async (modification: string) => {
    if (!selectedNote) return;
    
    setIsGenerating(true);
    
    try {
      // Create a prompt for the specific modification
      const prompt = `${studyNotesInstructions}
      
      Original Note Title: ${noteTitle}
      Original Note Content: ${noteContent}
      
      Modification Request: ${modification}
      
      Please apply the requested modification to the study notes while maintaining all the important optometry information.`;
      
      // Call the Gemini API
      const modifiedContent = await generateGeminiResponse(prompt);
      
      // Set the modified content
      setNoteContent(modifiedContent);
      toast.success(`Applied ${modification} to your note`);
    } catch (error) {
      console.error('Error modifying notes:', error);
      toast.error('Failed to modify notes. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleTopicClick = (suggestedTopic: string) => {
    setTopic(suggestedTopic);
  };

  const handleSubjectChange = (subjectId: string) => {
    setSelectedSubject(subjectId);
    setSelectedSpecificTopic('');
  };

  const handleSpecificTopicChange = (topicName: string) => {
    setSelectedSpecificTopic(topicName);
    setTopic('');  // Clear custom topic when selecting a specific one
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  const getSubjectIcon = (subjectId: string) => {
    switch(subjectId) {
      case 'ocular-disease':
        return <Eye className="h-5 w-5" />;
      case 'contact-lens':
        return <Contact className="h-5 w-5" />;
      case 'anatomy-physiology':
        return <BrainCircuit className="h-5 w-5" />;
      case 'binocular-vision':
        return <Eye className="h-5 w-5" />;
      case 'optics':
        return <Eye className="h-5 w-5" />;
      case 'clinical-procedures':
        return <ListChecks className="h-5 w-5" />;
      case 'pharmacology':
        return <Heart className="h-5 w-5" />;
      case 'pediatrics':
        return <Eye className="h-5 w-5" />;
      default:
        return <FileText className="h-5 w-5" />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />
      
      <main className="flex-1">
        <div className="container mx-auto px-4 py-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-xl text-blue-500 font-medium">Study Notes</h1>
            <Button 
              onClick={openCreateForm}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              <PlusCircle className="mr-1 h-4 w-4" />
              New Note
            </Button>
          </div>
          
          <div className="tool-card mb-8">
            <h2 className="text-2xl font-bold text-black mb-2">Generate Study Notes</h2>
            <p className="text-gray-700 mb-6">Create comprehensive study materials on any optometry topic</p>
            
            <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-4">
              <TabsList className="w-full grid grid-cols-2 bg-blue-50">
                <TabsTrigger value="topics" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
                  Select Subject
                </TabsTrigger>
                <TabsTrigger value="custom" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
                  Custom Topic
                </TabsTrigger>
              </TabsList>
              <TabsContent value="topics" className="p-4 border rounded-md mt-4 bg-white">
                <div className="space-y-4">
                  <div>
                    <label htmlFor="subject" className="block text-gray-800 mb-2">Select Subject Area</label>
                    <Select
                      value={selectedSubject}
                      onValueChange={handleSubjectChange}
                    >
                      <SelectTrigger id="subject" className="w-full bg-white border-gray-300">
                        <SelectValue placeholder="Select a subject" />
                      </SelectTrigger>
                      <SelectContent className="bg-white">
                        {optometrySubjects.map((subject) => (
                          <SelectItem key={subject.id} value={subject.id} className="flex items-center gap-2">
                            {getSubjectIcon(subject.id)}
                            <span>{subject.name}</span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-gray-500 mt-1">
                      {selectedSubject ? optometrySubjects.find(s => s.id === selectedSubject)?.description : ''}
                    </p>
                  </div>
                  
                  {selectedSubject && (
                    <div>
                      <label htmlFor="specific-topic" className="block text-gray-800 mb-2">Select Specific Topic</label>
                      <Select
                        value={selectedSpecificTopic}
                        onValueChange={handleSpecificTopicChange}
                      >
                        <SelectTrigger id="specific-topic" className="w-full bg-white border-gray-300">
                          <SelectValue placeholder="Select a specific topic" />
                        </SelectTrigger>
                        <SelectContent className="bg-white">
                          {optometrySubjects
                            .find(s => s.id === selectedSubject)
                            ?.topics.map((topic) => (
                              <SelectItem key={topic} value={topic}>
                                {topic}
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </div>
              </TabsContent>
              <TabsContent value="custom" className="p-4 border rounded-md mt-4 bg-white">
                <div className="mb-4">
                  <label htmlFor="topic" className="block text-gray-800 mb-2">Custom Topic</label>
                  <Input
                    id="topic"
                    placeholder="Enter any optometry topic (e.g., Color Vision Deficiency)"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    className="w-full bg-white border-gray-300 focus:border-blue-500 text-gray-800"
                  />
                </div>
                
                <div className="flex flex-wrap gap-2 mb-2">
                  {optometrySubjects.flatMap(subject => 
                    subject.topics.slice(0, 2)
                  ).map((suggestedTopic, index) => (
                    <Button
                      key={index}
                      variant="outline" 
                      size="sm"
                      onClick={() => handleTopicClick(suggestedTopic)}
                      className="bg-white text-blue-600 border-blue-200 hover:bg-blue-50"
                    >
                      {suggestedTopic}
                    </Button>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
            
            <div className="mb-4">
              <label htmlFor="template" className="block text-gray-800 mb-2">Note Template</label>
              <div className="flex flex-wrap gap-2">
                {noteTemplates.map(template => (
                  <Button
                    key={template}
                    type="button"
                    variant={templateType === template ? "default" : "outline"}
                    className={templateType === template ? 
                      "bg-blue-600 text-white" : 
                      "bg-white border-gray-300 text-gray-800"}
                    onClick={() => setTemplateType(template)}
                  >
                    {template}
                  </Button>
                ))}
              </div>
            </div>
            
            <Button
              onClick={generateNote}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center gap-2"
              disabled={isGenerating}
            >
              <WandSparkles className="h-5 w-5" />
              {isGenerating ? 'Generating...' : 'Generate Study Notes'}
            </Button>
          </div>
          
          <div className="space-y-4">
            {notes.map((note) => (
              <div 
                key={note.id} 
                className="tool-card cursor-pointer hover:scale-[1.01] transition-transform"
                onClick={() => openNote(note)}
              >
                <h2 className="text-lg text-gray-800 font-bold mb-2">{note.title}</h2>
                <p className="text-gray-700 mb-3 line-clamp-2">{note.content}</p>
                <div className="flex justify-between items-center">
                  <div className="flex gap-2">
                    {note.tags.map((tag, i) => (
                      <span key={i} className="px-2 py-1 text-xs rounded bg-gray-100 text-blue-600">
                        {tag}
                      </span>
                    ))}
                  </div>
                  <span className="text-xs text-gray-600">Last updated: {formatDate(note.lastUpdated)}</span>
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-8 p-6 rounded-xl border border-dashed border-gray-300 hover:border-blue-500/50 transition-colors text-center cursor-pointer" onClick={openCreateForm}>
            <p className="text-gray-600">+ Create a new study note</p>
          </div>
        </div>
      </main>

      {/* Create Note Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Create New Study Note</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div>
              <label htmlFor="noteTitle" className="block text-sm font-medium text-gray-700 mb-1">Title</label>
              <Input 
                id="noteTitle" 
                value={noteTitle} 
                onChange={(e) => setNoteTitle(e.target.value)} 
                placeholder="Note title"
              />
            </div>
            
            <div className="flex justify-between mb-1">
              <label htmlFor="noteContent" className="block text-sm font-medium text-gray-700">Content</label>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowPreview(!showPreview)}
                className="text-blue-600"
              >
                {showPreview ? 'Edit' : 'Preview'}
              </Button>
            </div>
            
            {showPreview ? (
              <div className="w-full h-64 p-4 border border-gray-300 rounded-md overflow-auto">
                <CaseMarkdown content={noteContent} />
              </div>
            ) : (
              <Textarea 
                id="noteContent" 
                value={noteContent} 
                onChange={(e) => setNoteContent(e.target.value)} 
                placeholder="Note content"
                className="w-full h-64 p-2"
              />
            )}
            
            <div>
              <label htmlFor="noteTags" className="block text-sm font-medium text-gray-700 mb-1">Tags (comma separated)</label>
              <Input 
                id="noteTags" 
                value={noteTags} 
                onChange={(e) => setNoteTags(e.target.value)} 
                placeholder="anatomy, clinical, etc."
              />
            </div>
          </div>
          <DialogFooter className="flex justify-between items-center">
            <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateNote} className="bg-blue-600 hover:bg-blue-700">
              <Save className="mr-2 h-4 w-4" />
              Save Note
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Note Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Edit Study Note</DialogTitle>
            <DialogDescription>
              Last updated: {selectedNote && formatDate(selectedNote.lastUpdated)}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div className="flex justify-end">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="text-blue-600">
                    <WandSparkles className="mr-2 h-4 w-4" />
                    Enhance Note
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="bg-white">
                  <DropdownMenuItem onClick={() => applyNoteModification('Add structured headers and subheadings')} className="cursor-pointer">
                    Add Headers
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => applyNoteModification('Simplify the content for easier understanding')} className="cursor-pointer">
                    Simplify
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => applyNoteModification('Expand the content with more detailed information')} className="cursor-pointer">
                    Expand Content
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => applyNoteModification('Add clinical pearls and practical tips')} className="cursor-pointer">
                    Add Clinical Pearls
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => applyNoteModification('Add references and citations')} className="cursor-pointer">
                    Add Citations
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            <div>
              <label htmlFor="editNoteTitle" className="block text-sm font-medium text-gray-700 mb-1">Title</label>
              <Input 
                id="editNoteTitle" 
                value={noteTitle} 
                onChange={(e) => setNoteTitle(e.target.value)} 
                placeholder="Note title"
              />
            </div>
            
            <div className="flex justify-between mb-1">
              <label htmlFor="editNoteContent" className="block text-sm font-medium text-gray-700">Content</label>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowPreview(!showPreview)}
                className="text-blue-600"
              >
                {showPreview ? 'Edit' : 'Preview'}
              </Button>
            </div>
            
            {showPreview ? (
              <div className="w-full h-64 p-4 border border-gray-300 rounded-md overflow-auto">
                <CaseMarkdown content={noteContent} />
              </div>
            ) : (
              <Textarea 
                id="editNoteContent" 
                value={noteContent} 
                onChange={(e) => setNoteContent(e.target.value)} 
                placeholder="Note content"
                className="w-full h-64 p-2"
              />
            )}
            
            <div>
              <label htmlFor="editNoteTags" className="block text-sm font-medium text-gray-700 mb-1">Tags (comma separated)</label>
              <Input 
                id="editNoteTags" 
                value={noteTags} 
                onChange={(e) => setNoteTags(e.target.value)} 
                placeholder="anatomy, clinical, etc."
              />
            </div>
          </div>
          <DialogFooter className="flex justify-between items-center">
            <Button variant="destructive" onClick={() => {
              if (selectedNote) handleDeleteNote(selectedNote.id);
              setShowEditDialog(false);
            }}>
              Delete
            </Button>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setShowEditDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleUpdateNote} className="bg-blue-600 hover:bg-blue-700">
                <Save className="mr-2 h-4 w-4" />
                Update Note
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
};

export default StudyNotes;
