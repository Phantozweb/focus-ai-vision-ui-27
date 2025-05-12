
import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import QuickQuestion from '@/components/QuickQuestion';
import ToolCard from '@/components/ToolCard';

const Index = () => {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header />
      
      <main className="container mx-auto px-4 py-8 flex-grow">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2 text-gray-800">Welcome to Focus.AI</h1>
          <p className="text-gray-600">Your AI assistant for optometry learning and practice</p>
        </div>

        {/* Quick Ask Section */}
        <section className="mb-8">
          <QuickQuestion />
        </section>

        {/* Main Tools Grid */}
        <section className="mb-10">
          <h2 className="text-2xl font-bold mb-4 text-gray-800">AI Tools</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <ToolCard 
              title="AI Assistant" 
              description="Get detailed answers to your optometry questions with our AI assistant"
              icon="chat"
              iconBg="bg-blue-500"
              path="/assistant"
            />
            <ToolCard 
              title="Study Notes" 
              description="Generate, edit and organize comprehensive study notes on key topics"
              icon="notes"
              iconBg="bg-green-500"
              path="/notes"
            />
            <ToolCard 
              title="Practice Quizzes" 
              description="Test your knowledge with AI-generated practice quizzes"
              icon="quiz"
              iconBg="bg-amber-500" 
              path="/quizzes"
            />
            <ToolCard 
              title="Case Studies" 
              description="Work through realistic patient scenarios and clinical cases"
              icon="academics"
              iconBg="bg-purple-500"
              path="/case-studies"
            />
            <ToolCard 
              title="Focus Notes" 
              description="Create, organize and share your own study notes and materials"
              icon="file-text"
              iconBg="bg-teal-500"
              path="/notes"
            />
            <ToolCard 
              title="Focus Share" 
              description="Collaborate and share study materials with peers in real-time"
              icon="search"
              iconBg="bg-indigo-500"
              path="https://focus-in.netlify.app"
              externalLink={true}
            />
          </div>
        </section>
        
        {/* AI Integration Section */}
        <section className="mb-10 bg-gradient-to-r from-sky-100 to-indigo-100 p-6 rounded-lg shadow-sm">
          <h2 className="text-2xl font-bold mb-4 text-gray-800">Focus AI Integration</h2>
          <p className="text-gray-700 mb-4">
            We're integrating advanced AI capabilities across all our tools to enhance your learning experience.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
            <div className="bg-white rounded-lg p-5 shadow-sm border border-gray-100">
              <h3 className="font-semibold text-lg mb-2 text-sky-800">AI-Enhanced Note Taking</h3>
              <p className="text-gray-600 text-sm">
                Create notes with AI assistance for grammar, content expansion, and academic reference integration.
              </p>
            </div>
            <div className="bg-white rounded-lg p-5 shadow-sm border border-gray-100">
              <h3 className="font-semibold text-lg mb-2 text-sky-800">Smart Collaboration</h3>
              <p className="text-gray-600 text-sm">
                AI will help facilitate knowledge sharing and provide insights when collaborating with peers.
              </p>
            </div>
          </div>
        </section>
        
        {/* Coming Soon Section - Modified to reflect integration */}
        <section className="mb-10">
          <h2 className="text-2xl font-bold mb-4 text-gray-800">Coming Soon</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6 relative overflow-hidden">
              <div className="absolute top-2 right-2 bg-amber-100 text-amber-800 text-xs px-2 py-1 rounded-full">Coming Soon</div>
              <h3 className="text-lg font-semibold mb-2 text-gray-800">Focus AI Hub</h3>
              <p className="text-gray-600 text-sm">A central dashboard to control AI settings across all tools and customize your learning experience.</p>
              <a href="https://focus-in.netlify.app" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline text-sm inline-block mt-3">
                Learn more
              </a>
            </div>
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6 relative overflow-hidden">
              <div className="absolute top-2 right-2 bg-amber-100 text-amber-800 text-xs px-2 py-1 rounded-full">Coming Soon</div>
              <h3 className="text-lg font-semibold mb-2 text-gray-800">Focus EMR</h3>
              <p className="text-gray-600 text-sm">Electronic Medical Records system designed specifically for optometry students and practitioners.</p>
              <a href="https://focus-in.netlify.app" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline text-sm inline-block mt-3">
                Learn more
              </a>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Index;
