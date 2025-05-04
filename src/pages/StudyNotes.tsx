
import React, { useState, useEffect } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from '@/components/ui/sonner';
import { PlusCircle, FileText, Save, WandSparkles, Pencil } from 'lucide-react';
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
  };

  const openCreateForm = () => {
    resetNoteForm();
    setShowCreateDialog(true);
  };

  const generateNote = () => {
    if (!topic.trim()) {
      toast.error('Please enter a topic');
      return;
    }

    setIsGenerating(true);
    
    // Simulate note generation
    setTimeout(() => {
      const generatedContent = `This is a ${templateType} for ${topic}.\n\n`;
      
      // Different content based on template type
      let additionalContent = '';
      switch(templateType) {
        case 'Comprehensive Overview':
          additionalContent = `# ${topic} Overview\n\n## Definition\n\n## Key Components\n\n## Clinical Significance\n\n## Recent Research`;
          break;
        case 'Study Guide':
          additionalContent = `# ${topic} Study Guide\n\n## Key Concepts to Master\n\n## Common Questions\n\n## Study Tips\n\n## Practice Problems`;
          break;
        case 'Clinical Application':
          additionalContent = `# Clinical Applications of ${topic}\n\n## Diagnostic Techniques\n\n## Treatment Approaches\n\n## Case Examples\n\n## Best Practices`;
          break;
        default:
          additionalContent = `# ${topic}\n\n## Overview\n\n## Details\n\n## Applications\n\n## References`;
      }
      
      setNoteTitle(topic);
      setNoteContent(generatedContent + additionalContent);
      setNoteTags(templateType.toLowerCase());
      
      setIsGenerating(false);
      setShowCreateDialog(true);
      toast.success(`Generated ${templateType} note for ${topic}`);
    }, 1500);
  };

  const applyNoteModification = (modification: string) => {
    if (!selectedNote) return;
    
    let modifiedContent = noteContent;
    switch(modification) {
      case 'Add Headers':
        modifiedContent = `# ${noteTitle}\n\n## Introduction\n\n${noteContent}\n\n## Details\n\n## Summary`;
        break;
      case 'Simplify':
        modifiedContent = `${noteContent}\n\n[Simplified version would appear here]`;
        break;
      case 'Expand':
        modifiedContent = `${noteContent}\n\n[Expanded version with more details would appear here]`;
        break;
      case 'Add Citations':
        modifiedContent = `${noteContent}\n\n## References\n1. Reference one would appear here\n2. Reference two would appear here`;
        break;
      default:
        break;
    }
    
    setNoteContent(modifiedContent);
    toast.success(`Applied ${modification} to your note`);
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
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
            
            <div className="mb-4">
              <label htmlFor="topic" className="block text-gray-800 mb-2">Topic</label>
              <Input
                id="topic"
                placeholder="Enter any optometry topic (e.g., Color Vision Deficiency)"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                className="w-full bg-white border-gray-300 focus:border-blue-500 text-gray-800"
              />
            </div>
            
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
            <div>
              <label htmlFor="noteContent" className="block text-sm font-medium text-gray-700 mb-1">Content</label>
              <textarea 
                id="noteContent" 
                value={noteContent} 
                onChange={(e) => setNoteContent(e.target.value)} 
                placeholder="Note content"
                className="w-full h-64 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
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
            <Button onClick={handleCreateNote}>
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
                  <Button variant="outline">
                    <WandSparkles className="mr-2 h-4 w-4" />
                    Enhance Note
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="bg-white">
                  <DropdownMenuItem onClick={() => applyNoteModification('Add Headers')} className="cursor-pointer">
                    Add Headers
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => applyNoteModification('Simplify')} className="cursor-pointer">
                    Simplify
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => applyNoteModification('Expand')} className="cursor-pointer">
                    Expand Content
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => applyNoteModification('Add Citations')} className="cursor-pointer">
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
            <div>
              <label htmlFor="editNoteContent" className="block text-sm font-medium text-gray-700 mb-1">Content</label>
              <textarea 
                id="editNoteContent" 
                value={noteContent} 
                onChange={(e) => setNoteContent(e.target.value)} 
                placeholder="Note content"
                className="w-full h-64 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
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
              <Button onClick={handleUpdateNote}>
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
