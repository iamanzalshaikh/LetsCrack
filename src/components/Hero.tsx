import { Link } from 'react-router-dom';
import { ArrowRight, CheckCircle2, TrendingUp, Sparkles, Star } from 'lucide-react';
import heroStudent from '../assets/hero-student.png';
import Counter from './ui/Counter';

/* 
 * LETSCRACK IELTS — HERO SECTION REDESIGN
 * Reference: schoolfms.com aesthetics
 * Focus: Professionalism, Academic authority, Clean UI
 */

const PROOF_POINTS = [
  '96% of students improve within 30 days',
  'Academic & General Training formats covered',
  'Official-format tasks with AI Examiners',
];

const SCORES = [
  { label: 'Listening', score: '8.5', pct: 92, color: '#3b82f6' },
  { label: 'Reading',   score: '8.0', pct: 85, color: '#10b981' },
  { label: 'Writing',   score: '7.5', pct: 78, color: '#f59e0b' },
  { label: 'Speaking',  score: '8.0', pct: 85, color: '#8b5cf6' },
];

const TRUST_INSTITUTIONS = [
  'University of Toronto', 'Oxford University', 'Imperial College', 'McGill', 'University of Melbourne',
];

export default function Hero() {
  return (
    <section 
      aria-label="Hero" 
      style={{ 
        background: '#fff', 
        position: 'relative', 
        overflow: 'hidden',
        borderBottom: '1px solid var(--color-border)',
      }}
    >
      {/* Subtle background element for texture (SchoolFMS vibe) */}
      <div style={{
        position: 'absolute',
        top: '-10%',
        right: '-5%',
        width: '600px',
        height: '600px',
        background: 'radial-gradient(circle, rgba(26,86,219,0.03) 0%, rgba(255,255,255,0) 70%)',
        zIndex: 0,
        pointerEvents: 'none',
      }} />

      <div className="container" style={{ position: 'relative', zIndex: 1 }}>
        <div className="hero-grid-wrapper" style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 1.25fr) minmax(0, 0.75fr)',
          gap: '5rem',
          alignItems: 'center',
          paddingTop: '60px',
          paddingBottom: '80px',
        }}>
          
          {/* ════ LEFT CONTENT ════ */}
          <div>
            
            {/* Elegant chip label */}
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.4rem 1rem',
              background: 'var(--color-brand-lt)',
              color: 'var(--color-brand)',
              borderRadius: '99px',
              fontSize: '0.8125rem',
              fontWeight: 700,
              letterSpacing: '0.02em',
              marginBottom: '2rem',
              boxShadow: '0 2px 8px rgba(26,86,219,0.08)',
            }}>
              <TrendingUp size={14} strokeWidth={3} />
              THE #1 IELTS SIMULATOR FOR 2024
            </div>

            {/* Main Title - Extreme emphasis on "Crack" or "8.0" */}
            <h1 style={{
              fontSize: 'clamp(2.5rem, 4.5vw, 3.75rem)',
              fontWeight: 800,
              color: 'var(--color-ink)',
              lineHeight: 1.2,
              letterSpacing: '-0.02em',
              marginBottom: '1.5rem',
              fontFamily: 'var(--font-display)',
            }}>
              Master the IELTS.<br />
              Achieve <span style={{ color: 'var(--color-brand)' }}>Band 8.0</span><br />
              <span style={{ fontWeight: 600, color: 'var(--color-ink-2)' }}>with AI Precision.</span>
            </h1>

            {/* Subtext */}
            <p style={{
              fontSize: '1.125rem',
              color: 'var(--color-ink-2)',
              lineHeight: 1.7,
              marginBottom: '2.5rem',
              maxWidth: '520px',
              fontWeight: 400,
            }}>
              Experience the world’s most realistic IELTS practice platform. 
              Get instant, examiner-grade AI feedback across all 4 modules.
            </p>

            {/* Benefit Grid */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr',
              gap: '0.75rem',
              marginBottom: '2.75rem',
            }}>
              {PROOF_POINTS.map((point) => (
                <div key={point} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div style={{
                    width: '20px', height: '20px', borderRadius: '50%',
                    background: 'var(--color-success-lt)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0,
                  }}>
                    <CheckCircle2 size={12} color="var(--color-success)" strokeWidth={3} />
                  </div>
                  <span style={{ fontSize: '0.9375rem', fontWeight: 500, color: 'var(--color-ink-2)' }}>
                    {point}
                  </span>
                </div>
              ))}
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '3.5rem' }}>
              <Link to="/register" className="btn btn-primary btn-lg" style={{ minWidth: '200px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                Start Practice Now <ArrowRight size={18} style={{ marginLeft: '4px' }} />
              </Link>
              <Link to="/login" className="btn btn-outline btn-lg" style={{ minWidth: '180px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                View Mock Tests
              </Link>
            </div>

            {/* Credibility footer */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <div style={{ display: 'flex', marginRight: '0.5rem' }}>
                  {[1, 2, 3].map((i) => (
                    <div key={i} style={{
                      width: '32px', height: '32px', borderRadius: '50%',
                      border: '2px solid #fff', background: '#f1f5f9',
                      marginLeft: i === 1 ? 0 : '-10px',
                      zIndex: 10 - i,
                      backgroundImage: `url(https://i.pravatar.cc/100?img=${i+10})`,
                      backgroundSize: 'cover',
                    }} />
                  ))}
                </div>
                <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-ink)' }}>
                  <Counter end={40} suffix="k+" /> Students
                </div>
              </div>
              <div style={{ width: '1px', height: '24px', background: 'var(--color-border)' }} />
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                <span style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--color-ink)' }}>
                  <Counter end={4.9} decimals={1} />/5
                </span>
                <span style={{ fontSize: '0.875rem', color: 'var(--color-ink-3)', marginLeft: '2px' }}>Rating</span>
              </div>
            </div>
          </div>

          {/* ════ RIGHT VISUAL ════ */}
          <div style={{ position: 'relative' }}>
            
            {/* Visual Container */}
            <div style={{
              position: 'relative',
              borderRadius: '24px',
              padding: '8px',
              background: '#fff',
              border: '1px solid var(--color-border)',
              boxShadow: '0 20px 40px -12px rgba(15, 23, 42, 0.06)',
            }}>
              <div style={{
                borderRadius: '16px',
                overflow: 'hidden',
                position: 'relative',
                background: '#f8fafc',
              }}>
                <img 
                  src={heroStudent} 
                  alt="IELTS Preparation Success" 
                  style={{ width: '100%', height: '360px', objectFit: 'cover', display: 'block' }}
                />
                
                {/* Floating Score Analytics (Mockup style) */}
                <div style={{
                  position: 'absolute',
                  top: '1.5rem',
                  left: '1.5rem',
                  background: 'rgba(255, 255, 255, 0.95)',
                  backdropFilter: 'blur(8px)',
                  padding: '1rem',
                  borderRadius: '16px',
                  boxShadow: '0 10px 20px rgba(0,0,0,0.05)',
                  width: '180px',
                  border: '1px solid rgba(255,255,255,0.5)',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--color-brand)' }} />
                    <span style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--color-ink-3)', textTransform: 'uppercase' }}>Live Feedback</span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {SCORES.slice(0, 3).map((s) => (
                      <div key={s.label}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.65rem', fontWeight: 600, color: 'var(--color-ink-2)', marginBottom: '2px' }}>
                          <span>{s.label}</span>
                          <span>{s.score}</span>
                        </div>
                        <div style={{ height: '4px', background: '#f1f5f9', borderRadius: '4px', overflow: 'hidden' }}>
                          <div style={{ height: '100%', width: `${s.pct}%`, background: s.color, borderRadius: '4px' }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Performance Badge */}
                <div style={{
                  position: 'absolute',
                  bottom: '1.5rem',
                  right: '1.5rem',
                  background: 'var(--color-brand)',
                  color: '#fff',
                  padding: '0.75rem 1.25rem',
                  borderRadius: '16px',
                  boxShadow: '0 10px 20px rgba(26,86,219,0.2)',
                  textAlign: 'center',
                }}>
                  <div style={{ fontSize: '1.25rem', fontWeight: 800, lineHeight: 1 }}>
                    +<Counter end={2.5} decimals={1} />
                  </div>
                  <div style={{ fontSize: '0.65rem', fontWeight: 600, opacity: 0.9, marginTop: '2px' }}>BAND GROWTH</div>
                </div>
              </div>
            </div>

            {/* Decorative element behind */}
            <div style={{
              position: 'absolute',
              top: '-20px',
              right: '-20px',
              width: '100%',
              height: '100%',
              background: 'var(--color-brand-lt)',
              borderRadius: '24px',
              zIndex: -1,
              transform: 'rotate(2deg)',
            }} />
          </div>

        </div>

        {/* ════ LOGO STRIP ════ */}
        <div style={{ 
          borderTop: '1px solid var(--color-border)', 
          paddingTop: '2rem', 
          paddingBottom: '2.5rem',
          textAlign: 'center',
        }}>
          <p style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-ink-4)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '1.5rem' }}>
            Accepted for admission to top institutions worldwide
          </p>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center', 
            gap: '3rem', 
            flexWrap: 'wrap',
            opacity: 0.6,
            filter: 'grayscale(1)',
          }}>
            {TRUST_INSTITUTIONS.map(name => (
              <span key={name} style={{ 
                fontSize: '0.9rem', 
                fontWeight: 700, 
                color: 'var(--color-ink-3)',
                whiteSpace: 'nowrap',
              }}>
                {name}
              </span>
            ))}
          </div>
        </div>

      </div>

      <style>{`
        @media (max-width: 1024px) {
          .hero-grid-wrapper {
            grid-template-columns: 1fr !important;
            padding-top: 60px !important;
            gap: 3rem !important;
          }
          .hero-grid-wrapper > div:last-child {
            order: -1;
            max-width: 600px;
            margin: 0 auto;
          }
        }
      `}</style>
    </section>
  );
}
