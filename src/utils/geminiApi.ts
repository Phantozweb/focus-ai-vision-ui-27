
import { toast } from '@/components/ui/sonner';
import { config } from '@/config/api';

const API_KEY = config.geminiApiKey;
const API_URL = 'https://generativelanguage.googleapis.com/v1beta';
const MODEL = config.geminiModel || "gemini-1.5-flash"; // Default model

/**
 * Check if the API key is valid
 */
export const checkApiKey = async (): Promise<boolean> => {
  try {
    const response = await fetch(
      `${API_URL}/${MODEL}:generateContent?key=${API_KEY}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              role: 'user',
              parts: [{ text: 'Hello' }],
            },
          ],
          generationConfig: {
            temperature: 0.4,
            maxOutputTokens: 200,
          },
        }),
      }
    );
    
    if (!response.ok) {
      console.error('API key validation failed:', await response.text());
      return false;
    }
    return true;
  } catch (error) {
    console.error('API key validation error:', error);
    return false;
  }
};

/**
 * Generate a response from Gemini API with better token management
 * @param prompt The text prompt
 * @param imageData Optional image data in base64 format
 * @param modelOverride Optional model override (e.g., gemini-2.0-flash for vision)
 */
export const generateGeminiResponse = async (
  prompt: string, 
  imageData: string | null = null,
  modelOverride?: string
): Promise<string> => {
  try {
    // Check if prompt is too long and truncate if necessary
    const maxPromptLength = 30000; // Gemini can handle around 30k tokens
    const truncatedPrompt = prompt.length > maxPromptLength
      ? prompt.substring(0, maxPromptLength) + "... (content truncated)"
      : prompt;

    // Prepare the request parts
    const parts: any[] = [{ text: truncatedPrompt }];

    // Add image if provided
    if (imageData) {
      // Extract base64 data from the data URL
      const base64Image = imageData.split(',')[1];
      
      // Add the image to parts
      parts.push({
        inlineData: {
          mimeType: "image/jpeg", // Assuming JPEG, adjust if needed
          data: base64Image
        }
      });
    }

    // Use vision model if image is provided
    const modelToUse = modelOverride || (imageData ? "gemini-2.0-flash" : MODEL);

    const response = await fetch(
      `${API_URL}/${modelToUse}:generateContent?key=${API_KEY}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              role: 'user',
              parts: parts,
            },
          ],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 1024, // Reduced from 2048 to avoid API limits
            topP: 0.8,
            topK: 40,
          },
          safetySettings: [
            {
              category: 'HARM_CATEGORY_HARASSMENT',
              threshold: 'BLOCK_MEDIUM_AND_ABOVE'
            },
            {
              category: 'HARM_CATEGORY_HATE_SPEECH',
              threshold: 'BLOCK_MEDIUM_AND_ABOVE'
            },
            {
              category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
              threshold: 'BLOCK_MEDIUM_AND_ABOVE'
            },
            {
              category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
              threshold: 'BLOCK_MEDIUM_AND_ABOVE'
            }
          ]
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Failed to generate response:', errorText);
      
      if (errorText.includes('too much content')) {
        throw new Error('The response was too large. Try asking a more specific question.');
      }
      
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    
    if (!data.candidates || data.candidates.length === 0) {
      throw new Error('No response generated');
    }
    
    return data.candidates[0].content.parts[0].text;
  } catch (error) {
    console.error('Error generating response:', error);
    throw error;
  }
};

/**
 * Generate follow-up questions based on a conversation with a focused prompt
 */
export const generateFollowUpQuestions = async (question: string, answer: string): Promise<string[]> => {
  try {
    // Create a focused prompt specifically for follow-up questions
    const prompt = `
    Based on this optometry conversation:
    User Question: "${question.substring(0, 150)}..."
    Assistant Answer: "${answer.substring(0, 200)}..."
    
    Generate 3 relevant follow-up questions that an optometry student might ask next.
    Questions should be concise (under 10 words each) and directly related to optometry topics.
    Format the response as a simple JSON array with just the questions, like this:
    ["Follow-up question 1", "Follow-up question 2", "Follow-up question 3"]
    `;

    const response = await fetch(
      `${API_URL}/${MODEL}:generateContent?key=${API_KEY}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              role: 'user',
              parts: [{ text: prompt }],
            },
          ],
          generationConfig: {
            temperature: 0.2,
            maxOutputTokens: 256, // Reduced for follow-up questions
          }
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    if (!data.candidates || data.candidates.length === 0) {
      throw new Error('No suggestions generated');
    }

    const suggestions = data.candidates[0].content.parts[0].text;
    try {
      // Try to parse the JSON response
      return JSON.parse(suggestions.replace(/```json|```/g, '').trim());
    } catch (e) {
      // If parsing fails, extract questions manually
      console.error('Failed to parse JSON suggestions:', e);
      
      // Fallback to simple extraction
      const lines = suggestions.split('\n').filter(line => 
        line.includes('"') || line.includes("'") || 
        (line.includes('Follow-up') && !line.includes('['))
      );
      
      return lines.slice(0, 3).map(line => {
        // Extract text between quotes or after a number
        const match = line.match(/["']([^"']+)["']/) || line.match(/\d+\.?\s*(.+)/);
        return match ? match[1].trim() : line.trim();
      });
    }
  } catch (error) {
    console.error('Error generating follow-up questions:', error);
    return ["What are symptoms of glaucoma?", "How to diagnose astigmatism?", "Difference between myopia and hyperopia?"];
  }
};

/**
 * Generate quiz questions with answers
 */
export type QuizDifficulty = 'easy' | 'medium' | 'hard';

export interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

export const generateQuizWithAnswers = async (
  topic: string,
  questionCount: number = 5,
  difficulty: QuizDifficulty = 'medium'
): Promise<QuizQuestion[]> => {
  try {
    const prompt = `
    Generate ${questionCount} ${difficulty} difficulty multiple-choice questions about ${topic} in optometry.
    For each question, provide:
    1. The question text
    2. Four answer options (A through D)
    3. The correct answer (as a number from 0-3, where 0=A, 1=B, 2=C, 3=D)
    4. A brief explanation of why the answer is correct
    
    Format as a JSON array with this structure:
    [
      {
        "question": "Question text?",
        "options": ["Option A", "Option B", "Option C", "Option D"],
        "correctAnswer": 0,
        "explanation": "Explanation of why Option A is correct"
      }
    ]
    `;

    const response = await fetch(
      `${API_URL}/${MODEL}:generateContent?key=${API_KEY}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              role: 'user',
              parts: [{ text: prompt }],
            },
          ],
          generationConfig: {
            temperature: 0.2,
            maxOutputTokens: 2048,
          }
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    if (!data.candidates || data.candidates.length === 0) {
      throw new Error('No quiz questions generated');
    }

    const quizText = data.candidates[0].content.parts[0].text;
    
    // Extract JSON from the response
    const jsonMatch = quizText.match(/\[\s*\{.*\}\s*\]/s);
    if (!jsonMatch) {
      throw new Error('Invalid quiz format');
    }
    
    try {
      return JSON.parse(jsonMatch[0]);
    } catch (e) {
      console.error('Failed to parse quiz JSON:', e);
      throw new Error('Invalid quiz format');
    }
  } catch (error) {
    console.error('Error generating quiz:', error);
    throw error;
  }
};
