
import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { CalendarDays, CheckCircle, Clock, Calendar, Settings } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Link } from 'react-router-dom';

interface UpdateItem {
  id: number;
  date: string;
  title: string;
  description: string;
  category: 'feature' | 'improvement' | 'fix';
}

interface VersionInfo {
  version: string;
  releaseDate: string;
  description: string;
  highlights: string[];
  updates: UpdateItem[];
}

const versionHistory: VersionInfo[] = [
  {
    version: "2.0",
    releaseDate: "2025-04-15",
    description: "Major update with image analysis capabilities and improved UI",
    highlights: [
      "Added image analysis for OCT and ophthalmological reports",
      "Completely redesigned user interface",
      "Enhanced study notes organization system",
      "Improved AI Assistant with chat history",
      "Added multiple format modes (simplify, student-friendly, clinical focus)"
    ],
    updates: [
      {
        id: 1,
        date: "2025-04-15",
        title: "Image Analysis Integration",
        description: "AI can now interpret OCT and ophthalmological reports, providing detailed analysis and learning opportunities.",
        category: "feature"
      },
      {
        id: 2,
        date: "2025-04-15",
        title: "Enhanced Study Notes",
        description: "Complete redesign of the study notes section with better organization, tagging, and search functionality.",
        category: "improvement"
      },
      {
        id: 3,
        date: "2025-04-15",
        title: "Advanced Quiz System",
        description: "Support for various question types including multiple choice, short answer, match the following, and weighted questions (1, 2, 5 marks).",
        category: "improvement"
      },
      {
        id: 4,
        date: "2025-04-15",
        title: "AI Assistant Chat History",
        description: "Chat history is now saved and accessible, making it easier to reference previous conversations.",
        category: "feature"
      },
      {
        id: 5,
        date: "2025-04-15",
        title: "Quick Format Modes",
        description: "New modes for AI responses: simplify, student-friendly, and clinical focus.",
        category: "feature"
      }
    ]
  },
  {
    version: "1.0",
    releaseDate: "2023-04-16",
    description: "Initial release with basic AI assistant and learning tools",
    highlights: [
      "Text-based AI assistant for optometry questions",
      "Simple quiz system with basic question types",
      "Case study generator with virtual patient scenarios",
      "Basic note-saving functionality (browser-based)"
    ],
    updates: [
      {
        id: 6,
        date: "2023-04-16",
        title: "Initial AI Assistant Release",
        description: "Basic AI assistant providing text-based responses to optometry questions.",
        category: "feature"
      },
      {
        id: 7,
        date: "2023-04-16",
        title: "Quiz System Launch",
        description: "First version of the quiz system with basic question types and functionality.",
        category: "feature"
      },
      {
        id: 8,
        date: "2023-04-16",
        title: "Case Study Generator",
        description: "Tool to generate virtual case studies and suggested questions (without answers).",
        category: "feature"
      },
      {
        id: 9,
        date: "2023-04-16",
        title: "Basic Notes Feature",
        description: "Simple note-saving functionality with browser-based storage.",
        category: "feature"
      },
      {
        id: 10,
        date: "2023-04-16",
        title: "Known Issues",
        description: "Notes saving issues, lack of organization, mobile compatibility problems with quiz section.",
        category: "fix"
      }
    ]
  }
];

const Updates = () => {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-bold text-gray-800">Latest Updates</h1>
            <div className="bg-blue-100 text-blue-800 px-4 py-1 rounded-full text-sm font-medium flex items-center">
              <Clock className="w-4 h-4 mr-1" />
              Current Version: 2.0
            </div>
          </div>
          
          <p className="text-gray-600 mb-8">
            Stay informed about the latest improvements, features, and bug fixes to Focus.AI. We're constantly working to enhance your learning experience.
          </p>
          
          <Tabs defaultValue="v2.0" className="mb-10">
            <TabsList className="mb-6">
              {versionHistory.map(version => (
                <TabsTrigger key={version.version} value={`v${version.version}`} className="flex items-center gap-1">
                  <span>Version {version.version}</span>
                </TabsTrigger>
              ))}
            </TabsList>
            
            {versionHistory.map(version => (
              <TabsContent key={version.version} value={`v${version.version}`}>
                <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4">
                    <h2 className="text-2xl font-bold text-gray-800">Version {version.version}</h2>
                    <div className="flex items-center mt-2 sm:mt-0 text-sm text-gray-500">
                      <Calendar className="h-4 w-4 mr-1" />
                      Released: {version.releaseDate}
                    </div>
                  </div>
                  <p className="text-gray-600 mb-4">{version.description}</p>
                  
                  <h3 className="font-semibold text-lg mb-2">Key Highlights:</h3>
                  <ul className="list-disc pl-5 mb-6 space-y-1 text-gray-600">
                    {version.highlights.map((highlight, index) => (
                      <li key={index}>{highlight}</li>
                    ))}
                  </ul>
                </div>
                
                <div className="space-y-4">
                  <h3 className="text-xl font-semibold mb-2">Detailed Changes:</h3>
                  {version.updates.map(update => (
                    <Card key={update.id} className="border-l-4 border-l-blue-500 hover:shadow-md transition-shadow">
                      <CardHeader className="pb-2">
                        <div className="flex justify-between items-start">
                          <CardTitle className="text-lg">{update.title}</CardTitle>
                          <div className="flex items-center text-sm text-gray-500">
                            <CalendarDays className="h-4 w-4 mr-1" />
                            {update.date}
                          </div>
                        </div>
                        <CardDescription className="flex items-center">
                          {update.category === 'feature' && (
                            <span className="bg-green-100 text-green-800 text-xs px-2 py-0.5 rounded">New Feature</span>
                          )}
                          {update.category === 'improvement' && (
                            <span className="bg-blue-100 text-blue-800 text-xs px-2 py-0.5 rounded">Improvement</span>
                          )}
                          {update.category === 'fix' && (
                            <span className="bg-amber-100 text-amber-800 text-xs px-2 py-0.5 rounded">Bug Fix</span>
                          )}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <p className="text-gray-600">{update.description}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>
            ))}
          </Tabs>
          
          <Card className="border-l-4 border-l-purple-500 mt-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-purple-500" />
                Future Updates
              </CardTitle>
              <CardDescription>Coming soon to Focus.AI</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                We're constantly working on improving Focus.AI. Here are some features we're planning to add in future updates:
              </p>
              <ul className="list-disc pl-5 space-y-2 text-gray-600">
                <li>Enhanced image analysis with 3D visualization of eye structures</li>
                <li>Integration with digital textbooks and research papers</li>
                <li>Mobile application for Android and iOS</li>
                <li>Collaborative study tools for group learning</li>
                <li>Expanded case study database with more clinical scenarios</li>
              </ul>
            </CardContent>
          </Card>
          
          <div className="flex justify-center mt-10">
            <Link 
              to="/support" 
              className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-6 rounded-md inline-flex items-center gap-2 transition-colors">
              <Settings className="h-4 w-4" />
              Support Our Development
            </Link>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Updates;
