
import { config } from '@/config/api';

interface AudioGenerationConfig {
  voiceName?: string;
  temperature?: number;
}

export const generateAudioFromText = async (
  text: string,
  options: AudioGenerationConfig = {}
): Promise<Blob> => {
  const { voiceName = 'Leda', temperature = 1 } = options;
  
  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-tts:streamGenerateContent?key=${config.geminiApiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              role: 'user',
              parts: [{ text }]
            }
          ],
          generationConfig: {
            temperature,
            responseModalities: ['AUDIO'],
            speechConfig: {
              voiceConfig: {
                prebuiltVoiceConfig: {
                  voiceName
                }
              }
            }
          }
        })
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const reader = response.body?.getReader();
    if (!reader) {
      throw new Error('Unable to read response');
    }

    const audioChunks: Uint8Array[] = [];
    
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      
      // Parse the streaming response
      const chunk = new TextDecoder().decode(value);
      const lines = chunk.split('\n').filter(line => line.trim());
      
      for (const line of lines) {
        if (line.startsWith('data: ')) {
          try {
            const data = JSON.parse(line.slice(6));
            if (data.candidates?.[0]?.content?.parts?.[0]?.inlineData) {
              const audioData = data.candidates[0].content.parts[0].inlineData.data;
              const binaryData = atob(audioData);
              const bytes = new Uint8Array(binaryData.length);
              for (let i = 0; i < binaryData.length; i++) {
                bytes[i] = binaryData.charCodeAt(i);
              }
              audioChunks.push(bytes);
            }
          } catch (e) {
            // Skip malformed JSON
            console.warn('Skipping malformed JSON:', e);
          }
        }
      }
    }
    
    // Combine all audio chunks
    const totalLength = audioChunks.reduce((sum, chunk) => sum + chunk.length, 0);
    const combinedArray = new Uint8Array(totalLength);
    let offset = 0;
    
    for (const chunk of audioChunks) {
      combinedArray.set(chunk, offset);
      offset += chunk.length;
    }
    
    return new Blob([combinedArray], { type: 'audio/wav' });
  } catch (error) {
    console.error('Error generating audio:', error);
    throw new Error('Failed to generate audio. Please try again.');
  }
};

export const downloadAudio = (audioBlob: Blob, filename: string = 'audio-note') => {
  const url = URL.createObjectURL(audioBlob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${filename}.wav`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

export const playAudio = (audioBlob: Blob): HTMLAudioElement => {
  const url = URL.createObjectURL(audioBlob);
  const audio = new Audio(url);
  audio.play();
  
  // Clean up the URL when audio ends
  audio.addEventListener('ended', () => {
    URL.revokeObjectURL(url);
  });
  
  return audio;
};
