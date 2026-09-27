export interface Flashcard {
  id: string;
  question: string;
  answer: string;
}

export interface Definition {
  term: string;
  definition: string;
}

export interface MCQ {
  id: string;
  question: string;
  options: string[];
  correctAnswer: string;
}

export interface StudySession {
  topic: string;
  duration: string;
  focus: string;
}

export interface StudyDay {
  day: string; // e.g., "Day 1", "Oct 12"
  sessions: StudySession[];
}

export interface StudyResult {
  type: 'flashcards' | 'summary' | 'mcq' | 'plan';
  topic: string;
  // For flashcards
  cards?: Flashcard[];
  // For summary
  shortSummary?: string;
  keyPoints?: string[];
  definitions?: Definition[];
  // For MCQs
  questions?: MCQ[];
  // For Plan
  days?: StudyDay[];
}
