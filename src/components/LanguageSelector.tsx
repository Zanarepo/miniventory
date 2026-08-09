import React from 'react';
import { useLanguage } from '../hooks/useLanguage';
import type { LanguageCode } from '../i18n/translations';
import { CustomSelect } from './CustomSelect';

export const LanguageSelector: React.FC = () => {
  const { language, setLanguage, supportedLanguages } = useLanguage();

  return (
    <CustomSelect
      value={language}
      onChange={(val) => setLanguage(val as LanguageCode)}
      options={supportedLanguages.map((lang) => ({
        value: lang.code,
        label: (
          <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span>{lang.flag}</span>
            <span className="hide-on-mobile">{lang.label}</span>
          </span>
        ),
      }))}
      style={{ minWidth: 'auto' }}
    />
  );
};
