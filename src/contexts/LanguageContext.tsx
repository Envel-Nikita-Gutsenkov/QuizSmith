
'use client';

import type { ReactNode }
from 'react';
import { createContext, useContext, useState, useCallback } from 'react';

// Define available languages
type Language = 'en' | 'ru';

interface Translations {
  [lang: string]: {
    [key: string]: string;
  };
}

// Define your translations here
const translations: Translations = {
  en: {
    'appHeader.myAccount': 'My Account',
    'appHeader.profile': 'Profile',
    'appHeader.settingsLink': 'Settings', // Changed from 'appHeader.settings' to avoid conflict
    'appHeader.logout': 'Log out',
    'appHeader.language': 'Language',
    'appHeader.lang.en': 'English (EN)',
    'appHeader.lang.ru': 'Russian (RU)',
    'appHeader.lang.current': 'EN',


    'nav.dashboard': 'Dashboard',
    'nav.myTests': 'My Tests',
    'nav.myTemplates': 'My Templates',
    'nav.newTest': 'New Test',
    'nav.newTemplate': 'New Template',
    'nav.settings': 'Settings',
    'nav.createNew': 'Create New',

    'dashboard.pageTitle': 'Dashboard',
    'dashboard.myTests.heading': 'My Tests',
    'dashboard.myTests.create': 'Create New Test',
    'dashboard.myTests.noTests.title': 'No tests created yet',
    'dashboard.myTests.noTests.description': 'Start by creating your first masterpiece!',
    'dashboard.myTests.noTests.button': 'Create Your First Test',
    'dashboard.myTemplates.heading': 'My Templates',
    'dashboard.myTemplates.create': 'Create New Template',
    'dashboard.myTemplates.noTemplates.title': 'No templates created yet',
    'dashboard.myTemplates.noTemplates.description': 'Build reusable designs for your quizzes.',
    'dashboard.myTemplates.noTemplates.button': 'Create Your First Template',
    'dashboard.editTest': 'Edit Test',
    'dashboard.editTemplate': 'Edit Template',


    'myTests.pageTitle': 'My Tests',
    'myTests.create': 'Create New Test',
    'myTests.noTests.title': "You haven't created any tests yet.",
    'myTests.noTests.description': 'Click the button below to start building your first quiz!',
    'myTests.noTests.button': 'Create Your First Test',
    'myTests.edit': 'Edit',
    'myTests.viewResults': 'View Results',
    'myTests.questionsLabel': 'questions',
    'myTests.statusLabel': 'Status',
    'myTests.lastModifiedLabel': 'Last modified',

    'myTemplates.pageTitle': 'My Templates',
    'myTemplates.create': 'Create New Template',
    'myTemplates.noTemplates.title': "You haven't created any templates yet.",
    'myTemplates.noTemplates.description': 'Templates help you build quizzes faster with consistent designs.',
    'myTemplates.noTemplates.button': 'Create Your First Template',
    'myTemplates.edit': 'Edit Template',
    'myTemplates.usageCountLabel': 'Used',
    'myTemplates.timesLabel': 'times',
    'myTemplates.lastModifiedLabel': 'Last modified',

    'settings.pageTitle': 'Settings',
    // ... add more translations as needed for other pages and components
  },
  ru: {
    'appHeader.myAccount': 'Мой аккаунт',
    'appHeader.profile': 'Профиль',
    'appHeader.settingsLink': 'Настройки', // Changed from 'appHeader.settings'
    'appHeader.logout': 'Выйти',
    'appHeader.language': 'Язык',
    'appHeader.lang.en': 'Английский (EN)',
    'appHeader.lang.ru': 'Русский (RU)',
    'appHeader.lang.current': 'RU',


    'nav.dashboard': 'Панель',
    'nav.myTests': 'Мои тесты',
    'nav.myTemplates': 'Мои шаблоны',
    'nav.newTest': 'Новый тест',
    'nav.newTemplate': 'Новый шаблон',
    'nav.settings': 'Настройки',
    'nav.createNew': 'Создать',

    'dashboard.pageTitle': 'Панель',
    'dashboard.myTests.heading': 'Мои тесты',
    'dashboard.myTests.create': 'Создать новый тест',
    'dashboard.myTests.noTests.title': 'Тесты еще не созданы',
    'dashboard.myTests.noTests.description': 'Начните с создания вашего первого шедевра!',
    'dashboard.myTests.noTests.button': 'Создать первый тест',
    'dashboard.myTemplates.heading': 'Мои шаблоны',
    'dashboard.myTemplates.create': 'Создать новый шаблон',
    'dashboard.myTemplates.noTemplates.title': 'Шаблоны еще не созданы',
    'dashboard.myTemplates.noTemplates.description': 'Создавайте многоразовые дизайны для ваших викторин.',
    'dashboard.myTemplates.noTemplates.button': 'Создать первый шаблон',
    'dashboard.editTest': 'Редактировать тест',
    'dashboard.editTemplate': 'Редактировать шаблон',


    'myTests.pageTitle': 'Мои тесты',
    'myTests.create': 'Создать новый тест',
    'myTests.noTests.title': 'Вы еще не создали ни одного теста.',
    'myTests.noTests.description': 'Нажмите кнопку ниже, чтобы начать создавать свою первую викторину!',
    'myTests.noTests.button': 'Создать свой первый тест',
    'myTests.edit': 'Редактировать',
    'myTests.viewResults': 'Смотреть результаты',
    'myTests.questionsLabel': 'вопросов',
    'myTests.statusLabel': 'Статус',
    'myTests.lastModifiedLabel': 'Последнее изменение',


    'myTemplates.pageTitle': 'Мои шаблоны',
    'myTemplates.create': 'Создать новый шаблон',
    'myTemplates.noTemplates.title': 'Вы еще не создали ни одного шаблона.',
    'myTemplates.noTemplates.description': 'Шаблоны помогут вам быстрее создавать викторины с единым дизайном.',
    'myTemplates.noTemplates.button': 'Создать свой первый шаблон',
    'myTemplates.edit': 'Редактировать шаблон',
    'myTemplates.usageCountLabel': 'Использовано',
    'myTemplates.timesLabel': 'раз',
    'myTemplates.lastModifiedLabel': 'Последнее изменение',

    'settings.pageTitle': 'Настройки',
    // ...
  },
};

interface LanguageContextType {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (key: string, replacements?: Record<string, string | number>) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>('en'); // Default language

  const setLanguage = useCallback((lang: Language) => {
    setLanguageState(lang);
    // Optionally, save to localStorage: localStorage.setItem('language', lang);
  }, []);

  // useEffect(() => {
  //   const storedLang = localStorage.getItem('language') as Language | null;
  //   if (storedLang && (storedLang === 'en' || storedLang === 'ru')) {
  //     setLanguageState(storedLang);
  //   }
  // }, []);

  const t = useCallback(
    (key: string, replacements?: Record<string, string | number>): string => {
      let translation = translations[language]?.[key] || translations.en?.[key] || key;
      if (replacements) {
        Object.keys(replacements).forEach((placeholder) => {
          translation = translation.replace(
            new RegExp(`{{${placeholder}}}`, 'g'),
            String(replacements[placeholder])
          );
        });
      }
      return translation;
    },
    [language]
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
