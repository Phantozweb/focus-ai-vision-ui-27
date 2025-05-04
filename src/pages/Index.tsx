
import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import QuickQuestion from '@/components/QuickQuestion';
import ToolCard from '@/components/ToolCard';
import FeatureSection from '@/components/FeatureSection';
import TestimonialItem from '@/components/TestimonialItem';
import TimelineItem from '@/components/TimelineItem';

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1">
        <section className="container mx-auto px-4 py-10">
          <h1 className="text-3xl sm:text-4xl font-bold text-white text-center mb-2">
            Your AI-powered learning companion for optometry studies
          </h1>
        </section>

        <section className="container mx-auto px-4 py-6">
          <QuickQuestion />
        </section>
        
        <section className="container mx-auto px-4 py-6">
          <h2 className="text-2xl font-bold text-white mb-6">Study Tools</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <ToolCard 
              title="AI Assistant" 
              description="Get instant answers to your optometry questions" 
              icon="chat" 
              iconBg="bg-blue-600"
              path="/assistant"
            />
            <ToolCard 
              title="Study Notes" 
              description="Create and organize your study materials" 
              icon="notes" 
              iconBg="bg-green-700"
              path="/notes"
            />
            <ToolCard 
              title="Quiz Generator" 
              description="Test your knowledge with interactive quizzes" 
              icon="quiz" 
              iconBg="bg-red-700"
              path="/quizzes"
            />
          </div>
        </section>

        <section className="container mx-auto px-4 py-8">
          <h2 className="text-2xl font-bold text-white mb-6">Focus.AI – My AI Study Assistant</h2>

          <FeatureSection 
            title="Introduction" 
            icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>}
            iconBg="bg-blue-600"
          >
            <p>Focus.AI is my AI-powered study assistant I first made just for myself to study easily, especially optometry subjects, but now it's in beta and I'm adding more updates. Right now it's limited to few users to keep it cost effective.</p>
          </FeatureSection>

          <FeatureSection 
            title="Why I Made It" 
            icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>}
            iconBg="bg-green-700"
          >
            <ul className="list-disc list-inside space-y-4">
              <TimelineItem title="In first semester">
                I was struggling with General Anatomy and Physiology so I used ChatGPT, but it gave too much info and wasn't really helpful.
              </TimelineItem>
              <TimelineItem title="Second semester">
                Ocular Anatomy and Physiology was even harder because syllabus got changed and only limited faculty were there, it made my head burst to understand concepts.
              </TimelineItem>
              <TimelineItem title="So">
                I started copy pasting textbook content using Google Lens scanner then asked GPT to convert it into points but that process itself wasted hours of my time.
              </TimelineItem>
            </ul>
          </FeatureSection>

          <FeatureSection 
            title="What Others Said" 
            icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>}
            iconBg="bg-purple-700"
          >
            <ul className="list-disc list-inside space-y-4">
              <TestimonialItem 
                name="Thirumalai"
                testimonial="said she struggles to understand key topics"
              />
              <TestimonialItem 
                name="Shobana"
                testimonial="said she can understand but can't make proper notes and liked how I make notes"
              />
              <TestimonialItem 
                name="CS Dharsini"
                testimonial="said my notes are way easier than textbooks"
              />
            </ul>
            <p className="mt-4">So I felt like I'm not alone and others also need something better</p>
          </FeatureSection>

          <FeatureSection 
            title="Building Focus.AI" 
            icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>}
            iconBg="bg-amber-700"
          >
            <ul className="list-disc list-inside space-y-4">
              <TimelineItem title="I started working on it around October 2024">
                as Focus Notes then slowly added AI features
              </TimelineItem>
              <TimelineItem title="In November">
                I gave beta access to Shobana and Thirumalai
              </TimelineItem>
              <TimelineItem title="On November 10">
                I renamed it to Focus.AI
              </TimelineItem>
              <TimelineItem title="Then">
                added Markdown export and kept testing with them till now
              </TimelineItem>
            </ul>
          </FeatureSection>

          <FeatureSection 
            title="How I Trained It" 
            icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>}
            iconBg="bg-red-700"
          >
            <p>I used <strong className="font-semibold text-white">Google Colab</strong> to train the AI with optometry datasets because I couldn't afford GPU and still wanted a model that gives only relevant simple notes without distractions.</p>
          </FeatureSection>

          <FeatureSection 
            title="What's Next" 
            icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>}
            iconBg="bg-blue-600"
          >
            <ul className="list-disc list-inside space-y-4">
              <TimelineItem title="Still working on it">
                Continue refining the AI model and interface
              </TimelineItem>
              <TimelineItem title="Soon planning to add">
                <span className="font-semibold text-white">voice tutoring</span> and <span className="font-semibold text-white">personalized study tips</span>
              </TimelineItem>
              <TimelineItem title="After that">
                I'll expand it for other students also, not just optometry
              </TimelineItem>
            </ul>
          </FeatureSection>

          <FeatureSection 
            title="Thanks" 
            icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>}
            iconBg="bg-purple-700"
          >
            <p>Thanks to <strong className="font-semibold text-white">Thirumalai</strong>, <strong className="font-semibold text-white">Shobana</strong>, and <strong className="font-semibold text-white">CS Dharsini</strong> for testing and giving proper feedback.</p>
          </FeatureSection>

          <FeatureSection 
            title="Contact" 
            icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>}
            iconBg="bg-green-700"
          >
            <div>
              <p className="mb-2">Mail – <code className="bg-slate-800 rounded px-2 py-1">iamsirenjeev@gmail.com</code></p>
              <p>UPI to support – <code className="bg-slate-800 rounded px-2 py-1">iamsirenjeev@oksbi</code></p>
            </div>
          </FeatureSection>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Index;
