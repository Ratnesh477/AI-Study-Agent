import { useState, useEffect } from 'react';
import type { StudyResult } from '../types/result';
import { MarkdownRenderer } from './MarkdownRenderer';

interface FlashcardDeckProps {
  data: StudyResult;
  onRetest: (wrongCardIds: string[]) => void;
  onCardReviewed?: () => void;
}

export const FlashcardDeck: React.FC<FlashcardDeckProps> = ({ data, onRetest, onCardReviewed }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [wrongAnswers, setWrongAnswers] = useState<string[]>([]);
  const [finished, setFinished] = useState(false);

  if (!data || !data.cards || data.cards.length === 0) {
    return <div>No cards to show.</div>;
  }

  const currentCard = data.cards[currentIndex];

  const handleNext = (knewIt: boolean) => {
    if (onCardReviewed) onCardReviewed();
    
    if (!knewIt) {
      setWrongAnswers((prev) => [...prev, currentCard.id]);
    }

    if (currentIndex < data.cards!.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setIsFlipped(false);
    } else {
      setFinished(true);
    }
  };

  const restart = () => {
    setCurrentIndex(0);
    setIsFlipped(false);
    setWrongAnswers([]);
    setFinished(false);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (finished) return;
      
      if (e.code === 'Space' || e.code === 'Enter' || e.code === 'ArrowUp' || e.code === 'ArrowDown') {
        e.preventDefault();
        setIsFlipped((prev) => !prev);
      } else if (isFlipped) {
        if (e.code === 'ArrowLeft') {
          e.preventDefault();
          handleNext(false);
        } else if (e.code === 'ArrowRight') {
          e.preventDefault();
          handleNext(true);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [finished, isFlipped, currentIndex]); // Need these dependencies since handleNext uses them

  if (finished) {
    return (
      <div className="finished-state">
        <h2>Deck Completed!</h2>
        <p>You missed {wrongAnswers.length} out of {data.cards.length} cards.</p>
        <div className="finished-actions">
          <button onClick={restart} className="action-btn">Restart Deck</button>
          {wrongAnswers.length > 0 && (
            <button onClick={() => onRetest(wrongAnswers)} className="action-btn retest-btn">
              Retest Wrong Answers
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flashcard-deck">
      <div className="deck-header">
        <h3>Topic: {data.topic}</h3>
        <span className="card-counter">Card {currentIndex + 1} of {data.cards.length}</span>
      </div>
      
      <div 
        className={`flashcard ${isFlipped ? 'flipped' : ''}`} 
        onClick={() => setIsFlipped(!isFlipped)}
      >
        <div className="flashcard-inner">
          <div className="flashcard-front">
            <h4>Question</h4>
            <MarkdownRenderer content={currentCard.question} />
            <span className="hint">Tap, Space, or ↑↓ to flip</span>
          </div>
          <div className="flashcard-back">
            <h4>Answer</h4>
            <MarkdownRenderer content={currentCard.answer} />
          </div>
        </div>
      </div>

      {isFlipped && (
        <div className="card-actions">
          <button onClick={(e) => { e.stopPropagation(); handleNext(false); }} className="wrong-btn">
            Didn't know it (←)
          </button>
          <button onClick={(e) => { e.stopPropagation(); handleNext(true); }} className="correct-btn">
            Knew it (→)
          </button>
        </div>
      )}
    </div>
  );
};
