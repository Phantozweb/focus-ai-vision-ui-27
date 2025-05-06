
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { SendHorizonal, Star } from 'lucide-react';
import { toast } from 'sonner';
import CaseMarkdown from '@/components/CaseMarkdown';
import { generateGeminiResponse } from '@/utils/geminiApi';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card } from '@/components/ui/card';

interface CaseStudyQAProps {
  condition: string;
  caseContent: string;
  onAskQuestion?: (question: string) => void;
  followupQuestions?: string[]; // Added prop to the interface
}

interface QAItem {
  question: string;
  answer: string;
}

const CaseStudyQA: React.FC<CaseStudyQAProps> = ({ condition, caseContent, onAskQuestion, followupQuestions: initialFollowupQuestions }) => {
  const [question, setQuestion] = useState('');
  const [qaItems, setQAItems] = useState<QAItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [followupQuestions, setFollowupQuestions] = useState<string[]>(initialFollowupQuestions || []);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);

  const handleQuestionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!question.trim()) return;
    
    await processQuestion(question);
  };

  const handleFollowupClick = async (followupQuestion: string) => {
    if (onAskQuestion) {
      onAskQuestion(followupQuestion);
    }
    
    await processQuestion(followupQuestion);
  };

  const processQuestion = async (newQuestion: string) => {
    setIsLoading(true);
    
    try {
      // Add the question to the QA list immediately
      setQAItems(prev => [...prev, { question: newQuestion, answer: "Loading response..." }]);
      setQuestion('');
      
      // Generate response using the case context
      const prompt = `
        You are an optometry expert answering specific questions about a case study.
        
        Here's the case study information:
        ${caseContent.substring(0, 2000)}... (case details)
        
        The condition is: ${condition}
        
        Question: ${newQuestion}
        
        Please answer the question with detailed clinical information. Include specific measurements, values, and readings where appropriate. 
        Use standard optometry notations like 6/6 for visual acuity. Include information about keratometry readings, IOP values, and other relevant clinical data if applicable to the question.
        Format your answer professionally without any introductory phrases or signature.
        Focus on the most clinically relevant details.
      `;
      
      const answer = await generateGeminiResponse(prompt);
      
      // Update the answer in the QA list
      setQAItems(prev => prev.map(item => 
        item.question === newQuestion && item.answer === "Loading response..."
          ? { ...item, answer }
          : item
      ));
      
      // Hide suggestions after asking a question
      setShowSuggestions(false);
      
    } catch (error) {
      console.error('Error generating answer:', error);
      toast.error('Failed to generate an answer. Please try again.');
      
      // Update with error message
      setQAItems(prev => prev.map(item => 
        item.answer === "Loading response..."
          ? { ...item, answer: "Failed to generate an answer. Please try again." }
          : item
      ));
    } finally {
      setIsLoading(false);
    }
  };

  const generateSuggestions = async () => {
    setLoadingSuggestions(true);
    try {
      const prompt = `
        Generate 4 relevant follow-up questions for this optometry case:
        
        Case topic: ${condition}
        
        Case content: ${caseContent.substring(0, 1000)}... (abbreviated)
        
        Generate 4 specific, clinically relevant questions that a student might ask about this case.
        Each question should be under 100 characters.
        Focus on different aspects like diagnosis, treatment, prognosis, and clinical findings.
        Return ONLY the questions separated by line breaks, with no additional text.
      `;
      
      const response = await generateGeminiResponse(prompt);
      const questions = response.split('\n').filter(q => q.trim().length > 0).slice(0, 4);
      setFollowupQuestions(questions);
      setShowSuggestions(true);
    } catch (error) {
      console.error('Error generating suggestions:', error);
      toast.error('Failed to generate suggested questions');
    } finally {
      setLoadingSuggestions(false);
    }
  };

  return (
    <div className="mt-4 border-t pt-4 w-full max-w-full overflow-hidden">
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-lg font-bold text-blue-700">Ask about this case</h3>
        <Button
          type="button"
          variant="outline"
          size="icon"
          className="bg-white hover:bg-blue-50 text-blue-600 h-8 w-8"
          onClick={generateSuggestions}
          disabled={loadingSuggestions}
          title="Suggest questions"
        >
          {loadingSuggestions ? (
            <div className="h-4 w-4 border-t-2 border-b-2 border-blue-600 rounded-full animate-spin"></div>
          ) : (
            <Star className="h-4 w-4" />
          )}
        </Button>
      </div>
      
      {/* Display follow-up questions only when requested via star button */}
      {showSuggestions && followupQuestions.length > 0 && (
        <div className="mb-4">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Suggested questions</h4>
          <div className="flex flex-wrap gap-2 mb-4">
            {followupQuestions.map((question, index) => (
              <Button
                key={index}
                variant="outline"
                size="sm"
                className="bg-white text-blue-600 hover:bg-blue-50 text-xs whitespace-normal text-left h-auto py-1.5 px-3 break-words"
                onClick={() => handleFollowupClick(question)}
                disabled={isLoading}
              >
                {question}
              </Button>
            ))}
          </div>
        </div>
      )}
      
      {qaItems.length > 0 && (
        <ScrollArea className="h-[250px] mb-4 pr-2">
          <div className="space-y-4">
            {qaItems.map((item, index) => (
              <Card key={index} className="overflow-hidden">
                <div className="bg-blue-50 p-3 border-b border-blue-100">
                  <h4 className="font-medium text-blue-800 break-words">{item.question}</h4>
                </div>
                <div className="p-3 bg-white">
                  <CaseMarkdown 
                    content={item.answer} 
                    className="prose prose-sm max-w-none" 
                  />
                </div>
              </Card>
            ))}
          </div>
        </ScrollArea>
      )}
      
      <form onSubmit={handleQuestionSubmit} className="flex gap-2">
        <Input
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="Ask a specific question about this case..."
          className="bg-white border-gray-300 flex-1"
          disabled={isLoading}
        />
        <Button 
          type="submit" 
          variant="default"
          disabled={isLoading || !question.trim()}
          className="shrink-0"
          size="icon"
        >
          <SendHorizonal className="h-4 w-4" />
        </Button>
      </form>
    </div>
  );
};

export default CaseStudyQA;
