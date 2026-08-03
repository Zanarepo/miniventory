import React, { useEffect, useRef, useState } from "react";
import { Link } from 'react-router-dom';
import { LanguageSelector } from '../components/LanguageSelector';
import { ThemeToggle } from '../components/ThemeToggle';
import { useLanguage } from '../hooks/useLanguage';
import { useAuth } from '../hooks/useAuth';
import "../styles/landing.css";
import analyticsImg from '../assets/Analytics.png';
import offlineSyncImg from '../assets/OfflineSync.png';
import sampleReceiptImg from '../assets/SampleReceipt.png';
// ^ Adjust this import path to wherever you place landing.css in your project
//   (e.g. "./landing.css" if you keep it next to this component).

/* ============================================================================
   Small inline icon set — kept dependency-free so this file can be dropped
   into the project without adding an icon library.
   ============================================================================ */

type IconProps = { size?: number };

const IconBolt = ({ size = 18 }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M13 2 3 14h7l-1 8 10-12h-7l1-8Z" />
  </svg>
);

const IconWifiOff = ({ size = 18 }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 2l20 20M8.5 16.5a5 5 0 0 1 7 0M5 12.5a10 10 0 0 1 3.5-2.4M19 12.5a10 10 0 0 0-2.2-1.8M12 20h.01" />
  </svg>
);

const IconGlobe = ({ size = 18 }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="9" />
    <path d="M3 12h18M12 3c2.5 2.6 3.8 5.7 3.8 9s-1.3 6.4-3.8 9c-2.5-2.6-3.8-5.7-3.8-9S9.5 5.6 12 3Z" />
  </svg>
);

const IconShield = ({ size = 18 }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 3 4 6v6c0 4.4 3 7.9 8 9 5-1.1 8-4.6 8-9V6l-8-3Z" />
    <path d="m9 12 2 2 4-4" />
  </svg>
);

const IconCheck = ({ size = 14 }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <path d="m5 13 4 4L19 7" />
  </svg>
);

const IconArrowRight = ({ size = 16 }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 12h14M13 6l6 6-6 6" />
  </svg>
);

const IconBag = ({ size = 20 }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 8h12l-1 12H7L6 8Z" />
    <path d="M9 8V6a3 3 0 0 1 6 0v2" />
  </svg>
);

const IconBox = ({ size = 20 }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 8 12 3 3 8v8l9 5 9-5V8Z" />
    <path d="M3 8l9 5 9-5M12 13v8" />
  </svg>
);

const IconChart = ({ size = 20 }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 20V10M12 20V4M20 20v-7" />
  </svg>
);

const IconUsers = ({ size = 20 }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="9" cy="8" r="3.2" />
    <path d="M2.5 20c0-3.6 2.9-6 6.5-6s6.5 2.4 6.5 6M16 8.3A3.2 3.2 0 1 1 16 14.7M18.5 20c0-2.7-1.6-4.8-4-5.6" />
  </svg>
);

const IconReceipt = ({ size = 20 }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 3h12v18l-3-2-3 2-3-2-3 2V3Z" />
    <path d="M9 8h6M9 12h6" />
  </svg>
);

const IconMic = ({ size = 20 }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="9" y="2" width="6" height="12" rx="3" />
    <path d="M5 11a7 7 0 0 0 14 0M12 18v4" />
  </svg>
);

const IconDoc = ({ size = 20 }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M7 3h7l4 4v14H7V3Z" />
    <path d="M14 3v4h4M9 12h6M9 16h6" />
  </svg>
);

/* ============================================================================
   Count-up hook for the hero "live" numbers — respects reduced motion.
   ============================================================================ */

function useCountUp(target: number, durationMs = 1500) {
  const [value, setValue] = useState(0);

  useEffect(() => {
    const prefersReduced =
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

    if (prefersReduced) {
      setValue(target);
      return;
    }

    let raf = 0;
    let start = 0;

    const step = (ts: number) => {
      if (!start) start = ts;
      const progress = Math.min((ts - start) / durationMs, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.round(target * eased));
      if (progress < 1) raf = requestAnimationFrame(step);
    };

    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [target, durationMs]);

  return value;
}

const naira = (n: number) => `₦${n.toLocaleString("en-NG")}`;

/* ============================================================================
   Scroll-reveal wrapper
   ============================================================================ */

const Reveal: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className = "",
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      { threshold: 0.15 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} className={`mv-reveal ${inView ? "mv-in-view" : ""} ${className}`}>
      {children}
    </div>
  );
};

/* ============================================================================
   Data
   ============================================================================ */

const FEATURES = [
  { icon: <IconBag />, title: "Record sales fast", body: "Log every sale in a few taps. No forms, no long typing.", accent: "#22d3ee", num: "01" },
  { icon: <IconBox />, title: "Track your stock", body: "Always know what's in your shop and what's finishing.", accent: "#2dd4bf", num: "02" },
  { icon: <IconChart />, title: "See your real profit", body: "Know how much you truly made — today, this week, this month.", accent: "#a3e635", num: "03" },
  { icon: <IconUsers />, title: "Customers who owe you", body: "Never forget who owes you money, or how much.", accent: "#f4b740", num: "04" },
  { icon: <IconReceipt />, title: "Record shop expenses", body: "Rent, fuel, stock cost — all in one place.", accent: "#fb7185", num: "05" },
  { icon: <IconWifiOff />, title: "Works without internet", body: "No data? No wahala. Your shop keeps running.", accent: "#818cf8", num: "06" },
  { icon: <IconDoc />, title: "Reports you understand", body: "Simple daily reports — no accounting knowledge needed.", accent: "#34d399", num: "07" },
];

const STEPS = [
  {
    title: "Record it",
    body: "Tap \u201cRecord Sale\u201d and enter what you sold. It takes about 10 seconds.",
  },
  {
    title: "We do the maths",
    body: "Miniventory checks your stock and works out your profit automatically.",
  },
  {
    title: "You decide",
    body: "See your true numbers today, and know what to buy, sell, or stop.",
  },
];

const STORY_CARDS = [
  {
    eyebrow: "Record sales & debts",
    title: "Never lose track of who owes you again",
    body: "Every sale, every pending balance — logged in seconds. Miniventory generates a clean digital receipt for every transaction so you and your customer are always on the same page.",
    highlights: ["Cash & credit sales", "Pending balance alerts", "Customer-linked records"],
    img: sampleReceiptImg,
    imgAlt: "Sample receipt showing cash paid and pending balance for customer Musa O.",
    flip: false,
    accent: "var(--mv-cyan)",
  },
  {
    eyebrow: "Works without internet",
    title: "Sell at the market, syncs when you're back",
    body: "No data? No wahala. Miniventory saves every sale offline and quietly syncs everything the moment your connection returns — securely, automatically, without you lifting a finger.",
    highlights: ["Full offline mode", "Automatic background sync", "Secure data protection"],
    img: offlineSyncImg,
    imgAlt: "Market seller using Miniventory on a tablet while offline, with sync shield graphic",
    flip: true,
    accent: "var(--mv-teal)",
  },
  {
    eyebrow: "Real-time analytics",
    title: "See the numbers that actually matter",
    body: "Forget spreadsheets. Miniventory turns every sale into live business intelligence — portfolio growth, cumulative revenue, profit margins — all on your phone, in real time.",
    highlights: ["Live profit & revenue", "Inventory & shipping tracking", "78%+ profit margin insight"],
    img: analyticsImg,
    imgAlt: "3D analytics dashboard showing portfolio growth, profit margins and shipping metrics",
    flip: false,
    accent: "var(--mv-gold)",
  },
];

/* const PLANS = [
  {
    name: "Free",
    tag: "Start today, no card needed",
    price: "₦0",
    cycle: "Free forever",
    features: [
      "Record sales & expenses",
      "Track your inventory",
      "Basic daily & weekly reports",
      "Works fully offline",
    ],
    cta: "Start Free",
    featured: false,
  },
  {
    name: "Premium",
    tag: "For shops that are growing",
    price: "₦2,500",
    cycle: "per month",
    features: [
      "Everything in Free",
      "Smart business insights",
      "Multiple staff accounts",
      "Automatic cloud backup",
      "Receipt scanning (OCR)",
    ],
    cta: "Try Premium",
    featured: true,
  },
  {
    name: "Enterprise",
    tag: "For cooperatives & NGOs",
    price: "Custom",
    cycle: "talk to our team",
    features: [
      "Bulk onboarding for members",
      "Admin & impact dashboard",
      "Portfolio monitoring",
      "API access & integrations",
    ],
    cta: "Talk to Us",
    featured: false,
  },
]; */

/* ============================================================================
   Component
   ============================================================================ */

export const Landing: React.FC = () => {
  const { t } = useLanguage();
  const { user } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const sales = useCountUp(284500);
  const expenses = useCountUp(96200);
  const profit = useCountUp(188300);

  return (
    <div className="mv-landing">
      {/* ---------------- Nav ---------------- */}
      <header className="mv-nav">
        <div className="mv-shell mv-nav-row">
          <a href="/" className="mv-logo" aria-label="Miniventory home">
            <svg className="mv-logo-mark" viewBox="0 0 34 34" fill="none">
              <path d="M17 2 30 9v16L17 32 4 25V9L17 2Z" stroke="var(--mv-cyan)" strokeWidth="2" strokeLinejoin="round" />
              <path d="M17 2v15M17 17 4 9M17 17l13-8M17 17v15" stroke="var(--mv-cyan)" strokeWidth="2" strokeLinejoin="round" />
            </svg>
            <span>
              <span className="mv-logo-mini">Mini</span>
              <span className="mv-logo-ventory">ventory</span>
            </span>
          </a>

          <nav className="mv-nav-links" aria-label="Primary">
            <a href="#features">Features</a>
            <a href="#how-it-works">How It Works</a>
            {/* <a href="#pricing">Pricing</a> */}
          </nav>

          <div className="mv-nav-actions" style={{ gap: '12px' }}>
            <div className="mv-hide-mobile" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <ThemeToggle />
              <LanguageSelector />
            </div>
            {user ? (
              <Link to="/dashboard" className="mv-btn mv-btn-primary mv-btn-sm">
                Dashboard
              </Link>
            ) : (
              <>
                <Link to="/login" className="mv-btn mv-btn-ghost mv-btn-sm mv-hide-mobile" style={{ padding: '8px 14px' }}>
                  {t('existingAccount')}
                </Link>
                <Link to="/register" className="mv-btn mv-btn-primary mv-btn-sm">
                  {t('getStartedFree')}
                </Link>
              </>
            )}
            <button
              className="mv-nav-burger"
              type="button"
              aria-label="Open menu"
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen((v) => !v)}
            >
              {menuOpen ? (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M6 6l12 12M18 6 6 18" /></svg>
              ) : (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M4 7h16M4 12h16M4 17h16" /></svg>
              )}
            </button>
          </div>
        </div>

        <div className={`mv-shell mv-mobile-menu ${menuOpen ? "mv-open" : ""}`}>
          <a href="#features" onClick={() => setMenuOpen(false)}>Features</a>
          <a href="#how-it-works" onClick={() => setMenuOpen(false)}>How It Works</a>
          {/* <a href="#pricing" onClick={() => setMenuOpen(false)}>Pricing</a> */}
          {!user && (
            <Link to="/login" onClick={() => setMenuOpen(false)}>
              {t('existingAccount')}
            </Link>
          )}
          <div style={{ padding: '12px 4px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <LanguageSelector />
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* ---------------- Hero ---------------- */}
      <section className="mv-hero">
        <div className="mv-shell mv-hero-grid">
          <div className="mv-hero-copy">
            <span className="mv-eyebrow">
              <IconBolt size={14} />
              {t('heroBadge')}
            </span>
            <h1>{t('appTagline')}</h1>
            <p className="mv-hero-sub">
              {t('heroDesc')}
            </p>
            <div className="mv-hero-cta-row">
              {user ? (
                <Link to="/dashboard" className="mv-btn mv-btn-primary">
                  Go to Dashboard <IconArrowRight />
                </Link>
              ) : (
                <Link to="/register" className="mv-btn mv-btn-primary">
                  {t('registerButton')} <IconArrowRight />
                </Link>
              )}
              <a href="#how-it-works" className="mv-btn mv-btn-ghost">
                See How It Works
              </a>
            </div>
            <div className="mv-hero-microcopy">
              <IconShield size={16} />
              No card needed · Your records stay private and safe
            </div>
          </div>

          <div className="mv-device-wrap">
            <div className="mv-floating-chip mv-chip-1">
              <IconBag size={15} />
              Sale recorded
            </div>
            <div className="mv-floating-chip mv-chip-2">
              <IconChart size={15} />
              Profit updated
            </div>

            <div className="mv-device" role="img" aria-label="Preview of the Miniventory daily profit dashboard">
              <div className="mv-device-header">
                <div className="mv-device-shop">
                  <span className="mv-device-shop-name">Mama Ngozi's Shop</span>
                  <span className="mv-device-date">Today · Ikeja Market</span>
                </div>
                <span className="mv-device-live">
                  <span className="mv-live-dot" />
                  LIVE
                </span>
              </div>

              <div className="mv-device-hero-stat">
                <div className="mv-device-hero-label">Today's Profit</div>
                <div className="mv-device-hero-value">{naira(profit)}</div>
              </div>

              <div className="mv-device-stats">
                <div className="mv-device-stat-card">
                  <div className="mv-device-stat-label">
                    <span className="mv-dot-cyan">●</span> Sales
                  </div>
                  <div className="mv-device-stat-value">{naira(sales)}</div>
                </div>
                <div className="mv-device-stat-card">
                  <div className="mv-device-stat-label">
                    <span className="mv-dot-rose">●</span> Expenses
                  </div>
                  <div className="mv-device-stat-value">{naira(expenses)}</div>
                </div>
              </div>

              <div className="mv-device-toast">
                <IconMic size={15} />
                "I sold 3 bags of rice" — recorded automatically
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ---------------- Trust strip ---------------- */}
      <div className="mv-trust">
        <div className="mv-shell mv-trust-row">
          <div className="mv-trust-item">
            <IconWifiOff size={16} />
            No internet? No problem.
          </div>
          <div className="mv-trust-item">
            <IconGlobe size={16} />
            Speaks Pidgin, Igbo, Yoruba &amp; Hausa
          </div>
          <div className="mv-trust-item">
            <IconShield size={16} />
            No accounting degree needed
          </div>
        </div>
      </div>

      {/* ---------------- How it works ---------------- */}
      <section className="mv-section" id="how-it-works">
        <div className="mv-shell">
          <Reveal className="mv-section-head">
            <span className="mv-eyebrow">How it works</span>
            <h2>Three simple steps. That's all.</h2>
            <p>No training needed. If you can send a WhatsApp message, you can use Miniventory.</p>
          </Reveal>

          <div className="mv-steps">
            {STEPS.map((step, i) => (
              <Reveal key={step.title}>
                <div className="mv-step">
                  <div className="mv-step-num">{i + 1}</div>
                  <h3>{step.title}</h3>
                  <p>{step.body}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ---------------- Story Section ---------------- */}
      <section className="mv-section mv-story-section" id="story">
        <div className="mv-shell">
          <Reveal className="mv-section-head">
            <span className="mv-eyebrow">See it in action</span>
            <h2>Built for the way you really run your shop</h2>
            <p>From your first sale to your end-of-day report — here's what Miniventory actually does for you.</p>
          </Reveal>

          <div className="mv-story-cards">
            {STORY_CARDS.map((card, i) => (
              <Reveal key={card.title}>
                <div className={`mv-story-card ${card.flip ? 'mv-story-card-flip' : ''}`}>
                  <div className="mv-story-img-wrap">
                    <div className="mv-story-img-glow" style={{ background: `radial-gradient(60% 70% at 50% 50%, ${card.accent}33 0%, transparent 70%)` }} />
                    <img
                      src={card.img}
                      alt={card.imgAlt}
                      className="mv-story-img"
                      loading="lazy"
                    />
                    <div className="mv-story-step-badge">{i + 1}</div>
                  </div>
                  <div className="mv-story-copy">
                    <span className="mv-eyebrow" style={{ color: card.accent }}>{card.eyebrow}</span>
                    <h3>{card.title}</h3>
                    <p>{card.body}</p>
                    <ul className="mv-story-highlights">
                      {card.highlights.map((h) => (
                        <li key={h}>
                          <span className="mv-story-check" style={{ color: card.accent }}>
                            <IconCheck size={13} />
                          </span>
                          {h}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ---------------- Features ---------------- */}
      <section className="mv-section mv-features-section" id="features">
        <div className="mv-shell">
          <Reveal className="mv-section-head">
            <span className="mv-eyebrow">Everything in one place</span>
            <h2>Built for how your shop really works</h2>
            <p>Every feature does one job well, so your shop stays simple to run.</p>
          </Reveal>

          <div className="mv-features-grid">
            {FEATURES.map((f, i) => (
              <Reveal key={f.title}>
                <div
                  className="mv-feature-card"
                  data-index={i}
                  style={{ '--fc-accent': f.accent } as React.CSSProperties}
                >
                  <span className="mv-feature-num">{f.num}</span>
                  <div className="mv-feature-icon">{f.icon}</div>
                  <h3>{f.title}</h3>
                  <p>{f.body}</p>
                  <div className="mv-feature-card-glow" />
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ---------------- Demo band ---------------- */}
      <section className="mv-demo">
        <div className="mv-shell mv-section mv-demo-grid">
          <Reveal>
            <span className="mv-eyebrow">Your numbers, made simple</span>
            <h2 style={{ fontSize: 32, fontWeight: 800, margin: "16px 0" }}>
              A report you can actually read
            </h2>
            <p style={{ color: "var(--mv-text-dim)", fontSize: 16 }}>
              No spreadsheets. No confusing charts. Just clear numbers that
              tell you how your shop is doing.
            </p>
            <div className="mv-demo-list">
              <div className="mv-demo-list-item">
                <span className="mv-demo-check"><IconCheck /></span>
                <div>
                  <h4>Daily, weekly & monthly profit</h4>
                  <p>See how your shop is doing at a glance.</p>
                </div>
              </div>
              <div className="mv-demo-list-item">
                <span className="mv-demo-check"><IconCheck /></span>
                <div>
                  <h4>Know your best-selling product</h4>
                  <p>So you always know what to restock first.</p>
                </div>
              </div>
              <div className="mv-demo-list-item">
                <span className="mv-demo-check"><IconCheck /></span>
                <div>
                  <h4>Download or share any report</h4>
                  <p>Send to your bank, your NGO, or a loan officer.</p>
                </div>
              </div>
            </div>
          </Reveal>

          <Reveal>
            <div className="mv-report-card">
              <div className="mv-report-head">
                <h4>This Week's Sales</h4>
                <span>Mon – Sun</span>
              </div>
              <div className="mv-bars">
                <div className="mv-bar" style={{ height: "48%" }} />
                <div className="mv-bar" style={{ height: "66%" }} />
                <div className="mv-bar" style={{ height: "40%" }} />
                <div className="mv-bar" style={{ height: "78%" }} />
                <div className="mv-bar" style={{ height: "58%" }} />
                <div className="mv-bar" style={{ height: "70%" }} />
                <div className="mv-bar mv-bar-today" style={{ height: "92%" }} />
              </div>
              <div className="mv-bars-labels">
                <span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span>
              </div>
              <div className="mv-report-foot">
                <div className="mv-report-foot-item">
                  <span>Best day</span>
                  <span>Sunday</span>
                </div>
                <div className="mv-report-foot-item">
                  <span>Top product</span>
                  <span>Rice, 50kg</span>
                </div>
                <div className="mv-report-foot-item">
                  <span>Week profit</span>
                  <span>₦96,400</span>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ---------------- Testimonial ---------------- */}
      <section className="mv-section">
        <div className="mv-shell">
          <Reveal className="mv-testimonial">
            <p className="mv-testimonial-quote">
              "Before, I no know if I dey make profit or loss. Now, I check my
              phone before I close my shop, and I <span>see my real money.</span>"
            </p>
            <div className="mv-testimonial-person">
              <div className="mv-avatar">MN</div>
              <div className="mv-testimonial-person-info">
                <strong>Mama Ngozi</strong>
                <span>Vegetable Seller, Lagos</span>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ---------------- Pricing ---------------- */}
      {/* 
      <section className="mv-section mv-section-tight" id="pricing">
        <div className="mv-shell">
          <Reveal className="mv-section-head">
            <span className="mv-eyebrow">Pricing</span>
            <h2>Start free. Grow when you're ready.</h2>
            <p>No hidden charges. Cancel your plan any time.</p>
          </Reveal>

          <div className="mv-pricing-grid">
            {PLANS.map((plan) => (
              <Reveal key={plan.name}>
                <div className={`mv-price-card ${plan.featured ? "mv-price-card-featured" : ""}`}>
                  {plan.featured && <span className="mv-price-badge">Most Popular</span>}
                  <h3>{plan.name}</h3>
                  <p>{plan.tag}</p>
                  <div className="mv-price-amount">
                    {plan.price} {plan.cycle !== "talk to our team" && plan.price !== "₦0" && <span>/mo</span>}
                  </div>
                  <div className="mv-price-cycle">{plan.cycle}</div>
                  <ul className="mv-price-features">
                    {plan.features.map((f) => (
                      <li key={f}>
                        <IconCheck />
                        {f}
                      </li>
                    ))}
                  </ul>
                  <a
                    href="/dashboard"
                    className={`mv-btn mv-btn-block ${plan.featured ? "mv-btn-primary" : "mv-btn-ghost"}`}
                  >
                    {plan.cta}
                  </a>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>
      */}

      {/* ---------------- Final CTA ---------------- */}
      <section className="mv-shell" style={{ paddingBottom: 96 }}>
        <Reveal>
          <div className="mv-final-cta">
            <span className="mv-eyebrow">Join thousands of shop owners</span>
            <h2>{t('appTagline')}</h2>
            <p>{t('heroDesc')}</p>
            <div className="mv-final-cta-actions">
              {user ? (
                <Link to="/dashboard" className="mv-btn mv-btn-primary">
                  Go to Dashboard <IconArrowRight />
                </Link>
              ) : (
                <Link to="/register" className="mv-btn mv-btn-primary">
                  {t('getStartedFree')} <IconArrowRight />
                </Link>
              )}
            </div>
          </div>
        </Reveal>
      </section>

      {/* ---------------- Footer ---------------- */}
      <footer className="mv-footer">
        <div className="mv-shell">
          <div className="mv-footer-grid">
            <div className="mv-footer-brand">
              <a href="/" className="mv-logo" aria-label="Miniventory home">
                <svg className="mv-logo-mark" viewBox="0 0 34 34" fill="none">
                  <path d="M17 2 30 9v16L17 32 4 25V9L17 2Z" stroke="#22d3ee" strokeWidth="2" strokeLinejoin="round" />
                  <path d="M17 2v15M17 17 4 9M17 17l13-8M17 17v15" stroke="#22d3ee" strokeWidth="2" strokeLinejoin="round" />
                </svg>
                <span>
                  <span className="mv-logo-mini">Mini</span>
                  <span className="mv-logo-ventory">ventory</span>
                </span>
              </a>
              <p>Simple business record keeping for every entrepreneur — built for the realities of African small businesses.</p>
            </div>

            <div className="mv-footer-col">
              <h4>Product</h4>
              <ul>
                <li><a href="#features">Features</a></li>
                <li><a href="#how-it-works">How It Works</a></li>
                {/* <li><a href="#pricing">Pricing</a></li> */}
              </ul>
            </div>

            <div className="mv-footer-col">
              <h4>Company</h4>
              <ul>
                {/* <li><a href="/about">About</a></li> */}
                {/* <li><a href="/contact">Contact Us</a></li> */}
                <li><a href="/dashboard">Go to Dashboard</a></li>
              </ul>
            </div>

            <div className="mv-footer-col">
              <h4>Languages</h4>
              <ul>
                <li><a href="#">English</a></li>
                <li><a href="#">Pidgin</a></li>
                <li><a href="#">Igbo · Yoruba · Hausa</a></li>
              </ul>
            </div>
          </div>

          <div className="mv-footer-bottom">
            <span>© {new Date().getFullYear()} Miniventory. Built for African entrepreneurs.</span>
            <span>Made for shops that never stop.</span>
          </div>
        </div>
      </footer>
    </div>
  );
};


