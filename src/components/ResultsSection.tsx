import { TrendingUp, ArrowUpRight, CalendarDays, GraduationCap } from 'lucide-react';
import Counter from './ui/Counter';

/* 
 * LETSCRACK IELTS — RESULTS / SCORE IMPROVEMENT
 * Focus: Proof, Alignment, Clean academic data visualization
 */

const SCORE_OUTCOMES = [
  {
    name: 'Ananya Rao',
    country: 'India',
    exam: 'IELTS Academic',
    timeline: '28 days',
    before: 6.0,
    after: 7.5,
  },
  {
    name: 'Hassan Malik',
    country: 'Pakistan',
    exam: 'IELTS General',
    timeline: '31 days',
    before: 5.5,
    after: 7.0,
  },
  {
    name: 'Maria Lopez',
    country: 'Colombia',
    exam: 'IELTS Academic',
    timeline: '24 days',
    before: 6.5,
    after: 8.0,
  },
  {
    name: 'Jing Li',
    country: 'China',
    exam: 'IELTS General',
    timeline: '30 days',
    before: 6.0,
    after: 7.5,
  },
];

const HIGHLIGHTS = [
  { value: '96%', label: 'Students reached target', icon: TrendingUp },
  { value: '+1.4', label: 'Avg band increase', icon: ArrowUpRight },
  { value: '30 days', label: 'Typical timeline', icon: CalendarDays },
];

export default function ResultsSection() {
  return (
    <section id="results" className="section" style={{ background: '#f8fafc', borderTop: '1px solid var(--color-border)' }}>
      <div className="container">
        
        {/* Header */}
        <div style={{ maxWidth: '720px', marginBottom: '4rem' }}>
          <p className="eyebrow">Results / Score Improvement</p>
          <h2 style={{ 
            fontSize: 'clamp(2.25rem, 5vw, 3rem)', 
            fontWeight: 800, 
            color: 'var(--color-ink)', 
            marginBottom: '1.25rem',
            fontFamily: 'var(--font-display)',
            letterSpacing: '-0.02em'
          }}>
            Real outcomes from focused<br />
            IELTS preparation
          </h2>
          <p style={{ fontSize: '1.125rem', color: 'var(--color-ink-2)', lineHeight: 1.7 }}>
            Clear progress tracking and daily feedback help students move from their current level to target score faster, without guesswork.
          </p>
        </div>

        {/* Stats Grid */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(3, 1fr)', 
          gap: '1.5rem', 
          marginBottom: '4rem' 
        }} className="stats-grid">
          {HIGHLIGHTS.map((item) => {
             const Icon = item.icon;
             return (
               <div key={item.label} style={{
                 background: '#fff',
                 padding: '2rem',
                 borderRadius: '20px',
                 border: '1px solid var(--color-border)',
                 boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
                 display: 'flex',
                 flexDirection: 'column',
                 gap: '1rem',
               }}>
                 <div style={{
                   width: '44px',
                   height: '44px',
                   borderRadius: '12px',
                   background: 'var(--color-brand-lt)',
                   display: 'flex',
                   alignItems: 'center',
                   justifyContent: 'center',
                   color: 'var(--color-brand)',
                 }}>
                   <Icon size={22} strokeWidth={2.5} />
                 </div>
                  <div>
                    <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--color-ink)', lineHeight: 1 }}>
                      {item.value.includes('%') ? <><Counter end={96} />%</> : 
                       item.value.includes('+') ? <><Counter end={1.4} decimals={1} prefix="+" /></> :
                       <><Counter end={30} /> days</>}
                    </div>
                    <p style={{ fontSize: '0.9375rem', fontWeight: 600, color: 'var(--color-ink-3)', marginTop: '0.4rem', marginBottom: 0 }}>{item.label}</p>
                  </div>
               </div>
             );
          })}
        </div>

        {/* Student Cards Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }} className="outcomes-grid">
          {SCORE_OUTCOMES.map((student) => (
            <div key={student.name} style={{
              background: '#fff',
              padding: '2rem',
              borderRadius: '24px',
              border: '1px solid var(--color-border)',
              boxShadow: '0 10px 30px -10px rgba(0,0,0,0.05)',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
                <div>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--color-ink)', marginBottom: '4px' }}>{student.name}</h3>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8125rem', color: 'var(--color-ink-3)', fontWeight: 600 }}>
                    <span>{student.country}</span>
                    <span style={{ opacity: 0.3 }}>•</span>
                    <span style={{ color: 'var(--color-brand)' }}>{student.exam}</span>
                  </div>
                </div>
                <div style={{
                  padding: '0.4rem 0.75rem',
                  background: 'var(--color-surface-2)',
                  borderRadius: '8px',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  color: 'var(--color-ink-2)',
                }}>
                  Timeline: {student.timeline}
                </div>
              </div>

              {/* Score Progress Visual */}
              <div style={{
                padding: '1.25rem',
                background: '#f8fafc',
                borderRadius: '16px',
                border: '1px solid var(--color-border)',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                  <div style={{ textAlign: 'center', flex: 1 }}>
                    <p style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-ink-4)', textTransform: 'uppercase', marginBottom: '4px' }}>Starting</p>
                    <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--color-ink-2)', lineHeight: 1 }}>{student.before}</div>
                  </div>
                  <div style={{ width: '1px', background: 'var(--color-border)', margin: '0 1.5rem' }} />
                  <div style={{ textAlign: 'center', flex: 1 }}>
                    <p style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-brand)', textTransform: 'uppercase', marginBottom: '4px' }}>Achieved</p>
                    <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--color-brand)', lineHeight: 1 }}>{student.after}</div>
                  </div>
                </div>
                
                {/* Progress Bar */}
                <div style={{ height: '8px', background: '#e2e8f0', borderRadius: '4px', overflow: 'hidden', position: 'relative' }}>
                  <div style={{ 
                    position: 'absolute', 
                    height: '100%', 
                    left: 0, 
                    width: `${(student.before / 9) * 100}%`,
                    background: '#cbd5e1' 
                  }} />
                  <div style={{ 
                    position: 'absolute', 
                    height: '100%', 
                    left: 0, 
                    width: `${(student.after / 9) * 100}%`,
                    background: 'var(--color-brand)' 
                  }} />
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>

      <style>{`
        @media (max-width: 960px) {
          .stats-grid { grid-template-columns: 1fr !important; }
          .outcomes-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </section>
  );
}
