
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
  console.log('Parsing MIME type:', mimeType);
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

  console.log('Parsed options:', options);
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
  console.log('Converting to WAV. Raw data length:', rawData.length);
  const options = parseMimeType(mimeType);
  const audioData = new Uint8Array(atob(rawData).split('').map(char => char.charCodeAt(0)));
  const wavHeader = new Uint8Array(createWavHeader(audioData.length, options));
  
  const wavFile = new Uint8Array(wavHeader.length + audioData.length);
  wavFile.set(wavHeader, 0);
  wavFile.set(audioData, wavHeader.length);
  
  console.log('WAV file created. Total size:', wavFile.length);
  return wavFile;
};

export const generateAudioFromText = async (
  text: string,
  options: AudioGenerationConfig = {}
): Promise<Blob> => {
  const { voiceName = 'Zephyr', temperature = 1 } = options;
  
  console.log('Starting audio generation for text:', text.substring(0, 50) + '...');
  console.log('Using voice:', voiceName, 'Temperature:', temperature);
  console.log('API Key available:', config.geminiApiKey ? 'Yes' : 'No');
  
  if (!config.geminiApiKey) {
    throw new Error('Gemini API key is not configured. Please check your API configuration.');
  }
  
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

    console.log('Response status:', response.status);
    if (!response.ok) {
      console.error('HTTP error:', response.status, response.statusText);
      const errorText = await response.text();
      console.error('Error response:', errorText);
      
      if (response.status === 401) {
        throw new Error('Invalid API key. Please check your Gemini API key configuration.');
      } else if (response.status === 403) {
        throw new Error('API access forbidden. Please ensure your API key has the necessary permissions.');
      } else if (response.status === 429) {
        throw new Error('Rate limit exceeded. Please try again in a moment.');
      }
      
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const reader = response.body?.getReader();
    if (!reader) {
      throw new Error('Unable to read response');
    }

    const audioChunks: { data: string; mimeType: string }[] = [];
    let totalChunks = 0;
    
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      
      const chunk = new TextDecoder().decode(value);
      console.log('Received chunk:', chunk.substring(0, 200) + '...');
      
      // Split by lines and process each line
      const lines = chunk.split('\n');
      
      for (const line of lines) {
        const trimmedLine = line.trim();
        if (!trimmedLine) continue;
        
        // Look for JSON data lines
        if (trimmedLine.startsWith('data: ')) {
          try {
            const jsonStr = trimmedLine.slice(6); // Remove 'data: ' prefix
            if (jsonStr === '[DONE]') continue;
            
            const data = JSON.parse(jsonStr);
            console.log('Parsed data structure:', Object.keys(data));
            
            if (data.candidates?.[0]?.content?.parts?.[0]?.inlineData) {
              const inlineData = data.candidates[0].content.parts[0].inlineData;
              console.log('Found audio chunk:', {
                mimeType: inlineData.mimeType,
                dataLength: inlineData.data?.length || 0
              });
              
              audioChunks.push({
                data: inlineData.data,
                mimeType: inlineData.mimeType
              });
              totalChunks++;
            }
          } catch (e) {
            console.warn('Failed to parse JSON line:', trimmedLine.substring(0, 100), e);
          }
        } else if (trimmedLine.startsWith('[') || trimmedLine.startsWith('{')) {
          // Try to parse as direct JSON
          try {
            const data = JSON.parse(trimmedLine);
            if (data.candidates?.[0]?.content?.parts?.[0]?.inlineData) {
              const inlineData = data.candidates[0].content.parts[0].inlineData;
              console.log('Found audio chunk (direct JSON):', {
                mimeType: inlineData.mimeType,
                dataLength: inlineData.data?.length || 0
              });
              
              audioChunks.push({
                data: inlineData.data,
                mimeType: inlineData.mimeType
              });
              totalChunks++;
            }
          } catch (e) {
            console.warn('Failed to parse direct JSON:', trimmedLine.substring(0, 100), e);
          }
        }
      }
    }
    
    console.log('Total chunks received:', totalChunks);
    console.log('Audio chunks array length:', audioChunks.length);
    
    if (audioChunks.length === 0) {
      console.error('No audio data found in response');
      throw new Error('No audio data received from the API. This might be due to content filtering or API configuration issues.');
    }

    // Use the first chunk's MIME type for conversion
    const firstChunk = audioChunks[0];
    const combinedData = audioChunks.map(chunk => chunk.data).join('');
    
    console.log('Combined data length:', combinedData.length);
    console.log('First chunk MIME type:', firstChunk.mimeType);
    
    // Convert to WAV format
    const wavData = convertToWav(combinedData, firstChunk.mimeType);
    
    const blob = new Blob([wavData], { type: 'audio/wav' });
    console.log('Final blob size:', blob.size);
    
    return blob;
  } catch (error) {
    console.error('Error generating audio:', error);
    throw new Error(`Failed to generate audio: ${error instanceof Error ? error.message : 'Unknown error'}`);
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
