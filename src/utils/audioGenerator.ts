
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
