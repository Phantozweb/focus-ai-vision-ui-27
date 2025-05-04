
import React, { useState, useEffect } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/sonner';
import { FlaskConical, FileText } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

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
}

const CaseStudies = () => {
  const [condition, setCondition] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [savedCases, setSavedCases] = useState<SavedCase[]>([]);
  const [showSavedCases, setShowSavedCases] = useState(false);
  const [selectedCase, setSelectedCase] = useState<SavedCase | null>(null);
  const [showCaseDialog, setShowCaseDialog] = useState(false);

  useEffect(() => {
    // Load saved cases from localStorage
    const savedCasesFromStorage = localStorage.getItem('generatedCases');
    if (savedCasesFromStorage) {
      setSavedCases(JSON.parse(savedCasesFromStorage));
    }
  }, []);

  const handleGenerate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!condition.trim()) return;

    setIsGenerating(true);
    
    // Simulate case generation (in a real app, you'd make an API call)
    setTimeout(() => {
      const newCase: SavedCase = {
        id: Date.now().toString(),
        title: `Case Study: ${condition}`,
        content: `This is a generated case study about ${condition}. The patient presents with symptoms typical of this condition including... [detailed case would be here]`,
        condition: condition,
        createdAt: Date.now()
      };
      
      const updatedCases = [newCase, ...savedCases];
      setSavedCases(updatedCases);
      localStorage.setItem('generatedCases', JSON.stringify(updatedCases));
      
      toast.success(`Generated case study for ${condition}`);
      setIsGenerating(false);
      setSelectedCase(newCase);
      setShowCaseDialog(true);
    }, 1500);
  };

  const handleOpenCase = (caseItem: SavedCase) => {
    setSelectedCase(caseItem);
    setShowCaseDialog(true);
  };

  const handleDeleteCase = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updatedCases = savedCases.filter(caseItem => caseItem.id !== id);
    setSavedCases(updatedCases);
    localStorage.setItem('generatedCases', JSON.stringify(updatedCases));
    toast.success('Case deleted');
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
              onClick={() => toast.info('This would generate a randomized case')}
            >
              Generate Random Case
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
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>{selectedCase?.title}</DialogTitle>
            <DialogDescription>
              Generated on {selectedCase && new Date(selectedCase.createdAt).toLocaleString()}
            </DialogDescription>
          </DialogHeader>
          <div className="mt-4">
            <p className="whitespace-pre-line">{selectedCase?.content}</p>
          </div>
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
};

export default CaseStudies;
