import { createContext } from 'react';
import type { LanguageCode, TranslationKey, LanguageMeta } from '../i18n/translations';

export interface LanguageContextType {
  language: LanguageCode;
  setLanguage: (lang: LanguageCode) => void;
  t: (key: TranslationKey) => string;
  supportedLanguages: LanguageMeta[];
}

export const LanguageContext = createContext<LanguageContextType | undefined>(undefined);
