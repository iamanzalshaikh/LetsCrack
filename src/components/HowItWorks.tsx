import { UserPlus, BookOpen, Award, ArrowRight } from "lucide-react";

const steps = [
  {
    icon: UserPlus,
    title: "Create Your Account",
    desc: "Tell us your target band score and exam date. Our system builds a smart, personalised study plan focused on your weakest skills.",
    note: "Academic or General Training",
    color: "var(--color-brand)",
    colorLight: "var(--color-brand-lt)",
  },
  {
    icon: BookOpen,
    title: "Practice Every Day",
    desc: "Work through authentic tasks that mirror the real IELTS exam. Get instant AI feedback on every answer you submit.",
    note: "Official format · Instant AI scoring",
    color: "var(--color-success)",
    colorLight: "var(--color-success-lt)",
  },
  {
    icon: Award,
    title: "Achieve Your Target",
    desc: "96% of students reach their target within 30 days. Track your progress across all four skills and walk into the exam room with genuine confidence.",
    note: "Band 7.5+ Guaranteed",
    color: "var(--color-gold)",
    colorLight: "var(--color-gold-lt)",
  },
];

const HowItWorks = () => {
  return (
    <section id="how-it-works" className="section" style={{ background: "var(--color-surface-2)" }}>
      <div className="container">
        {/* Header */}
        <div 
          className="grid-2" 
          style={{ alignItems: 'end', marginBottom: '5rem', gap: '4rem' }}
        >
          <div className="animate-fade-up">
            <p className="eyebrow">How It Works</p>
            <h2 style={{ fontSize: "clamp(2rem, 4vw, 2.75rem)", lineHeight: 1.15 }}>
              From Sign-Up to <span style={{ color: "var(--color-brand)" }}>Band 8+</span> in Three Steps
            </h2>
          </div>
          <div className="animate-fade-up delay-1">
            <p style={{ fontSize: "1.125rem", color: "var(--color-ink-2)", lineHeight: 1.7, marginBottom: '1.5rem' }}>
              No fluff. Just the most direct path to the score you need for your visa, university admission, or professional registration.
            </p>
            <a href="#pricing" className="btn btn-outline">
              Get Started Free <ArrowRight size={18} />
            </a>
          </div>
        </div>

        {/* Steps Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '2rem' }}>
          {steps.map((step, i) => {
            const Icon = step.icon;
            return (
              <div 
                key={step.title} 
                className="card animate-fade-up" 
                style={{ 
                  animationDelay: `${(i + 1) * 100}ms`,
                  padding: '2.5rem',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'flex-start'
                }}
              >
                <div style={{
                  width: "3.5rem",
                  height: "3.5rem",
                  borderRadius: "14px",
                  background: step.colorLight,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: step.color,
                  marginBottom: "2rem",
                  boxShadow: `0 4px 12px 0 ${step.color}20`,
                }}>
                  <Icon size={24} strokeWidth={2.5} />
                </div>

                <h3 style={{ fontSize: "1.375rem", marginBottom: "1rem" }}>
                  {step.title}
                </h3>
                
                <p style={{ fontSize: "1rem", color: "var(--color-ink-2)", lineHeight: 1.7, marginBottom: "2rem", flexGrow: 1 }}>
                  {step.desc}
                </p>

                <div style={{
                  padding: "0.4rem 1rem",
                  borderRadius: "var(--radius-pill)",
                  fontSize: "0.8125rem",
                  fontWeight: 700,
                  background: step.colorLight,
                  color: step.color,
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em'
                }}>
                  {step.note}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <style>{`
        @media (max-width: 1024px) {
          .grid-2 { grid-template-columns: 1fr !important; gap: 2rem !important; }
          div[style*="gridTemplateColumns: repeat(3, 1fr)"] { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </section>
  );
};

export default HowItWorks;
