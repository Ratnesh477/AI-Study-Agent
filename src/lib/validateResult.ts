import type { StudyResult } from '../types/result';

export function validateStudyResult(data: any): StudyResult {
  if (!data || typeof data !== 'object') {
    throw new Error('Response is not an object');
  }
  
  if (typeof data.topic !== 'string') {
    throw new Error('Missing or invalid topic field');
  }
  
  if (!['flashcards', 'summary', 'mcq', 'plan'].includes(data.type)) {
    throw new Error('Missing or invalid type field. Must be flashcards, summary, mcq, or plan');
  }

  if (data.type === 'flashcards') {
    if (!Array.isArray(data.cards) || data.cards.length === 0) {
      throw new Error('Flashcards must have a non-empty cards array');
    }
    data.cards.forEach((card: any, index: number) => {
      if (typeof card.id !== 'string' || typeof card.question !== 'string' || typeof card.answer !== 'string') {
        throw new Error(`Card at index ${index} is invalid`);
      }
    });
  }

  if (data.type === 'summary') {
    if (typeof data.shortSummary !== 'string') {
      throw new Error('Summary must have a shortSummary string');
    }
    if (!Array.isArray(data.keyPoints)) {
      throw new Error('Summary must have a keyPoints array');
    }
    if (!Array.isArray(data.definitions)) {
      throw new Error('Summary must have a definitions array');
    }
  }

  if (data.type === 'mcq') {
    if (!Array.isArray(data.questions) || data.questions.length === 0) {
      throw new Error('MCQ must have a non-empty questions array');
    }
    data.questions.forEach((q: any, index: number) => {
      if (typeof q.id !== 'string' || typeof q.question !== 'string' || typeof q.correctAnswer !== 'string') {
        throw new Error(`MCQ at index ${index} is invalid`);
      }
      if (!Array.isArray(q.options) || q.options.length < 2) {
        throw new Error(`MCQ at index ${index} must have at least 2 options`);
      }
    });
  }

  if (data.type === 'plan') {
    if (!Array.isArray(data.days) || data.days.length === 0) {
      throw new Error('Plan must have a non-empty days array');
    }
    data.days.forEach((day: any, i: number) => {
      if (typeof day.day !== 'string' || !Array.isArray(day.sessions)) {
        throw new Error(`Day at index ${i} is invalid`);
      }
      day.sessions.forEach((s: any, j: number) => {
        if (typeof s.topic !== 'string' || typeof s.duration !== 'string' || typeof s.focus !== 'string') {
          throw new Error(`Session at day ${i}, index ${j} is invalid`);
        }
      });
    });
  }

  return data as StudyResult;
}
