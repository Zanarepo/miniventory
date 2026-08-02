import React, { type HTMLAttributes } from 'react';

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: 'success' | 'warning' | 'error' | 'info';
  showDot?: boolean;
  pulseDot?: boolean;
  children: React.ReactNode;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'info',
  showDot = true,
  pulseDot = false,
  className = '',
  style,
  ...props
}) => {
  const variantClass = `badge-${variant}`;
  const dotPulseClass = pulseDot ? 'badge-dot-pulse' : '';

  return (
    <span className={`badge ${variantClass} ${className}`.trim()} style={style} {...props}>
      {showDot && <span className={`badge-dot ${dotPulseClass}`} />}
      <span>{children}</span>
    </span>
  );
};
