
import React from 'react';

interface FeatureSectionProps {
  icon: React.ReactNode;
  iconBg: string;
  title: string;
  children: React.ReactNode;
}

const FeatureSection = ({ icon, iconBg, title, children }: FeatureSectionProps) => {
  return (
    <div className="tool-card mb-6">
      <div className="flex items-center gap-3 mb-4">
        <div className={`feature-icon ${iconBg}`}>
          {icon}
        </div>
        <h2 className="text-2xl font-bold text-white">{title}</h2>
      </div>
      <div className="text-slate-300">
        {children}
      </div>
    </div>
  );
};

export default FeatureSection;
