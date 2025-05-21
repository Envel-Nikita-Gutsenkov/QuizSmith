
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
    'appHeader.settingsLink': 'Settings', 
    'appHeader.logout': 'Log out',
    'appHeader.language': 'Language',
    'appHeader.lang.en': 'English (EN)',
    'appHeader.lang.ru': 'Russian (RU)',
    'appHeader.lang.current': 'EN',
    'appHeader.toggleSidebar': 'Toggle sidebar',


    'nav.dashboard': 'Dashboard',
    'nav.myTests': 'My Tests',
    'nav.myTemplates': 'My Templates',
    'nav.newTest': 'New Test',
    'nav.newTemplate': 'New Template',
    'nav.settings': 'Settings',
    'nav.adminPanel': 'Admin Panel',
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
    'editor.defaultTestNameExisting': 'Test {{testId}}',
    'editor.defaultEndMessage': 'Congratulations! Score: {{score}}/{{total}}.',
    'editor.quizTitlePlaceholder': 'Quiz Title',
    'editor.pageTitleNew': 'Create New Test',
    'editor.pageTitleEditing': 'Editing: {{testNameOrId}}',
    'editor.pageTitleExisting': 'Editing Test: {{testNameOrId}}',
    'editor.refreshPreview': 'Refresh Preview',
    'editor.fullScreenPreview': 'Full Screen Preview',
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
    'editor.toast.saveSuccessTitleExisting': 'Existing Test Data Logged',
    'editor.toast.saveSuccessDescriptionExisting': 'Test {{testId}} configuration logged to console.',
    'editor.toast.popupBlockedTitle': 'Popup Blocked',
    'editor.toast.popupBlockedDescription': 'Please allow popups for this site to use full screen preview.',


    'templateEditor.new.pageTitle': 'New Template Editor',
    'templateEditor.edit.pageTitle': 'Edit Template: {{templateIdOrName}}',
    'templateEditor.updatePreview': 'Update Preview',
    'templateEditor.saveTemplate': 'Save Template',
    'templateEditor.details.title': 'Template Details & Design',
    'templateEditor.details.description': 'Define the structure and style of your reusable quiz template.',
    'templateEditor.details.nameLabel': 'Template Name',
    'templateEditor.details.namePlaceholder': 'e.g., Modern MCQ Template',
    'templateEditor.details.loadedNamePlaceholder': 'Template {{templateId}}',
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

    'testResults.pageTitle': 'Results: {{testId}}',
    'testResults.summaryTitle': 'Test Summary',
    'testResults.summaryDescription': 'Detailed results for test ID: {{testId}}. This feature is under development.',
    'testResults.comingSoon': 'Detailed test results and analytics will be available here soon.',
    'testResults.checkBack': 'Please check back later!',

    'adminPanel.pageTitle': 'Admin Panel',
    'adminPanel.storage.title': 'Storage Configuration',
    'adminPanel.storage.description': 'Select and configure permanent storage options for the application. (Note: This is a UI placeholder. Backend implementation is required for full functionality).',
    'adminPanel.storage.selectLabel': 'Choose Storage Type:',
    'adminPanel.storage.sqlite.label': 'SQLite',
    'adminPanel.storage.sqlite.description': 'Local file-based database. Good for development or small single-server deployments.',
    'adminPanel.storage.sqlite.pathLabel': 'Database File Path',
    'adminPanel.storage.sqlite.pathPlaceholder': '/path/to/your/database.sqlite',
    'adminPanel.storage.mysql.label': 'MySQL',
    'adminPanel.storage.mysql.description': 'Robust relational database. Suitable for larger applications.',
    'adminPanel.storage.mysql.hostLabel': 'Host',
    'adminPanel.storage.mysql.portLabel': 'Port',
    'adminPanel.storage.mysql.dbNameLabel': 'Database Name',
    'adminPanel.storage.mysql.userLabel': 'Username',
    'adminPanel.storage.mysql.passwordLabel': 'Password',
    'adminPanel.storage.firestore.label': 'Firebase Firestore',
    'adminPanel.storage.firestore.description': 'Scalable NoSQL cloud database. Recommended for Next.js applications.',
    'adminPanel.storage.firestore.projectIdLabel': 'Project ID',
    'adminPanel.storage.firestore.clientEmailLabel': 'Client Email',
    'adminPanel.storage.firestore.privateKeyLabel': 'Private Key (JSON)',
    'adminPanel.storage.firestore.privateKeyPlaceholder': 'Paste your Firebase service account private key JSON here...',
    'adminPanel.storage.other.label': 'Other Database',
    'adminPanel.storage.other.description': 'Requires manual backend setup.',
    'adminPanel.storage.other.connectionStringLabel': 'Connection String / Details',
    'adminPanel.storage.other.connectionStringPlaceholder': 'Enter connection details or path...',
    'adminPanel.storage.saveButton': 'Save Configuration',
    'adminPanel.toast.saveConfigTitle': 'Configuration Update',
    'adminPanel.toast.saveConfigDescription': 'This feature is not yet implemented. Backend development is required.',
    'adminPanel.toast.notImplementedTitle': 'Feature Not Implemented',
    'adminPanel.toast.notImplementedDescription': '{{featureName}} functionality is not yet available.',
    'adminPanel.logs.title': 'Application Logs',
    'adminPanel.logs.description': 'View system and application logs. (Placeholder UI)',
    'adminPanel.logs.placeholder': 'Log entries would appear here...\n[INFO] 2023-10-27 10:00:00 - Application started.\n[WARN] 2023-10-27 10:05:23 - User login attempt failed.\n...',
    'adminPanel.logs.refreshButton': 'Refresh Logs',
    'adminPanel.rollbacks.title': 'Version Rollbacks',
    'adminPanel.rollbacks.description': 'Manage and rollback to previous application versions. (Placeholder UI)',
    'adminPanel.rollbacks.versionLabel': 'Version {{version}}',
    'adminPanel.rollbacks.deployedDateLabel': 'Deployed: {{date}}',
    'adminPanel.rollbacks.currentButton': 'Current',
    'adminPanel.rollbacks.rollbackButton': 'Rollback',
    'adminPanel.rollbacks.rollbackToButton': 'Rollback to {{version}}',


  },
  ru: {
    'appHeader.myAccount': 'Мой аккаунт',
    'appHeader.profile': 'Профиль',
    'appHeader.settingsLink': 'Настройки',
    'appHeader.logout': 'Выйти',
    'appHeader.language': 'Язык',
    'appHeader.lang.en': 'Английский (EN)',
    'appHeader.lang.ru': 'Русский (RU)',
    'appHeader.lang.current': 'RU',
    'appHeader.toggleSidebar': 'Переключить боковую панель',

    'nav.dashboard': 'Панель',
    'nav.myTests': 'Мои тесты',
    'nav.myTemplates': 'Мои шаблоны',
    'nav.newTest': 'Новый тест',
    'nav.newTemplate': 'Новый шаблон',
    'nav.settings': 'Настройки',
    'nav.adminPanel': 'Панель администратора',
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
    'editor.defaultTestNameExisting': 'Тест {{testId}}',
    'editor.defaultEndMessage': 'Поздравляем! Результат: {{score}}/{{total}}.',
    'editor.quizTitlePlaceholder': 'Название викторины',
    'editor.pageTitleNew': 'Создать новый тест',
    'editor.pageTitleEditing': 'Редактирование: {{testNameOrId}}',
    'editor.pageTitleExisting': 'Редактирование теста: {{testNameOrId}}',
    'editor.refreshPreview': 'Обновить предпросмотр',
    'editor.fullScreenPreview': 'Полноэкранный предпросмотр',
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
    'editor.toast.saveSuccessTitleExisting': 'Данные существующего теста записаны',
    'editor.toast.saveSuccessDescriptionExisting': 'Конфигурация теста {{testId}} записана в консоль.',
    'editor.toast.popupBlockedTitle': 'Всплывающее окно заблокировано',
    'editor.toast.popupBlockedDescription': 'Пожалуйста, разрешите всплывающие окна для этого сайта, чтобы использовать полноэкранный предпросмотр.',

    'templateEditor.new.pageTitle': 'Редактор нового шаблона',
    'templateEditor.edit.pageTitle': 'Редактировать шаблон: {{templateIdOrName}}',
    'templateEditor.updatePreview': 'Обновить предпросмотр',
    'templateEditor.saveTemplate': 'Сохранить шаблон',
    'templateEditor.details.title': 'Детали шаблона и дизайн',
    'templateEditor.details.description': 'Определите структуру и стиль вашего многоразового шаблона викторины.',
    'templateEditor.details.nameLabel': 'Название шаблона',
    'templateEditor.details.namePlaceholder': 'например, Современный MCQ шаблон',
    'templateEditor.details.loadedNamePlaceholder': 'Шаблон {{templateId}}',
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

    'testResults.pageTitle': 'Результаты: {{testId}}',
    'testResults.summaryTitle': 'Сводка по тесту',
    'testResults.summaryDescription': 'Подробные результаты для теста ID: {{testId}}. Эта функция находится в разработке.',
    'testResults.comingSoon': 'Подробные результаты теста и аналитика скоро будут доступны здесь.',
    'testResults.checkBack': 'Пожалуйста, зайдите позже!',

    'adminPanel.pageTitle': 'Панель администратора',
    'adminPanel.storage.title': 'Конфигурация хранилища',
    'adminPanel.storage.description': 'Выберите и настройте параметры постоянного хранилища для приложения. (Примечание: Это заглушка интерфейса. Для полной функциональности требуется разработка бэкенда).',
    'adminPanel.storage.selectLabel': 'Выберите тип хранилища:',
    'adminPanel.storage.sqlite.label': 'SQLite',
    'adminPanel.storage.sqlite.description': 'Локальная файловая база данных. Подходит для разработки или небольших односерверных развертываний.',
    'adminPanel.storage.sqlite.pathLabel': 'Путь к файлу базы данных',
    'adminPanel.storage.sqlite.pathPlaceholder': '/путь/к/вашей/базе.sqlite',
    'adminPanel.storage.mysql.label': 'MySQL',
    'adminPanel.storage.mysql.description': 'Надежная реляционная база данных. Подходит для крупных приложений.',
    'adminPanel.storage.mysql.hostLabel': 'Хост',
    'adminPanel.storage.mysql.portLabel': 'Порт',
    'adminPanel.storage.mysql.dbNameLabel': 'Имя базы данных',
    'adminPanel.storage.mysql.userLabel': 'Имя пользователя',
    'adminPanel.storage.mysql.passwordLabel': 'Пароль',
    'adminPanel.storage.firestore.label': 'Firebase Firestore',
    'adminPanel.storage.firestore.description': 'Масштабируемая облачная NoSQL база данных. Рекомендуется для приложений Next.js.',
    'adminPanel.storage.firestore.projectIdLabel': 'ID Проекта',
    'adminPanel.storage.firestore.clientEmailLabel': 'Email клиента',
    'adminPanel.storage.firestore.privateKeyLabel': 'Приватный ключ (JSON)',
    'adminPanel.storage.firestore.privateKeyPlaceholder': 'Вставьте сюда JSON приватного ключа вашего сервисного аккаунта Firebase...',
    'adminPanel.storage.other.label': 'Другая база данных',
    'adminPanel.storage.other.description': 'Требуется ручная настройка и конфигурация бэкенда.',
    'adminPanel.storage.other.connectionStringLabel': 'Строка подключения / Детали',
    'adminPanel.storage.other.connectionStringPlaceholder': 'Введите детали подключения или путь...',
    'adminPanel.storage.saveButton': 'Сохранить конфигурацию',
    'adminPanel.toast.saveConfigTitle': 'Обновление конфигурации',
    'adminPanel.toast.saveConfigDescription': 'Эта функция еще не реализована. Требуется разработка бэкенда.',
    'adminPanel.toast.notImplementedTitle': 'Функция не реализована',
    'adminPanel.toast.notImplementedDescription': 'Функциональность "{{featureName}}" еще не доступна.',
    'adminPanel.logs.title': 'Логи приложения',
    'adminPanel.logs.description': 'Просмотр системных и прикладных логов. (Заглушка интерфейса)',
    'adminPanel.logs.placeholder': 'Записи логов будут отображаться здесь...\n[ИНФО] 2023-10-27 10:00:00 - Приложение запущено.\n[ПРЕДУПР.] 2023-10-27 10:05:23 - Неудачная попытка входа пользователя.\n...',
    'adminPanel.logs.refreshButton': 'Обновить логи',
    'adminPanel.rollbacks.title': 'Откат версий',
    'adminPanel.rollbacks.description': 'Управление и откат к предыдущим версиям приложения. (Заглушка интерфейса)',
    'adminPanel.rollbacks.versionLabel': 'Версия {{version}}',
    'adminPanel.rollbacks.deployedDateLabel': 'Развернуто: {{date}}',
    'adminPanel.rollbacks.currentButton': 'Текущая',
    'adminPanel.rollbacks.rollbackButton': 'Откатить',
    'adminPanel.rollbacks.rollbackToButton': 'Откатить до {{version}}',
  },
};

interface LanguageContextType {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (key: string, replacements?: Record<string, string | number | undefined>, defaultValue?: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>('en'); 

  const setLanguage = useCallback((lang: Language) => {
    setLanguageState(lang);
  }, []);

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
