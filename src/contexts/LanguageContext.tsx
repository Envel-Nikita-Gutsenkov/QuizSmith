
'use client';

import type { ReactNode }
from 'react';
import { createContext, useContext, useState, useCallback, Suspense } from 'react'; // Added Suspense

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
    'dashboard.myPageTemplates.heading': 'My Page Templates',
    'dashboard.myPageTemplates.create': 'Create New Page Template',
    'dashboard.myPageTemplates.noPageTemplates.title': 'No page templates created yet',
    'dashboard.myPageTemplates.noPageTemplates.description': 'Build reusable page designs for your quizzes.',
    'dashboard.myPageTemplates.noPageTemplates.button': 'Create Your First Page Template',
    'dashboard.editTest': 'Edit Test',
    'dashboard.editPageTemplate': 'Edit Page Template',


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

    'myPageTemplates.pageTitle': 'My Templates',
    'myPageTemplates.create': 'Create New Template',
    'myPageTemplates.noPageTemplates.title': "You haven't created any templates yet.",
    'myPageTemplates.noPageTemplates.description': 'Page templates help you build quizzes faster with consistent page designs.',
    'myPageTemplates.noPageTemplates.button': 'Create Your First Template',
    'myPageTemplates.edit': 'Edit Template',
    'myPageTemplates.usageCountLabel': 'Used',
    'myPageTemplates.timesLabel': 'times',
    'myPageTemplates.lastModifiedLabel': 'Last modified',

    'settings.pageTitle': 'Settings',

    'editor.defaultTestName': 'My Awesome Quiz',
    'editor.defaultTestNameExisting': 'Test {{testId}}',
    'editor.defaultTestNameFromTemplate': 'Quiz from {{templateName}}',
    'editor.defaultEndMessage': 'Congratulations! Score: {{score}}/{{total}}.',
    'editor.quizTitlePlaceholder': 'Quiz Title',
    'editor.pageTitleNew': 'Create New Test',
    'editor.pageTitleEditing': 'Editing: {{testNameOrId}}',
    'editor.pageTitleExisting': 'Editing Test: {{testNameOrId}}',
    'editor.refreshPreview': 'Refresh Preview',
    'editor.fullScreenPreview': 'Full Screen Preview',
    'editor.saveTest': 'Save Test',
    'editor.config.title': 'Configuration & Page Style',
    'editor.config.description': 'Basic settings, page style (HTML/CSS), and embed information.',
    'editor.config.testNameLabel': 'Test Name',
    'editor.config.testNamePlaceholder': 'e.g., General Knowledge',
    'editor.config.endMessageLabel': 'Quiz End Message',
    'editor.config.endMessagePlaceholder': 'e.g., Congrats! Score: {{score}}/{{total}}',
    'editor.config.endMessageHint': 'Use {{score}} and {{total}} as placeholders.',
    'editor.config.htmlLabel': 'Page HTML Structure',
    'editor.config.cssLabel': 'Page CSS Styles',
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
    'editor.questions.questionTypeLabel': 'Question Type',
    'editor.questions.questionTextLabel': 'Question Text',
    'editor.questions.questionTextPlaceholder': 'Enter question text',
    'editor.questions.optionsLabel': 'Options:',
    'editor.questions.markIncorrect': 'Mark as incorrect',
    'editor.questions.markCorrect': 'Mark as correct',
    'editor.questions.optionTextPlaceholder': 'Option text',
    'editor.questions.optionImageUrlPlaceholder': 'Image URL (optional)',
    'editor.questions.removeOption': 'Remove option',
    'editor.questions.addOption': 'Add Option',
    'editor.questions.matchingPairsLabel': 'Matching Pairs:',
    'editor.questions.addMatchPair': 'Add Pair',
    'editor.questions.matchPromptPlaceholder': 'Prompt Text',
    'editor.questions.matchTargetPlaceholder': 'Target Text',
    'editor.questions.removeMatchPair': 'Remove Pair',
    'editor.questions.dragItemsLabel': 'Draggable Items:',
    'editor.questions.addDragItem': 'Add Item',
    'editor.questions.dragItemPlaceholder': 'Draggable Item Text',
    'editor.questions.removeDragItem': 'Remove Item',
    'editor.questions.dropTargetsLabel': 'Drop Targets:',
    'editor.questions.addDropTarget': 'Add Target',
    'editor.questions.dropTargetPlaceholder': 'Drop Target Text (optional, for label)',
    'editor.questions.removeDropTarget': 'Remove Target',
    'editor.questions.configNotAvailable': 'Configuration for this question type is not yet fully available.',

    'editor.newQuestionText': 'New Question {{number}}',
    'editor.optionPlaceholder': 'Option {{letter}}',
    'editor.newOptionText': 'New Option {{number}}',
    'editor.toast.saveSuccessTitle': 'Test Data Logged',
    'editor.toast.saveSuccessDescription': 'Test configuration has been logged to the console.',
    'editor.toast.saveSuccessTitleExisting': 'Existing Test Data Logged',
    'editor.toast.saveSuccessDescriptionExisting': 'Test {{testId}} configuration logged to console.',
    'editor.toast.popupBlockedTitle': 'Popup Blocked',
    'editor.toast.popupBlockedDescription': 'Please allow popups for this site to use full screen preview.',
    'editor.toast.templateNotFoundTitle': 'Page Style Template Not Found',
    'editor.toast.templateNotFoundDescription': 'The page style template "{{templateId}}" was not found. Loaded default blank canvas.',
    'editor.toast.templateLoadErrorTitle': 'Template Load Error',
    'editor.toast.templateLoadErrorDescription': 'Could not load template "{{templateId}}". Starting with a blank canvas.',


    'pageTemplateEditor.new.pageTitle': 'New Page Template',
    'pageTemplateEditor.new.pageTitleFromSource': 'New Page Template (from {{sourceName}})',
    'pageTemplateEditor.edit.pageTitle': 'Edit Page Template: {{templateIdOrName}}',
    'pageTemplateEditor.updatePreview': 'Update Preview',
    'pageTemplateEditor.saveTemplate': 'Save Page Template',
    'pageTemplateEditor.details.title': 'Page Template Details & Design',
    'pageTemplateEditor.details.description': 'Define the HTML structure and CSS style of your reusable quiz page template. You can include <script> tags in the HTML for template-specific JavaScript.',
    'pageTemplateEditor.details.nameLabel': 'Page Template Name',
    'pageTemplateEditor.details.namePlaceholder': 'e.g., Modern MCQ Page Style',
    'pageTemplateEditor.details.loadedNamePlaceholder': 'Page Template {{templateId}}',
    'pageTemplateEditor.details.descriptionLabel': 'Description (Optional)',
    'pageTemplateEditor.details.descriptionPlaceholder': 'A brief description of what this page template is best for...',
    'pageTemplateEditor.details.htmlLabel': 'Page HTML Structure',
    'pageTemplateEditor.details.htmlPlaceholder': 'Enter page template HTML...\n<!-- Ensure it includes placeholders like <div id="quiz-content-host"> for questions -->',
    'pageTemplateEditor.details.cssLabel': 'Page CSS Styles',
    'pageTemplateEditor.details.cssPlaceholder': 'Enter page template CSS...\n/* Style your page template elements */\n/* Add your CSS animations here */',
    'pageTemplateEditor.preview.titlePane': 'Page Template Preview',
    'pageTemplateEditor.preview.descriptionPane': 'This is how your page template structure will look with sample content.',
    'pageTemplateEditor.preview.iframeTitle': 'Page Template Preview',
    'pageTemplateEditor.preview.sampleTitle': 'Sample Page Template Title',
    'pageTemplateEditor.preview.sampleQuestion': 'This is where question content would appear.',
    'pageTemplateEditor.preview.sampleOption1': 'Sample Option 1',
    'pageTemplateEditor.preview.sampleOption2': 'Sample Option 2',
    'pageTemplateEditor.toast.saveSuccessTitle': 'Page Template Saved (Mock)',
    'pageTemplateEditor.toast.saveSuccessDescription': 'Page Template "{{templateName}}" data logged to console.',
    'pageTemplateEditor.toast.loadErrorTitle': 'Load Error',
    'pageTemplateEditor.toast.loadErrorDescription': 'Could not load template "{{templateId}}". Loaded default blank canvas.',


    'pageTemplates.explore.pageTitle': 'Explore Templates',
    'pageTemplates.explore.createButton': 'Create New Template',
    'pageTemplates.explore.useThisTemplate': 'Use This Template',
    'pageTemplates.explore.preview': 'Edit Page Style',
    'pageTemplates.explore.duplicate': 'Duplicate',
    'pageTemplates.explore.noTemplates.title': 'No Page Templates Available Yet',
    'pageTemplates.explore.noTemplates.description': 'Be the first to create a stunning page template for QuizSmith!',
    'pageTemplates.explore.noTemplates.button': 'Create Your First Page Template',

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
    'adminPanel.storage.saveButton': 'Save Configuration',
    'adminPanel.toast.saveConfigTitle': 'Configuration Update',
    'adminPanel.toast.saveConfigDescription': 'This feature is not yet implemented. Backend development is required.',
    'adminPanel.toast.notImplementedTitle': 'Feature Not Implemented',
    'adminPanel.toast.notImplementedDescription': '{{featureName}} functionality is not yet available.',
    'adminPanel.logs.title': 'Application Logs',
    'adminPanel.logs.description': 'View system and application logs. (Placeholder UI)',
    'adminPanel.logs.placeholder': 'Log entries would appear here...\n[INFO] 2023-10-27 10:00:00 - Application started.\n[WARN] 2023-10-27 10:05:23 - User login attempt failed.\n...',
    'adminPanel.logs.refreshButton': 'Refresh Logs',
    'adminPanel.testVersionManagement.title': 'Test Version Management',
    'adminPanel.testVersionManagement.description': 'Review and revert tests to their previous saved states. (Placeholder UI)',
    'adminPanel.testVersionManagement.currentVersion': 'Version {{version}} (Current)',
    'adminPanel.testVersionManagement.previousVersion': 'Version {{version}}',
    'adminPanel.testVersionManagement.rollbackButton': 'Rollback to this Version',
    'adminPanel.testVersionManagement.testNameLabel': 'Test: {{testName}}',
    'adminPanel.testVersionManagement.savedDateLabel': 'Saved: {{date}}',


    'questionType.multiple-choice-text': 'Multiple Choice (Text)',
    'questionType.multiple-choice-image': 'Multiple Choice (Image)',
    'questionType.matching-text-text': 'Matching (Text-to-Text)',
    'questionType.drag-and-drop-text-text': 'Drag & Drop (Text-on-Text)',

    'quiz.feedback.correct': 'Correct!',
    'quiz.feedback.incorrect': 'Incorrect!',
    'quiz.endScreen.title': 'Quiz Complete!',
    'quiz.restartButton': 'Restart Quiz',
    'quiz.matching.selectPrompt': 'Select a match for:',
    'quiz.dragDrop.dropHere': 'Drop here',
    'quiz.questionType.notImplemented': 'This question type is not fully interactive in preview yet.',

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
    'dashboard.myPageTemplates.heading': 'Мои шаблоны страниц',
    'dashboard.myPageTemplates.create': 'Создать новый шаблон страницы',
    'dashboard.myPageTemplates.noPageTemplates.title': 'Шаблоны страниц еще не созданы',
    'dashboard.myPageTemplates.noPageTemplates.description': 'Создавайте многоразовые дизайны страниц для ваших викторин.',
    'dashboard.myPageTemplates.noPageTemplates.button': 'Создать первый шаблон страницы',
    'dashboard.editTest': 'Редактировать тест',
    'dashboard.editPageTemplate': 'Редактировать шаблон страницы',

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

    'myPageTemplates.pageTitle': 'Мои шаблоны',
    'myPageTemplates.create': 'Создать новый шаблон',
    'myPageTemplates.noPageTemplates.title': 'Вы еще не создали ни одного шаблона.',
    'myPageTemplates.noPageTemplates.description': 'Шаблоны страниц помогут вам быстрее создавать викторины с единым дизайном страниц.',
    'myPageTemplates.noPageTemplates.button': 'Создать свой первый шаблон',
    'myPageTemplates.edit': 'Редактировать шаблон',
    'myPageTemplates.usageCountLabel': 'Использовано',
    'myPageTemplates.timesLabel': 'раз',
    'myPageTemplates.lastModifiedLabel': 'Последнее изменение',

    'settings.pageTitle': 'Настройки',

    'editor.defaultTestName': 'Моя классная викторина',
    'editor.defaultTestNameExisting': 'Тест {{testId}}',
    'editor.defaultTestNameFromTemplate': 'Викторина из {{templateName}}',
    'editor.defaultEndMessage': 'Поздравляем! Результат: {{score}}/{{total}}.',
    'editor.quizTitlePlaceholder': 'Название викторины',
    'editor.pageTitleNew': 'Создать новый тест',
    'editor.pageTitleEditing': 'Редактирование: {{testNameOrId}}',
    'editor.pageTitleExisting': 'Редактирование теста: {{testNameOrId}}',
    'editor.refreshPreview': 'Обновить предпросмотр',
    'editor.fullScreenPreview': 'Полноэкранный предпросмотр',
    'editor.saveTest': 'Сохранить тест',
    'editor.config.title': 'Конфигурация и стиль страницы',
    'editor.config.description': 'Основные настройки, стиль страницы (HTML/CSS) и информация для встраивания.',
    'editor.config.testNameLabel': 'Название теста',
    'editor.config.testNamePlaceholder': 'например, Общие знания',
    'editor.config.endMessageLabel': 'Сообщение о завершении викторины',
    'editor.config.endMessagePlaceholder': 'например, Поздравляем! Результат: {{score}}/{{total}}',
    'editor.config.endMessageHint': 'Используйте {{score}} и {{total}} как плейсхолдеры.',
    'editor.config.htmlLabel': 'Структура HTML страницы',
    'editor.config.cssLabel': 'Стили CSS страницы',
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
    'editor.questions.questionTypeLabel': 'Тип вопроса',
    'editor.questions.questionTextLabel': 'Текст вопроса',
    'editor.questions.questionTextPlaceholder': 'Введите текст вопроса',
    'editor.questions.optionsLabel': 'Варианты:',
    'editor.questions.markIncorrect': 'Отметить как неверный',
    'editor.questions.markCorrect': 'Отметить как верный',
    'editor.questions.optionTextPlaceholder': 'Текст варианта',
    'editor.questions.optionImageUrlPlaceholder': 'URL изображения (необязательно)',
    'editor.questions.removeOption': 'Удалить вариант',
    'editor.questions.addOption': 'Добавить вариант',
    'editor.questions.matchingPairsLabel': 'Пары для сопоставления:',
    'editor.questions.addMatchPair': 'Добавить пару',
    'editor.questions.matchPromptPlaceholder': 'Текст подсказки',
    'editor.questions.matchTargetPlaceholder': 'Текст цели',
    'editor.questions.removeMatchPair': 'Удалить пару',
    'editor.questions.dragItemsLabel': 'Перетаскиваемые элементы:',
    'editor.questions.addDragItem': 'Добавить элемент',
    'editor.questions.dragItemPlaceholder': 'Текст перетаскиваемого элемента',
    'editor.questions.removeDragItem': 'Удалить элемент',
    'editor.questions.dropTargetsLabel': 'Цели для перетаскивания:',
    'editor.questions.addDropTarget': 'Добавить цель',
    'editor.questions.dropTargetPlaceholder': 'Текст цели для перетаскивания (необязательно, для метки)',
    'editor.questions.removeDropTarget': 'Удалить цель',
    'editor.questions.configNotAvailable': 'Конфигурация для этого типа вопроса пока недоступна.',

    'editor.newQuestionText': 'Новый вопрос {{number}}',
    'editor.optionPlaceholder': 'Вариант {{letter}}',
    'editor.newOptionText': 'Новый вариант {{number}}',
    'editor.toast.saveSuccessTitle': 'Данные теста записаны',
    'editor.toast.saveSuccessDescription': 'Конфигурация теста записана в консоль.',
    'editor.toast.saveSuccessTitleExisting': 'Данные существующего теста записаны',
    'editor.toast.saveSuccessDescriptionExisting': 'Конфигурация теста {{testId}} записана в консоль.',
    'editor.toast.popupBlockedTitle': 'Всплывающее окно заблокировано',
    'editor.toast.popupBlockedDescription': 'Пожалуйста, разрешите всплывающие окна для этого сайта, чтобы использовать полноэкранный предпросмотр.',
    'editor.toast.templateNotFoundTitle': 'Шаблон страницы не найден',
    'editor.toast.templateNotFoundDescription': 'Шаблон страницы "{{templateId}}" не найден. Загружен пустой шаблон по умолчанию.',
    'editor.toast.templateLoadErrorTitle': 'Ошибка загрузки шаблона',
    'editor.toast.templateLoadErrorDescription': 'Не удалось загрузить шаблон "{{templateId}}". Загружен пустой холст.',


    'pageTemplateEditor.new.pageTitle': 'Новый шаблон страницы',
    'pageTemplateEditor.new.pageTitleFromSource': 'Новый шаблон страницы (из {{sourceName}})',
    'pageTemplateEditor.edit.pageTitle': 'Редактировать шаблон страницы: {{templateIdOrName}}',
    'pageTemplateEditor.updatePreview': 'Обновить предпросмотр',
    'pageTemplateEditor.saveTemplate': 'Сохранить шаблон страницы',
    'pageTemplateEditor.details.title': 'Детали и дизайн шаблона страницы',
    'pageTemplateEditor.details.description': 'Определите структуру HTML и стиль CSS вашего многоразового шаблона страницы викторины. Вы можете включать теги &lt;script&gt; в HTML для специфичного JavaScript шаблона.',
    'pageTemplateEditor.details.nameLabel': 'Название шаблона страницы',
    'pageTemplateEditor.details.namePlaceholder': 'например, Современный стиль страницы MCQ',
    'pageTemplateEditor.details.loadedNamePlaceholder': 'Шаблон страницы {{templateId}}',
    'pageTemplateEditor.details.descriptionLabel': 'Описание (необязательно)',
    'pageTemplateEditor.details.descriptionPlaceholder': 'Краткое описание, для чего лучше всего подходит этот шаблон страницы...',
    'pageTemplateEditor.details.htmlLabel': 'Структура HTML страницы',
    'pageTemplateEditor.details.htmlPlaceholder': 'Введите HTML шаблона страницы...\n<!-- Убедитесь, что он содержит плейсхолдеры, такие как <div id="quiz-content-host"> для вопросов -->',
    'pageTemplateEditor.details.cssLabel': 'Стили CSS страницы',
    'pageTemplateEditor.details.cssPlaceholder': 'Введите CSS шаблона страницы...\n/* Стилизуйте элементы вашего шаблона страницы */\n/* Добавьте сюда свои CSS анимации */',
    'pageTemplateEditor.preview.titlePane': 'Предпросмотр шаблона страницы',
    'pageTemplateEditor.preview.descriptionPane': 'Так будет выглядеть структура вашего шаблона страницы с образцом содержимого.',
    'pageTemplateEditor.preview.iframeTitle': 'Предпросмотр шаблона страницы',
    'pageTemplateEditor.preview.sampleTitle': 'Пример названия шаблона страницы',
    'pageTemplateEditor.preview.sampleQuestion': 'Здесь будет отображаться содержимое вопроса.',
    'pageTemplateEditor.preview.sampleOption1': 'Вариант А',
    'pageTemplateEditor.preview.sampleOption2': 'Вариант Б',
    'pageTemplateEditor.toast.saveSuccessTitle': 'Шаблон страницы сохранен (имитация)',
    'pageTemplateEditor.toast.saveSuccessDescription': 'Данные шаблона страницы "{{templateName}}" записаны в консоль.',
    'pageTemplateEditor.toast.loadErrorTitle': 'Ошибка загрузки',
    'pageTemplateEditor.toast.loadErrorDescription': 'Не удалось загрузить шаблон "{{templateId}}". Загружен пустой шаблон по умолчанию.',

    'pageTemplates.explore.pageTitle': 'Обзор шаблонов',
    'pageTemplates.explore.createButton': 'Создать новый шаблон',
    'pageTemplates.explore.useThisTemplate': 'Использовать этот шаблон',
    'pageTemplates.explore.preview': 'Редактировать стиль страницы',
    'pageTemplates.explore.duplicate': 'Дублировать',
    'pageTemplates.explore.noTemplates.title': 'Доступных шаблонов страниц пока нет',
    'pageTemplates.explore.noTemplates.description': 'Станьте первым, кто создаст потрясающий шаблон страницы для QuizSmith!',
    'pageTemplates.explore.noTemplates.button': 'Создать свой первый шаблон страницы',

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
    'adminPanel.storage.saveButton': 'Сохранить конфигурацию',
    'adminPanel.toast.saveConfigTitle': 'Обновление конфигурации',
    'adminPanel.toast.saveConfigDescription': 'Эта функция еще не реализована. Требуется разработка бэкенда.',
    'adminPanel.toast.notImplementedTitle': 'Функция не реализована',
    'adminPanel.toast.notImplementedDescription': 'Функциональность "{{featureName}}" еще не доступна.',
    'adminPanel.logs.title': 'Логи приложения',
    'adminPanel.logs.description': 'Просмотр системных и прикладных логов. (Заглушка интерфейса)',
    'adminPanel.logs.placeholder': 'Записи логов будут отображаться здесь...\n[ИНФО] 2023-10-27 10:00:00 - Приложение запущено.\n[ПРЕДУПР.] 2023-10-27 10:05:23 - Неудачная попытка входа пользователя.\n...',
    'adminPanel.logs.refreshButton': 'Обновить логи',
    'adminPanel.testVersionManagement.title': 'Управление версиями тестов',
    'adminPanel.testVersionManagement.description': 'Просмотр и откат тестов к предыдущим сохраненным состояниям. (Заглушка интерфейса)',
    'adminPanel.testVersionManagement.currentVersion': 'Версия {{version}} (Текущая)',
    'adminPanel.testVersionManagement.previousVersion': 'Версия {{version}}',
    'adminPanel.testVersionManagement.rollbackButton': 'Откатить к этой версии',
    'adminPanel.testVersionManagement.testNameLabel': 'Тест: {{testName}}',
    'adminPanel.testVersionManagement.savedDateLabel': 'Сохранено: {{date}}',

    'questionType.multiple-choice-text': 'Один из многих (Текст)',
    'questionType.multiple-choice-image': 'Один из многих (Изображение)',
    'questionType.matching-text-text': 'Сопоставление (Текст-Текст)',
    'questionType.drag-and-drop-text-text': 'Перетаскивание (Текст-на-Текст)',

    'quiz.feedback.correct': 'Верно!',
    'quiz.feedback.incorrect': 'Неверно!',
    'quiz.endScreen.title': 'Викторина завершена!',
    'quiz.restartButton': 'Начать заново',
    'quiz.matching.selectPrompt': 'Выберите пару для:',
    'quiz.dragDrop.dropHere': 'Перетащите сюда',
    'quiz.questionType.notImplemented': 'Этот тип вопроса еще не полностью интерактивен в предпросмотре.',

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
               new RegExp(`{{\\s*${placeholder}\\s*}}`, 'g'), // Added \\s* to allow for spaces around placeholder
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

