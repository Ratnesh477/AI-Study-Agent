import React from 'react';
import type { StudyResult } from '../types/result';
import { MarkdownRenderer } from './MarkdownRenderer';

interface SummaryViewProps {
  data: StudyResult;
}

export const SummaryView: React.FC<SummaryViewProps> = ({ data }) => {
  if (data.type !== 'summary') return null;

  return (
    <div className="summary-view" style={{ width: '100%', maxWidth: '600px', background: 'var(--card-bg)', padding: '2rem', borderRadius: 'var(--border-radius)', border: '1px solid var(--card-border)', animation: 'fadeIn 0.5s ease' }}>
      <h2 style={{ color: 'var(--primary)', marginBottom: '1rem' }}>{data.topic}</h2>
      
      <div style={{ marginBottom: '2rem' }}>
        <h3 style={{ marginBottom: '0.5rem', color: 'var(--text-muted)' }}>Overview</h3>
        <div style={{ lineHeight: '1.6' }}><MarkdownRenderer content={data.shortSummary!} /></div>
      </div>

      <div style={{ marginBottom: '2rem' }}>
        <h3 style={{ marginBottom: '0.5rem', color: 'var(--text-muted)' }}>Key Points</h3>
        <ul style={{ paddingLeft: '1.5rem', lineHeight: '1.6' }}>
          {data.keyPoints?.map((pt, i) => (
            <li key={i} style={{ marginBottom: '0.5rem' }}><MarkdownRenderer content={pt} /></li>
          ))}
        </ul>
      </div>

      <div>
        <h3 style={{ marginBottom: '0.5rem', color: 'var(--text-muted)' }}>Definitions</h3>
        <dl>
          {data.definitions?.map((def, i) => (
            <div key={i} style={{ marginBottom: '1rem', padding: '1rem', background: 'rgba(0,0,0,0.1)', borderRadius: '8px' }}>
              <dt style={{ fontWeight: '600', color: 'var(--primary)', marginBottom: '0.25rem' }}><MarkdownRenderer content={def.term} /></dt>
              <dd style={{ marginLeft: 0 }}><MarkdownRenderer content={def.definition} /></dd>
            </div>
          ))}
        </dl>
      </div>
    </div>
  );
};
