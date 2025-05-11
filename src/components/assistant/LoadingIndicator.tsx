
import React from 'react';

interface LoadingIndicatorProps {
  isVisible: boolean;
}

// This component is no longer used as we're solely using ThinkingIndicator
// The file is kept to prevent import errors, but the component is simplified
const LoadingIndicator: React.FC<LoadingIndicatorProps> = ({ isVisible }) => {
  return null; // Return null to avoid duplicate loading indicators
};

export default LoadingIndicator;
