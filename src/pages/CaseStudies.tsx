import React, { useState, useEffect } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { FlaskConical, FileText, Save, Download, ArrowDown, X, FileQuestion } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ScrollArea } from '@/components/ui/scroll-area';
import { generateGeminiResponse } from '@/utils/geminiApi';
import { useNavigate } from 'react-router-dom';
import CasePracticeModal from '@/components/CasePracticeModal';
import CaseMarkdown from '@/components/CaseMarkdown';
import { useIsMobile } from '@/hooks/use-mobile';
import CaseStudyQA from '@/components/CaseStudyQA';

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
  const isMobile = useIsMobile();

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
      9. Clinical Findings: Include a table for visual acuity measurements using standard notation like 6/6, 6/9, etc. Include columns for OD, OS, best corrected VA
      10. Slit Lamp Examination: Include a table with findings for anterior and posterior segment
      11. Diagnostic Tests: Include results formatted in tables when appropriate. Include keratometry readings (K-readings), IOP values, and other relevant measurements.
      12. Assessment: Working diagnosis with ICD-10 code
      13. Plan: Treatment recommendations
      14. Follow-up: Recommended timeline and specific tests
      
      Make the case realistic, clinically accurate and educational for optometry students. Use proper medical terminology and formatting with tables for key clinical measurements. Use standard optometric notation (e.g., 6/6, 6/9 for visual acuity rather than 20/20, 20/30).`;
      
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
              <FlaskConical className="h-5 w-5 mr-2" />
              <span>Select Random Condition</span>
            </Button>
            <Button
              variant="outline"
              className="flex-1 bg-white border-gray-300 hover:border-blue-500 text-gray-700"
              onClick={() => setShowSavedCases(!showSavedCases)}
            >
              <FileText className="h-5 w-5 mr-2" />
              <span>
                {showSavedCases ? 'Hide Saved Cases' : 'View Saved Cases'}
              </span>
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
            <div className="flex flex-wrap gap-2">
              {popularConditions.map(conditionName => (
                <Button
                  key={conditionName}
                  variant="outline"
                  className="bg-white border-gray-300 hover:border-sky-500 text-gray-800"
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
        <DialogContent className="max-w-4xl max-h-[90vh] p-0 rounded-xl">
          <DialogHeader className="p-4 border-b">
            <DialogTitle className="text-xl text-blue-700">{selectedCase?.title}</DialogTitle>
            <DialogDescription>
              Generated on {selectedCase && new Date(selectedCase.createdAt).toLocaleString()}
            </DialogDescription>
            <DialogClose className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
              <X className="h-4 w-4 text-gray-500" />
            </DialogClose>
          </DialogHeader>
          
          <ScrollArea className="h-[calc(90vh-180px)]">
            <div className="p-4">
              {/* Case study content with CaseMarkdown component */}
              <div className="case-study-display my-4">
                {selectedCase && (
                  <CaseMarkdown content={selectedCase.content} />
                )}
              </div>
              
              {/* Follow-up questions now as interactive buttons */}
              {selectedCase && followupQuestions.length > 0 && (
                <CaseStudyQA
                  condition={selectedCase.condition}
                  caseContent={selectedCase.content}
                  followupQuestions={followupQuestions}
                />
              )}
            </div>
          </ScrollArea>
          
          <DialogFooter className="flex-col sm:flex-row gap-2 items-start sm:items-center justify-between border-t p-4">
            <div className="flex flex-wrap gap-2">
              <Button 
                variant="outline" 
                onClick={saveToNotes} 
                className="flex items-center gap-1"
                size={isMobile ? "sm" : "default"}
              >
                <Save className="h-4 w-4" />
                {!isMobile && <span>Save to Notes</span>}
              </Button>
              
              <Button
                variant="outline"
                onClick={practiceMCQ}
                className="flex items-center gap-1"
                size={isMobile ? "sm" : "default"}
              >
                <FileQuestion className="h-4 w-4" />
                {!isMobile && <span>Practice Quiz</span>}
              </Button>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="outline" 
                    className="flex items-center gap-1"
                    size={isMobile ? "sm" : "default"}
                  >
                    <Download className="h-4 w-4" />
                    {!isMobile && <span>Download</span>} <ArrowDown className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="bg-white">
                  <DropdownMenuItem onClick={() => handleDownload('markdown')} className="cursor-pointer">
                    As Markdown (.md)
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleDownload('text')} className="cursor-pointer">
                    As Text (.txt)
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            
            <Button 
              variant="outline" 
              onClick={() => setShowCaseDialog(false)}
              className="text-gray-700 hover:bg-gray-100"
              size={isMobile ? "sm" : "default"}
            >
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
