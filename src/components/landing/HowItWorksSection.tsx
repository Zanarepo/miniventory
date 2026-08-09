import React from 'react';
import { Reveal } from './Reveal';
import { STEPS } from './LandingData';
import { LandingHowToUse } from './LandingHowToUse';

export const HowItWorksSection: React.FC = () => {
  return (
    <>
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

      {/* ---------------- Interactive Step-by-Step Guide ---------------- */}
      <LandingHowToUse />
    </>
  );
};
