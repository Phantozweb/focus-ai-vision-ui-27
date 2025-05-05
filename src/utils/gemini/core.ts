
import { genAI, generationConfig, safetySettings, MAX_PROMPT_LENGTH } from './config';

// Function to check if API key is valid
export const checkApiKey = async (): Promise<boolean> => {
  try {
    // Simple test prompt to check if API is working
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    await model.generateContent("Test");
    return true;
  } catch (error) {
    console.error("API key validation error:", error);
    return false;
  }
};

// Function to generate a response with better error handling for large responses
export const generateGeminiResponse = async (prompt: string): Promise<string> => {
  try {
    // Split large prompts if needed to avoid exceeding token limits
    const promptToUse = prompt.length > MAX_PROMPT_LENGTH 
      ? prompt.substring(0, MAX_PROMPT_LENGTH) + "..."
      : prompt;
    
    // Get the Gemini model with our configuration
    const model = genAI.getGenerativeModel({ 
      model: "gemini-pro",
      generationConfig,
      safetySettings,
    });

    // Generate the response
    const result = await model.generateContent(promptToUse);
    const response = result.response;
    const text = response.text();
    
    return text;
  } catch (error: any) {
    console.error("Error generating Gemini response:", error);
    
    // Check for specific error types
    if (error.message && error.message.includes("too much response")) {
      return "I apologize, but the response was too large to process. Could you try asking a more specific question?";
    }
    
    throw new Error(`Failed to generate response: ${error.message || "Unknown error"}`);
  }
};
