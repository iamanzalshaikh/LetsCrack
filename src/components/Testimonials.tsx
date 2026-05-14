import { Star, Quote } from 'lucide-react';

const TESTIMONIALS = [
  {
    name: 'Priya Nair',
    country: 'India',
    exam: 'Academic',
    quote: 'The AI writing feedback was specific and practical. I improved faster in 4 weeks than in my previous 4 months of self-study.',
    target: '7.5',
    achieved: '8.0',
    img: 'https://i.pravatar.cc/100?img=44',
  },
  {
    name: 'Omar Hassan',
    country: 'UAE',
    exam: 'General',
    quote: 'Daily speaking practice removed my anxiety. The mock test format felt exactly like the real exam day experience.',
    target: '7.0',
    achieved: '7.5',
    img: 'https://i.pravatar.cc/100?img=12',
  },
  {
    name: 'Sarah Okonkwo',
    country: 'Nigeria',
    exam: 'Academic',
    quote: 'I needed all modules at 7.0 for registration. The personalized plan told me precisely what to practice each day.',
    target: '7.0',
    achieved: '7.5',
    img: 'https://i.pravatar.cc/100?img=5',
  },
];

// Double items for infinite scroll effect
const SCROLL_ITEMS = [...TESTIMONIALS, ...TESTIMONIALS, ...TESTIMONIALS];

export default function Testimonials() {
  return (
    <section id="testimonials" className="section" style={{ background: '#fff', borderTop: '1px solid var(--color-border)', overflow: 'hidden' }}>
      <div className="container">
        
        {/* Header */}
        <div style={{ textAlign: 'center', maxWidth: '720px', margin: '0 auto 4rem' }} className="animate-fade-up">
          <p className="eyebrow" style={{ justifyContent: 'center' }}>Success Stories</p>
          <h2 style={{ fontSize: 'clamp(2.25rem, 5vw, 2.75rem)', marginBottom: '1.25rem' }}>
            Trusted by students targeting<br />
            higher IELTS bands
          </h2>
          <p style={{ fontSize: '1.125rem', color: 'var(--color-ink-2)', lineHeight: 1.7 }}>
            Verified learner outcomes with target score, achieved score, and exam type.
          </p>
        </div>
      </div>

      {/* Marquee Wrapper */}
      <div className="testimonial-marquee-container" style={{ position: 'relative' }}>
        <div className="testimonial-track">
          {SCROLL_ITEMS.map((t, idx) => (
            <div key={idx} className="card" style={{
              flexShrink: 0,
              width: '380px',
              padding: '2.5rem',
              margin: '0 1rem',
              display: 'flex',
              flexDirection: 'column',
              background: 'white'
            }}>
              {/* Profile */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                <img 
                  src={t.img} 
                  alt={t.name} 
                  style={{ width: '48px', height: '48px', borderRadius: '50%', objectFit: 'cover' }} 
                />
                <div>
                  <h4 style={{ fontSize: '1rem', fontWeight: 700, margin: 0 }}>{t.name}</h4>
                  <p style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-ink-4)', margin: 0 }}>
                    {t.country} • IELTS {t.exam}
                  </p>
                </div>
              </div>

              {/* Quote */}
              <div style={{ position: 'relative', flex: 1, marginBottom: '2rem' }}>
                <Quote size={20} color="var(--color-brand)" style={{ position: 'absolute', top: -10, left: -5, opacity: 0.1 }} />
                <p style={{ 
                  fontSize: '1rem', 
                  color: 'var(--color-ink-2)', 
                  lineHeight: 1.7, 
                  position: 'relative',
                  fontStyle: 'italic'
                }}>
                  "{t.quote}"
                </p>
              </div>

              {/* Score Proof Badge */}
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'space-between', 
                background: 'var(--color-brand-lt)',
                padding: '0.875rem 1.125rem',
                borderRadius: '14px',
                border: '1px solid rgba(26,86,219,0.1)',
              }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-ink-4)', textTransform: 'uppercase' }}>
                  Target: <span style={{ color: 'var(--color-ink-2)' }}>{t.target}</span>
                </div>
                <div style={{ fontSize: '0.9375rem', fontWeight: 800, color: 'var(--color-brand)' }}>
                   Band {t.achieved} <span style={{ fontSize: '0.7rem', fontWeight: 600, opacity: 0.8 }}>Achieved</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="container">
        {/* Aggregate Review */}
        <div 
          className="animate-fade-up"
          style={{ 
            marginTop: '4rem', 
            display: 'flex', 
            justifyContent: 'center',
            alignItems: 'center',
            gap: '1rem',
            padding: '1rem 2rem',
            background: 'var(--color-surface-2)',
            borderRadius: 'var(--radius-pill)',
            width: 'fit-content',
            margin: '4rem auto 0',
            border: '1px solid var(--color-border)'
          }}
        >
          <div style={{ display: 'flex', gap: '2px' }}>
            {[...Array(5)].map((_, i) => (
              <Star key={i} size={16} fill="#f59e0b" color="#f59e0b" />
            ))}
          </div>
          <p style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--color-ink)', margin: 0 }}>
            4.9/5 · 12,400+ verified student reviews
          </p>
        </div>
      </div>

      <style>{`
        .testimonial-track {
          display: flex;
          width: max-content;
          animation: marquee 40s linear infinite;
          padding: 2rem 0;
        }
        .testimonial-track:hover {
          animation-play-state: paused;
        }
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-33.33%); }
        }
      `}</style>
    </section>
  );
}
