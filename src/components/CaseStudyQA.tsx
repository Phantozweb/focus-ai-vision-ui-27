
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { SendHorizonal } from 'lucide-react';
import { toast } from 'sonner';
import CaseMarkdown from '@/components/CaseMarkdown';
import { generateGeminiResponse } from '@/utils/geminiApi';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card } from '@/components/ui/card';

interface CaseStudyQAProps {
  condition: string;
  caseContent: string;
  followupQuestions?: string[];
  onAskQuestion?: (question: string) => void;
}

interface QAItem {
  question: string;
  answer: string;
}

const CaseStudyQA: React.FC<CaseStudyQAProps> = ({ condition, caseContent, followupQuestions = [], onAskQuestion }) => {
  const [question, setQuestion] = useState('');
  const [qaItems, setQAItems] = useState<QAItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);

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

  return (
    <div className="mt-4 border-t pt-4 w-full max-w-full overflow-hidden">
      <h3 className="text-lg font-bold text-blue-700 mb-3">Ask about this case</h3>
      
      {/* Display follow-up questions with improved mobile layout */}
      {followupQuestions && followupQuestions.length > 0 && (
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
          className="bg-white border-gray-300"
          disabled={isLoading}
        />
        <Button 
          type="submit" 
          variant="default"
          disabled={isLoading || !question.trim()}
          className="shrink-0"
        >
          <SendHorizonal className="h-4 w-4" />
        </Button>
      </form>
    </div>
  );
};

export default CaseStudyQA;
