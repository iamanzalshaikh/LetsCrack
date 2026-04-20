import { UserPlus, BookOpen, Award, ArrowRight } from "lucide-react";

const steps = [
  {
    number: "01",
    icon: UserPlus,
    title: "Create Your Account",
    desc: "Sign up in under a minute. Tell us your target band score and exam date. Our system builds a smart, personalised study plan focused on your weakest skills.",
    note: "Academic or General Training · Any current band level",
    color: "var(--color-brand)",
    colorLight: "var(--color-brand-lt)",
  },
  {
    number: "02",
    icon: BookOpen,
    title: "Practice Every Day",
    desc: "Work through authentic Listening, Reading, Writing, and Speaking tasks that mirror the real IELTS exam. Get instant AI feedback on every answer you submit.",
    note: "Timed · Official format · Instant AI scoring",
    color: "var(--color-success)",
    colorLight: "var(--color-success-lt)",
  },
  {
    number: "03",
    icon: Award,
    title: "Achieve Your Target Band",
    desc: "96% of LetsCrack students reach their target within 30 days. Track your progress across all four skills and walk into the exam room with genuine confidence.",
    note: "Band 7.5+ Guaranteed on Ultimate plan",
    color: "var(--color-gold)",
    colorLight: "var(--color-gold-lt)",
  },
];

const HowItWorks = () => {
  return (
    <section
      id="how-it-works"
      className="section"
      style={{ background: "var(--color-surface)" }}
    >
      <div className="container">
        {/* Header */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "4rem",
            alignItems: "end",
            marginBottom: "4rem",
          }}
          className="how-header"
        >
          <div>
            <p className="eyebrow">How It Works</p>
            <h2
              style={{
                fontSize: "clamp(2rem, 4vw, 2.75rem)",
                fontWeight: 800,
                color: "var(--color-ink)",
                letterSpacing: "-0.025em",
                lineHeight: 1.15,
                fontFamily: "var(--font-display)",
              }}
            >
              From Sign-Up to <span style={{ color: "var(--color-brand)" }}>Band 8+</span> in Three Steps
            </h2>
          </div>
          <div>
            <p
              style={{
                fontSize: "1.0625rem",
                color: "var(--color-ink-2)",
                lineHeight: 1.75,
                maxWidth: "none",
              }}
            >
              No fluff. No filler. Just the most direct path to the score you
              need for your visa, university admission, or professional
              registration.
            </p>
            <a
              href="#pricing"
              className="btn btn-outline"
              style={{ marginTop: "1.5rem" }}
            >
              Get Started Free <ArrowRight size={16} />
            </a>
          </div>
        </div>

        {/* Steps */}
        <div className="grid-3" style={{ gap: "1.5rem", position: "relative" }}>
          {/* Connector line */}
          <div
            style={{
              position: "absolute",
              top: "2.5rem",
              left: "calc(16.66% + 1.5rem)",
              right: "calc(16.66% + 1.5rem)",
              height: "1px",
              background: "var(--color-border)",
              zIndex: 0,
            }}
            className="step-connector"
          />

          {steps.map((step, i) => {
            const Icon = step.icon;
            return (
              <div
                key={step.number}
                style={{ position: "relative", zIndex: 1 }}
              >
                {/* Number badge */}
                <div
                  style={{
                    width: "2.75rem",
                    height: "2.75rem",
                    borderRadius: "50%",
                    background: step.color,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "0.875rem",
                    fontWeight: 800,
                    color: "#fff",
                    marginBottom: "1.75rem",
                    boxShadow: `0 4px 12px 0 ${step.color}40`,
                  }}
                >
                  {i + 1}
                </div>

                <h3
                  style={{
                    fontSize: "1.25rem",
                    fontWeight: 700,
                    color: "var(--color-ink)",
                    marginBottom: "0.75rem",
                    letterSpacing: "-0.015em",
                  }}
                >
                  {step.title}
                </h3>
                <p
                  style={{
                    fontSize: "0.9375rem",
                    color: "var(--color-ink-2)",
                    lineHeight: 1.7,
                    marginBottom: "1.25rem",
                    maxWidth: "none",
                  }}
                >
                  {step.desc}
                </p>
                <div
                  style={{
                    display: "inline-block",
                    padding: "0.375rem 0.875rem",
                    borderRadius: "999px",
                    fontSize: "0.8rem",
                    fontWeight: 600,
                    background: step.colorLight,
                    color: step.color,
                  }}
                >
                  {step.note}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .how-header { grid-template-columns: 1fr !important; gap: 1.5rem !important; }
          .step-connector { display: none; }
        }
      `}</style>
    </section>
  );
};

export default HowItWorks;
