import React from 'react';

interface LoadingStateProps {
  message?: string;
}

export const LoadingState: React.FC<LoadingStateProps> = ({ message = 'Generating...' }) => {
  return (
    <div className="loading-state">
      <div className="spinner"></div>
      <p>{message}</p>
    </div>
  );
};
