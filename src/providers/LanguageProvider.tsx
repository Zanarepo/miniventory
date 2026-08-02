import React, { useState, useCallback } from 'react';
import { LanguageContext } from '../contexts/LanguageContext';
import {
  TRANSLATIONS,
  SUPPORTED_LANGUAGES,
  type LanguageCode,
  type TranslationKey,
} from '../i18n/translations';

interface LanguageProviderProps {
  children: React.ReactNode;
  defaultLang?: LanguageCode;
  storageKey?: string;
}

export const LanguageProvider: React.FC<LanguageProviderProps> = ({
  children,
  defaultLang = 'en',
  storageKey = 'biztrack-trader-language',
}) => {
  const [language, setLanguageState] = useState<LanguageCode>(() => {
    try {
      const stored = localStorage.getItem(storageKey) as LanguageCode | null;
      return stored && TRANSLATIONS[stored] ? stored : defaultLang;
    } catch {
      return defaultLang;
    }
  });

  const setLanguage = useCallback(
    (lang: LanguageCode) => {
      try {
        localStorage.setItem(storageKey, lang);
      } catch {
        // Fallback for restricted cookie environments
      }
      setLanguageState(lang);
    },
    [storageKey],
  );

  const t = useCallback(
    (key: TranslationKey): string => {
      const dict = TRANSLATIONS[language] || TRANSLATIONS.en;
      return dict[key] || TRANSLATIONS.en[key] || key;
    },
    [language],
  );

  return (
    <LanguageContext.Provider
      value={{
        language,
        setLanguage,
        t,
        supportedLanguages: SUPPORTED_LANGUAGES,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
};
