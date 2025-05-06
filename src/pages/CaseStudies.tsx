import React, { useState, useEffect } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/sonner';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { FlaskConical, FileText, Save, Download, ArrowDown, MessageCircle, FileQuestion } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { generateGeminiResponse } from '@/utils/geminiApi';
import { useNavigate } from 'react-router-dom';
import CasePracticeModal from '@/components/CasePracticeModal';

const popularConditions = [
  "Diabetic Retinopathy",
  "Glaucoma",
  "Cataract",
  "Age-related Macular Degeneration",
  "Dry Eye Syndrome",
  "Keratoconus",
  "Retinal Detachment",
  "Conjunctivitis",
];

interface SavedCase {
  id: string;
  title: string;
  content: string;
  condition: string;
  createdAt: number;
  followupQuestions?: string[];
}

const CaseStudies = () => {
  const [condition, setCondition] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [savedCases, setSavedCases] = useState<SavedCase[]>([]);
  const [showSavedCases, setShowSavedCases] = useState(false);
  const [selectedCase, setSelectedCase] = useState<SavedCase | null>(null);
  const [showCaseDialog, setShowCaseDialog] = useState(false);
  const [followupQuestions, setFollowupQuestions] = useState<string[]>([]);
  const [isGeneratingFollowups, setIsGeneratingFollowups] = useState(false);
  const [showPracticeModal, setShowPracticeModal] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Load saved cases from localStorage
    const savedCasesFromStorage = localStorage.getItem('generatedCases');
    if (savedCasesFromStorage) {
      setSavedCases(JSON.parse(savedCasesFromStorage));
    }
  }, []);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!condition.trim()) return;

    setIsGenerating(true);
    
    try {
      // Generate a realistic case study using Gemini API with improved prompt for EMR-style format
      const prompt = `Generate a detailed clinical case study about a patient with ${condition} in an Electronic Medical Record (EMR) style format. 
      Include the following sections with clear headings and formatted as an EMR would display:
      
      1. Patient Demographics: age, gender, occupation
      2. Chief Complaint: in patient's own words
      3. History of Present Illness: detailed timeline and symptom progression
      4. Review of Systems: relevant findings specific to optometry
      5. Past Ocular History
      6. Medical History: systemic conditions, medications, allergies
      7. Family History: relevant ocular and systemic conditions
      8. Social History: relevant lifestyle factors
      9. Clinical Findings: Include a table for visual acuity measurements with columns for OD, OS, best corrected VA
      10. Slit Lamp Examination: Include a table with findings for anterior and posterior segment
      11. Diagnostic Tests: Include results formatted in tables when appropriate
      12. Assessment: Working diagnosis with ICD-10 code
      13. Plan: Treatment recommendations
      14. Follow-up: Recommended timeline and specific tests
      
      Make the case realistic, clinically accurate and educational for optometry students. Use proper medical terminology and formatting with tables for key clinical measurements.`;
      
      const caseContent = await generateGeminiResponse(prompt);
      
      // Generate follow-up questions
      const followupPrompt = `Based on this case study about ${condition}, generate 6 follow-up questions that would help optometry students think critically about this case. Questions should cover diagnosis, treatment options, and clinical decision-making. Format as a simple bulleted list. Keep questions concise (under 15 words if possible).`;
      const followupResponse = await generateGeminiResponse(followupPrompt);
      
      // Parse questions from response (assuming they're in a bulleted list format)
      const questionsList = followupResponse
        .split('\n')
        .filter(line => line.trim().startsWith('-') || line.trim().startsWith('*'))
        .map(line => line.replace(/^[-*]\s+/, '').trim())
        .filter(q => q.length > 0);
      
      const newCase: SavedCase = {
        id: Date.now().toString(),
        title: `Case Study: ${condition}`,
        content: caseContent,
        condition: condition,
        createdAt: Date.now(),
        followupQuestions: questionsList.length > 0 ? questionsList : undefined
      };
      
      const updatedCases = [newCase, ...savedCases];
      setSavedCases(updatedCases);
      localStorage.setItem('generatedCases', JSON.stringify(updatedCases));
      
      toast.success(`Generated case study for ${condition}`);
      setSelectedCase(newCase);
      setFollowupQuestions(questionsList);
      setShowCaseDialog(true);
    } catch (error) {
      console.error('Error generating case study:', error);
      toast.error('Failed to generate case study. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleOpenCase = (caseItem: SavedCase) => {
    setSelectedCase(caseItem);
    setFollowupQuestions(caseItem.followupQuestions || []);
    setShowCaseDialog(true);
  };

  const handleDeleteCase = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updatedCases = savedCases.filter(caseItem => caseItem.id !== id);
    setSavedCases(updatedCases);
    localStorage.setItem('generatedCases', JSON.stringify(updatedCases));
    toast.success('Case deleted');
  };

  const generateMoreFollowupQuestions = async () => {
    if (!selectedCase) return;
    
    setIsGeneratingFollowups(true);
    
    try {
      const prompt = `Based on this case study about ${selectedCase.condition}, generate 4 additional follow-up questions that would help students think critically about this case. 
      Make these questions different from any existing questions. Format as a simple bulleted list. Keep questions concise (under 10 words if possible).`;
      
      const response = await generateGeminiResponse(prompt);
      
      // Parse questions from response
      const newQuestions = response
        .split('\n')
        .filter(line => line.trim().startsWith('-') || line.trim().startsWith('*'))
        .map(line => line.replace(/^[-*]\s+/, '').trim())
        .filter(q => q.length > 0);
      
      if (newQuestions.length > 0) {
        const updatedQuestions = [...followupQuestions, ...newQuestions];
        setFollowupQuestions(updatedQuestions);
        
        // Update the case with new questions
        const updatedCase = {
          ...selectedCase,
          followupQuestions: updatedQuestions
        };
        
        const updatedCases = savedCases.map(c => 
          c.id === selectedCase.id ? updatedCase : c
        );
        
        setSavedCases(updatedCases);
        localStorage.setItem('generatedCases', JSON.stringify(updatedCases));
        toast.success('Generated additional follow-up questions');
      } else {
        toast.error('Failed to generate follow-up questions');
      }
    } catch (error) {
      console.error('Error generating follow-up questions:', error);
      toast.error('Failed to generate follow-up questions');
    } finally {
      setIsGeneratingFollowups(false);
    }
  };

  const saveToNotes = () => {
    if (!selectedCase) return;
    
    // Get existing study notes
    const savedNotes = localStorage.getItem('studyNotes');
    let studyNotes = savedNotes ? JSON.parse(savedNotes) : [];
    
    // Create a new note from the case study
    const newNote = {
      id: Date.now().toString(),
      title: `${selectedCase.title} - Notes`,
      content: selectedCase.content,
      lastUpdated: Date.now(),
      tags: [selectedCase.condition, 'case-study']
    };
    
    // Add to study notes
    studyNotes = [newNote, ...studyNotes];
    localStorage.setItem('studyNotes', JSON.stringify(studyNotes));
    
    toast.success('Case saved to Study Notes');
  };

  const handleDownload = (format: 'markdown' | 'text') => {
    if (!selectedCase) return;
    
    const formattedContent = 
      `# ${selectedCase.title}\n\n` + 
      `Created: ${new Date(selectedCase.createdAt).toLocaleString()}\n\n` +
      `${selectedCase.content}\n\n` +
      (followupQuestions.length > 0 ? 
        `## Follow-up Questions\n\n${followupQuestions.map(q => `- ${q}`).join('\n')}\n` : '');
    
    if (format === 'markdown') {
      // Download as markdown
      const blob = new Blob([formattedContent], { type: 'text/markdown' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${selectedCase.condition.replace(/\s+/g, '-')}-case-study.md`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success('Case study downloaded as Markdown');
    } else if (format === 'text') {
      // Download as plain text
      const blob = new Blob([formattedContent], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${selectedCase.condition.replace(/\s+/g, '-')}-case-study.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success('Case study downloaded as Text');
    }
  };

  const navigateToAssistant = (question: string) => {
    // Store the question in sessionStorage to retrieve it on the Assistant page
    sessionStorage.setItem('quickQuestion', question);
    
    // Navigate to the assistant page
    navigate('/assistant');
  };

  const practiceMCQ = () => {
    if (!selectedCase) return;
    setShowPracticeModal(true);
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />
      
      <main className="flex-1">
        <div className="container mx-auto px-4 py-6">
          <h2 className="text-xl text-gray-700 font-medium mb-4">Create and practice with realistic optometry patient cases</h2>
          
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <Button
              className="flex-1 bg-sky-500 hover:bg-sky-600 border border-sky-600 text-white shadow-button"
              onClick={() => {
                setCondition(popularConditions[Math.floor(Math.random() * popularConditions.length)]);
                toast.info('Random condition selected. Click "Generate Case Study" to create it.');
              }}
            >
              Select Random Condition
            </Button>
            <Button
              variant="outline"
              className="flex-1 bg-white border-gray-300 hover:border-blue-500 text-gray-700"
              onClick={() => setShowSavedCases(!showSavedCases)}
            >
              {showSavedCases ? 'Hide Saved Cases' : 'View Saved Cases'}
            </Button>
          </div>
          
          {showSavedCases && (
            <div className="mb-8 bg-white rounded-xl overflow-hidden border border-gray-200 shadow-sm p-4">
              <h3 className="text-lg font-semibold mb-3">Saved Cases</h3>
              {savedCases.length === 0 ? (
                <p className="text-gray-500">No saved cases yet</p>
              ) : (
                <div className="space-y-2">
                  {savedCases.map(caseItem => (
                    <div 
                      key={caseItem.id}
                      onClick={() => handleOpenCase(caseItem)}
                      className="flex justify-between items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer"
                    >
                      <div>
                        <h4 className="font-medium">{caseItem.title}</h4>
                        <p className="text-xs text-gray-500">
                          {new Date(caseItem.createdAt).toLocaleString()}
                        </p>
                      </div>
                      <button
                        onClick={(e) => handleDeleteCase(caseItem.id, e)}
                        className="text-red-500 hover:text-red-700"
                      >
                        Delete
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
          
          <div className="tool-card mb-8">
            <h2 className="text-2xl font-bold text-black mb-2">Create a New Case Study</h2>
            <p className="text-gray-700 mb-6">Enter an eye condition to generate a realistic patient case</p>
            
            <form onSubmit={handleGenerate}>
              <div className="mb-4">
                <label htmlFor="condition" className="block text-gray-800 mb-2">Eye Condition</label>
                <Input
                  id="condition"
                  placeholder="Enter any eye condition (e.g., Diabetic Retinopathy)"
                  value={condition}
                  onChange={(e) => setCondition(e.target.value)}
                  className="w-full bg-white border-gray-300 focus:border-sky-500 text-gray-800"
                />
                <p className="text-sm text-gray-600 mt-2">
                  Enter any eye condition and we'll generate a detailed case study with patient demographics
                </p>
              </div>
              
              <Button
                type="submit"
                className="w-full bg-sky-500 hover:bg-sky-600 text-white shadow-button flex items-center justify-center gap-2"
                disabled={isGenerating}
              >
                <FlaskConical className="h-5 w-5" />
                {isGenerating ? 'Generating...' : 'Generate Case Study'}
              </Button>
            </form>
          </div>
          
          <div>
            <h3 className="text-xl font-bold text-gray-800 mb-4">Popular Conditions</h3>
            <div className="suggested-questions-container">
              {popularConditions.map(conditionName => (
                <Button
                  key={conditionName}
                  variant="outline"
                  className="bg-white border-gray-300 hover:border-sky-500 text-gray-800 whitespace-nowrap mx-1"
                  onClick={() => setCondition(conditionName)}
                >
                  {conditionName}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </main>

      <Dialog open={showCaseDialog} onOpenChange={setShowCaseDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>{selectedCase?.title}</DialogTitle>
            <DialogDescription>
              Generated on {selectedCase && new Date(selectedCase.createdAt).toLocaleString()}
            </DialogDescription>
          </DialogHeader>
          
          <ScrollArea className="h-[calc(90vh-200px)]">
            {/* Updated to use ReactMarkdown for consistent rendering with AI Assistant */}
            <div className="case-study-display markdown-content my-4">
              {selectedCase && (
                <ReactMarkdown 
                  remarkPlugins={[remarkGfm]}
                  components={{
                    table: ({ node, ...props }) => (
                      <div className="my-4 overflow-x-auto rounded-md border border-gray-200 shadow-sm">
                        <Table {...props} className="min-w-full divide-y divide-gray-200" />
                      </div>
                    ),
                    thead: ({ node, ...props }) => (
                      <thead {...props} className="bg-blue-50" />
                    ),
                    th: ({ node, ...props }) => (
                      <th {...props} className="px-4 py-3 text-left text-sm font-semibold text-blue-700" />
                    ),
                    td: ({ node, ...props }) => (
                      <td {...props} className="px-4 py-3 text-sm border-t border-gray-200" />
                    ),
                    tr: ({ node, children, ...props }) => (
                      <tr {...props} className="hover:bg-gray-50 transition-colors">{children}</tr>
                    ),
                    a: ({ node, ...props }) => (
                      <a {...props} className="text-blue-500 hover:text-blue-700 hover:underline" target="_blank" rel="noreferrer" />
                    ),
                    code: ({ node, ...props }) => (
                      <code {...props} className="bg-gray-100 px-1 py-0.5 rounded text-sm font-mono" />
                    ),
                    pre: ({ node, ...props }) => (
                      <pre {...props} className="bg-gray-100 p-4 rounded-md overflow-x-auto my-4" />
                    ),
                    h1: ({ node, ...props }) => (
                      <h1 {...props} className="text-2xl font-bold text-blue-700 mt-6 mb-4" />
                    ),
                    h2: ({ node, ...props }) => (
                      <h2 {...props} className="text-xl font-bold text-blue-600 mt-5 mb-3 pb-1 border-b border-gray-200" />
                    ),
                    h3: ({ node, ...props }) => (
                      <h3 {...props} className="text-lg font-bold text-blue-500 mt-4 mb-2" />
                    ),
                    strong: ({ node, ...props }) => (
                      <strong {...props} className="font-bold text-blue-700" />
                    ),
                    em: ({ node, ...props }) => (
                      <em {...props} className="italic text-blue-600" />
                    ),
                  }}
                >
                  {selectedCase.content}
                </ReactMarkdown>
              )}
            </div>
            
            {followupQuestions.length > 0 && (
              <div className="mt-6 border-t pt-4 case-study-section">
                <h3 className="text-lg font-medium mb-3">Follow-up Questions</h3>
                <div className="suggested-questions-container pb-2">
                  {followupQuestions.map((question, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      size="sm"
                      className="text-gray-800 mr-2 whitespace-normal text-left justify-start"
                      onClick={() => navigateToAssistant(question)}
                    >
                      {question}
                    </Button>
                  ))}
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={generateMoreFollowupQuestions}
                  disabled={isGeneratingFollowups}
                  className="mt-3"
                >
                  {isGeneratingFollowups ? 'Generating...' : 'Generate More Questions'}
                </Button>
              </div>
            )}
          </ScrollArea>
          
          <DialogFooter className="flex-col sm:flex-row gap-2 items-start sm:items-center justify-between">
            <div className="flex flex-wrap gap-2">
              <Button 
                variant="outline" 
                onClick={saveToNotes} 
                className="flex gap-1"
              >
                <Save className="h-4 w-4" />
                Save to Notes
              </Button>
              
              <Button
                variant="outline"
                onClick={practiceMCQ}
                className="flex gap-1"
              >
                <FileQuestion className="h-4 w-4" />
                Practice Quiz
              </Button>
              
              <Button
                variant="outline"
                onClick={() => {
                  if (!selectedCase) return;
                  navigateToAssistant(`Tell me more about ${selectedCase.condition} diagnosis and treatment options.`);
                }}
                className="flex gap-1"
              >
                <MessageCircle className="h-4 w-4" />
                Ask AI
              </Button>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="flex gap-1">
                    <Download className="h-4 w-4" />
                    Download <ArrowDown className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={() => handleDownload('markdown')}>
                    As Markdown (.md)
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleDownload('text')}>
                    As Text (.txt)
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            
            <Button variant="outline" onClick={() => setShowCaseDialog(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {selectedCase && (
        <CasePracticeModal
          isOpen={showPracticeModal}
          onClose={() => setShowPracticeModal(false)}
          caseTitle={selectedCase.title}
          condition={selectedCase.condition}
        />
      )}

      <Footer />
    </div>
  );
};

export default CaseStudies;
