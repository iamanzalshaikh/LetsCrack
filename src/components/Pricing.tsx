import { Check, Shield, Zap } from 'lucide-react';

const plans = [
  {
    name: 'Starter',
    price: 0,
    priceLabel: 'Free forever',
    desc: 'Explore the platform and try authentic IELTS tasks at no cost.',
    cta: 'Start for Free',
    ctaVariant: 'outline' as const,
    highlight: false,
    features: [
      '5 Listening practice tests',
      '5 Reading passages',
      '2 Writing submissions',
      '1 Speaking simulation',
      'Basic band score report',
    ],
  },
  {
    name: 'Academic Pro',
    price: 19,
    priceLabel: 'per month',
    desc: 'Everything you need to hit your target band for university or immigration.',
    cta: 'Start 7-Day Free Trial',
    ctaVariant: 'primary' as const,
    highlight: true,
    tag: 'Most Popular',
    features: [
      'Unlimited Listening & Reading',
      'Unlimited Writing submissions',
      'AI scoring on all 4 criteria',
      'Unlimited Speaking simulations',
      'Full AI examiner feedback',
      'Performance analytics',
      'Full-length mock exams',
    ],
  },
  {
    name: 'Ultimate',
    price: 39,
    priceLabel: 'per month',
    desc: 'For high achievers targeting Band 8.0+ with a guaranteed result.',
    cta: 'Get Ultimate Access',
    ctaVariant: 'outline' as const,
    highlight: false,
    features: [
      'Everything in Academic Pro',
      'Band 7.5+ Score Guarantee',
      '2× live 1-on-1 sessions',
      'Expert essay corrections',
      'Dedicated study coach',
      'Priority support (< 2 hr)',
    ],
  },
];

const Pricing = () => {
  return (
    <section id="pricing" className="section" style={{ background: 'var(--color-surface-2)', borderTop: '1px solid var(--color-border)' }}>
      <div className="container">

        {/* Header */}
        <div style={{ textAlign: 'center', maxWidth: '640px', margin: '0 auto 4rem' }} className="animate-fade-up">
          <p className="eyebrow" style={{ justifyContent: 'center' }}>Pricing Plans</p>
          <h2 style={{ fontSize: 'clamp(2rem, 4vw, 2.75rem)', marginBottom: '1.25rem' }}>
            Simple, Transparent Pricing
          </h2>
          <p style={{ fontSize: '1.125rem', color: 'var(--color-ink-2)', lineHeight: 1.7 }}>
            Start free and upgrade when you're ready. Cancel anytime — no lock-in.
          </p>
        </div>

        {/* Cards Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem', alignItems: 'stretch' }}>
          {plans.map((plan, i) => (
            <div
              key={plan.name}
              className="card animate-fade-up"
              style={{ 
                animationDelay: `${(i + 1) * 100}ms`,
                display: 'flex', 
                flexDirection: 'column', 
                padding: '3rem 2.5rem',
                border: plan.highlight ? '2px solid var(--color-brand)' : '1px solid var(--color-border)',
                background: 'white',
                position: 'relative'
              }}
            >
              {plan.tag && (
                <div style={{
                  position: 'absolute', top: 0, left: '50%',
                  transform: 'translate(-50%, -50%)',
                  background: 'var(--color-brand)',
                  color: '#fff', fontSize: '0.75rem', fontWeight: 800,
                  letterSpacing: '0.05em', textTransform: 'uppercase',
                  padding: '0.5rem 1.5rem',
                  borderRadius: 'var(--radius-pill)',
                  whiteSpace: 'nowrap',
                  boxShadow: 'var(--shadow-brand)'
                }}>
                  <Zap size={12} style={{ display: 'inline', marginRight: 6, marginTop: -2 }} />
                  {plan.tag}
                </div>
              )}

              <div style={{ marginBottom: '2.5rem' }}>
                <span style={{ 
                  display: 'inline-block', 
                  padding: '0.4rem 1rem', 
                  borderRadius: 'var(--radius-pill)',
                  fontSize: '0.8125rem', 
                  fontWeight: 700,
                  background: plan.highlight ? 'var(--color-brand-lt)' : 'var(--color-surface-3)',
                  color: plan.highlight ? 'var(--color-brand)' : 'var(--color-ink-3)',
                  marginBottom: '1.5rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em'
                }}>
                  {plan.name}
                </span>

                <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem', marginBottom: '1rem' }}>
                  <span style={{ fontSize: '3.5rem', fontWeight: 800, color: 'var(--color-ink)', lineHeight: 1 }}>
                    {plan.price === 0 ? 'Free' : `$${plan.price}`}
                  </span>
                  {plan.price > 0 && (
                    <span style={{ fontSize: '1rem', color: 'var(--color-ink-3)', fontWeight: 500 }}>/{plan.priceLabel}</span>
                  )}
                </div>

                <p style={{ fontSize: '1rem', color: 'var(--color-ink-2)', lineHeight: 1.6 }}>
                  {plan.desc}
                </p>
              </div>

              <div style={{ display: 'grid', gap: '1rem', marginBottom: '2.5rem', flexGrow: 1 }}>
                {plan.features.map(f => (
                  <div key={f} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{ 
                      width: '20px', height: '20px', borderRadius: '50%',
                      background: plan.highlight ? 'var(--color-brand-lt)' : 'var(--color-success-lt)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      <Check size={12} color={plan.highlight ? 'var(--color-brand)' : 'var(--color-success)'} strokeWidth={3} />
                    </div>
                    <span style={{ fontSize: '0.9375rem', color: 'var(--color-ink-2)', fontWeight: 500 }}>{f}</span>
                  </div>
                ))}
              </div>

              <a
                href="/register"
                className={`btn ${plan.highlight ? 'btn-primary' : 'btn-outline'} btn-lg`}
                style={{ width: '100%', justifyContent: 'center' }}
              >
                {plan.cta}
              </a>
            </div>
          ))}
        </div>

        {/* Money back guarantee */}
        <div style={{
          marginTop: '4rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '0.75rem',
          color: 'var(--color-ink-3)',
          fontSize: '0.9375rem',
          fontWeight: 500
        }}>
          <Shield size={20} color="var(--color-success)" />
          30-Day Money-Back Guarantee on all paid plans
        </div>
      </div>
    </section>
  );
};

export default Pricing;
