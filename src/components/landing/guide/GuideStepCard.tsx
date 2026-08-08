import React from 'react';
import type { StepItem } from './types';

interface GuideStepCardProps {
  step: StepItem;
  index: number;
  accent: string;
}

export const GuideStepCard: React.FC<GuideStepCardProps> = ({ step, index, accent }) => {
  return (
    <div className="mv-guide-step-card">
      <div
        className="mv-guide-step-num"
        style={{
          backgroundColor: `${accent}26`,
          color: accent,
          borderColor: `${accent}50`,
        }}
      >
        {index + 1}
      </div>
      <div className="mv-guide-step-content">
        <h4>{step.title.replace(/^[0-9]+\.\s*/, '')}</h4>
        <p>{step.desc}</p>
      </div>
    </div>
  );
};
