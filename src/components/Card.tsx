import React, { type HTMLAttributes } from 'react';

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  title?: string;
  subtitle?: string;
  footer?: React.ReactNode;
  isInteractive?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  title,
  subtitle,
  footer,
  style,
  isInteractive = false,
  className = '',
  ...props
}) => {
  const cardStyle: React.CSSProperties = {
    padding: '24px',
    ...style,
  };

  const headerStyle: React.CSSProperties = {
    marginBottom: '16px',
    borderBottom: title ? '1px solid var(--border-color)' : 'none',
    paddingBottom: title ? '12px' : '0',
  };

  const titleStyle: React.CSSProperties = {
    fontSize: '1.25rem',
    fontWeight: 700,
    color: 'var(--text-main)',
    letterSpacing: '-0.02em',
    margin: 0,
  };

  const subtitleStyle: React.CSSProperties = {
    fontSize: '0.875rem',
    color: 'var(--text-muted)',
    marginTop: '6px',
  };

  const interactiveClass = isInteractive ? 'glass-card-interactive' : '';

  return (
    <div
      className={`glass-panel ${interactiveClass} ${className}`.trim()}
      style={cardStyle}
      {...props}
    >
      {(title || subtitle) && (
        <div style={headerStyle}>
          {title && <h3 style={titleStyle}>{title}</h3>}
          {subtitle && <p style={subtitleStyle}>{subtitle}</p>}
        </div>
      )}
      <div>{children}</div>
      {footer && <div className="card-footer-container">{footer}</div>}
    </div>
  );
};
