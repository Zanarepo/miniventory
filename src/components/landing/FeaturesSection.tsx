import React from 'react';
import { Reveal } from './Reveal';
import { FEATURES } from './LandingData';

export const FeaturesSection: React.FC = () => {
  return (
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
  );
};
