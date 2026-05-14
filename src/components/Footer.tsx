import { Sparkles, Mail, Globe, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const cols = [
  {
    heading: 'Platform',
    links: [
      { label: 'Listening Lab',     href: '#features' },
      { label: 'Reading Practice',  href: '#features' },
      { label: 'Writing AI Scorer', href: '#features' },
      { label: 'Speaking Examiner', href: '#features' },
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
    <footer style={{ background: 'var(--color-ink)', color: 'rgba(255,255,255,0.6)' }}>

      {/* CTA Banner Section */}
      <div className="container" style={{ paddingTop: '6rem' }}>
        <div 
          className="animate-fade-up"
          style={{
            background: 'var(--color-brand)', 
            borderRadius: '24px',
            padding: '4rem 3.5rem',
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            gap: '2.5rem', 
            flexWrap: 'wrap',
            marginBottom: '6rem',
            boxShadow: 'var(--shadow-brand)',
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          {/* Decorative element inside banner */}
          <div style={{
            position: 'absolute', top: '-20%', right: '-10%', width: '300px', height: '300px',
            background: 'rgba(255,255,255,0.1)', borderRadius: '50%', filter: 'blur(60px)'
          }} />

          <div style={{ position: 'relative', zIndex: 1 }}>
            <h2 style={{ color: '#fff', fontSize: 'clamp(2.5rem, 4vw, 3rem)', marginBottom: '0.75rem', lineHeight: 1.1 }}>
              Ready to Crack the IELTS?
            </h2>
            <p style={{ color: 'rgba(255,255,255,0.9)', fontSize: '1.125rem' }}>
              Join 40,000+ students who achieved their target band score with AI precision.
            </p>
          </div>
          <Link
            to="/register"
            className="btn btn-lg"
            style={{ 
              background: '#fff', 
              color: 'var(--color-brand)',
              position: 'relative',
              zIndex: 1
            }}
          >
            Start Free Trial <ArrowRight size={20} />
          </Link>
        </div>

        {/* Footer Content Grid */}
        <div 
          className="footer-grid"
          style={{
            display: 'grid', 
            gridTemplateColumns: '2fr 1fr 1fr',
            gap: '4rem', 
            paddingBottom: '4rem'
          }}
        >
          {/* Brand Info */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
              <div style={{
                width: 36, height: 36, borderRadius: '10px',
                background: 'var(--color-brand)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Sparkles size={20} color="white" strokeWidth={2.5} />
              </div>
              <span style={{ fontSize: '1.25rem', fontWeight: 800, color: '#fff' }}>
                LetsCrack <span style={{ color: 'var(--color-brand-mid)' }}>IELTS</span>
              </span>
            </div>
            <p style={{ fontSize: '1rem', lineHeight: 1.6, marginBottom: '2rem', maxWidth: '300px' }}>
              The most accurate IELTS practice platform. Helping aspirants achieve Band 8+ with examiner-grade AI feedback.
            </p>
            <div style={{ display: 'grid', gap: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.9375rem' }}>
                <Mail size={16} /> hello@letscrackielts.com
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.9375rem' }}>
                <Globe size={16} /> letscrackielts.com
              </div>
            </div>
          </div>

          {/* Link columns */}
          {cols.map(col => (
            <div key={col.heading}>
              <h4 style={{
                fontSize: '0.75rem', 
                fontWeight: 800, 
                textTransform: 'uppercase', 
                color: 'rgba(255,255,255,0.4)',
                letterSpacing: '0.1em',
                marginBottom: '1.5rem',
              }}>
                {col.heading}
              </h4>
              <ul style={{ listStyle: 'none', display: 'grid', gap: '0.875rem', padding: 0 }}>
                {col.links.map(link => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      style={{ fontSize: '0.9375rem', color: 'rgba(255,255,255,0.6)', textDecoration: 'none', transition: 'color 150ms ease' }}
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

        {/* Legal Bottom Bar */}
        <div style={{
          borderTop: '1px solid rgba(255,255,255,0.1)',
          padding: '2rem 0',
          display: 'flex', 
          justifyContent: 'space-between',
          alignItems: 'center', 
          flexWrap: 'wrap', 
          gap: '1.5rem'
        }}>
          <p style={{ fontSize: '0.875rem', color: 'rgba(255,255,255,0.4)', margin: 0 }}>
            © {new Date().getFullYear()} LetsCrack IELTS. All rights reserved.
          </p>
          <div style={{ display: 'flex', gap: '1rem' }}>
             <div style={{ fontSize: '0.75rem', fontWeight: 700, padding: '0.35rem 1rem', borderRadius: 'var(--radius-pill)', background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.4)' }}>
               IELTS Academic
             </div>
             <div style={{ fontSize: '0.75rem', fontWeight: 700, padding: '0.35rem 1rem', borderRadius: 'var(--radius-pill)', background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.4)' }}>
               IELTS General
             </div>
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
