import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Sparkles, Menu, X, ChevronDown } from "lucide-react";

const navItems = [
  {
    label: "Features",
    href: "#features",
    sub: ["Listening Lab", "Reading", "Writing AI", "Speaking"],
  },
  { label: "How It Works", href: "#how-it-works" },
  { label: "Pricing", href: "#pricing" },
  { label: "Success Stories", href: "#testimonials" },
];

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      style={{
        position: "sticky",
        top: 0,
        zIndex: 100,
        background: scrolled
          ? "rgba(255,255,255,0.95)"
          : "rgba(255,255,255,0.98)",
        borderBottom: scrolled ? "1px solid #e2e8f0" : "1px solid transparent",
        backdropFilter: "blur(12px)",
        transition: "border-color 200ms, box-shadow 200ms, background 200ms",
        boxShadow: scrolled ? "0 1px 8px 0 rgb(15 23 42 / 0.06)" : "none",
      }}
    >
      <div
        className="container"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          height: "68px",
          gap: "2rem",
        }}
      >
        {/* Logo */}
        <a
          href="/"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.75rem",
            textDecoration: "none",
            flexShrink: 0,
          }}
          aria-label="LetsCrack IELTS — Home"
        >
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: "10px",
              background: "var(--color-brand)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 4px 12px rgba(26,86,219,0.2)",
            }}
          >
            <Sparkles size={19} color="white" strokeWidth={2.5} />
          </div>
          <span
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "1.25rem",
              fontWeight: 800,
              letterSpacing: "-0.02em",
              color: "var(--color-ink)",
            }}
          >
            LetsCrack <span style={{ color: "var(--color-brand)" }}>IELTS</span>
          </span>
        </a>

        {/* Desktop Nav */}
        <nav
          aria-label="Primary"
          style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}
          className="desktop-only"
        >
          {navItems.map((item) => (
            <a
              key={item.href}
              href={item.href}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.25rem",
                padding: "0.5rem 1rem",
                borderRadius: "8px",
                fontSize: "0.9375rem",
                fontWeight: 600,
                fontFamily: "var(--font-display)",
                color: "var(--color-ink-2)",
                textDecoration: "none",
                transition: "all 150ms ease",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLAnchorElement).style.color =
                  "var(--color-brand)";
                (e.currentTarget as HTMLAnchorElement).style.background =
                  "var(--color-brand-lt)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLAnchorElement).style.color =
                  "var(--color-ink-2)";
                (e.currentTarget as HTMLAnchorElement).style.background =
                  "transparent";
              }}
            >
              {item.label}
              {item.sub && <ChevronDown size={14} style={{ opacity: 0.5 }} />}
            </a>
          ))}
        </nav>

        {/* Right side */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.75rem",
            flexShrink: 0,
          }}
        >
          <Link
            to="/login"
            className="btn btn-ghost btn-sm desktop-only"
            style={{ fontWeight: 500 }}
          >
            Log in
          </Link>
          <Link
            to="/register"
            className="btn btn-primary btn-sm"
            style={{ letterSpacing: "-0.01em" }}
          >
            Start Free Trial
          </Link>

          {/* Mobile toggle */}
          <button
            className="mobile-only"
            onClick={() => setMenuOpen((o) => !o)}
            style={{
              display: "none",
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: "0.5rem",
              color: "var(--color-ink)",
            }}
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
          >
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile dropdown */}
      {menuOpen && (
        <div
          style={{
            background: "#fff",
            borderTop: "1px solid var(--color-border)",
            padding: "1.25rem 1.5rem 1.5rem",
          }}
          className="mobile-only"
        >
          <nav
            style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}
          >
            {navItems.map((item) => (
              <a
                key={item.href}
                href={item.href}
                onClick={() => setMenuOpen(false)}
                style={{
                  padding: "0.75rem 0.875rem",
                  borderRadius: "8px",
                  fontSize: "0.9375rem",
                  fontWeight: 500,
                  color: "var(--color-ink-2)",
                  textDecoration: "none",
                }}
              >
                {item.label}
              </a>
            ))}
            <div
              style={{
                height: "1px",
                background: "var(--color-border)",
                margin: "0.75rem 0",
              }}
            />
            <Link
              to="/register"
              onClick={() => setMenuOpen(false)}
              className="btn btn-primary"
              style={{ width: "100%", justifyContent: "center" }}
            >
              Start Free Trial
            </Link>
          </nav>
        </div>
      )}

      <style>{`
        @media (max-width: 768px) {
          .desktop-only { display: none !important; }
          .mobile-only  { display: flex !important; }
        }
        @media (min-width: 769px) {
          .mobile-only { display: none !important; }
        }
      `}</style>
    </header>
  );
};

export default Navbar;
