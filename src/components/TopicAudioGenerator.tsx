
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { generateGeminiResponse } from '@/utils/geminiApi';
import { generateAudioFromText, downloadAudio, playAudio } from '@/utils/audioGenerator';
import { toast } from '@/components/ui/sonner';
import { 
  BookOpen, RefreshCw, Plus, Edit, Volume2, Download, 
  Square, Play, Wand2
} from 'lucide-react';

interface TopicAudioGeneratorProps {
  onSaveNote?: (title: string, text: string, audioBlob: Blob, voiceName: string) => void;
}

const TopicAudioGenerator = ({ onSaveNote }: TopicAudioGeneratorProps) => {
  const [topicKeywords, setTopicKeywords] = useState('');
  const [generatedText, setGeneratedText] = useState('');
  const [isGeneratingText, setIsGeneratingText] = useState(false);
  const [isGeneratingAudio, setIsGeneratingAudio] = useState(false);
  const [generatedAudio, setGeneratedAudio] = useState<Blob | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentAudio, setCurrentAudio] = useState<HTMLAudioElement | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  const handleGenerateText = async () => {
    if (!topicKeywords.trim()) {
      toast.error('Please enter topic keywords');
      return;
    }

    setIsGeneratingText(true);
    try {
      const prompt = `Create concise, clear study notes about "${topicKeywords}" in optometry. Keep it under 200 words and focus on key points that would be useful for audio learning. Format as plain text without markdown.`;
      
      const textContent = await generateGeminiResponse(prompt);
      setGeneratedText(textContent);
      setGeneratedAudio(null); // Reset audio when text changes
      toast.success('Text content generated! Review and edit if needed.');
    } catch (error) {
      console.error('Error generating text:', error);
      toast.error('Failed to generate text content');
    } finally {
      setIsGeneratingText(false);
    }
  };

  const handleEnhanceText = async () => {
    if (!generatedText.trim()) {
      toast.error('No text to enhance');
      return;
    }

    setIsGeneratingText(true);
    try {
      const prompt = `Enhance and improve this optometry study content for better audio learning. Keep it concise but more engaging and clear:\n\n${generatedText}`;
      
      const enhancedText = await generateGeminiResponse(prompt);
      setGeneratedText(enhancedText);
      setGeneratedAudio(null); // Reset audio when text changes
      toast.success('Text enhanced successfully!');
    } catch (error) {
      console.error('Error enhancing text:', error);
      toast.error('Failed to enhance text');
    } finally {
      setIsGeneratingText(false);
    }
  };

  const handleGenerateAudio = async () => {
    if (!generatedText.trim()) {
      toast.error('Please generate or enter text content first');
      return;
    }

    setIsGeneratingAudio(true);
    try {
      const audioBlob = await generateAudioFromText(generatedText, {
        voiceName: 'Zephyr',
        temperature: 1
      });
      
      setGeneratedAudio(audioBlob);
      
      // Auto-save if callback provided
      if (onSaveNote) {
        onSaveNote(topicKeywords || 'Audio Note', generatedText, audioBlob, 'Zephyr');
      }
      
      toast.success('Audio generated successfully!');
    } catch (error) {
      console.error('Error generating audio:', error);
      toast.error('Failed to generate audio');
    } finally {
      setIsGeneratingAudio(false);
    }
  };

  const handlePlayAudio = async () => {
    if (!generatedAudio) return;

    if (isPlaying && currentAudio) {
      currentAudio.pause();
      currentAudio.currentTime = 0;
      setIsPlaying(false);
      setCurrentAudio(null);
    } else {
      try {
        const audio = playAudio(generatedAudio);
        setCurrentAudio(audio);
        setIsPlaying(true);
        
        audio.addEventListener('ended', () => {
          setIsPlaying(false);
          setCurrentAudio(null);
        });
        
        audio.addEventListener('error', () => {
          setIsPlaying(false);
          setCurrentAudio(null);
          toast.error('Error playing audio');
        });
      } catch (error) {
        console.error('Error playing audio:', error);
        toast.error('Failed to play audio');
      }
    }
  };

  const handleDownloadAudio = () => {
    if (!generatedAudio) return;
    
    try {
      const timestamp = new Date().toISOString().slice(0, 16).replace(/[:.]/g, '-');
      downloadAudio(generatedAudio, `${topicKeywords || 'audio-note'}-${timestamp}`);
      toast.success('Audio downloaded successfully!');
    } catch (error) {
      console.error('Error downloading audio:', error);
      toast.error('Failed to download audio');
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BookOpen className="h-5 w-5 text-sky-500" />
          Generate Audio from Topic
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label htmlFor="topic-input" className="block text-sm font-medium text-gray-700 mb-2">
            Enter optometry topic keywords
          </label>
          <div className="flex gap-2">
            <Input
              id="topic-input"
              placeholder="e.g., Glaucoma diagnosis, Refraction techniques, Contact lens fitting..."
              value={topicKeywords}
              onChange={(e) => setTopicKeywords(e.target.value)}
              className="flex-1"
            />
            <Button
              onClick={handleGenerateText}
              disabled={isGeneratingText || !topicKeywords.trim()}
              className="bg-sky-500 hover:bg-sky-600"
            >
              {isGeneratingText ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <Plus className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>

        {generatedText && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="block text-sm font-medium text-gray-700">
                Generated Content (Preview & Edit)
              </label>
              <div className="flex gap-2">
                <Button
                  onClick={() => setIsEditing(!isEditing)}
                  size="sm"
                  variant="outline"
                >
                  <Edit className="mr-2 h-4 w-4" />
                  {isEditing ? 'Preview' : 'Edit'}
                </Button>
                <Button
                  onClick={handleEnhanceText}
                  disabled={isGeneratingText}
                  size="sm"
                  variant="outline"
                  className="text-purple-600 border-purple-300 hover:bg-purple-50"
                >
                  {isGeneratingText ? (
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Wand2 className="mr-2 h-4 w-4" />
                  )}
                  Enhance with AI
                </Button>
              </div>
            </div>
            
            {isEditing ? (
              <Textarea
                value={generatedText}
                onChange={(e) => {
                  setGeneratedText(e.target.value);
                  setGeneratedAudio(null); // Reset audio when text changes
                }}
                className="min-h-[120px]"
                placeholder="Edit your content here..."
              />
            ) : (
              <div className="p-3 bg-gray-50 rounded-md border min-h-[120px]">
                <p className="text-sm text-gray-800 whitespace-pre-wrap">{generatedText}</p>
              </div>
            )}
          </div>
        )}

        {generatedText && (
          <div className="flex gap-2 pt-2">
            <Button
              onClick={handleGenerateAudio}
              disabled={isGeneratingAudio || !generatedText.trim()}
              className="bg-green-500 hover:bg-green-600"
            >
              {isGeneratingAudio ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Generating Audio...
                </>
              ) : (
                <>
                  <Volume2 className="mr-2 h-4 w-4" />
                  Generate Audio
                </>
              )}
            </Button>

            {generatedAudio && (
              <>
                <Button
                  onClick={handlePlayAudio}
                  variant="outline"
                  className="text-blue-600 border-blue-300 hover:bg-blue-50"
                >
                  {isPlaying ? (
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
                  onClick={handleDownloadAudio}
                  variant="outline"
                  className="text-green-600 border-green-300 hover:bg-green-50"
                >
                  <Download className="mr-2 h-4 w-4" />
                  Download
                </Button>
              </>
            )}
          </div>
        )}

        {generatedAudio && (
          <div className="p-3 bg-green-50 rounded-md border border-green-200">
            <p className="text-sm text-green-800">
              ✅ Audio generated successfully! You can now play or download the audio file.
            </p>
          </div>
        )}

        <div className="text-xs text-gray-500 space-y-1">
          <p>• Step 1: Enter topic keywords and generate content</p>
          <p>• Step 2: Review, edit manually, or enhance with AI</p>
          <p>• Step 3: Generate high-quality audio from the content</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default TopicAudioGenerator;
