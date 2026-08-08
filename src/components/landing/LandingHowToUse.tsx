import React, { useState, useEffect, useRef } from 'react';
import { useLanguage } from '../../hooks/useLanguage';
import { GUIDE_DATA } from './guide/guideData';
import { GuideTabs } from './guide/GuideTabs';
import { GuidePanel } from './guide/GuidePanel';

/* ============================================================================
   Reveal animation hook (matching Landing page styling)
   ============================================================================ */
function useInView(options = { threshold: 0.15 }) {
  const [inView, setInView] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setInView(true);
        observer.unobserve(el);
      }
    }, options);
    observer.observe(el);
    return () => observer.disconnect();
  }, [options]);

  return { ref, inView };
}

/* ============================================================================
   Modularized Interactive Workflow Guide Container
   ============================================================================ */
export const LandingHowToUse: React.FC = () => {
  const { language } = useLanguage();
  const [activeTab, setActiveTab] = useState<number>(0);
  const { ref, inView } = useInView({ threshold: 0.1 });

  // Retrieve localized dictionary (defaulting to English)
  const content = GUIDE_DATA[language] || GUIDE_DATA.en;
  const currentPillar = content.pillars[activeTab] || content.pillars[0];

  return (
    <section className="mv-section mv-guide-section" id="user-guide">
      <div className="mv-shell">
        {/* Animated Header */}
        <div
          ref={ref}
          className={`mv-reveal mv-section-head ${inView ? 'mv-in-view' : ''}`}
          style={{ transition: 'opacity 0.6s ease, transform 0.6s ease' }}
        >
          <span className="mv-eyebrow">{content.eyebrow}</span>
          <h2>{content.heading}</h2>
          <p>{content.subheading}</p>
        </div>

        {/* Modular Interactive Tab Bar */}
        <GuideTabs pillars={content.pillars} activeTab={activeTab} onSelectTab={setActiveTab} />

        {/* Modular Active Tab Showcase Panel */}
        <GuidePanel
          pillar={currentPillar}
          proTipHeader={content.proTipHeader}
          activeTab={activeTab}
        />
      </div>
    </section>
  );
};
