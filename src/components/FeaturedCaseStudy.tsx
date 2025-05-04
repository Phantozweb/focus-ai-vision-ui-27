
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { FileText, ArrowRight, MessageCircle, FileQuestion } from 'lucide-react';

const FeaturedCaseStudy = () => {
  const featuredCase = {
    title: "Diabetic Retinopathy Case",
    description: "A 52-year-old male with type 2 diabetes presents with gradually decreasing vision in both eyes over the past 6 months. Explore this clinical case to understand diagnostic techniques, treatment options, and patient management.",
    imageSrc: "https://images.unsplash.com/photo-1618022346306-e549e57b5b7d?crop=entropy&cs=tinysrgb&fit=crop&h=200&q=80&w=350"
  };

  return (
    <div className="tool-card">
      <div className="flex items-center gap-3 mb-4">
        <div className="feature-icon bg-sky-500">
          <FileText className="h-6 w-6" />
        </div>
        <h2 className="text-2xl font-bold text-black">Featured Case Study</h2>
      </div>
      
      <div className="flex flex-col md:flex-row gap-6">
        <div className="md:w-1/3">
          <img 
            src={featuredCase.imageSrc} 
            alt={featuredCase.title}
            className="w-full h-48 object-cover rounded-lg mb-4"
          />
        </div>
        
        <div className="md:w-2/3">
          <h3 className="text-xl font-bold text-gray-800 mb-2">{featuredCase.title}</h3>
          <p className="text-gray-700 mb-4">{featuredCase.description}</p>
          
          <div className="flex flex-wrap gap-3">
            <Button asChild className="bg-sky-500 hover:bg-sky-600 text-white">
              <Link to="/case-studies">
                View Case Study <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
            
            <Button asChild variant="outline" className="bg-white border-gray-300 text-gray-800">
              <Link to="/assistant" state={{ context: "diabetic retinopathy" }}>
                <MessageCircle className="mr-1 h-4 w-4" /> Ask Questions
              </Link>
            </Button>
            
            <Button asChild variant="outline" className="bg-white border-gray-300 text-gray-800">
              <Link to="/case-studies">
                <FileQuestion className="mr-1 h-4 w-4" /> Practice Quiz
              </Link>
            </Button>
          </div>
        </div>
      </div>
      
      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">Suggested learning path</span>
          <Link to="/case-studies" className="text-sm text-blue-500 hover:text-blue-700">
            View all case studies
          </Link>
        </div>
        <div className="flex mt-2 overflow-x-auto pb-2 suggested-questions-container">
          <Button variant="outline" size="sm" asChild className="bg-white border-gray-300 text-gray-800 whitespace-nowrap mx-1">
            <Link to="/assistant">Learn about stages of DR</Link>
          </Button>
          <Button variant="outline" size="sm" asChild className="bg-white border-gray-300 text-gray-800 whitespace-nowrap mx-1">
            <Link to="/assistant">OCT findings in DME</Link>
          </Button>
          <Button variant="outline" size="sm" asChild className="bg-white border-gray-300 text-gray-800 whitespace-nowrap mx-1">
            <Link to="/assistant">Treatment options</Link>
          </Button>
          <Button variant="outline" size="sm" asChild className="bg-white border-gray-300 text-gray-800 whitespace-nowrap mx-1">
            <Link to="/assistant">BCVA assessment</Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default FeaturedCaseStudy;
