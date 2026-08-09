import React from 'react';
import { Reveal } from './Reveal';
import { PLANS } from './LandingData';
import { IconCheck } from './LandingIcons';

export const PricingSection: React.FC = () => {
  return (
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
              <div className={`mv-price-card ${plan.featured ? 'mv-price-card-featured' : ''}`}>
                {plan.featured && <span className="mv-price-badge">Most Popular</span>}
                <h3>{plan.name}</h3>
                <p>{plan.tag}</p>
                <div className="mv-price-amount">
                  {plan.price}{' '}
                  {plan.cycle !== 'talk to our team' && plan.price !== '₦0' && <span>/mo</span>}
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
                  className={`mv-btn mv-btn-block ${plan.featured ? 'mv-btn-primary' : 'mv-btn-ghost'}`}
                >
                  {plan.cta}
                </a>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
};
