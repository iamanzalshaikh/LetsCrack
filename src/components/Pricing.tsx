import { Check, Shield, Star, Zap } from 'lucide-react';

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
      '2 Writing task submissions',
      '1 Speaking simulation',
      'Basic band score report',
      'Community forum access',
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
      'Unlimited Listening & Reading tests',
      'Unlimited Writing submissions',
      'AI scoring on all 4 criteria',
      'Unlimited Speaking simulations',
      'Full AI examiner feedback',
      'Performance analytics dashboard',
      'Full-length mock exams (timed)',
      'Email & chat support',
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
      '2× live 1-on-1 tutor sessions',
      'Expert essay corrections',
      'Dedicated study coach',
      'Custom 30-day study plan',
      'Priority support (< 2 hr)',
      'Certificate of Completion',
    ],
  },
];

const Pricing = () => {
  return (
    <section id="pricing" className="section" style={{ background: 'var(--color-surface-2)', borderTop: '1px solid var(--color-border)' }}>
      <div className="container">

        {/* Header */}
        <div style={{ textAlign: 'center', maxWidth: '580px', margin: '0 auto 3.5rem' }}>
          <p className="eyebrow" style={{ justifyContent: 'center' }}>Pricing</p>
          <h2 style={{ fontSize: 'clamp(2rem, 4vw, 2.75rem)', fontWeight: 800, color: 'var(--color-ink)', marginBottom: '0.875rem', letterSpacing: '-0.025em' }}>
            Simple, Transparent Pricing
          </h2>
          <p style={{ fontSize: '1.0625rem', color: 'var(--color-ink-2)', lineHeight: 1.7, margin: '0 auto', maxWidth: 'none' }}>
            Start free and upgrade when you're ready. Cancel anytime — no lock-in.
          </p>
        </div>

        {/* Guarantee strip */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          gap: '0.5rem', marginBottom: '2.5rem',
        }}>
          <Shield size={16} color="var(--color-success)" />
          <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-ink-2)' }}>
            30-Day Money-Back Guarantee on all paid plans
          </span>
        </div>

        {/* Cards */}
        <div className="grid-3" style={{ alignItems: 'start' }}>
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={plan.highlight ? 'card card-featured' : 'card'}
              style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', position: 'relative' }}
            >
              {/* Popular tag */}
              {plan.tag && (
                <div style={{
                  position: 'absolute', top: '-1px', left: '50%',
                  transform: 'translateX(-50%)',
                  background: 'var(--color-brand)',
                  color: '#fff', fontSize: '0.7125rem', fontWeight: 700,
                  letterSpacing: '0.04em', textTransform: 'uppercase',
                  padding: '0.35rem 1.25rem',
                  borderRadius: '0 0 8px 8px',
                  whiteSpace: 'nowrap',
                }}>
                  <Zap size={11} style={{ display: 'inline', marginRight: 4, marginTop: -1 }} />
                  {plan.tag}
                </div>
              )}

              <div style={{ paddingTop: plan.tag ? '1.5rem' : 0 }}>
                {/* Plan name badge */}
                <div style={{
                  display: 'inline-flex', alignItems: 'center', gap: '0.35rem',
                  padding: '0.3rem 0.75rem', borderRadius: '999px',
                  fontSize: '0.8rem', fontWeight: 700,
                  background: plan.highlight ? 'var(--color-brand-lt)' : 'var(--color-surface-3)',
                  color: plan.highlight ? 'var(--color-brand)' : 'var(--color-ink-2)',
                  marginBottom: '1rem',
                }}>
                  {plan.name === 'Ultimate' && <Star size={12} fill="currentColor" />}
                  {plan.name}
                </div>

                {/* Price */}
                <div style={{ marginBottom: '0.75rem' }}>
                  <span style={{
                    fontSize: '3rem', fontWeight: 900, color: 'var(--color-ink)',
                    letterSpacing: '-0.04em', lineHeight: 1,
                    fontVariantNumeric: 'tabular-nums',
                  }}>
                    {plan.price === 0 ? 'Free' : `$${plan.price}`}
                  </span>
                  {plan.price > 0 && (
                    <span style={{ fontSize: '0.9375rem', color: 'var(--color-ink-3)', marginLeft: '0.4rem', fontWeight: 500 }}>
                      {plan.priceLabel}
                    </span>
                  )}
                </div>

                <p style={{ fontSize: '0.9rem', color: 'var(--color-ink-2)', lineHeight: 1.6, marginBottom: 0, maxWidth: 'none' }}>
                  {plan.desc}
                </p>
              </div>

              {/* CTA */}
              <a
                href="#"
                className={`btn btn-${plan.ctaVariant}`}
                style={{ width: '100%', textAlign: 'center', justifyContent: 'center' }}
              >
                {plan.cta}
              </a>

              {/* Divider */}
              <div className="divider" />

              {/* Features */}
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {plan.features.map(f => (
                  <li key={f} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.625rem' }}>
                    <Check
                      size={16}
                      color={plan.highlight ? 'var(--color-brand)' : 'var(--color-success)'}
                      strokeWidth={2.5}
                      style={{ marginTop: '0.125rem', flexShrink: 0 }}
                    />
                    <span style={{ fontSize: '0.9rem', color: 'var(--color-ink-2)', lineHeight: 1.5 }}>{f}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Footer note */}
        <p style={{
          textAlign: 'center', fontSize: '0.875rem', color: 'var(--color-ink-3)',
          marginTop: '2rem', maxWidth: 'none',
        }}>
          All prices in USD. Billed monthly. Annual plans available with 25% discount —
          <a href="#" style={{ color: 'var(--color-brand)', fontWeight: 600, marginLeft: '0.25rem' }}>contact us</a>.
        </p>
      </div>

      <style>{`
        @media (max-width: 1024px) {
          .grid-3 { grid-template-columns: 1fr !important; max-width: 480px; margin-left: auto; margin-right: auto; }
        }
      `}</style>
    </section>
  );
};

export default Pricing;
