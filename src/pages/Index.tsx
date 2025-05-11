
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
              description="Generate and organize comprehensive study notes on key topics"
              icon="notes"
              iconBg="bg-green-500"
              path="/notes"
            />
            <ToolCard 
              title="Indian Curriculum" 
              description="Access standardized one-nation one-syllabus 5-year BSc Optometry curriculum"
              icon="academics"
              iconBg="bg-purple-500"
              path="/indian-curriculum"
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
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Index;
