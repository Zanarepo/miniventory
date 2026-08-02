import React from 'react';
import { useLanguage } from '../hooks/useLanguage';

export const LanguageSelector: React.FC = () => {
  const { language, setLanguage, supportedLanguages } = useLanguage();

  const selectStyle: React.CSSProperties = {
    padding: '8px 12px',
    borderRadius: 'var(--radius-md)',
    border: '1px solid var(--border-color)',
    backgroundColor: 'var(--bg-card)',
    color: 'var(--text-main)',
    fontFamily: 'var(--font-sans)',
    fontSize: '0.875rem',
    fontWeight: 600,
    cursor: 'pointer',
    outline: 'none',
    boxShadow: 'var(--shadow-sm)',
    transition: 'border-color var(--transition-fast), box-shadow var(--transition-fast)',
  };

  return (
    <select
      value={language}
      onChange={(e) => setLanguage(e.target.value as unknown as typeof language)}
      style={selectStyle}
      aria-label="Select application language"
      title="Change Language"
      onFocus={(e) => (e.target.style.boxShadow = 'var(--focus-ring)')}
      onBlur={(e) => (e.target.style.boxShadow = 'var(--shadow-sm)')}
    >
      {supportedLanguages.map((lang) => (
        <option key={lang.code} value={lang.code}>
          {lang.flag} {lang.label}
        </option>
      ))}
    </select>
  );
};
