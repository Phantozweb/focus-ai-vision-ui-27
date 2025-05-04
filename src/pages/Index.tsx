
import React from 'react';
import { Link } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import QuickQuestion from '@/components/QuickQuestion';
import ToolCard from '@/components/ToolCard';
import DonationForm from '@/components/DonationForm';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import FeaturedCaseStudy from '@/components/FeaturedCaseStudy';

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="container mx-auto px-4 py-12 md:py-16">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-black mb-6 leading-tight">
              Your AI-powered learning companion for optometry studies
            </h1>
            <p className="text-gray-700 text-lg mb-8 max-w-2xl mx-auto">
              Focus.AI helps optometry students master complex concepts, create study notes, practice with quizzes, and access expert assistance anytime.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild className="px-6 py-6 text-lg bg-sky-500 hover:bg-sky-600 text-white">
                <Link to="/assistant">Get Started <ArrowRight className="ml-2 h-5 w-5" /></Link>
              </Button>
            </div>
          </div>
        </section>
        
        {/* Quick Question Section */}
        <section className="container mx-auto px-4 py-6">
          <QuickQuestion />
        </section>

        {/* Featured Case Study Section */}
        <section className="container mx-auto px-4 py-6">
          <FeaturedCaseStudy />
        </section>
        
        {/* Features Section */}
        <section className="container mx-auto px-4 py-12">
          <div className="text-center mb-10">
            <h2 className="text-2xl md:text-3xl font-bold text-black mb-4">AI-Powered Learning Tools</h2>
            <p className="text-gray-700 max-w-xl mx-auto">
              Everything you need to excel in your optometry studies
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <ToolCard 
              title="AI Assistant" 
              description="Get instant answers to your optometry questions from a specialized AI trained on optometry textbooks" 
              icon="chat" 
              iconBg="bg-sky-500"
              path="/assistant"
            />
            <ToolCard 
              title="Study Notes" 
              description="Create and organize simplified study materials with key concepts highlighted for better retention" 
              icon="notes" 
              iconBg="bg-sky-500"
              path="/notes"
            />
            <ToolCard 
              title="Quiz Generator" 
              description="Test your knowledge with customizable quizzes tailored to your curriculum and learning goals" 
              icon="quiz" 
              iconBg="bg-sky-500"
              path="/quizzes"
            />
          </div>
        </section>
        
        {/* Donation Section */}
        <section className="container mx-auto px-4 py-8 mb-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex flex-col justify-center">
              <h2 className="text-2xl md:text-3xl font-bold text-black mb-4">Donate to Support Focus.AI</h2>
              <p className="text-gray-700 mb-4">
                Focus.AI is continually evolving to better serve optometry students. Your support helps us add new features, expand our knowledge base, and keep the service accessible.
              </p>
              <ul className="space-y-3 mb-6">
                <li className="flex items-center text-gray-700">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-sky-500 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Enhanced AI training on specialized optometry content
                </li>
                <li className="flex items-center text-gray-700">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-sky-500 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Development of new learning tools and features
                </li>
                <li className="flex items-center text-gray-700">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-sky-500 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Server costs to keep Focus.AI running smoothly
                </li>
              </ul>
              <div className="text-gray-700">
                <p>For any questions, contact us at: <code className="bg-gray-100 rounded px-2 py-1 text-black">iamsirenjeev@gmail.com</code></p>
              </div>
            </div>
            
            <div>
              <DonationForm upiId="iamsirenjeev@oksbi" />
            </div>
          </div>
        </section>
        
        {/* CTA Section */}
        <section className="container mx-auto px-4 py-12 mb-10">
          <div className="bg-gradient-to-r from-sky-100 to-blue-100 rounded-2xl p-8 text-center">
            <h2 className="text-2xl md:text-3xl font-bold text-black mb-4">Ready to transform your optometry studies?</h2>
            <p className="text-gray-700 mb-6 max-w-xl mx-auto">
              Join other students who are already using Focus.AI to improve their learning experience.
            </p>
            <Button asChild className="px-6 py-6 text-lg bg-sky-500 hover:bg-sky-600 text-white">
              <Link to="/assistant">Get Started Now</Link>
            </Button>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Index;
