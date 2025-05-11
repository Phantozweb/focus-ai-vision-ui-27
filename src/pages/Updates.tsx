
import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { CalendarDays, CheckCircle, Clock } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

interface UpdateItem {
  id: number;
  date: string;
  title: string;
  description: string;
  category: 'feature' | 'improvement' | 'fix';
}

const updates: UpdateItem[] = [
  {
    id: 1,
    date: '2023-05-10',
    title: 'Enhanced Image Analysis',
    description: 'Improved AI image analysis capabilities for better diagnosis of eye conditions from uploaded images.',
    category: 'feature'
  },
  {
    id: 2,
    date: '2023-05-08',
    title: 'Expanded Quiz Question Types',
    description: 'Added new question types including matching and short answer questions to better test understanding.',
    category: 'feature'
  },
  {
    id: 3,
    date: '2023-05-05',
    title: 'Updated UI Interface',
    description: 'Refreshed user interface with improved navigation and accessibility features.',
    category: 'improvement'
  },
  {
    id: 4,
    date: '2023-05-02',
    title: 'Fixed Response Truncation',
    description: 'Resolved issues with AI responses being cut off by increasing token limits.',
    category: 'fix'
  },
  {
    id: 5,
    date: '2023-04-28',
    title: 'New Study Notes Features',
    description: 'Added tagging and advanced search functionality to study notes for better organization.',
    category: 'feature'
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
              Last updated: May 10, 2023
            </div>
          </div>
          
          <p className="text-gray-600 mb-8">
            Stay informed about the latest improvements, features, and bug fixes to Focus. We're constantly working to enhance your learning experience.
          </p>
          
          <div className="space-y-6">
            {updates.map((update) => (
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

          <Separator className="my-12" />
          
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 mt-8">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Support Focus</h2>
            <p className="text-gray-600 mb-4">
              Focus is developed by a small team passionate about improving optometry education. Your support helps us continue building valuable tools for optometry students worldwide.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 mt-6">
              <a 
                href="https://www.buymeacoffee.com/focus" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="bg-amber-500 hover:bg-amber-600 text-white font-medium py-2 px-6 rounded-md text-center flex-1 transition-colors flex items-center justify-center gap-2">
                <span>Buy us a coffee</span>
              </a>
              <a 
                href="mailto:feedback@focus-in.netlify.app" 
                className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-6 rounded-md text-center flex-1 transition-colors">
                Send Feedback
              </a>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Updates;
