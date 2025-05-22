
'use client';

import type { ReactNode } from 'react';
import { createContext, useContext, useState, useCallback, useEffect } from 'react';

// Import translations
import enTranslations from '@/locales/en.json';
import ruTranslations from '@/locales/ru.json';

type Language = 'en' | 'ru';

interface Translations {
  [key: string]: string; // Keeping it simple: flat key-value pairs
}

interface NestedTranslations {
  [lang: string]: Translations;
}

const translations: NestedTranslations = {
  en: enTranslations,
  ru: ruTranslations,
};

interface LanguageContextType {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (key: string, replacements?: Record<string, string | number | undefined>, defaultValue?: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>('en');
  const [loadedTranslations, setLoadedTranslations] = useState<NestedTranslations>(translations); // Initialize with direct imports

  // This useEffect is not strictly necessary if JSON is imported directly and synchronously,
  // but would be useful for dynamic loading or fetching. For now, it's a good pattern.
  useEffect(() => {
    // In a more complex setup, you might fetch these files
    // For now, direct imports are used.
    setLoadedTranslations({
      en: enTranslations,
      ru: ruTranslations,
    });
  }, []);


  const setLanguage = useCallback((lang: Language) => {
    setLanguageState(lang);
    if (typeof window !== 'undefined') {
      localStorage.setItem('quizsmith_language', lang);
    }
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedLang = localStorage.getItem('quizsmith_language') as Language | null;
      if (storedLang && (storedLang === 'en' || storedLang === 'ru')) {
        setLanguageState(storedLang);
      }
    }
  }, []);


  const t = useCallback(
    (key: string, replacements?: Record<string, string | number | undefined>, defaultValue?: string): string => {
      const langTranslations = loadedTranslations[language] || loadedTranslations.en;
      let translation = langTranslations?.[key] || defaultValue || key;
      
      if (replacements) {
        Object.keys(replacements).forEach((placeholder) => {
          const value = replacements[placeholder];
          if (value !== undefined) {
             translation = translation.replace(
               new RegExp(`{{\\s*${placeholder}\\s*}}`, 'g'), 
               String(value)
             );
          }
        });
      }
      return translation;
    },
    [language, loadedTranslations]
  );

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}


    