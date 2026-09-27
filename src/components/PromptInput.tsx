import React, { useState } from 'react';

interface PromptInputProps {
  onSubmit: (topic: string) => void;
  isLoading: boolean;
}

export const PromptInput: React.FC<PromptInputProps> = ({ onSubmit, isLoading }) => {
  const [topic, setTopic] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (topic.trim() && !isLoading) {
      onSubmit(topic.trim());
    }
  };

  return (
    <form onSubmit={handleSubmit} className="prompt-form">
      <div className="input-group">
        <input
          type="text"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          placeholder="Enter a topic to generate flashcards (e.g. 'Photosynthesis')"
          disabled={isLoading}
          className="topic-input"
        />
        <button type="submit" disabled={!topic.trim() || isLoading} className="submit-btn">
          {isLoading ? 'Generating...' : 'Generate'}
        </button>
      </div>
    </form>
  );
};
