
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { generateAudioFromText, downloadAudio, playAudio } from '@/utils/audioGenerator';
import { toast } from '@/components/ui/sonner';
import { Volume2, Download, RefreshCw, Mic, Square } from 'lucide-react';

const VOICE_OPTIONS = [
  { value: 'Leda', label: 'Leda (Female)' },
  { value: 'Aiden', label: 'Aiden (Male)' },
  { value: 'Ember', label: 'Ember (Female)' },
  { value: 'Vale', label: 'Vale (Neutral)' }
];

const AudioNoteGenerator = () => {
  const [text, setText] = useState('');
  const [selectedVoice, setSelectedVoice] = useState('Leda');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedAudio, setGeneratedAudio] = useState<Blob | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentAudio, setCurrentAudio] = useState<HTMLAudioElement | null>(null);

  const handleGenerateAudio = async () => {
    if (!text.trim()) {
      toast.error('Please enter some text to convert to audio');
      return;
    }

    setIsGenerating(true);
    try {
      const audioBlob = await generateAudioFromText(text, {
        voiceName: selectedVoice,
        temperature: 1
      });
      
      setGeneratedAudio(audioBlob);
      toast.success('Audio note generated successfully!');
    } catch (error) {
      console.error('Error generating audio:', error);
      toast.error('Failed to generate audio. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePlayAudio = () => {
    if (!generatedAudio) return;

    if (isPlaying && currentAudio) {
      // Stop current audio
      currentAudio.pause();
      currentAudio.currentTime = 0;
      setIsPlaying(false);
      setCurrentAudio(null);
    } else {
      // Play audio
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
    }
  };

  const handleDownloadAudio = () => {
    if (!generatedAudio) return;
    
    const timestamp = new Date().toISOString().slice(0, 16).replace(/[:.]/g, '-');
    downloadAudio(generatedAudio, `audio-note-${timestamp}`);
    toast.success('Audio downloaded successfully!');
  };

  const generateSampleText = () => {
    const samples = [
      "Glaucoma is a group of eye diseases that damage the optic nerve, often caused by elevated intraocular pressure. Early detection through regular eye exams is crucial for preventing vision loss.",
      "The accommodation reflex involves three components: accommodation of the lens, constriction of the pupil, and convergence of the eyes. This allows for clear vision at various distances.",
      "Diabetic retinopathy is a complication of diabetes that affects the blood vessels in the retina. Regular diabetic eye exams are essential for early detection and treatment.",
      "The tear film consists of three layers: the lipid layer, aqueous layer, and mucin layer. Each layer plays a crucial role in maintaining eye health and comfort."
    ];
    
    const randomSample = samples[Math.floor(Math.random() * samples.length)];
    setText(randomSample);
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Mic className="h-5 w-5 text-sky-500" />
          Audio Note Generator
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label htmlFor="text-input" className="block text-sm font-medium text-gray-700 mb-2">
            Enter text to convert to audio
          </label>
          <Textarea
            id="text-input"
            placeholder="Enter your study notes, concepts, or any text you'd like to convert to audio..."
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="min-h-[120px]"
          />
          <Button
            variant="outline"
            size="sm"
            className="mt-2"
            onClick={generateSampleText}
          >
            Generate Sample Text
          </Button>
        </div>

        <div>
          <label htmlFor="voice-select" className="block text-sm font-medium text-gray-700 mb-2">
            Select Voice
          </label>
          <Select value={selectedVoice} onValueChange={setSelectedVoice}>
            <SelectTrigger>
              <SelectValue placeholder="Choose a voice" />
            </SelectTrigger>
            <SelectContent>
              {VOICE_OPTIONS.map((voice) => (
                <SelectItem key={voice.value} value={voice.value}>
                  {voice.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex gap-2">
          <Button
            onClick={handleGenerateAudio}
            disabled={isGenerating || !text.trim()}
            className="bg-sky-500 hover:bg-sky-600"
          >
            {isGenerating ? (
              <>
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Mic className="mr-2 h-4 w-4" />
                Generate Audio
              </>
            )}
          </Button>

          {generatedAudio && (
            <>
              <Button
                onClick={handlePlayAudio}
                variant="outline"
                className="text-green-600 border-green-300 hover:bg-green-50"
              >
                {isPlaying ? (
                  <>
                    <Square className="mr-2 h-4 w-4" />
                    Stop
                  </>
                ) : (
                  <>
                    <Volume2 className="mr-2 h-4 w-4" />
                    Play
                  </>
                )}
              </Button>

              <Button
                onClick={handleDownloadAudio}
                variant="outline"
                className="text-blue-600 border-blue-300 hover:bg-blue-50"
              >
                <Download className="mr-2 h-4 w-4" />
                Download
              </Button>
            </>
          )}
        </div>

        {generatedAudio && (
          <div className="p-3 bg-green-50 rounded-md border border-green-200">
            <p className="text-sm text-green-800">
              ✅ Audio note generated successfully! You can now play or download the audio file.
            </p>
          </div>
        )}

        <div className="text-xs text-gray-500 space-y-1">
          <p>• Audio notes are generated using Google's Gemini TTS technology</p>
          <p>• Perfect for creating study materials you can listen to on the go</p>
          <p>• Downloaded files are in WAV format for high quality audio</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default AudioNoteGenerator;
