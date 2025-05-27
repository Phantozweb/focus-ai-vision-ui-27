
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import AudioNoteGenerator from '@/components/AudioNoteGenerator';
import TopicAudioGenerator from '@/components/TopicAudioGenerator';
import { generateAudioFromText, downloadAudio, playAudio } from '@/utils/audioGenerator';
import { toast } from '@/components/ui/sonner';
import { 
  Mic, Volume2, Download, Trash, Search, 
  Play, Square
} from 'lucide-react';

interface SavedAudioNote {
  id: string;
  title: string;
  text: string;
  audioBlob?: Blob;
  createdAt: number;
  voiceName: string;
}

const AudioNotes = () => {
  const [savedNotes, setSavedNotes] = useState<SavedAudioNote[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [playingAudioId, setPlayingAudioId] = useState<string | null>(null);
  const [currentAudio, setCurrentAudio] = useState<HTMLAudioElement | null>(null);

  useEffect(() => {
    // Load saved audio notes from localStorage
    const saved = localStorage.getItem('audioNotes');
    if (saved) {
      try {
        const parsedNotes = JSON.parse(saved);
        setSavedNotes(parsedNotes);
      } catch (error) {
        console.error('Error loading saved audio notes:', error);
      }
    }
  }, []);

  const saveAudioNote = (title: string, text: string, audioBlob: Blob, voiceName: string) => {
    const newNote: SavedAudioNote = {
      id: Date.now().toString(),
      title,
      text,
      audioBlob,
      createdAt: Date.now(),
      voiceName
    };

    const updatedNotes = [...savedNotes, newNote];
    setSavedNotes(updatedNotes);
    
    // Save to localStorage (without audioBlob for now due to storage limitations)
    const notesToSave = updatedNotes.map(note => ({
      ...note,
      audioBlob: undefined // Don't save blob to localStorage
    }));
    localStorage.setItem('audioNotes', JSON.stringify(notesToSave));
    
    toast.success('Audio note saved!');
  };

  const deleteAudioNote = (id: string) => {
    const updatedNotes = savedNotes.filter(note => note.id !== id);
    setSavedNotes(updatedNotes);
    
    const notesToSave = updatedNotes.map(note => ({
      ...note,
      audioBlob: undefined
    }));
    localStorage.setItem('audioNotes', JSON.stringify(notesToSave));
    
    toast.success('Audio note deleted');
  };

  const playAudioNote = async (note: SavedAudioNote) => {
    if (playingAudioId === note.id && currentAudio) {
      // Stop current audio
      currentAudio.pause();
      currentAudio.currentTime = 0;
      setPlayingAudioId(null);
      setCurrentAudio(null);
      return;
    }

    try {
      let audioToPlay: Blob;
      
      if (note.audioBlob) {
        audioToPlay = note.audioBlob;
      } else {
        // Regenerate audio if not available
        toast.info('Regenerating audio...');
        audioToPlay = await generateAudioFromText(note.text, {
          voiceName: note.voiceName,
          temperature: 1
        });
      }

      const audio = playAudio(audioToPlay);
      setCurrentAudio(audio);
      setPlayingAudioId(note.id);
      
      audio.addEventListener('ended', () => {
        setPlayingAudioId(null);
        setCurrentAudio(null);
      });
      
      audio.addEventListener('error', () => {
        setPlayingAudioId(null);
        setCurrentAudio(null);
        toast.error('Error playing audio');
      });
    } catch (error) {
      console.error('Error playing audio:', error);
      toast.error('Failed to play audio');
    }
  };

  const downloadAudioNote = async (note: SavedAudioNote) => {
    try {
      let audioToDownload: Blob;
      
      if (note.audioBlob) {
        audioToDownload = note.audioBlob;
      } else {
        // Regenerate audio if not available
        toast.info('Generating audio for download...');
        audioToDownload = await generateAudioFromText(note.text, {
          voiceName: note.voiceName,
          temperature: 1
        });
      }

      downloadAudio(audioToDownload, note.title);
      toast.success('Audio downloaded!');
    } catch (error) {
      console.error('Error downloading audio:', error);
      toast.error('Failed to download audio');
    }
  };

  const filteredNotes = savedNotes.filter(note =>
    note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    note.text.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <Header />
      
      <div className="flex-1 container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Mic className="h-7 w-7 text-sky-500" />
            <h1 className="text-3xl font-bold text-sky-800">Audio Notes</h1>
          </div>
          <p className="text-gray-600">Generate and manage audio versions of your study materials</p>
        </div>
        
        <Tabs defaultValue="generate" className="w-full">
          <TabsList className="grid w-full md:w-[400px] mx-auto grid-cols-3 mb-8">
            <TabsTrigger value="generate">Generate</TabsTrigger>
            <TabsTrigger value="topic">Topic Audio</TabsTrigger>
            <TabsTrigger value="saved">Saved ({savedNotes.length})</TabsTrigger>
          </TabsList>
          
          <TabsContent value="generate" className="mt-0">
            <div className="max-w-4xl mx-auto">
              <AudioNoteGenerator />
            </div>
          </TabsContent>
          
          <TabsContent value="topic" className="mt-0">
            <div className="max-w-2xl mx-auto">
              <TopicAudioGenerator onSaveNote={saveAudioNote} />
            </div>
          </TabsContent>
          
          <TabsContent value="saved" className="mt-0">
            <div className="max-w-4xl mx-auto">
              <div className="mb-6">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search audio notes..."
                    className="pl-10"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>

              {filteredNotes.length === 0 ? (
                <Card className="text-center py-12">
                  <CardContent>
                    <Mic className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-600 mb-2">
                      {savedNotes.length === 0 ? 'No Audio Notes Yet' : 'No Notes Found'}
                    </h3>
                    <p className="text-gray-500 mb-6">
                      {savedNotes.length === 0 
                        ? 'Generate your first audio note to get started!'
                        : 'Try adjusting your search terms.'}
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredNotes.map((note) => (
                    <Card key={note.id} className="border border-sky-200">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-lg text-sky-800 line-clamp-2">
                          {note.title}
                        </CardTitle>
                        <div className="text-xs text-gray-500">
                          Created: {new Date(note.createdAt).toLocaleDateString()} • Voice: {note.voiceName}
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-gray-700 mb-4 line-clamp-3">
                          {note.text}
                        </p>
                        
                        <div className="flex gap-2">
                          <Button
                            onClick={() => playAudioNote(note)}
                            size="sm"
                            variant="outline"
                            className="text-green-600 border-green-300 hover:bg-green-50"
                          >
                            {playingAudioId === note.id ? (
                              <>
                                <Square className="mr-2 h-4 w-4" />
                                Stop
                              </>
                            ) : (
                              <>
                                <Play className="mr-2 h-4 w-4" />
                                Play
                              </>
                            )}
                          </Button>
                          
                          <Button
                            onClick={() => downloadAudioNote(note)}
                            size="sm"
                            variant="outline"
                            className="text-blue-600 border-blue-300 hover:bg-blue-50"
                          >
                            <Download className="mr-2 h-4 w-4" />
                            Download
                          </Button>
                          
                          <Button
                            onClick={() => deleteAudioNote(note.id)}
                            size="sm"
                            variant="outline"
                            className="text-red-600 border-red-300 hover:bg-red-50"
                          >
                            <Trash className="mr-2 h-4 w-4" />
                            Delete
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
      
      <Footer />
    </div>
  );
};

export default AudioNotes;
