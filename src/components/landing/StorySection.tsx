import React from 'react';
import { Reveal } from './Reveal';
import { STORY_CARDS } from './LandingData';
import { IconCheck } from './LandingIcons';

export const StorySection: React.FC = () => {
  return (
    <section className="mv-section mv-story-section" id="story">
      <div className="mv-shell">
        <Reveal className="mv-section-head">
          <span className="mv-eyebrow">See it in action</span>
          <h2>Built for the way you really run your shop</h2>
          <p>
            From your first sale to your end-of-day report — here's what Miniventory actually does
            for you.
          </p>
        </Reveal>

        <div className="mv-story-cards">
          {STORY_CARDS.map((card, i) => (
            <Reveal key={card.title}>
              <div className={`mv-story-card ${card.flip ? 'mv-story-card-flip' : ''}`}>
                <div className="mv-story-img-wrap">
                  <div
                    className="mv-story-img-glow"
                    style={{
                      background: `radial-gradient(60% 70% at 50% 50%, ${card.accent}33 0%, transparent 70%)`,
                    }}
                  />
                  <img src={card.img} alt={card.imgAlt} className="mv-story-img" loading="lazy" />
                  <div className="mv-story-step-badge">{i + 1}</div>
                </div>
                <div className="mv-story-copy">
                  <span className="mv-eyebrow" style={{ color: card.accent }}>
                    {card.eyebrow}
                  </span>
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
  );
};
