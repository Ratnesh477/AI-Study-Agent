import { useState, useRef, useEffect } from 'react';
import { PromptInput } from './components/PromptInput';
import { FlashcardDeck } from './components/FlashcardDeck';
import { SummaryView } from './components/SummaryView';
import { QuizView } from './components/QuizView';
import { PlanView } from './components/PlanView';
import { ErrorState } from './components/ErrorState';
import { LoadingState } from './components/LoadingState';
import { generateStudyMaterial, refineStudyMaterial } from './lib/api';
import { validateStudyResult } from './lib/validateResult';
import type { StudyResult } from './types/result';
import './index.css';

function App() {
  const [data, setData] = useState<StudyResult | null>(() => {
    const saved = localStorage.getItem('study-session');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return null;
      }
    }
    return null;
  });

  const [history, setHistory] = useState<StudyResult[]>(() => {
    const saved = localStorage.getItem('study-history');
    if (saved) {
      try { return JSON.parse(saved); } catch { return []; }
    }
    return [];
  });

  const [stats, setStats] = useState(() => {
    const saved = localStorage.getItem('study-stats');
    if (saved) {
      try { return JSON.parse(saved); } catch {}
    }
    return { cardsReviewed: 0, quizzesCompleted: 0, totalQuizScore: 0, maxQuizScore: 0, plansGenerated: 0 };
  });

  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    const savedTheme = localStorage.getItem('theme');
    return (savedTheme as 'dark' | 'light') || 'dark';
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<'flashcards' | 'summary' | 'mcq' | 'plan'>('flashcards');
  
  const requestId = useRef(0);
  const [lastTopic, setLastTopic] = useState('');

  useEffect(() => {
    if (data) {
      localStorage.setItem('study-session', JSON.stringify(data));
    } else {
      localStorage.removeItem('study-session');
    }
  }, [data]);

  useEffect(() => {
    localStorage.setItem('study-history', JSON.stringify(history));
  }, [history]);

  useEffect(() => {
    localStorage.setItem('study-stats', JSON.stringify(stats));
  }, [stats]);

  useEffect(() => {
    if (theme === 'light') {
      document.documentElement.classList.add('light-mode');
    } else {
      document.documentElement.classList.remove('light-mode');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  const handleGenerate = async (topic: string) => {
    setIsLoading(true);
    setError(null);
    setLastTopic(topic);
    setData(null);
    
    const id = ++requestId.current;

    try {
      const raw = await generateStudyMaterial(topic, mode);
      
      if (id !== requestId.current) return; // stale response

      try {
        const parsed = JSON.parse(raw);
        const validated = validateStudyResult(parsed);
        setData(validated);
        
        // Add to history
        setHistory(prev => {
          const filtered = prev.filter(p => p.topic !== validated.topic || p.type !== validated.type);
          return [validated, ...filtered].slice(0, 10);
        });

        if (validated.type === 'plan') {
          setStats((s: any) => ({ ...s, plansGenerated: s.plansGenerated + 1 }));
        }
      } catch (parseError: any) {
        if (id !== requestId.current) return;
        setError(parseError.message || 'Received malformed or invalid data from AI.');
      }
      
    } catch (apiError: any) {
      if (id !== requestId.current) return;
      setError(apiError.message || 'Failed to connect to the AI model.');
    } finally {
      if (id === requestId.current) {
        setIsLoading(false);
      }
    }
  };

  const handleRefine = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!refineText.trim() || !data || isLoading) return;

    setIsLoading(true);
    setError(null);
    const id = ++requestId.current;

    try {
      const raw = await refineStudyMaterial(data, refineText.trim());
      if (id !== requestId.current) return;
      
      try {
        const parsed = JSON.parse(raw);
        const validated = validateStudyResult(parsed);
        setData(validated);
        setRefineText('');

        // Update history
        setHistory(prev => {
          const filtered = prev.filter(p => p.topic !== validated.topic || p.type !== validated.type);
          return [validated, ...filtered].slice(0, 10);
        });
      } catch (parseError: any) {
        if (id !== requestId.current) return;
        setError(parseError.message || 'Received malformed data on refine.');
      }
    } catch (apiError: any) {
      if (id !== requestId.current) return;
      setError(apiError.message || 'Failed to refine flashcards.');
    } finally {
      if (id === requestId.current) {
        setIsLoading(false);
      }
    }
  };

  const handleClear = () => {
    setData(null);
    setLastTopic('');
    setError(null);
  };

  const [refineText, setRefineText] = useState('');

  const handleRetest = (wrongCardIds: string[]) => {
    if (!data) return;
    const retestCards = data.cards?.filter(card => wrongCardIds.includes(card.id)) || [];
    // Create a new data object with only the wrong cards
    setData({
      ...data,
      topic: `${data.topic} (Retest)`,
      cards: retestCards
    });
  };

  const [showDashboard, setShowDashboard] = useState(false);

  return (
    <div className="app-container">
      <header className="app-header">
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem', gap: '0.5rem' }}>
          <button onClick={() => setShowDashboard(!showDashboard)} className="action-btn" style={{ width: 'auto', padding: '0.5rem 1rem', fontSize: '0.875rem' }}>
            {showDashboard ? '🏠 Home' : '📊 Dashboard'}
          </button>
          <button 
            onClick={toggleTheme} 
            className="action-btn" 
            style={{ width: 'auto', padding: '0.5rem 1rem', fontSize: '0.875rem' }}
          >
            {theme === 'dark' ? '☀️ Light Mode' : '🌙 Dark Mode'}
          </button>
        </div>
        <h1>AI Study Assistant</h1>
        <p>Turn any topic into interactive study materials</p>
      </header>
      
      <main className="app-main">
        {showDashboard ? (
          <div className="dashboard-view" style={{ width: '100%', maxWidth: '600px', margin: '0 auto', background: 'var(--card-bg)', padding: '2rem', borderRadius: 'var(--border-radius)', border: '1px solid var(--card-border)' }}>
            <h2 style={{ color: 'var(--primary)', marginBottom: '1.5rem', textAlign: 'center' }}>Your Study Dashboard</h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div style={{ padding: '1.5rem', background: 'rgba(0,0,0,0.1)', borderRadius: '8px', textAlign: 'center' }}>
                <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--primary)' }}>{stats.cardsReviewed}</div>
                <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Flashcards Mastered</div>
              </div>
              <div style={{ padding: '1.5rem', background: 'rgba(0,0,0,0.1)', borderRadius: '8px', textAlign: 'center' }}>
                <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--primary)' }}>{stats.quizzesCompleted}</div>
                <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Quizzes Completed</div>
              </div>
              <div style={{ padding: '1.5rem', background: 'rgba(0,0,0,0.1)', borderRadius: '8px', textAlign: 'center' }}>
                <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--primary)' }}>
                  {stats.maxQuizScore > 0 ? Math.round((stats.totalQuizScore / stats.maxQuizScore) * 100) : 0}%
                </div>
                <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Avg Quiz Score</div>
              </div>
              <div style={{ padding: '1.5rem', background: 'rgba(0,0,0,0.1)', borderRadius: '8px', textAlign: 'center' }}>
                <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--primary)' }}>{stats.plansGenerated}</div>
                <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Study Plans Created</div>
              </div>
            </div>
            <button onClick={() => setShowDashboard(false)} className="submit-btn" style={{ marginTop: '2rem', width: '100%' }}>Back to Studying</button>
          </div>
        ) : (
          <>
            {history.length > 0 && (
          <div className="history-row" style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto', paddingBottom: '0.5rem', alignItems: 'center' }}>
            <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>Recent: </span>
            {history.map((h, i) => (
              <button 
                key={i} 
                onClick={() => { setData(h); setMode(h.type as any); setLastTopic(h.topic); setError(null); }}
                className="pill-btn"
                style={{
                  background: 'var(--card-bg)', border: '1px solid var(--card-border)', padding: '0.25rem 0.75rem', 
                  borderRadius: '999px', fontSize: '0.875rem', color: 'var(--text-color)', cursor: 'pointer', whiteSpace: 'nowrap'
                }}
              >
                {h.topic} ({h.type})
              </button>
            ))}
          </div>
        )}

        <div className="mode-selector" style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginBottom: '1rem' }}>
          <label style={{ cursor: 'pointer' }}>
            <input type="radio" value="flashcards" checked={mode === 'flashcards'} onChange={() => setMode('flashcards')} /> Flashcards
          </label>
          <label style={{ cursor: 'pointer' }}>
            <input type="radio" value="summary" checked={mode === 'summary'} onChange={() => setMode('summary')} /> Summary & Notes
          </label>
          <label style={{ cursor: 'pointer' }}>
            <input type="radio" value="mcq" checked={mode === 'mcq'} onChange={() => setMode('mcq')} /> AI Quiz
          </label>
          <label style={{ cursor: 'pointer' }}>
            <input type="radio" value="plan" checked={mode === 'plan'} onChange={() => setMode('plan')} /> Study Plan
          </label>
        </div>
        
        <PromptInput onSubmit={handleGenerate} isLoading={isLoading} />
        
        <div className="content-area">
          {isLoading && <LoadingState message={
            mode === 'flashcards' ? 'Generating flashcards...' :
            mode === 'summary' ? 'Generating summary...' :
            mode === 'mcq' ? 'Generating quiz...' :
            'Generating study plan...'
          } />}
          
          {error && <ErrorState message={error} onRetry={() => handleGenerate(lastTopic)} />}
          
          {!isLoading && !error && data && (
            <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              {data.type === 'flashcards' && <FlashcardDeck data={data} onRetest={handleRetest} onCardReviewed={() => setStats((s: any) => ({ ...s, cardsReviewed: s.cardsReviewed + 1 }))} />}
              {data.type === 'summary' && <SummaryView data={data} />}
              {data.type === 'mcq' && <QuizView data={data} onQuizComplete={(score, max) => setStats((s: any) => ({ ...s, quizzesCompleted: s.quizzesCompleted + 1, totalQuizScore: s.totalQuizScore + score, maxQuizScore: s.maxQuizScore + max }))} />}
              {data.type === 'plan' && <PlanView data={data} />}
              
              <div className="refine-container">
                <form onSubmit={handleRefine} className="refine-form">
                  <input
                    type="text"
                    value={refineText}
                    onChange={(e) => setRefineText(e.target.value)}
                    placeholder="Refine deck (e.g., 'Make it harder' or 'Add 3 more cards')"
                    disabled={isLoading}
                    className="topic-input"
                    style={{ fontSize: '0.875rem' }}
                  />
                  <button type="submit" disabled={!refineText.trim() || isLoading} className="submit-btn" style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}>
                    Refine
                  </button>
                </form>
                <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }} className="deck-actions">
                  <button onClick={() => window.print()} className="action-btn" style={{ background: 'var(--card-border)', fontSize: '0.875rem', flex: 1 }}>
                    🖨️ Print to PDF
                  </button>
                  <button onClick={handleClear} className="action-btn" style={{ background: 'transparent', color: 'var(--danger)', fontSize: '0.875rem', flex: 1 }}>
                    🗑️ Clear Deck
                  </button>
                </div>
              </div>
            </div>
          )}
          
          {!isLoading && !error && !data && (
            <div className="empty-state">
              <div className="empty-icon">🧠</div>
              <p>
                Enter a topic above to generate your first {
                  mode === 'flashcards' ? 'deck of flashcards' :
                  mode === 'summary' ? 'summary sheet' :
                  mode === 'mcq' ? 'quiz' :
                  'study plan'
                }!
              </p>
            </div>
          )}
        </div>
        </>
        )}
      </main>
    </div>
  );
}

export default App;
