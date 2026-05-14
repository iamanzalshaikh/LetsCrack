import { TrendingUp, ArrowUpRight, CalendarDays } from 'lucide-react';
import Counter from './ui/Counter';

const SCORE_OUTCOMES = [
  {
    name: 'Ananya Rao',
    country: 'India',
    exam: 'Academic',
    timeline: '28 days',
    before: 6.0,
    after: 7.5,
  },
  {
    name: 'Hassan Malik',
    country: 'Pakistan',
    exam: 'General',
    timeline: '31 days',
    before: 5.5,
    after: 7.0,
  },
  {
    name: 'Maria Lopez',
    country: 'Colombia',
    exam: 'Academic',
    timeline: '24 days',
    before: 6.5,
    after: 8.0,
  },
  {
    name: 'Jing Li',
    country: 'China',
    exam: 'General',
    timeline: '30 days',
    before: 6.0,
    after: 7.5,
  },
];

const HIGHLIGHTS = [
  { value: '96%', label: 'Success Rate', icon: TrendingUp, color: 'var(--color-success)' },
  { value: '+1.4', label: 'Avg Band Increase', icon: ArrowUpRight, color: 'var(--color-brand)' },
  { value: '30 days', label: 'Typical Timeline', icon: CalendarDays, color: 'var(--color-gold)' },
];

export default function ResultsSection() {
  return (
    <section id="results" className="section" style={{ background: 'var(--color-surface-2)', borderTop: '1px solid var(--color-border)' }}>
      <div className="container">
        
        {/* Header */}
        <div style={{ textAlign: 'center', maxWidth: '720px', margin: '0 auto 6rem' }} className="animate-fade-up">
          <p className="eyebrow" style={{ justifyContent: 'center' }}>Learning Outcomes</p>
          <h2 style={{ fontSize: 'clamp(2.25rem, 5vw, 3rem)', marginBottom: '1.25rem' }}>
            Real outcomes from focused<br />
            IELTS preparation
          </h2>
          <p style={{ fontSize: '1.125rem', color: 'var(--color-ink-2)', lineHeight: 1.7 }}>
            Clear progress tracking and daily feedback help students move from their current level to target score faster, without guesswork.
          </p>
        </div>

        {/* Stats Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '2rem', marginBottom: '6rem' }}>
          {HIGHLIGHTS.map((item, i) => {
             const Icon = item.icon;
             return (
               <div key={i} className="card animate-fade-up" style={{ 
                 animationDelay: `${(i + 1) * 100}ms`,
                 background: '#fff', 
                 padding: '2.5rem', 
                 textAlign: 'center',
                 display: 'flex',
                 flexDirection: 'column',
                 alignItems: 'center'
               }}>
                 <div style={{
                   width: '4rem',
                   height: '4rem',
                   borderRadius: '16px',
                   background: `${item.color}10`,
                   display: 'flex',
                   alignItems: 'center',
                   justifyContent: 'center',
                   color: item.color,
                   marginBottom: '1.5rem',
                 }}>
                   <Icon size={28} strokeWidth={2.5} />
                 </div>
                 <div style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--color-ink)', lineHeight: 1, marginBottom: '0.5rem' }}>
                   {item.value.includes('%') ? <><Counter end={96} />%</> : 
                    item.value.includes('+') ? <><Counter end={1.4} decimals={1} prefix="+" /></> :
                    <><Counter end={30} /> days</>}
                 </div>
                 <p style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--color-ink-4)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                   {item.label}
                 </p>
               </div>
             );
          })}
        </div>

        {/* Individual Outcomes */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
          {SCORE_OUTCOMES.map((student, i) => (
            <div key={i} className="card animate-fade-up" style={{ 
              animationDelay: `${(i + 4) * 100}ms`,
              padding: '2.5rem',
              background: 'white'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
                <div>
                  <h4 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0 }}>{student.name}</h4>
                  <p style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--color-ink-4)', marginTop: '0.25rem' }}>
                    {student.country} • IELTS {student.exam}
                  </p>
                </div>
                <div style={{
                  padding: '0.4rem 1rem',
                  background: 'var(--color-surface-2)',
                  borderRadius: 'var(--radius-pill)',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  color: 'var(--color-ink-3)',
                  textTransform: 'uppercase'
                }}>
                  {student.timeline}
                </div>
              </div>

              <div style={{
                padding: '2rem',
                background: 'var(--color-surface-2)',
                borderRadius: '16px',
                border: '1px solid var(--color-border)',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                  <div style={{ textAlign: 'center' }}>
                    <p style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-ink-4)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Starting</p>
                    <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--color-ink-3)' }}>{student.before}</div>
                  </div>
                  <div style={{ width: '40px', height: '1px', background: 'var(--color-border)' }} />
                  <div style={{ textAlign: 'center' }}>
                    <p style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-brand)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Achieved</p>
                    <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--color-brand)' }}>{student.after}</div>
                  </div>
                </div>
                
                {/* Visual Progress */}
                <div style={{ height: '8px', background: 'white', borderRadius: 'var(--radius-pill)', overflow: 'hidden', position: 'relative' }}>
                  <div style={{ 
                    position: 'absolute', 
                    height: '100%', 
                    left: 0, 
                    width: `${(student.after / 9) * 100}%`,
                    background: 'var(--color-brand)' 
                  }} />
                  <div style={{ 
                    position: 'absolute', 
                    height: '100%', 
                    left: 0, 
                    width: `${(student.before / 9) * 100}%`,
                    background: 'rgba(0,0,0,0.1)' 
                  }} />
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>

      <style>{`
        @media (max-width: 1024px) {
          div[style*="gridTemplateColumns: repeat(3, 1fr)"] { grid-template-columns: 1fr !important; }
          div[style*="gridTemplateColumns: 1fr 1fr"] { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </section>
  );
}
