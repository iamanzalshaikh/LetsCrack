import { Sparkles, Mail, Globe, ArrowRight } from 'lucide-react';

const cols = [
  {
    heading: 'Platform',
    links: [
      { label: 'Listening Lab',     href: '#features' },
      { label: 'Reading Practice',  href: '#features' },
      { label: 'Writing AI Scorer', href: '#features' },
      { label: 'Speaking Examiner', href: '#features' },
      { label: 'Mock Full Exam',    href: '#pricing' },
    ],
  },
  {
    heading: 'Company',
    links: [
      { label: 'About Us',        href: '#' },
      { label: 'Success Stories', href: '#testimonials' },
      { label: 'Blog',            href: '#' },
      { label: 'Careers',         href: '#' },
    ],
  },
  {
    heading: 'Support',
    links: [
      { label: 'Help Centre',     href: '#' },
      { label: 'Privacy Policy',  href: '#' },
      { label: 'Terms of Service',href: '#' },
      { label: 'Refund Policy',   href: '#' },
    ],
  },
];

const Footer = () => {
  return (
    <footer style={{ background: 'var(--color-ink)', color: 'rgba(255,255,255,0.7)' }}>

      {/* CTA Banner */}
      <div className="container" style={{ paddingTop: '4rem' }}>
        <div style={{
          background: 'var(--color-brand)', borderRadius: '16px',
          padding: '3rem 3.5rem',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          gap: '2rem', flexWrap: 'wrap',
          marginBottom: '4rem',
        }}>
          <div>
            <h2 style={{
              fontFamily: 'var(--font-sans)', color: '#fff',
              fontSize: 'clamp(1.5rem, 3vw, 2.25rem)', fontWeight: 800,
              letterSpacing: '-0.025em', marginBottom: '0.5rem',
            }}>
              Ready to Crack the IELTS?
            </h2>
            <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '1rem', maxWidth: 'none' }}>
              Join 40,000+ students who achieved their target band score.
            </p>
          </div>
          <a
            href="#pricing"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
              background: '#fff', color: 'var(--color-brand)',
              padding: '0.875rem 2rem', borderRadius: '10px',
              fontWeight: 700, fontSize: '0.9375rem', textDecoration: 'none',
              flexShrink: 0, transition: 'all 160ms',
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.background = '#f0f5ff'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.background = '#fff'; }}
          >
            Start Free Trial <ArrowRight size={16} />
          </a>
        </div>

        {/* Grid */}
        <div style={{
          display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr',
          gap: '3rem', paddingBottom: '3.5rem',
        }} className="footer-grid">

          {/* Brand */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.125rem' }}>
              <div style={{
                width: 32, height: 32, borderRadius: '8px',
                background: 'var(--color-brand)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Sparkles size={17} color="white" />
              </div>
              <span style={{
                fontFamily: 'var(--font-sans)', fontSize: '1.0625rem',
                fontWeight: 800, letterSpacing: '-0.025em', color: '#fff',
              }}>
                LetsCrack <span style={{ color: '#93c5fd' }}>IELTS</span>
              </span>
            </div>
            <p style={{ fontSize: '0.9rem', lineHeight: 1.7, marginBottom: '1.5rem', maxWidth: '240px', color: 'rgba(255,255,255,0.6)' }}>
              The most accurate IELTS practice platform. Helping aspirants
              achieve Band 8+ with confidence.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
              {[
                { icon: Mail, text: 'hello@letscrackielts.com' },
                { icon: Globe, text: 'letscrackielts.com' },
              ].map(({ icon: Icon, text }) => (
                <div key={text} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', color: 'rgba(255,255,255,0.5)' }}>
                  <Icon size={14} />
                  {text}
                </div>
              ))}
            </div>
          </div>

          {/* Link columns */}
          {cols.map(col => (
            <div key={col.heading}>
              <h4 style={{
                fontSize: '0.75rem', fontWeight: 800, letterSpacing: '0.08em',
                textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)',
                marginBottom: '1.25rem',
              }}>
                {col.heading}
              </h4>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {col.links.map(link => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.6)', textDecoration: 'none', transition: 'color 150ms' }}
                      onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.color = '#fff'; }}
                      onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.color = 'rgba(255,255,255,0.6)'; }}
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div style={{
          borderTop: '1px solid rgba(255,255,255,0.1)',
          padding: '1.5rem 0',
          display: 'flex', justifyContent: 'space-between',
          alignItems: 'center', flexWrap: 'wrap', gap: '1rem',
        }}>
          <p style={{ fontSize: '0.875rem', color: 'rgba(255,255,255,0.4)', maxWidth: 'none' }}>
            © {new Date().getFullYear()} LetsCrack IELTS. All rights reserved.
          </p>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            {['IELTS Academic', 'IELTS General Training'].map(tag => (
              <span key={tag} style={{
                padding: '0.25rem 0.75rem', borderRadius: '999px',
                fontSize: '0.75rem', fontWeight: 600,
                background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.5)',
              }}>{tag}</span>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 1024px) {
          .footer-grid { grid-template-columns: 1fr 1fr !important; }
        }
        @media (max-width: 640px) {
          .footer-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </footer>
  );
};

export default Footer;
