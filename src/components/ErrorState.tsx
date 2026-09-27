import React from 'react';

interface ErrorStateProps {
  message: string;
  onRetry: () => void;
}

export const ErrorState: React.FC<ErrorStateProps> = ({ message, onRetry }) => {
  return (
    <div className="error-state">
      <div className="error-icon">⚠️</div>
      <h3>Something went wrong</h3>
      <p>{message}</p>
      <button onClick={onRetry} className="retry-btn">Try Again</button>
    </div>
  );
};
