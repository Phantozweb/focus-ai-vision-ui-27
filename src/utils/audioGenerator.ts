
import { config } from '@/config/api';

interface AudioGenerationConfig {
  voiceName?: string;
  temperature?: number;
}

interface WavConversionOptions {
  numChannels: number;
  sampleRate: number;
  bitsPerSample: number;
}

// Parse MIME type to extract audio parameters
const parseMimeType = (mimeType: string): WavConversionOptions => {
  const [fileType, ...params] = mimeType.split(';').map(s => s.trim());
  const [_, format] = fileType.split('/');

  const options: Partial<WavConversionOptions> = {
    numChannels: 1,
    sampleRate: 24000,
    bitsPerSample: 16
  };

  if (format && format.startsWith('L')) {
    const bits = parseInt(format.slice(1), 10);
    if (!isNaN(bits)) {
      options.bitsPerSample = bits;
    }
  }

  for (const param of params) {
    const [key, value] = param.split('=').map(s => s.trim());
    if (key === 'rate') {
      options.sampleRate = parseInt(value, 10);
    }
  }

  return options as WavConversionOptions;
};

// Create WAV header for PCM data
const createWavHeader = (dataLength: number, options: WavConversionOptions): ArrayBuffer => {
  const { numChannels, sampleRate, bitsPerSample } = options;
  
  const byteRate = sampleRate * numChannels * bitsPerSample / 8;
  const blockAlign = numChannels * bitsPerSample / 8;
  const buffer = new ArrayBuffer(44);
  const view = new DataView(buffer);

  const writeString = (offset: number, string: string) => {
    for (let i = 0; i < string.length; i++) {
      view.setUint8(offset + i, string.charCodeAt(i));
    }
  };

  writeString(0, 'RIFF');
  view.setUint32(4, 36 + dataLength, true);
  writeString(8, 'WAVE');
  writeString(12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true); // PCM format
  view.setUint16(22, numChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, byteRate, true);
  view.setUint16(32, blockAlign, true);
  view.setUint16(34, bitsPerSample, true);
  writeString(36, 'data');
  view.setUint32(40, dataLength, true);

  return buffer;
};

// Convert raw PCM data to WAV format
const convertToWav = (rawData: string, mimeType: string): Uint8Array => {
  const options = parseMimeType(mimeType);
  const audioData = new Uint8Array(atob(rawData).split('').map(char => char.charCodeAt(0)));
  const wavHeader = new Uint8Array(createWavHeader(audioData.length, options));
  
  const wavFile = new Uint8Array(wavHeader.length + audioData.length);
  wavFile.set(wavHeader, 0);
  wavFile.set(audioData, wavHeader.length);
  
  return wavFile;
};

export const generateAudioFromText = async (
  text: string,
  options: AudioGenerationConfig = {}
): Promise<Blob> => {
  const { voiceName = 'Zephyr', temperature = 1 } = options;
  
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

    const audioChunks: { data: string; mimeType: string }[] = [];
    
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      
      const chunk = new TextDecoder().decode(value);
      const lines = chunk.split('\n').filter(line => line.trim());
      
      for (const line of lines) {
        if (line.startsWith('data: ')) {
          try {
            const data = JSON.parse(line.slice(6));
            if (data.candidates?.[0]?.content?.parts?.[0]?.inlineData) {
              const inlineData = data.candidates[0].content.parts[0].inlineData;
              audioChunks.push({
                data: inlineData.data,
                mimeType: inlineData.mimeType
              });
            }
          } catch (e) {
            console.warn('Skipping malformed JSON:', e);
          }
        }
      }
    }
    
    if (audioChunks.length === 0) {
      throw new Error('No audio data received');
    }

    // Use the first chunk's MIME type for conversion
    const firstChunk = audioChunks[0];
    const combinedData = audioChunks.map(chunk => chunk.data).join('');
    
    // Convert to WAV format
    const wavData = convertToWav(combinedData, firstChunk.mimeType);
    
    return new Blob([wavData], { type: 'audio/wav' });
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
    
    audio.preload = 'auto';
    audio.volume = 1;
    
    const cleanup = () => {
      URL.revokeObjectURL(url);
    };
    
    audio.addEventListener('ended', cleanup);
    audio.addEventListener('error', cleanup);
    
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
