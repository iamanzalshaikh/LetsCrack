import { Link } from 'react-router-dom';
import { ArrowRight, CheckCircle2, TrendingUp } from 'lucide-react';
import heroStudent from '../assets/hero-student.png';

const PROOF_POINTS = [
  '96% of students improve within 30 days',
  'Academic & General Training formats covered',
  'Official-format tasks with AI Examiners',
];

const SCORES = [
  { label: 'Listening', score: '8.5', pct: 92, color: '#3b82f6' },
  { label: 'Reading',   score: '8.0', pct: 85, color: '#10b981' },
  { label: 'Writing',   score: '7.5', pct: 78, color: '#f59e0b' },
];

export default function Hero() {
  return (
    <section className="section" style={{ background: '#fff', position: 'relative' }}>
      {/* Decorative Blur */}
      <div style={{
        position: 'absolute',
        top: '-10%',
        right: '-5%',
        width: '600px',
        height: '600px',
        background: 'radial-gradient(circle, rgba(26,86,219,0.04) 0%, rgba(255,255,255,0) 70%)',
        zIndex: 0,
        pointerEvents: 'none',
      }} />

      <div className="container" style={{ position: 'relative', zIndex: 1 }}>
        <div className="grid-2" style={{ alignItems: 'center' }}>
          
          {/* Left Content */}
          <div className="animate-fade-up">
            <div className="eyebrow" style={{ background: 'var(--color-brand-lt)', padding: '0.4rem 1rem', borderRadius: 'var(--radius-pill)' }}>
              <TrendingUp size={14} strokeWidth={3} />
              THE #1 IELTS SIMULATOR FOR 2024
            </div>

            <h1 style={{ fontSize: 'clamp(2.5rem, 5vw, 4rem)', marginBottom: '1.5rem', lineHeight: 1.1 }}>
              Master the IELTS.<br />
              Achieve <span style={{ color: 'var(--color-brand)' }}>Band 8.0</span><br />
              <span style={{ fontWeight: 600, color: 'var(--color-ink-2)' }}>with AI Precision.</span>
            </h1>

            <p style={{ fontSize: '1.125rem', marginBottom: '2.5rem', maxWidth: '540px' }}>
              Experience the world’s most realistic IELTS practice platform. 
              Get instant, examiner-grade AI feedback across all 4 modules.
            </p>

            {/* Proof Points */}
            <div style={{ display: 'grid', gap: '1rem', marginBottom: '3rem' }}>
              {PROOF_POINTS.map((point) => (
                <div key={point} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div style={{
                    width: '24px', height: '24px', borderRadius: '50%',
                    background: 'var(--color-success-lt)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                  }}>
                    <CheckCircle2 size={14} color="var(--color-success)" strokeWidth={3} />
                  </div>
                  <span style={{ fontWeight: 500, color: 'var(--color-ink-2)' }}>{point}</span>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              <Link to="/register" className="btn btn-primary btn-lg">
                Start Practice Now <ArrowRight size={20} />
              </Link>
              <Link to="/login" className="btn btn-outline btn-lg">
                View Mock Tests
              </Link>
            </div>
          </div>

          {/* Right Visual */}
          <div className="animate-fade-in" style={{ position: 'relative' }}>
            <div style={{
              borderRadius: '24px',
              padding: '12px',
              background: '#fff',
              border: '1px solid var(--color-border)',
              boxShadow: 'var(--shadow-lg)'
            }}>
              <div style={{ borderRadius: '16px', overflow: 'hidden', position: 'relative' }}>
                <img 
                  src={heroStudent} 
                  alt="IELTS Student" 
                  style={{ width: '100%', height: '440px', objectFit: 'cover' }}
                />
                
                {/* Floating Analytics Card */}
                <div style={{
                  position: 'absolute',
                  top: '2rem',
                  left: '2rem',
                  background: 'rgba(255, 255, 255, 0.95)',
                  backdropFilter: 'blur(10px)',
                  padding: '1.25rem',
                  borderRadius: '20px',
                  boxShadow: 'var(--shadow-md)',
                  width: '200px',
                  border: '1px solid rgba(255,255,255,0.5)'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1rem' }}>
                    <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: 'var(--color-brand)' }} />
                    <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--color-ink-3)', textTransform: 'uppercase' }}>Live Feedback</span>
                  </div>
                  <div style={{ display: 'grid', gap: '0.75rem' }}>
                    {SCORES.map((s) => (
                      <div key={s.label}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-ink-2)', marginBottom: '4px' }}>
                          <span>{s.label}</span>
                          <span>{s.score}</span>
                        </div>
                        <div style={{ height: '6px', background: '#f1f5f9', borderRadius: '6px', overflow: 'hidden' }}>
                          <div style={{ height: '100%', width: `${s.pct}%`, background: s.color }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Score Growth Badge */}
                <div style={{
                  position: 'absolute',
                  bottom: '2rem',
                  right: '2rem',
                  background: 'var(--color-brand)',
                  color: '#fff',
                  padding: '1rem 1.5rem',
                  borderRadius: '20px',
                  boxShadow: 'var(--shadow-brand)',
                  textAlign: 'center'
                }}>
                  <div style={{ fontSize: '1.5rem', fontWeight: 800, lineHeight: 1 }}>+2.5</div>
                  <div style={{ fontSize: '0.7rem', fontWeight: 600, opacity: 0.9, marginTop: '2px', letterSpacing: '0.05em' }}>BAND GROWTH</div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
