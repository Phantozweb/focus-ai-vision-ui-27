
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from '@/components/ui/sonner';

interface DonationFormProps {
  upiId: string;
}

const DonationForm: React.FC<DonationFormProps> = ({ upiId }) => {
  const [amount, setAmount] = useState<string>('');
  const [name, setName] = useState<string>('');
  
  const quickAmounts = [100, 200, 500, 1000];
  
  const handleQuickAmountSelect = (amt: number) => {
    setAmount(amt.toString());
  };
  
  const handleDonate = () => {
    if (!amount || parseFloat(amount) <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }
    
    if (!name.trim()) {
      toast.error('Please enter your name');
      return;
    }
    
    // Generate UPI payment link
    const remarks = `${name} - ${amount} - Focus AI`;
    const upiLink = `upi://pay?pa=${upiId}&pn=FocusAI&am=${amount}&cu=INR&tn=${encodeURIComponent(remarks)}`;
    
    // Open UPI link
    window.location.href = upiLink;
    toast.success(`Thank you, ${name}! Redirecting to payment...`);
  };
  
  return (
    <div className="tool-card">
      <div className="flex items-center gap-3 mb-4">
        <div className="feature-icon bg-blue-600">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-white">Support Focus.AI</h2>
      </div>
      <p className="text-slate-400 mb-6">Your contribution helps us continue to improve and expand Focus.AI for all students</p>
      
      <div className="mb-4">
        <label htmlFor="name" className="block text-slate-300 mb-2">Your Name</label>
        <Input 
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Enter your name"
          className="bg-darkBg border-slate-700 focus:border-blue-500 text-white"
        />
      </div>
      
      <div className="mb-6">
        <label htmlFor="amount" className="block text-slate-300 mb-2">Donation Amount (INR)</label>
        <Input 
          id="amount"
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="Enter amount"
          className="bg-darkBg border-slate-700 focus:border-blue-500 text-white"
        />
        
        <div className="flex flex-wrap gap-2 mt-3">
          {quickAmounts.map(amt => (
            <Button 
              key={amt}
              onClick={() => handleQuickAmountSelect(amt)}
              variant="outline" 
              size="sm"
              className={`${amount === amt.toString() ? 'bg-blue-900 border-blue-500 text-white' : 'bg-darkBg border-slate-700 text-slate-300'}`}
            >
              ₹{amt}
            </Button>
          ))}
        </div>
      </div>
      
      <Button 
        onClick={handleDonate}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white"
      >
        Donate to iamsirenjeev@oksbi
      </Button>
    </div>
  );
};

export default DonationForm;
