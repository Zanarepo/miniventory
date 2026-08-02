import React, { type ButtonHTMLAttributes } from 'react';
import { LoadingSpinner } from './LoadingSpinner';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  leftIcon,
  rightIcon,
  disabled,
  className = '',
  style,
  ...props
}) => {
  // Map props directly to our Design System CSS framework classes
  const variantClass = `btn-${variant}`;
  const sizeClass = `btn-${size}`;
  const combinedClassName = `btn ${variantClass} ${sizeClass} ${className}`.trim();

  return (
    <button
      className={combinedClassName}
      disabled={disabled || isLoading}
      aria-disabled={disabled || isLoading}
      style={style}
      {...props}
    >
      {isLoading && <LoadingSpinner size="sm" color="currentColor" />}
      {!isLoading && leftIcon && (
        <span className="btn-icon-left" style={{ display: 'inline-flex', alignItems: 'center' }}>
          {leftIcon}
        </span>
      )}
      <span>{children}</span>
      {!isLoading && rightIcon && (
        <span className="btn-icon-right" style={{ display: 'inline-flex', alignItems: 'center' }}>
          {rightIcon}
        </span>
      )}
    </button>
  );
};
