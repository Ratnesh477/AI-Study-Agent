import React from 'react';
import type { StudyResult } from '../types/result';

interface PlanViewProps {
  data: StudyResult;
}

export const PlanView: React.FC<PlanViewProps> = ({ data }) => {
  if (data.type !== 'plan' || !data.days) return null;

  return (
    <div className="plan-view" style={{ width: '100%', maxWidth: '700px', animation: 'fadeIn 0.5s ease' }}>
      <h2 style={{ color: 'var(--primary)', marginBottom: '1.5rem', textAlign: 'center' }}>
        {data.topic}
      </h2>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {data.days.map((day, i) => (
          <div key={i} style={{ background: 'var(--card-bg)', padding: '1.5rem', borderRadius: 'var(--border-radius)', border: '1px solid var(--card-border)', boxShadow: 'var(--shadow-sm)' }}>
            <h3 style={{ marginBottom: '1rem', color: 'var(--text-color)', borderBottom: '1px solid var(--card-border)', paddingBottom: '0.5rem' }}>
              {day.day}
            </h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {day.sessions.map((session, j) => (
                <div key={j} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(0,0,0,0.1)', padding: '0.75rem', borderRadius: '8px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                    <span style={{ fontWeight: '600' }}>{session.topic}</span>
                    <span style={{ fontSize: '0.875rem', color: 'var(--primary)' }}>{session.focus}</span>
                  </div>
                  <span style={{ fontWeight: '500', color: 'var(--text-muted)' }}>{session.duration}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
