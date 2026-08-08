import React from 'react';
import type { LanguageCode } from '../../../i18n/translations';

export interface StepItem {
  title: string;
  desc: string;
}

export interface PillarGuide {
  tabName: string;
  badge: string;
  headline: string;
  steps: StepItem[];
  proTip: string;
  ctaText: string;
  accent: string;
  icon: React.ComponentType<{ size?: number; style?: React.CSSProperties; className?: string }>;
}

export interface GuideContent {
  eyebrow: string;
  heading: string;
  subheading: string;
  proTipHeader: string;
  pillars: PillarGuide[];
}

export type GuideDictionary = Record<LanguageCode, GuideContent>;
