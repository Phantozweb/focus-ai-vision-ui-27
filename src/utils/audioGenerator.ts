
import { config } from '@/config/api';

interface AudioGenerationConfig {
  voiceName?: string;
  temperature?: number;
}

// Helper function to create WAV header for PCM data
const createWavHeader = (dataLength: number, sampleRate: number = 24000, channels: number = 1, bitsPerSample: number = 16) => {
  const byteRate = sampleRate * channels * bitsPerSample / 8;
  const blockAlign = channels * bitsPerSample / 8;
  const buffer = new ArrayBuffer(44);
  const view = new DataView(buffer);

  // RIFF chunk descriptor
  const writeString = (offset: number, string: string) => {
    for (let i = 0; i < string.length; i++) {
      view.setUint8(offset + i, string.charCodeAt(i));
    }
  };

  writeString(0, 'RIFF');
  view.setUint32(4, 36 + dataLength, true);
  writeString(8, 'WAVE');

  // fmt sub-chunk
  writeString(12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true); // PCM format
  view.setUint16(22, channels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, byteRate, true);
  view.setUint16(32, blockAlign, true);
  view.setUint16(34, bitsPerSample, true);

  // data sub-chunk
  writeString(36, 'data');
  view.setUint32(40, dataLength, true);

  return new Uint8Array(buffer);
};

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
    
    // Create proper WAV file with header
    const wavHeader = createWavHeader(combinedArray.length);
    const wavFile = new Uint8Array(wavHeader.length + combinedArray.length);
    wavFile.set(wavHeader, 0);
    wavFile.set(combinedArray, wavHeader.length);
    
    return new Blob([wavFile], { type: 'audio/wav' });
  } catch (error) {
    console.error('Error generating audio:', error);
    throw new Error('Failed to generate audio. Please try again.');
  }
};

export const downloadAudio = (audioBlob: Blob, filename: string = 'audio-note') => {
  try {
    const url = URL.createObjectURL(audioBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${filename}.wav`;
    a.style.display = 'none';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    
    // Clean up the URL after a short delay
    setTimeout(() => {
      URL.revokeObjectURL(url);
    }, 100);
  } catch (error) {
    console.error('Error downloading audio:', error);
    throw error;
  }
};

export const playAudio = (audioBlob: Blob): HTMLAudioElement => {
  try {
    const url = URL.createObjectURL(audioBlob);
    const audio = new Audio(url);
    
    // Set up audio properties for better compatibility
    audio.preload = 'auto';
    audio.volume = 1;
    
    // Clean up the URL when audio ends or errors occur
    const cleanup = () => {
      URL.revokeObjectURL(url);
    };
    
    audio.addEventListener('ended', cleanup);
    audio.addEventListener('error', cleanup);
    
    // Start playing
    audio.play().catch(error => {
      console.error('Error playing audio:', error);
      cleanup();
      throw error;
    });
    
    return audio;
  } catch (error) {
    console.error('Error creating audio:', error);
    throw error;
  }
};
