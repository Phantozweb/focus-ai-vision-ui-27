
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { SendHorizonal, Star, Download } from 'lucide-react';
import { toast } from 'sonner';
import CaseMarkdown from '@/components/CaseMarkdown';
import { generateGeminiResponse } from '@/utils/geminiApi';
import { downloadAsMarkdown } from '@/utils/downloadUtils';
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

interface ExtractedData {
  demographics: string;
  clinicalFindings: string;
  diagnosis: string;
  presentIllness: string;
  pastOcularHistory: string;
  medicalHistory: string;
  specialTests: string;
  fundusExam: string;
  slitLampExam: string;
  fullCase: string;
}

const CaseStudyQA: React.FC<CaseStudyQAProps> = ({ condition, caseContent, onAskQuestion, followupQuestions: initialFollowupQuestions }) => {
  const [question, setQuestion] = useState('');
  const [qaItems, setQAItems] = useState<QAItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [followupQuestions, setFollowupQuestions] = useState<string[]>(initialFollowupQuestions || []);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [extractedData, setExtractedData] = useState<ExtractedData | null>(null);

  // Extract key data from the case study for more accurate responses
  useEffect(() => {
    const extractData = () => {
      // Store full case content for complex questions
      const fullCase = caseContent;
      
      // Extract specific sections for targeted answers
      const demographics = extractSection(caseContent, "Patient Demographics", "Chief Complaint");
      const clinicalFindings = extractSection(caseContent, "Clinical Findings", "Diagnosis");
      const diagnosis = extractSection(caseContent, "Diagnosis", "Treatment Plan");
      const presentIllness = extractSection(caseContent, "History of Present Illness", "Review of Systems");
      const pastOcularHistory = extractSection(caseContent, "Past Ocular History", "Medical History");
      const medicalHistory = extractSection(caseContent, "Medical History", "Family History");
      const specialTests = extractSection(caseContent, "Special Tests", "Diagnosis");
      const fundusExam = extractSection(caseContent, "Fundus Examination", "Special Tests");
      const slitLampExam = extractSection(caseContent, "Slit Lamp Examination", "Intraocular Pressure");
      
      setExtractedData({
        demographics,
        clinicalFindings,
        diagnosis,
        presentIllness,
        pastOcularHistory,
        medicalHistory,
        specialTests,
        fundusExam,
        slitLampExam,
        fullCase
      });
    };
    
    extractData();
  }, [caseContent]);

  // Helper function to extract sections from the case content
  const extractSection = (content: string, startSection: string, endSection: string): string => {
    const startRegex = new RegExp(`#+\\s*${startSection}`, 'i');
    const endRegex = new RegExp(`#+\\s*${endSection}`, 'i');
    
    const startMatch = content.match(startRegex);
    const endMatch = content.match(endRegex);
    
    if (startMatch && startMatch.index !== undefined) {
      const sectionStart = startMatch.index;
      
      let sectionEnd;
      if (endMatch && endMatch.index !== undefined) {
        sectionEnd = endMatch.index;
      } else {
        sectionEnd = content.length;
      }
      
      return content.substring(sectionStart, sectionEnd).trim();
    }
    
    return "";
  };

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
      
      // Default to using the full case
      let relevantContent = extractedData?.fullCase || caseContent;
      let additionalContext = '';
      const questionLower = newQuestion.toLowerCase();
      
      // Identify the type of question to provide more targeted responses
      if (extractedData) {
        // For differential diagnosis questions, combine relevant clinical data
        if (questionLower.includes("differential") || 
            questionLower.includes("diagnos") || 
            questionLower.includes("consider") ||
            questionLower.includes("condition") ||
            questionLower.includes("possible")) {
          
          const diagnosisSections = [
            extractedData.presentIllness,
            extractedData.clinicalFindings, 
            extractedData.fundusExam,
            extractedData.slitLampExam,
            extractedData.specialTests,
            extractedData.diagnosis
          ].filter(section => section.length > 0);
          
          relevantContent = diagnosisSections.join("\n\n");
          
          additionalContext = `
            This question is about differential diagnosis. Focus on interpreting the clinical findings,
            test results, and symptoms to provide a comprehensive differential diagnosis, even if the
            final diagnosis is already mentioned. Include explanations for why each differential is a
            consideration based on the specific findings in the case.
          `;
        } 
        // For treatment questions
        else if (questionLower.includes("treatment") || 
                questionLower.includes("management") || 
                questionLower.includes("therapy") ||
                questionLower.includes("intervention") ||
                questionLower.includes("medication")) {
          
          const treatmentSections = [
            extractedData.diagnosis,
            extractSection(caseContent, "Treatment Plan", "Follow-up"),
            extractSection(caseContent, "Follow-up", "Patient Education")
          ].filter(section => section.length > 0);
          
          relevantContent = treatmentSections.join("\n\n");
        }
        // For patient demographics questions
        else if (questionLower.includes("patient") || 
                questionLower.includes("name") || 
                questionLower.includes("age") ||
                questionLower.includes("gender") ||
                questionLower.includes("demographics")) {
          
          relevantContent = extractedData.demographics;
        }
        // For measurement-related questions
        else if (questionLower.includes("reading") || 
                questionLower.includes("measurement") || 
                questionLower.includes("acuity") ||
                questionLower.includes("pressure") ||
                questionLower.includes("iop") ||
                questionLower.includes("k-reading") ||
                questionLower.includes("refraction")) {
          
          const measurementSections = [
            extractedData.clinicalFindings,
            extractSection(caseContent, "Visual acuity", "Refraction"),
            extractSection(caseContent, "Refraction", "Pupil"),
            extractSection(caseContent, "Intraocular Pressure", "Fundus")
          ].filter(section => section.length > 0);
          
          relevantContent = measurementSections.join("\n\n");
        }
        // If we don't have targeted sections or the question is generic, use the full case
        else {
          relevantContent = extractedData.fullCase;
        }
      }
      
      // Generate response using the case context with improved prompt
      const prompt = `
        You are an optometry expert answering specific questions about a case study.
        
        Here is the case study about a patient with ${condition}:
        ${relevantContent}
        
        Question: "${newQuestion}"
        
        ${additionalContext}
        
        Provide a detailed, accurate answer based on the information present in this case.
        When referring to measurements, values, or clinical findings, cite them EXACTLY as they appear in the case.
        
        When asked about differential diagnoses, consider all the clinical findings, symptoms, and test results
        to provide several possible diagnoses, even if the final diagnosis is already mentioned in the case.
        Explain why each differential diagnosis is considered based on specific findings in the case.
        
        If information is not explicitly mentioned in the case but can be reasonably inferred from the
        clinical findings provided, make the inference clear by stating "Based on the findings, it can be inferred that..."
        
        Use proper optometric terminology and formatting. Present information in a clear, educational manner.
        If referring to tables or measurements from the case, reproduce them in your answer.
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
        Each question should focus on specific values, measurements, or details that appear in the case.
        Keep questions under 100 characters.
        Focus on different aspects like:
        - Specific clinical findings or test results and their interpretation
        - Treatment rationale based on the findings
        - Differential diagnosis considerations
        - Expected prognosis based on the presented values
        
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

  const handleDownloadQA = () => {
    if (qaItems.length === 0) {
      toast.error('No Q&A content to download');
      return;
    }

    const content = qaItems.map(item => 
      `## Question: ${item.question}\n\n${item.answer}`
    ).join('\n\n---\n\n');
    
    const filename = `case-study-qa-${condition.replace(/\s+/g, '-')}`;
    // Add heading for the markdown file
    const heading = `Q&A on ${condition} Case Study`;
    downloadAsMarkdown(content, filename, heading);
    toast.success('Q&A content downloaded');
  };

  return (
    <div className="mt-4 border-t pt-4 w-full max-w-full overflow-hidden">
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-lg font-bold text-blue-700">Ask about this case</h3>
        <div className="flex gap-2">
          {qaItems.length > 0 && (
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="bg-white hover:bg-blue-50 text-blue-600 h-8 w-8"
              onClick={handleDownloadQA}
              title="Download Q&A"
            >
              <Download className="h-4 w-4" />
            </Button>
          )}
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
