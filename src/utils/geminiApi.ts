
import { assistantInstructions } from './assistantInstructions';
import { studyNotesInstructions } from './studyNotesInstructions';
import { toast } from '@/components/ui/sonner';

// API key should be stored in environment variables in production
// For this demonstration, we'll use a variable that users can set
let GEMINI_API_KEY = '';

export const setApiKey = (apiKey: string) => {
  GEMINI_API_KEY = apiKey;
  localStorage.setItem('gemini_api_key', apiKey);
  return true;
};

export const getApiKey = (): string => {
  if (!GEMINI_API_KEY) {
    GEMINI_API_KEY = localStorage.getItem('gemini_api_key') || '';
  }
  return GEMINI_API_KEY;
};

export const checkApiKey = async (): Promise<boolean> => {
  const apiKey = getApiKey();
  if (!apiKey) return false;
  
  try {
    const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-pro', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      }
    });
    
    return response.ok;
  } catch (error) {
    console.error('Error checking API key:', error);
    return false;
  }
};

export async function generateGeminiResponse(prompt: string): Promise<string> {
  const apiKey = getApiKey();
  if (!apiKey) {
    throw new Error('API key is not set');
  }
  
  console.log("Generating response for:", prompt);
  
  try {
    const enhancedPrompt = `${assistantInstructions}
    
    Now respond to this question: ${prompt}`;
    
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: enhancedPrompt
          }]
        }],
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 2048,
        }
      })
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`API Error: ${errorData.error?.message || 'Unknown error'}`);
    }
    
    const data = await response.json();
    return data.candidates[0].content.parts[0].text || "Sorry, I couldn't generate a response.";
  } catch (error) {
    console.error('Error generating response:', error);
    throw error;
  }
}

export async function generateFollowUpQuestions(question: string, answer: string): Promise<string[]> {
  const apiKey = getApiKey();
  if (!apiKey) {
    throw new Error('API key is not set');
  }
  
  console.log("Generating follow-up questions for:", question);
  
  try {
    const enhancedPrompt = `Based on this optometry-related question: "${question}" and the answer: "${answer.substring(0, 500)}...", generate 3-5 precise follow-up questions that would help a student deepen their understanding of this topic. Focus only on optometry-related aspects. Keep questions short (under 10 words if possible) and directly relevant to the content.`;
    
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: enhancedPrompt
          }]
        }],
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 1024,
        }
      })
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`API Error: ${errorData.error?.message || 'Unknown error'}`);
    }
    
    const data = await response.json();
    const generatedText = data.candidates[0].content.parts[0].text || "";
    
    // Parse the generated text to extract questions
    const questions = generatedText
      .split('\n')
      .filter(line => line.trim().length > 0 && line.trim().endsWith('?'))
      .map(line => line.trim().replace(/^\d+\.\s*/, ''))
      .slice(0, 5);
    
    return questions.length > 0 ? questions : ["What are related conditions?", "How is it diagnosed?", "What treatments are available?"];
  } catch (error) {
    console.error('Error generating follow-up questions:', error);
    throw error;
  }
}

export async function generateQuizWithAnswers(topic: string, questionCount: number, difficulty: string): Promise<any[]> {
  const apiKey = getApiKey();
  if (!apiKey) {
    throw new Error('API key is not set');
  }
  
  console.log(`Generating ${questionCount} ${difficulty} questions about ${topic}`);
  
  try {
    const enhancedPrompt = `Create ${questionCount} multiple choice questions about ${topic} for optometry students at a ${difficulty} difficulty level. 
    
    For each question:
    1. Provide a clear, concise question
    2. Give exactly 4 answer options (A, B, C, D)
    3. Indicate which answer is correct (by index: 0, 1, 2, or 3)
    4. Include a brief explanation of why the answer is correct
    
    Format the response as a structured JSON array that can be parsed directly, like this example:
    [
      {
        "question": "What is the most common type of glaucoma?",
        "options": ["Open-angle glaucoma", "Angle-closure glaucoma", "Normal-tension glaucoma", "Secondary glaucoma"],
        "correctAnswer": 0,
        "explanation": "Open-angle glaucoma accounts for approximately 90% of all glaucoma cases."
      }
    ]`;
    
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: enhancedPrompt
          }]
        }],
        generationConfig: {
          temperature: 0.2, // Lower temperature for more structured output
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 2048,
        }
      })
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`API Error: ${errorData.error?.message || 'Unknown error'}`);
    }
    
    const data = await response.json();
    const generatedText = data.candidates[0].content.parts[0].text || "";
    
    // Extract JSON from the generated text
    const jsonMatch = generatedText.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      throw new Error("Failed to parse quiz questions from the response");
    }
    
    try {
      const quizQuestions = JSON.parse(jsonMatch[0]);
      return quizQuestions;
    } catch (parseError) {
      console.error("JSON parsing error:", parseError);
      throw new Error("Failed to parse quiz questions from the response");
    }
  } catch (error) {
    console.error('Error generating quiz questions:', error);
    throw error;
  }
}

export async function generateStudyNotes(topic: string): Promise<string> {
  const apiKey = getApiKey();
  if (!apiKey) {
    throw new Error('API key is not set');
  }
  
  console.log("Generating study notes for:", topic);
  
  try {
    const enhancedPrompt = `${studyNotesInstructions}
    
    Please create study notes on the following optometry topic: ${topic}`;
    
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: enhancedPrompt
          }]
        }],
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 4096, // Longer output for study notes
        }
      })
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`API Error: ${errorData.error?.message || 'Unknown error'}`);
    }
    
    const data = await response.json();
    return data.candidates[0].content.parts[0].text || "Sorry, I couldn't generate study notes.";
  } catch (error) {
    console.error('Error generating study notes:', error);
    throw error;
  }
}

export async function generateCaseStudy(topic: string, complexity: string): Promise<any> {
  const apiKey = getApiKey();
  if (!apiKey) {
    throw new Error('API key is not set');
  }
  
  console.log(`Generating ${complexity} case study about ${topic}`);
  
  try {
    const enhancedPrompt = `Create a detailed optometry case study about ${topic} at a ${complexity} complexity level.
    
    The case study should include:
    1. Patient demographics and chief complaint
    2. Relevant history (medical, ocular, family, social)
    3. Clinical findings and test results
    4. Diagnosis
    5. Management plan and recommendations
    6. Educational notes for students
    7. 3-5 quiz questions with multiple-choice answers
    
    Format the response as a structured JSON object that can be parsed directly, like this:
    {
      "title": "Title of the case study",
      "patientInfo": "Demographics and presenting complaints",
      "history": "Relevant history details",
      "clinicalFindings": "Examination findings and test results",
      "diagnosis": "The final diagnosis",
      "management": "Treatment and management plan",
      "educationalNotes": "Key learning points for students",
      "quizQuestions": [
        {
          "question": "What is the most likely diagnosis?",
          "options": ["Option A", "Option B", "Option C", "Option D"],
          "correctAnswer": 1,
          "explanation": "Explanation why Option B is correct"
        }
      ]
    }`;
    
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: enhancedPrompt
          }]
        }],
        generationConfig: {
          temperature: 0.3, // Lower temperature for more structured output
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 4096,
        }
      })
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`API Error: ${errorData.error?.message || 'Unknown error'}`);
    }
    
    const data = await response.json();
    const generatedText = data.candidates[0].content.parts[0].text || "";
    
    // Extract JSON from the generated text
    const jsonMatch = generatedText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("Failed to parse case study from the response");
    }
    
    try {
      const caseStudy = JSON.parse(jsonMatch[0]);
      return caseStudy;
    } catch (parseError) {
      console.error("JSON parsing error:", parseError);
      throw new Error("Failed to parse case study from the response");
    }
  } catch (error) {
    console.error('Error generating case study:', error);
    throw error;
  }
}
