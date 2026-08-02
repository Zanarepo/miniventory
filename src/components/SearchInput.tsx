import React, { type InputHTMLAttributes, forwardRef, useRef, useEffect } from 'react';
import { Search, X } from 'lucide-react';

export interface SearchInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  value?: string;
  onChange?: (value: string, e?: React.ChangeEvent<HTMLInputElement>) => void;
  onClear?: () => void;
  placeholder?: string;
  shortcutText?: string;
  showShortcut?: boolean;
  wrapperClassName?: string;
}

export const SearchInput = forwardRef<HTMLInputElement, SearchInputProps>(
  (
    {
      value = '',
      onChange,
      onClear,
      placeholder = 'Search invoices, inventory, customers...',
      shortcutText = 'Ctrl + K',
      showShortcut = true,
      className = '',
      wrapperClassName = '',
      style,
      ...props
    },
    ref,
  ) => {
    const fallbackRef = useRef<HTMLInputElement>(null);
    const inputRef = (ref || fallbackRef) as React.RefObject<HTMLInputElement | null>;

    useEffect(() => {
      const handleKeyDown = (e: KeyboardEvent) => {
        if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
          e.preventDefault();
          inputRef.current?.focus();
          inputRef.current?.select();
        }
      };
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }, [inputRef]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      onChange?.(e.target.value, e);
    };

    const handleClear = (e: React.MouseEvent<HTMLButtonElement>) => {
      e.stopPropagation();
      onChange?.('');
      onClear?.();
      if (inputRef && inputRef.current) {
        inputRef.current.focus();
      }
    };

    return (
      <div
        className={`input-wrapper search-input-wrapper ${wrapperClassName}`.trim()}
        style={style}
      >
        <span className="search-prefix-icon" aria-hidden="true">
          <Search size={18} strokeWidth={2.2} />
        </span>
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={handleInputChange}
          placeholder={placeholder}
          className={`input-field ${className}`.trim()}
          aria-label="Search"
          {...props}
        />
        {value ? (
          <button
            type="button"
            onClick={handleClear}
            className="btn-ghost"
            style={{
              padding: '4px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              border: 'none',
              background: 'transparent',
            }}
            aria-label="Clear search input"
            title="Clear search"
          >
            <X size={16} strokeWidth={2.5} />
          </button>
        ) : showShortcut && shortcutText ? (
          <span className="shortcut-pill">{shortcutText}</span>
        ) : null}
      </div>
    );
  },
);

SearchInput.displayName = 'SearchInput';
