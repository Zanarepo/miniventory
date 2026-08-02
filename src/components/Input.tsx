import React, { type InputHTMLAttributes, forwardRef } from 'react';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  helperText?: string;
  error?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  wrapperClassName?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      helperText,
      error,
      leftIcon,
      rightIcon,
      style,
      className = '',
      wrapperClassName = '',
      id,
      ...props
    },
    ref,
  ) => {
    const inputId = id || `input-${Math.random().toString(36).substring(2, 9)}`;

    const helperStyle: React.CSSProperties = {
      fontSize: '0.75rem',
      fontWeight: error ? 600 : 400,
      color: error ? 'var(--brand-danger)' : 'var(--text-muted)',
      transition: 'color var(--transition-fast)',
    };

    return (
      <div className="input-container">
        {label && (
          <label
            htmlFor={inputId}
            className="input-label"
            style={{ color: error ? 'var(--brand-danger)' : undefined }}
          >
            {label}
          </label>
        )}
        <div
          className={`input-wrapper ${error ? 'input-error animate-shake' : ''} ${wrapperClassName}`.trim()}
        >
          {leftIcon && (
            <span
              style={{
                marginRight: '10px',
                display: 'flex',
                alignItems: 'center',
                color: 'var(--text-muted)',
              }}
            >
              {leftIcon}
            </span>
          )}
          <input
            ref={ref}
            id={inputId}
            className={`input-field ${className}`.trim()}
            style={style}
            aria-invalid={!!error}
            {...props}
          />
          {rightIcon && (
            <span
              style={{
                marginLeft: '10px',
                display: 'flex',
                alignItems: 'center',
                color: 'var(--text-muted)',
              }}
            >
              {rightIcon}
            </span>
          )}
        </div>
        {(helperText || error) && <span style={helperStyle}>{error || helperText}</span>}
      </div>
    );
  },
);

Input.displayName = 'Input';
