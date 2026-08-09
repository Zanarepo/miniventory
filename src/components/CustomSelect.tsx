import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';

export interface SelectOption {
  value: string;
  label: React.ReactNode;
}

interface CustomSelectProps {
  value: string;
  options: SelectOption[];
  onChange: (value: string) => void;
  style?: React.CSSProperties;
  className?: string;
  disabled?: boolean;
  required?: boolean;
  leftIcon?: React.ReactNode;
}

export const CustomSelect: React.FC<CustomSelectProps> = ({
  value,
  options,
  onChange,
  style,
  className,
  disabled,
  required,
  leftIcon,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((opt) => opt.value === value) || options[0];

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  return (
    <div
      ref={containerRef}
      className={className}
      style={{ position: 'relative', display: 'inline-block', ...style }}
    >
      {required && (
        <input
          type="text"
          required={required}
          value={value}
          onChange={() => {}}
          style={{ position: 'absolute', opacity: 0, height: 0, width: 0, pointerEvents: 'none' }}
        />
      )}
      <div
        onClick={() => !disabled && setIsOpen(!isOpen)}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: leftIcon ? '8px 12px 8px 38px' : '8px 12px',
          borderRadius: 'var(--radius-md, 8px)',
          border: `1px solid ${isOpen ? 'var(--brand-primary, #2563eb)' : 'var(--border-color, #e2e8f0)'}`,
          backgroundColor: disabled
            ? 'var(--bg-app, #f8fafc)'
            : 'var(--bg-dropdown, var(--bg-elevated, #ffffff))',
          color: disabled ? 'var(--text-muted, #64748b)' : 'var(--text-main, #0f172a)',
          fontSize: '0.85rem',
          fontWeight: 500,
          cursor: disabled ? 'not-allowed' : 'pointer',
          width: '100%',
          boxShadow: isOpen ? '0 0 0 2px rgba(37, 99, 235, 0.2)' : 'none',
          transition: 'all 0.2s ease',
          userSelect: 'none',
        }}
      >
        {leftIcon && (
          <div
            style={{
              position: 'absolute',
              left: '12px',
              top: '50%',
              transform: 'translateY(-50%)',
              color: 'var(--text-muted, #64748b)',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            {leftIcon}
          </div>
        )}
        <span style={{ textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
          {selectedOption?.label}
        </span>
        <ChevronDown
          size={16}
          style={{
            color: 'var(--text-muted, #64748b)',
            flexShrink: 0,
            marginLeft: '8px',
            transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 0.2s ease',
          }}
        />
      </div>

      {isOpen && (
        <div
          style={{
            position: 'absolute',
            top: 'calc(100% + 4px)',
            left: 0,
            zIndex: 1000,
            width: '100%',
            minWidth: 'max-content',
            backgroundColor: 'var(--bg-dropdown, var(--bg-elevated, #ffffff))',
            border: '1px solid var(--border-color, #e2e8f0)',
            borderRadius: 'var(--radius-md, 8px)',
            boxShadow: '0 12px 28px rgba(0, 0, 0, 0.45), 0 4px 10px rgba(0, 0, 0, 0.35)',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <div style={{ maxHeight: '250px', overflowY: 'auto' }}>
            {options.map((option) => (
              <div
                key={option.value}
                onClick={() => {
                  onChange(option.value);
                  setIsOpen(false);
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.backgroundColor = 'var(--bg-hover, #f1f5f9)')
                }
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                style={{
                  padding: '10px 12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  cursor: 'pointer',
                  fontSize: '0.85rem',
                  fontWeight: value === option.value ? 600 : 500,
                  color:
                    value === option.value
                      ? 'var(--brand-primary, #2563eb)'
                      : 'var(--text-main, #0f172a)',
                  backgroundColor: 'transparent',
                  transition: 'background-color 0.15s ease',
                }}
              >
                <span>{option.label}</span>
                {value === option.value && (
                  <Check size={16} style={{ color: 'var(--brand-primary, #2563eb)' }} />
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
