
import { generateGeminiResponse } from './core';

export type EnhancementMode = 'grammar' | 'expand' | 'simplify' | 'clinical' | 'academic';

/**
 * Enhance notes using AI
 * @param content The original note content
 * @param mode The enhancement mode
 * @param customPrompt Optional custom prompt for enhancement
 */
export async function enhanceNotes(
  content: string,
  mode: EnhancementMode,
  customPrompt?: string
): Promise<string> {
  const basePrompt = `Enhance the following optometry study notes:\n\n${content}\n\n`;
  
  let enhancementPrompt = basePrompt;
  
  switch (mode) {
    case 'grammar':
      enhancementPrompt += 'Improve grammar, fix spelling errors, and enhance the overall writing quality without changing the meaning.';
      break;
    case 'expand':
      enhancementPrompt += 'Expand these notes with more detailed information, examples, and explanations while maintaining the same structure.';
      break;
    case 'simplify':
      enhancementPrompt += 'Simplify these notes to make them more understandable while preserving all key information.';
      break;
    case 'clinical':
      enhancementPrompt += 'Enhance these notes with more clinical perspectives, practical applications, and patient case examples.';
      break;
    case 'academic':
      enhancementPrompt += 'Enhance these notes with more academic references, research findings, and scientific terminology.';
      break;
    default:
      if (customPrompt) {
        enhancementPrompt += customPrompt;
      } else {
        enhancementPrompt += 'Improve these notes while preserving their structure and content.';
      }
  }
  
  enhancementPrompt += '\n\nKeep the markdown formatting. Return only the enhanced text.';
  
  const enhancedContent = await generateGeminiResponse(enhancementPrompt);
  return enhancedContent;
}
