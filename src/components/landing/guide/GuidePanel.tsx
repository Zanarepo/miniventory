import React from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2, ArrowRight } from 'lucide-react';
import type { PillarGuide } from './types';
import { GuideStepCard } from './GuideStepCard';

interface GuidePanelProps {
  pillar: PillarGuide;
  proTipHeader: string;
  activeTab: number;
}

export const GuidePanel: React.FC<GuidePanelProps> = ({ pillar, proTipHeader, activeTab }) => {
  const Icon = pillar.icon;

  return (
    <div
      key={activeTab}
      className="mv-guide-panel"
      style={{ '--panel-accent': pillar.accent } as React.CSSProperties}
    >
      {/* Top Headline Bar */}
      <div className="mv-guide-panel-head">
        <span
          className="mv-guide-badge"
          style={{
            color: pillar.accent,
            borderColor: `${pillar.accent}40`,
            backgroundColor: `${pillar.accent}14`,
          }}
        >
          <Icon size={14} style={{ marginRight: '6px' }} />
          {pillar.badge}
        </span>
        <h3>{pillar.headline}</h3>
      </div>

      {/* Actionable Steps Grid */}
      <div className="mv-guide-steps-grid">
        {pillar.steps.map((step, idx) => (
          <GuideStepCard key={idx} step={step} index={idx} accent={pillar.accent} />
        ))}
      </div>

      {/* Bottom Footer: Pro Tip Callout + Action Button */}
      <div className="mv-guide-panel-footer">
        <div
          className="mv-guide-protip"
          style={{
            borderColor: `${pillar.accent}40`,
            background: `linear-gradient(to right, ${pillar.accent}0A, transparent)`,
          }}
        >
          <div className="mv-guide-protip-icon" style={{ color: pillar.accent }}>
            <CheckCircle2 size={20} />
          </div>
          <div className="mv-guide-protip-text">
            <strong>{proTipHeader}: </strong>
            <span>{pillar.proTip}</span>
          </div>
        </div>

        <div className="mv-guide-cta-wrap">
          <Link
            to="/register"
            className="mv-btn mv-guide-cta-btn"
            style={{ backgroundColor: pillar.accent, color: '#030712' }}
          >
            <span>{pillar.ctaText}</span>
            <ArrowRight size={18} />
          </Link>
        </div>
      </div>
    </div>
  );
};
