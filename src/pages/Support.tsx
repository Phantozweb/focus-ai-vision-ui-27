
import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import DonationForm from '@/components/DonationForm';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Mail, MessageSquare, Settings } from 'lucide-react';

const SupportPage = () => {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header />
      
      <main className="container mx-auto px-4 py-8 flex-grow">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-2 text-gray-800">Support Focus.AI</h1>
          <p className="text-gray-600 mb-8">Help us improve our tools and resources for optometry students worldwide.</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
            <Card className="border-l-4 border-l-sky-500">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5 text-sky-500" />
                  Get in Touch
                </CardTitle>
                <CardDescription>We'd love to hear your feedback and suggestions</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">
                  Have questions, suggestions, or found a bug? Our team is ready to help you with any queries or issues you might have.
                </p>
                <a 
                  href="mailto:feedback@focus-in.netlify.app" 
                  className="bg-sky-500 hover:bg-sky-600 text-white font-medium py-2 px-6 rounded-md inline-flex items-center gap-2 transition-colors">
                  <Mail className="h-4 w-4" />
                  Send Feedback
                </a>
              </CardContent>
            </Card>
            
            <Card className="border-l-4 border-l-amber-500">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5 text-amber-500" />
                  Technical Support
                </CardTitle>
                <CardDescription>Need help with using our platform?</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">
                  If you're experiencing technical difficulties or need guidance on how to use our tools effectively, our support team is here to help.
                </p>
                <a 
                  href="https://docs.google.com/forms/d/e/1FAIpQLSf8Kd56-Y4AxMxYpzL5TeFG-02_Eil0GBBYsiWXPlxc5oiCrw/viewform?usp=sf_link" 
                  target="_blank"
                  rel="noopener noreferrer" 
                  className="bg-amber-500 hover:bg-amber-600 text-white font-medium py-2 px-6 rounded-md inline-flex items-center gap-2 transition-colors">
                  <Settings className="h-4 w-4" />
                  Request Support
                </a>
              </CardContent>
            </Card>
          </div>
          
          <Separator className="my-8" />
          
          <div className="mb-10">
            <h2 className="text-2xl font-bold mb-6 text-gray-800">Donate to Support Our Mission</h2>
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <p className="text-gray-600 mb-6">
                Focus.AI is developed by a small team passionate about improving optometry education. 
                Your support helps us continue building valuable tools for optometry students worldwide.
                Every contribution makes a difference in our ability to improve and expand our platform.
              </p>
              
              <DonationForm upiId="donation@upi" />
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 mt-8">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Other Ways to Support Us</h2>
            <p className="text-gray-600 mb-4">
              Besides financial contributions, there are many ways you can help Focus.AI grow:
            </p>
            <ul className="list-disc pl-5 mb-4 space-y-2 text-gray-600">
              <li>Share Focus.AI with your classmates and colleagues</li>
              <li>Provide feedback on our tools and features</li>
              <li>Report bugs or issues you encounter</li>
              <li>Suggest new features or improvements</li>
              <li>Contribute content or case studies</li>
            </ul>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default SupportPage;
