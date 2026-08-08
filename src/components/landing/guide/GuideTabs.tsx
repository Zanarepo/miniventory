import React from 'react';
import type { PillarGuide } from './types';

interface GuideTabsProps {
  pillars: PillarGuide[];
  activeTab: number;
  onSelectTab: (index: number) => void;
}

export const GuideTabs: React.FC<GuideTabsProps> = ({ pillars, activeTab, onSelectTab }) => {
  return (
    <div className="mv-guide-tabs-container">
      <div className="mv-guide-tabs">
        {pillars.map((pillar, i) => {
          const PillarIcon = pillar.icon;
          const isActive = i === activeTab;
          return (
            <button
              key={pillar.tabName}
              onClick={() => onSelectTab(i)}
              className={`mv-guide-tab ${isActive ? 'active' : ''}`}
              style={
                {
                  '--tab-accent': pillar.accent,
                  borderColor: isActive ? pillar.accent : 'transparent',
                } as React.CSSProperties
              }
              aria-selected={isActive}
            >
              <div
                className="mv-guide-tab-icon"
                style={{
                  color: isActive ? pillar.accent : 'var(--text-muted)',
                  backgroundColor: isActive ? `${pillar.accent}1A` : 'rgba(255,255,255,0.04)',
                }}
              >
                <PillarIcon size={18} />
              </div>
              <span className="mv-guide-tab-label">{pillar.tabName}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
