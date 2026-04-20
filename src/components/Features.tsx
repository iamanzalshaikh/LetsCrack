import { CheckCircle2, Headphones, BookOpen, PenLine, Mic } from 'lucide-react';
import listeningImg from '../assets/feature-listening.png';
import readingImg from '../assets/feature-reading.png';
import writingImg from '../assets/feature-writing.png';
import speakingImg from '../assets/feature-speaking.png';

/* 
 * LETSCRACK IELTS — PLATFORM FEATURES
 * Style: Clean alternating sections (Text + Image)
 * References: schoolfms.com
 */

const FEATURES_DATA = [
  {
    id: 'listening',
    label: 'Listening',
    title: 'Multi-Accent Listening Lab',
    desc: 'Practice with British, Australian, Canadian and American accents across all four IELTS sections. 200+ tracks spanning monologues, dialogues, lectures, and multi-speaker discussions.',
    image: listeningImg,
    points: ['200+ audio tracks', 'All four IELTS sections', 'Variable playback speed', 'Transcript review'],
    reversed: false,
    color: '#3b82f6',
  },
  {
    id: 'reading',
    label: 'Reading',
    title: 'Academic & General Reading',
    desc: 'Authentic passages drawn from scientific journals, newspapers, and magazines. All 13 question types covered with detailed explanations for every answer.',
    image: readingImg,
    points: ['300+ passages', 'Academic & General formats', 'All 13 question types', 'Timed & untimed mode'],
    reversed: true,
    color: '#10b981',
  },
  {
    id: 'writing',
    label: 'Writing',
    title: 'AI Writing Scorer',
    desc: 'Submit Task 1 (graphs, charts, maps, diagrams) and Task 2 essays for instant AI feedback scored on all four official band descriptors — task achievement, coherence, lexical resource, and grammar.',
    image: writingImg,
    points: ['Task 1 & Task 2 prompts', 'AI band score per criterion', 'Annotated feedback', 'Unlimited submissions'],
    reversed: false,
    color: '#f59e0b',
  },
  {
    id: 'speaking',
    label: 'Speaking',
    title: 'AI Examiner Simulation',
    desc: 'Experience realistic Part 1, 2, and 3 interviews with a conversational AI examiner. Receive a detailed breakdown of your fluency, vocabulary, pronunciation, and coherence.',
    image: speakingImg,
    points: ['Parts 1, 2 & 3', 'AI fluency scoring', 'Pronunciation feedback'],
    reversed: true,
    color: '#8b5cf6',
  },
];

const Features = () => {
  return (
    <section id="features" className="section" style={{ background: '#fff' }}>
      <div className="container">
        
        {/* Section Header */}
        <div style={{ textAlign: 'center', maxWidth: '720px', margin: '0 auto 5rem' }}>
          <p className="eyebrow" style={{ justifyContent: 'center' }}>Platform Features</p>
          <h2 style={{ 
            fontSize: 'clamp(2.25rem, 5vw, 3rem)', 
            fontWeight: 800, 
            color: 'var(--color-ink)', 
            marginBottom: '1.25rem',
            fontFamily: 'var(--font-display)',
            letterSpacing: '-0.02em'
          }}>
            Every IELTS Skill.<br />
            <span style={{ color: 'var(--color-brand)' }}>One Platform.</span>
          </h2>
          <p style={{ fontSize: '1.125rem', color: 'var(--color-ink-2)', lineHeight: 1.7, margin: '0 auto' }}>
            Designed by IELTS experts to replicate the exact conditions of the real test — from multi-accent audio to official scoring rubrics.
          </p>
        </div>

        {/* Alternating Features */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8rem' }}>
          {FEATURES_DATA.map((feat) => (
            <div 
              key={feat.id} 
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '5rem',
                alignItems: 'center',
              }}
              className={`feature-row ${feat.reversed ? 'reversed' : ''}`}
            >
              {/* Text Block */}
              <div style={{ order: feat.reversed ? 2 : 1 }}>
                <div style={{
                  display: 'inline-block',
                  padding: '0.25rem 0.75rem',
                  background: `${feat.color}10`,
                  color: feat.color,
                  borderRadius: '6px',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  marginBottom: '1rem',
                }}>
                  {feat.label}
                </div>
                <h3 style={{ 
                  fontSize: '2rem', 
                  fontWeight: 800, 
                  color: 'var(--color-ink)', 
                  marginBottom: '1.25rem',
                  fontFamily: 'var(--font-display)' 
                }}>
                  {feat.title}
                </h3>
                <p style={{ 
                  fontSize: '1.0625rem', 
                  color: 'var(--color-ink-2)', 
                  lineHeight: 1.7, 
                  marginBottom: '2rem' 
                }}>
                  {feat.desc}
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {feat.points.map((p) => (
                    <div key={p} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <CheckCircle2 size={18} color="var(--color-success)" strokeWidth={2.5} />
                      <span style={{ fontSize: '1rem', fontWeight: 500, color: 'var(--color-ink-2)' }}>{p}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Image Block */}
              <div style={{ order: feat.reversed ? 1 : 2 }}>
                <div style={{
                  position: 'relative',
                  borderRadius: '20px',
                  overflow: 'hidden',
                  boxShadow: '0 20px 40px -12px rgba(0,0,0,0.08)',
                  border: '1px solid var(--color-border)',
                  background: '#f8fafc',
                }}>
                  <img 
                    src={feat.image} 
                    alt={feat.title} 
                    style={{ width: '100%', height: '400px', objectFit: 'cover', display: 'block' }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>

      <style>{`
        @media (max-width: 960px) {
          .feature-row {
            grid-template-columns: 1fr !important;
            gap: 3rem !important;
            text-align: center;
          }
          .feature-row > div {
            order: initial !important;
          }
          .feature-row .reversed {
             flex-direction: column-reverse;
          }
          .feature-row div:first-child {
            display: flex;
            flex-direction: column;
            align-items: center;
          }
        }
      `}</style>
    </section>
  );
};

export default Features;
