
import React from 'react';

interface LoadingIndicatorProps {
  isVisible: boolean;
}

// This component is no longer used as we're solely using ThinkingIndicator
const LoadingIndicator: React.FC<LoadingIndicatorProps> = () => {
  return null; // Return null to avoid duplicate loading indicators
};

export default LoadingIndicator;
