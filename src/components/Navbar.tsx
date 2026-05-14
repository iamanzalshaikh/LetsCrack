import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Sparkles, Menu, X } from "lucide-react";

const navItems = [
  {
    label: "Features",
    href: "#features",
  },
  { label: "How It Works", href: "/#how-it-works" },
  { label: "Pricing", href: "/#pricing" },
  { label: "Success Stories", href: "/#testimonials" },
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
        background: scrolled ? "rgba(255,255,255,0.9)" : "white",
        borderBottom: "1px solid var(--color-border)",
        backdropFilter: "blur(10px)",
        transition: "all 200ms ease",
        height: scrolled ? "64px" : "72px",
        display: "flex",
        alignItems: "center"
      }}
    >
      <div className="container" style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        {/* Logo */}
        <Link to="/" style={{ display: "flex", alignItems: "center", gap: "0.75rem", textDecoration: "none" }}>
          <div style={{
            width: 34, height: 34, borderRadius: "8px", background: "var(--color-brand)",
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: "var(--shadow-brand)"
          }}>
            <Sparkles size={18} color="white" strokeWidth={2.5} />
          </div>
          <span style={{ fontSize: "1.25rem", fontWeight: 800, color: "var(--color-ink)", letterSpacing: "-0.01em" }}>
            LetsCrack <span style={{ color: "var(--color-brand)" }}>IELTS</span>
          </span>
        </Link>

        {/* Links */}
        <nav style={{ display: "flex", alignItems: "center", gap: "0.5rem" }} className="desktop-only">
          {navItems.map((item) => (
            <Link
              key={item.href}
              to={item.href}
              className="btn btn-ghost"
              style={{ padding: "0.5rem 0.875rem", fontSize: "0.9375rem", fontWeight: 600 }}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Buttons */}
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <Link to="/login" className="btn btn-ghost desktop-only" style={{ fontWeight: 600 }}>Log in</Link>
          <Link to="/register" className="btn btn-primary btn-sm">Start Free Trial</Link>
          
          <button className="mobile-only" onClick={() => setMenuOpen(!menuOpen)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--color-ink)" }}>
            {menuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div style={{
          position: "absolute", top: "100%", left: 0, width: "100%", 
          background: "white", padding: "1.5rem", borderBottom: "1px solid var(--color-border)",
          boxShadow: "var(--shadow-lg)"
        }} className="mobile-only">
          <nav style={{ display: "grid", gap: "0.5rem" }}>
            {navItems.map((item) => (
              <Link key={item.href} to={item.href} onClick={() => setMenuOpen(false)} style={{ padding: "0.75rem", fontWeight: 600, color: "var(--color-ink-2)", textDecoration: "none" }}>
                {item.label}
              </Link>
            ))}
            <hr style={{ border: "none", borderTop: "1px solid var(--color-border)", margin: "0.5rem 0" }} />
            <Link to="/login" className="btn btn-ghost" onClick={() => setMenuOpen(false)}>Log in</Link>
            <Link to="/register" className="btn btn-primary" onClick={() => setMenuOpen(false)} style={{ justifyContent: "center" }}>Start Free Trial</Link>
          </nav>
        </div>
      )}

      <style>{`
        @media (max-width: 768px) {
          .desktop-only { display: none !important; }
          .mobile-only { display: flex !important; }
        }
        @media (min-width: 769px) {
          .mobile-only { display: none !important; }
        }
      `}</style>
    </header>
  );
};

export default Navbar;
