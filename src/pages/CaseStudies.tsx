
import React, { useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/sonner';

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

const CaseStudies = () => {
  const [condition, setCondition] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!condition.trim()) return;

    setIsGenerating(true);
    
    // Simulate case generation (in a real app, you'd make an API call)
    setTimeout(() => {
      toast.success(`Generated case study for ${condition}`);
      setIsGenerating(false);
      // In a real app, you'd navigate to the generated case or display it
    }, 1500);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1">
        <div className="container mx-auto px-4 py-6">
          <h2 className="text-xl text-gray-400 mb-4">Create and practice with realistic optometry patient cases</h2>
          
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <Button
              variant="outline"
              className="flex-1 bg-darkBg-card border-slate-700 hover:border-blue-500 text-white"
              onClick={() => toast.info('This would generate a randomized case')}
            >
              Generate Case
            </Button>
            <Button
              variant="outline"
              className="flex-1 bg-darkBg-card/50 border-slate-700 hover:border-blue-500 text-slate-400"
              onClick={() => toast.info('This would show your saved cases')}
            >
              View Case
            </Button>
          </div>
          
          <div className="tool-card mb-8">
            <h2 className="text-2xl font-bold text-white mb-2">Create a New Case Study</h2>
            <p className="text-slate-400 mb-6">Enter an eye condition to generate a realistic patient case</p>
            
            <form onSubmit={handleGenerate}>
              <div className="mb-4">
                <label htmlFor="condition" className="block text-white mb-2">Eye Condition</label>
                <Input
                  id="condition"
                  placeholder="Enter any eye condition (e.g., Diabetic Retinopathy)"
                  value={condition}
                  onChange={(e) => setCondition(e.target.value)}
                  className="w-full bg-darkBg border-slate-700 focus:border-focusBlue text-white"
                />
                <p className="text-sm text-slate-500 mt-2">
                  Enter any eye condition and we'll generate a detailed case study with Tamil patient demographics
                </p>
              </div>
              
              <Button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center gap-2"
                disabled={isGenerating}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                </svg>
                Generate Case Study
              </Button>
            </form>
          </div>
          
          <div>
            <h3 className="text-xl font-bold text-white mb-4">Popular Conditions</h3>
            <div className="flex flex-wrap gap-2">
              {popularConditions.map(condition => (
                <Button
                  key={condition}
                  variant="outline"
                  className="bg-darkBg border-slate-700 hover:border-blue-500 text-white"
                  onClick={() => setCondition(condition)}
                >
                  {condition}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default CaseStudies;
