
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

    'editor.defaultTestName': 'My Awesome Quiz',
    'editor.defaultEndMessage': 'Congratulations! Score: {{score}}/{{total}}.',
    'editor.quizTitlePlaceholder': 'Quiz Title',
    'editor.pageTitleNew': 'Create New Test',
    'editor.pageTitleEditing': 'Editing: {{testName}}',
    'editor.refreshPreview': 'Refresh Preview',
    'editor.saveTest': 'Save Test',
    'editor.config.title': 'Configuration',
    'editor.config.description': 'Basic settings, design inputs, and embed information.',
    'editor.config.testNameLabel': 'Test Name',
    'editor.config.testNamePlaceholder': 'e.g., General Knowledge',
    'editor.config.endMessageLabel': 'Quiz End Message',
    'editor.config.endMessagePlaceholder': 'e.g., Congrats! Score: {{score}}/{{total}}',
    'editor.config.endMessageHint': 'Use {{score}} and {{total}} as placeholders.',
    'editor.config.htmlLabel': 'HTML Structure',
    'editor.config.cssLabel': 'CSS Styles',
    'editor.config.embedTitle': 'Embed Your Test',
    'editor.config.embedDescription': 'After saving, embed code will appear here.',
    'editor.preview.title': 'Live Preview',
    'editor.preview.description': 'Rendered output of your test. Fully interactive.',
    'editor.questions.title': 'Questions',
    'editor.questions.description': 'Add and manage your questions and answers.',
    'editor.questions.addQuestion': 'Add Question',
    'editor.questions.noQuestions': 'No questions added yet.',
    'editor.questions.addFirstQuestion': 'Add First Question',
    'editor.questions.questionLabel': 'Question {{number}}',
    'editor.questions.questionTextLabel': 'Question Text',
    'editor.questions.questionTextPlaceholder': 'Enter question text',
    'editor.questions.optionsLabel': 'Options:',
    'editor.questions.markIncorrect': 'Mark as incorrect',
    'editor.questions.markCorrect': 'Mark as correct',
    'editor.questions.optionTextPlaceholder': 'Option text',
    'editor.questions.removeOption': 'Remove option',
    'editor.questions.addOption': 'Add Option',
    'editor.newQuestionText': 'New Question {{number}}',
    'editor.optionPlaceholder': 'Option {{letter}}',
    'editor.newOptionText': 'New Option {{number}}',
    'editor.toast.saveSuccessTitle': 'Test Data Logged',
    'editor.toast.saveSuccessDescription': 'Test configuration has been logged to the console.',

    'templateEditor.new.pageTitle': 'New Template Editor',
    'templateEditor.updatePreview': 'Update Preview',
    'templateEditor.saveTemplate': 'Save Template',
    'templateEditor.details.title': 'Template Details & Design',
    'templateEditor.details.description': 'Define the structure and style of your reusable quiz template.',
    'templateEditor.details.nameLabel': 'Template Name',
    'templateEditor.details.namePlaceholder': 'e.g., Modern MCQ Template',
    'templateEditor.details.descriptionLabel': 'Description (Optional)',
    'templateEditor.details.descriptionPlaceholder': 'A brief description of what this template is best for...',
    'templateEditor.details.htmlLabel': 'HTML Structure',
    'templateEditor.details.htmlPlaceholder': 'Enter template HTML...\n<!-- Use placeholders like {{question_text}}, {{option_text}}, <div data-quiz-options-host> etc. -->',
    'templateEditor.details.cssLabel': 'CSS Styles',
    'templateEditor.details.cssPlaceholder': 'Enter template CSS...\n/* Style your template elements */',
    'templateEditor.preview.titlePane': 'Template Preview',
    'templateEditor.preview.descriptionPane': 'This is how your template structure will look with sample content.',
    'templateEditor.preview.iframeTitle': 'Template Preview',
    'templateEditor.preview.sampleTitle': 'Sample Template Title',
    'templateEditor.preview.sampleQuestion': 'This is a sample question text.',
    'templateEditor.preview.sampleOption1': 'Sample Option 1',
    'templateEditor.preview.sampleOption2': 'Sample Option 2',

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

    'editor.defaultTestName': 'Моя классная викторина',
    'editor.defaultEndMessage': 'Поздравляем! Результат: {{score}}/{{total}}.',
    'editor.quizTitlePlaceholder': 'Название викторины',
    'editor.pageTitleNew': 'Создать новый тест',
    'editor.pageTitleEditing': 'Редактирование: {{testName}}',
    'editor.refreshPreview': 'Обновить предпросмотр',
    'editor.saveTest': 'Сохранить тест',
    'editor.config.title': 'Конфигурация',
    'editor.config.description': 'Основные настройки, дизайн и информация для встраивания.',
    'editor.config.testNameLabel': 'Название теста',
    'editor.config.testNamePlaceholder': 'например, Общие знания',
    'editor.config.endMessageLabel': 'Сообщение о завершении викторины',
    'editor.config.endMessagePlaceholder': 'например, Поздравляем! Результат: {{score}}/{{total}}',
    'editor.config.endMessageHint': 'Используйте {{score}} и {{total}} как плейсхолдеры.',
    'editor.config.htmlLabel': 'Структура HTML',
    'editor.config.cssLabel': 'Стили CSS',
    'editor.config.embedTitle': 'Встроить ваш тест',
    'editor.config.embedDescription': 'После сохранения здесь появится код для встраивания.',
    'editor.preview.title': 'Живой предпросмотр',
    'editor.preview.description': 'Отображаемый результат вашего теста. Полностью интерактивно.',
    'editor.questions.title': 'Вопросы',
    'editor.questions.description': 'Добавляйте и управляйте вашими вопросами и ответами.',
    'editor.questions.addQuestion': 'Добавить вопрос',
    'editor.questions.noQuestions': 'Вопросы еще не добавлены.',
    'editor.questions.addFirstQuestion': 'Добавить первый вопрос',
    'editor.questions.questionLabel': 'Вопрос {{number}}',
    'editor.questions.questionTextLabel': 'Текст вопроса',
    'editor.questions.questionTextPlaceholder': 'Введите текст вопроса',
    'editor.questions.optionsLabel': 'Варианты:',
    'editor.questions.markIncorrect': 'Отметить как неверный',
    'editor.questions.markCorrect': 'Отметить как верный',
    'editor.questions.optionTextPlaceholder': 'Текст варианта',
    'editor.questions.removeOption': 'Удалить вариант',
    'editor.questions.addOption': 'Добавить вариант',
    'editor.newQuestionText': 'Новый вопрос {{number}}',
    'editor.optionPlaceholder': 'Вариант {{letter}}',
    'editor.newOptionText': 'Новый вариант {{number}}',
    'editor.toast.saveSuccessTitle': 'Данные теста записаны',
    'editor.toast.saveSuccessDescription': 'Конфигурация теста записана в консоль.',

    'templateEditor.new.pageTitle': 'Редактор нового шаблона',
    'templateEditor.updatePreview': 'Обновить предпросмотр',
    'templateEditor.saveTemplate': 'Сохранить шаблон',
    'templateEditor.details.title': 'Детали шаблона и дизайн',
    'templateEditor.details.description': 'Определите структуру и стиль вашего многоразового шаблона викторины.',
    'templateEditor.details.nameLabel': 'Название шаблона',
    'templateEditor.details.namePlaceholder': 'например, Современный MCQ шаблон',
    'templateEditor.details.descriptionLabel': 'Описание (необязательно)',
    'templateEditor.details.descriptionPlaceholder': 'Краткое описание, для чего лучше всего подходит этот шаблон...',
    'templateEditor.details.htmlLabel': 'Структура HTML',
    'templateEditor.details.htmlPlaceholder': 'Введите HTML шаблона...\n<!-- Используйте плейсхолдеры типа {{question_text}}, {{option_text}}, <div data-quiz-options-host> и т.д. -->',
    'templateEditor.details.cssLabel': 'Стили CSS',
    'templateEditor.details.cssPlaceholder': 'Введите CSS шаблона...\n/* Стилизуйте элементы вашего шаблона */',
    'templateEditor.preview.titlePane': 'Предпросмотр шаблона',
    'templateEditor.preview.descriptionPane': 'Так будет выглядеть структура вашего шаблона с образцом содержимого.',
    'templateEditor.preview.iframeTitle': 'Предпросмотр шаблона',
    'templateEditor.preview.sampleTitle': 'Пример названия шаблона',
    'templateEditor.preview.sampleQuestion': 'Это пример текста вопроса.',
    'templateEditor.preview.sampleOption1': 'Пример варианта 1',
    'templateEditor.preview.sampleOption2': 'Пример варианта 2',
  },
};

interface LanguageContextType {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (key: string, replacements?: Record<string, string | number | undefined>, defaultValue?: string) => string; // Added defaultValue
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
    (key: string, replacements?: Record<string, string | number | undefined>, defaultValue?: string): string => {
      let translation = translations[language]?.[key] || translations.en?.[key] || defaultValue || key;
      if (replacements) {
        Object.keys(replacements).forEach((placeholder) => {
          const value = replacements[placeholder];
          if (value !== undefined) {
             translation = translation.replace(
               new RegExp(`{{${placeholder}}}`, 'g'),
               String(value)
             );
          }
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

