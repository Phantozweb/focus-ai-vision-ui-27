import React, { useState, useEffect } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { FlaskConical, FileText, Save, Download, X, FileQuestion } from 'lucide-react';
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
  const [showCaseView, setShowCaseView] = useState(false);
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
      const prompt = `Generate a comprehensive clinical case study about a patient with ${condition} structured as a complete Electronic Medical Record (EMR). 
      
      Include all the following sections with clear headings:
      
      1. Patient Demographics: Include full name, age, gender, occupation, and contact details
      2. Chief Complaint: Quote the patient's exact words regarding their visual symptoms
      3. History of Present Illness: Include detailed timeline, symptom progression, and severity
      4. Past Ocular History: Previous diagnoses, surgeries, trauma, and treatments
      5. Medical History: List all systemic conditions, current medications with dosages and frequency, allergies
      6. Family History: Comprehensive ocular and systemic conditions in immediate family
      7. Social History: Occupation, smoking status, alcohol intake, relevant hobbies affecting vision
      8. Clinical Findings: 
         - Visual acuity (use 6/6 notation, not 20/20)
         - Refraction data with sphere, cylinder, and axis values for both eyes
         - Ocular motility assessment
         - Pupillary assessment with sizes in mm and reactivity
      9. Slit Lamp Examination: 
         - Anterior segment findings with detailed descriptions
         - Corneal assessment including fluorescein staining pattern if relevant
         - Lens clarity with grading if relevant
      10. Intraocular Pressure: Values for both eyes with time of measurement and method
      11. Fundus Examination: Detailed description of disc, cup-to-disc ratio, vessels, macula
      12. Special Tests:
          - Keratometry readings (K-readings) with values
          - Topography if relevant to condition
          - OCT findings with thickness values if relevant
          - Visual fields results if relevant
          - Color vision testing if relevant
      13. Diagnosis: Primary and differential diagnoses with ICD-10 codes
      14. Treatment Plan: Detailed medications with dosage, frequency, duration
      15. Follow-up Instructions: Timeline and specific tests needed
      16. Patient Education: Specific instructions provided
      
      Present all measurements in formatted tables for easy reading. Use standard ophthalmic abbreviations (OD, OS, OU). Include realistic, specific values for all measurements appropriate for the condition. Make the case comprehensive but clinically accurate for ${condition}.`;
      
      const caseContent = await generateGeminiResponse(prompt);
      
      // Generate follow-up questions
      const followupPrompt = `Based on this detailed EMR case study about a patient with ${condition}, generate 6 follow-up questions that would help optometry students think critically about the case. 
      
      Questions should cover:
      - Clinical interpretation of specific test results mentioned in the case
      - Differential diagnosis considerations
      - Treatment plan reasoning
      - Prognosis assessment based on findings
      - Potential complications to monitor
      - Further testing that might be warranted

      Format as a simple bulleted list. Keep questions concise (under 15 words if possible).`;
      
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
      setShowCaseView(true);
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
    setShowCaseView(true);
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

  const handleDownload = () => {
    if (!selectedCase) return;
    
    const formattedContent = 
      `# ${selectedCase.title}\n\n` + 
      `Created: ${new Date(selectedCase.createdAt).toLocaleString()}\n\n` +
      `${selectedCase.content}\n\n` +
      (followupQuestions.length > 0 ? 
        `## Follow-up Questions\n\n${followupQuestions.map(q => `- ${q}`).join('\n')}\n` : '');
    
    // Download as markdown only
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
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <Button
              variant="outline"
              className="flex-1 bg-white border-gray-300 hover:border-blue-500 text-gray-700"
              onClick={() => setShowSavedCases(!showSavedCases)}
            >
              <FileText className="h-5 w-5 mr-2" />
              <span className={isMobile ? "sr-only" : ""}>
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
        </div>
      </main>

      {/* Improved full-screen case view with better mobile support */}
      {showCaseView && selectedCase && (
        <div className="fixed inset-0 z-50 bg-white overflow-hidden">
          <div className="h-full flex flex-col">
            <div className="flex justify-between items-center p-3 sm:p-4 border-b">
              <div className="max-w-[80%]">
                <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-blue-700 truncate">{selectedCase.title}</h1>
                <p className="text-xs sm:text-sm text-gray-600 truncate">
                  Generated on {new Date(selectedCase.createdAt).toLocaleString()}
                </p>
              </div>
              <Button 
                variant="ghost" 
                size="icon" 
                className="rounded-full h-8 w-8 sm:h-10 sm:w-10 hover:bg-gray-100 flex-shrink-0"
                onClick={() => setShowCaseView(false)}
              >
                <X className="h-5 w-5 sm:h-6 sm:w-6 text-gray-600" />
              </Button>
            </div>

            <div className="flex flex-col lg:flex-row h-[calc(100vh-64px)] overflow-hidden">
              {/* Main case content with improved mobile scrolling */}
              <div className="w-full lg:w-3/4 h-full overflow-hidden flex flex-col">
                <ScrollArea className="flex-1 p-3 sm:p-4 md:p-6">
                  <div className="max-w-4xl mx-auto">
                    {/* Action buttons moved above the content as icon-only */}
                    <div className="flex justify-end gap-2 mb-4">
                      <Button 
                        variant="outline" 
                        onClick={saveToNotes} 
                        size="icon"
                        className="h-8 w-8 bg-white hover:bg-gray-50" 
                        title="Save to Notes"
                      >
                        <Save className="h-4 w-4" />
                      </Button>
                      
                      <Button
                        variant="outline"
                        onClick={handleDownload}
                        size="icon"
                        className="h-8 w-8 bg-white hover:bg-gray-50" 
                        title="Download as Markdown"
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                    
                    <CaseMarkdown 
                      content={selectedCase.content} 
                      className="prose max-w-none px-0 sm:px-2"
                    />
                  </div>
                </ScrollArea>
                
                <div className="border-t p-3 sm:p-4">
                  <div className="max-w-4xl mx-auto">
                    <CaseStudyQA
                      condition={selectedCase.condition}
                      caseContent={selectedCase.content}
                      followupQuestions={followupQuestions}
                    />
                  </div>
                </div>
              </div>
              
              {/* Removed the sidebar since we moved the action buttons */}
              <div className="lg:w-1/4 lg:border-l border-gray-200 bg-gray-50 p-3 sm:p-4 overflow-auto hidden lg:block">
                <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">Options</h3>
                <Button 
                  variant="outline" 
                  onClick={() => generateMoreFollowupQuestions()} 
                  disabled={isGeneratingFollowups}
                  className="justify-start w-full text-sm"
                >
                  {isGeneratingFollowups ? 'Generating...' : 'Generate More Questions'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

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
