
import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/sonner';
import { PlusCircle } from 'lucide-react';

const sampleNotes = [
  {
    title: "Ocular Anatomy",
    excerpt: "The eye is composed of three main layers: the outer layer (sclera and cornea), the middle layer (iris, ciliary body, and choroid), and the inner layer (retina)...",
    lastUpdated: "May 1, 2025",
    tags: ["anatomy", "basics"]
  },
  {
    title: "Refractive Errors",
    excerpt: "Common refractive errors include myopia (nearsightedness), hyperopia (farsightedness), astigmatism, and presbyopia...",
    lastUpdated: "May 2, 2025",
    tags: ["clinical", "refraction"]
  },
  {
    title: "Glaucoma Classification",
    excerpt: "Types of glaucoma include open-angle glaucoma, angle-closure glaucoma, normal-tension glaucoma, and secondary glaucoma...",
    lastUpdated: "May 3, 2025",
    tags: ["pathology", "clinical"]
  }
];

const StudyNotes = () => {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />
      
      <main className="flex-1">
        <div className="container mx-auto px-4 py-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-xl text-blue-500 font-medium">Study Notes</h1>
            <Button 
              onClick={() => toast.info("This would create a new note")}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              <PlusCircle className="mr-1 h-4 w-4" />
              New Note
            </Button>
          </div>
          
          <div className="space-y-4">
            {sampleNotes.map((note, index) => (
              <div 
                key={index} 
                className="tool-card cursor-pointer hover:scale-[1.01] transition-transform"
                onClick={() => toast.info(`This would open the "${note.title}" note`)}
              >
                <h2 className="text-lg text-gray-800 font-bold mb-2">{note.title}</h2>
                <p className="text-gray-700 mb-3 line-clamp-2">{note.excerpt}</p>
                <div className="flex justify-between items-center">
                  <div className="flex gap-2">
                    {note.tags.map((tag, i) => (
                      <span key={i} className="px-2 py-1 text-xs rounded bg-gray-100 text-blue-600">
                        {tag}
                      </span>
                    ))}
                  </div>
                  <span className="text-xs text-gray-600">Last updated: {note.lastUpdated}</span>
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-8 p-6 rounded-xl border border-dashed border-gray-300 hover:border-blue-500/50 transition-colors text-center cursor-pointer" onClick={() => toast.info("This would create a new note")}>
            <p className="text-gray-600">+ Create a new study note</p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default StudyNotes;
