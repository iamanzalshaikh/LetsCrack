import { CheckCircle2 } from 'lucide-react';
import listeningImg from '../assets/feature-listening.png';
import readingImg from '../assets/feature-reading.png';
import writingImg from '../assets/feature-writing.png';
import speakingImg from '../assets/feature-speaking.png';

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
    bgColor: 'var(--color-brand-lt)',
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
    bgColor: '#ecfdf5',
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
    bgColor: '#fffbeb',
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
    bgColor: '#f5f3ff',
  },
];

const Features = () => {
  return (
    <section id="features" className="section" style={{ background: '#fff' }}>
      <div className="container">
        
        {/* Section Header */}
        <div style={{ textAlign: 'center', maxWidth: '720px', margin: '0 auto 6rem' }}>
          <p className="eyebrow" style={{ justifyContent: 'center' }}>Platform Features</p>
          <h2 style={{ fontSize: 'clamp(2.25rem, 5vw, 3rem)', marginBottom: '1.25rem' }}>
            Every IELTS Skill.<br />
            <span style={{ color: 'var(--color-brand)' }}>One Platform.</span>
          </h2>
          <p style={{ fontSize: '1.125rem', color: 'var(--color-ink-2)', lineHeight: 1.7 }}>
            Designed by IELTS experts to replicate the exact conditions of "The Real Test" — from multi-accent audio to official scoring rubrics.
          </p>
        </div>

        {/* Alternating Features */}
        <div style={{ display: 'grid', gap: '8rem' }}>
          {FEATURES_DATA.map((feat) => (
            <div 
              key={feat.id} 
              className="grid-2" 
              style={{ alignItems: 'center' }}
            >
              {/* Text Block */}
              <div style={{ order: feat.reversed ? 2 : 1 }} className="animate-fade-up">
                <div style={{
                  display: 'inline-flex',
                  padding: '0.35rem 1rem',
                  background: feat.bgColor,
                  color: feat.color,
                  borderRadius: '10px',
                  fontSize: '0.8125rem',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  marginBottom: '1.25rem',
                }}>
                  {feat.label}
                </div>
                <h3 style={{ fontSize: '2.25rem', marginBottom: '1.25rem' }}>
                  {feat.title}
                </h3>
                <p style={{ fontSize: '1.125rem', marginBottom: '2rem', lineHeight: 1.7 }}>
                  {feat.desc}
                </p>
                <div style={{ display: 'grid', gap: '0.875rem' }}>
                  {feat.points.map((p) => (
                    <div key={p} style={{ display: 'flex', alignItems: 'center', gap: '0.875rem' }}>
                      <CheckCircle2 size={20} color="var(--color-success)" strokeWidth={2.5} />
                      <span style={{ fontSize: '1rem', fontWeight: 500, color: 'var(--color-ink-2)' }}>{p}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Image Block */}
              <div style={{ order: feat.reversed ? 1 : 2 }} className="animate-fade-in">
                <div style={{
                  borderRadius: '24px',
                  overflow: 'hidden',
                  boxShadow: 'var(--shadow-lg)',
                  border: '1px solid var(--color-border)',
                  background: 'var(--color-surface-2)',
                  padding: '12px'
                }}>
                   <div style={{ borderRadius: '16px', overflow: 'hidden' }}>
                    <img 
                      src={feat.image} 
                      alt={feat.title} 
                      style={{ width: '100%', height: '420px', objectFit: 'cover' }}
                    />
                   </div>
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};

export default Features;
