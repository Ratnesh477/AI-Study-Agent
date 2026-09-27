import React, { useState } from 'react';
import type { StudyResult } from '../types/result';

interface QuizViewProps {
  data: StudyResult;
  onQuizComplete?: (score: number, max: number) => void;
}

export const QuizView: React.FC<QuizViewProps> = ({ data, onQuizComplete }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [quizFinished, setQuizFinished] = useState(false);

  if (data.type !== 'mcq' || !data.questions) return null;

  const currentQ = data.questions[currentIndex];

  const handleSelect = (opt: string) => {
    if (showResult) return;
    setSelectedOption(opt);
    setShowResult(true);
    if (opt === currentQ.correctAnswer) {
      setScore(s => s + 1);
    }
  };

  const handleNext = () => {
    if (currentIndex < data.questions!.length - 1) {
      setCurrentIndex(i => i + 1);
      setSelectedOption(null);
      setShowResult(false);
    } else {
      setQuizFinished(true);
      if (onQuizComplete) {
        // use score + 1 if the last question was correct, since state hasn't flushed
        const finalScore = (selectedOption === currentQ.correctAnswer) ? score + 1 : score;
        onQuizComplete(finalScore, data.questions!.length);
      }
    }
  };

  if (quizFinished) {
    return (
      <div className="finished-state" style={{ width: '100%', maxWidth: '500px' }}>
        <h2>Quiz Complete!</h2>
        <p>You scored {score} out of {data.questions.length}.</p>
        <button onClick={() => { setCurrentIndex(0); setScore(0); setQuizFinished(false); setSelectedOption(null); setShowResult(false); }} className="action-btn">
          Retake Quiz
        </button>
      </div>
    );
  }

  return (
    <div className="quiz-view" style={{ width: '100%', maxWidth: '600px', background: 'var(--card-bg)', padding: '2rem', borderRadius: 'var(--border-radius)', border: '1px solid var(--card-border)', animation: 'fadeIn 0.5s ease' }}>
      <div className="deck-header">
        <h3 style={{ color: 'var(--text-muted)' }}>{data.topic}</h3>
        <span className="card-counter">Q {currentIndex + 1} of {data.questions.length}</span>
      </div>

      <h3 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', lineHeight: '1.5' }}>{currentQ.question}</h3>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {currentQ.options.map((opt, i) => {
          let bgColor = "var(--card-border)";
          
          if (showResult) {
            if (opt === currentQ.correctAnswer) {
              bgColor = "var(--success)";
            } else if (opt === selectedOption) {
              bgColor = "var(--danger)";
            }
          } else if (opt === selectedOption) {
            bgColor = "var(--primary)";
          }

          return (
            <button 
              key={i}
              onClick={() => handleSelect(opt)}
              style={{
                width: '100%', 
                padding: '1rem', 
                textAlign: 'left', 
                borderRadius: '8px',
                border: 'none',
                background: bgColor,
                color: 'var(--text-color)',
                cursor: showResult ? 'default' : 'pointer',
                transition: 'all 0.2s'
              }}
            >
              {opt}
            </button>
          );
        })}
      </div>

      {showResult && (
        <button 
          onClick={handleNext}
          className="submit-btn"
          style={{ marginTop: '2rem', width: '100%' }}
        >
          {currentIndex < data.questions!.length - 1 ? 'Next Question' : 'Finish Quiz'}
        </button>
      )}
    </div>
  );
};
