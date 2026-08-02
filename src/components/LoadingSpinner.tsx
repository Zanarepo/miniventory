import React from 'react';

export interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  color?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  color = 'currentColor',
}) => {
  const getDimensions = () => {
    switch (size) {
      case 'sm':
        return '16px';
      case 'lg':
        return '36px';
      case 'md':
      default:
        return '24px';
    }
  };

  const spinnerStyle: React.CSSProperties = {
    display: 'inline-block',
    width: getDimensions(),
    height: getDimensions(),
    border: '3px solid rgba(0, 0, 0, 0.1)',
    borderTopColor: color,
    borderRadius: '50%',
  };

  return (
    <span
      className="animate-spin"
      style={spinnerStyle}
      role="status"
      aria-label="Loading status progress..."
    />
  );
};
