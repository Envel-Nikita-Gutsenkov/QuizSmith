
'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Save, Eye, PlusCircle, Settings2, HelpCircle, Trash2, CheckCircle, Circle, Code, MessageSquareText, ExternalLink, Image as ImageIcon, CloudOff, Palette, CheckSquare, Square } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import type { Question, QuestionOption, MatchPair, DraggableItem, DropTarget, QuestionType, PageTemplate as PageTemplateType, Test, CategoryBin, ConnectPair } from '@/lib/types';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/contexts/LanguageContext';
import { pageTemplates, DEFAULT_TEMPLATE_ID } from '@/lib/mockPageTemplates';
import { useSearchParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import Link from 'next/link';
import { Checkbox } from '@/components/ui/checkbox';


const generateId = () => Math.random().toString(36).substr(2, 9);

interface TestDraft {
  name: string;
  questions: Question[];
  templateId: string; 
  quizEndMessage: string;
}

const NO_EXPECTED_DRAG_ITEM = "__NONE__"; // For drag-and-drop-text-text
const NO_CATEGORY_ASSIGNED = "__NO_CATEGORY__"; // For categorization D&D

function NewTestEditorPageContent() {
  const { t } = useLanguage();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { toast } = useToast();

  const [testName, setTestName] = useState('');
  const [questions, setQuestions] = useState<Question[]>([]);
  
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>(DEFAULT_TEMPLATE_ID);
  const [currentTemplate, setCurrentTemplate] = useState<PageTemplateType | null>(null);

  const [quizEndMessage, setQuizEndMessage] = useState('');
  const [previewContent, setPreviewContent] = useState('');

  const [hasUnsavedDraft, setHasUnsavedDraft] = useState(false);
  const localStorageKey = 'quizsmith-test-draft-new';
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [debounceTimer, setDebounceTimer] = useState<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const template = pageTemplates.find(pt => pt.id === selectedTemplateId);
    const effectiveTemplate = template || pageTemplates.find(pt => pt.id === DEFAULT_TEMPLATE_ID)!;
    setCurrentTemplate(effectiveTemplate);
  }, [selectedTemplateId]);

  useEffect(() => {
    if (!isInitialLoad) return;

    const savedDraft = localStorage.getItem(localStorageKey);
    if (savedDraft) {
      try {
        const draft: TestDraft = JSON.parse(savedDraft);
        setTestName(draft.name);
        setQuestions(draft.questions);
        setSelectedTemplateId(draft.templateId || DEFAULT_TEMPLATE_ID); 
        setQuizEndMessage(draft.quizEndMessage);
        setHasUnsavedDraft(true);
        toast({ title: t('editor.toast.draftRestoredTitle'), description: t('editor.toast.draftRestoredDescriptionNew') });
        setIsInitialLoad(false); 
        return;
      } catch (e) {
        console.error("Failed to parse test draft from localStorage", e);
        localStorage.removeItem(localStorageKey); 
      }
    }

    const initialTemplateIdFromUrl = searchParams.get('template') || DEFAULT_TEMPLATE_ID;
    setSelectedTemplateId(initialTemplateIdFromUrl); 

    const selectedInitialTemplateForName = pageTemplates.find(pt => pt.id === initialTemplateIdFromUrl) || pageTemplates.find(pt => pt.id === DEFAULT_TEMPLATE_ID)!;
    
    const defaultTestNameFromTemplateBase = "Quiz from " + selectedInitialTemplateForName.name;
    if (initialTemplateIdFromUrl && initialTemplateIdFromUrl !== DEFAULT_TEMPLATE_ID && selectedInitialTemplateForName) {
      setTestName(t('editor.defaultTestNameFromTemplate', {templateName: selectedInitialTemplateForName.name, defaultValue: defaultTestNameFromTemplateBase}));
    } else {
      setTestName(t('editor.defaultTestName', { defaultValue: "My Awesome Quiz"}));
    }
    
    const templateIdQueryParam = searchParams.get('template');
    if (templateIdQueryParam && !pageTemplates.find(pt => pt.id === templateIdQueryParam)) {
        const descriptionDefaultValue = "The page style template \"" + templateIdQueryParam + "\" was not found. Loaded default blank canvas.";
        toast({
            title: t('editor.toast.templateNotFoundTitle'),
            description: t('editor.toast.templateNotFoundDescription', {templateId: templateIdQueryParam, defaultValue: descriptionDefaultValue}),
            variant: "destructive",
        });
    }
    setQuizEndMessage(t('editor.defaultEndMessage', {defaultValue: "Congratulations! Score: {{score}}/{{total}}."}));
    setQuestions([]); 
    setIsInitialLoad(false); 
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Removed isInitialLoad, searchParams, t, toast, localStorageKey. Should only run once.

  useEffect(() => {
    if (isInitialLoad) return; 

    if (debounceTimer) clearTimeout(debounceTimer);

    const timer = setTimeout(() => {
      const draft: TestDraft = {
        name: testName,
        questions,
        templateId: selectedTemplateId, 
        quizEndMessage
      };
      localStorage.setItem(localStorageKey, JSON.stringify(draft));
      setHasUnsavedDraft(true);
    }, 1000);
    setDebounceTimer(timer);
    
    return () => {
      if (timer) clearTimeout(timer);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [testName, questions, selectedTemplateId, quizEndMessage, isInitialLoad]);


  const updatePreview = useCallback(() => {
    if (!currentTemplate) {
        setPreviewContent("<html><body><p>No Page Style Template selected or template not found.</p></body></html>");
        return;
    }

    const questionsJson = JSON.stringify(questions).replace(/<\//g, '<\\u002F');
    const injectedDataHtml = `
      <script id="quiz-data" type="application/json">${questionsJson}</script>
      <div id="quiz-name-data" style="display:none;">${testName || ''}</div>
      <div id="quiz-end-message-data" style="display:none;">${quizEndMessage}</div>
    `;
    
    const bodyContentWithInjectedData = `
      ${currentTemplate.htmlContent}
      ${injectedDataHtml}
    `;
    
    let stylingVariables = '';
     if (typeof window !== 'undefined') { 
        const rootStyle = getComputedStyle(document.documentElement);
        stylingVariables = `
          :root {
            --background: ${rootStyle.getPropertyValue('--background').trim()};
            --foreground: ${rootStyle.getPropertyValue('--foreground').trim()};
            --card: ${rootStyle.getPropertyValue('--card').trim()};
            --card-foreground: ${rootStyle.getPropertyValue('--card-foreground').trim()};
            --primary: ${rootStyle.getPropertyValue('--primary').trim()};
            --primary-foreground: ${rootStyle.getPropertyValue('--primary-foreground').trim()};
            --secondary: ${rootStyle.getPropertyValue('--secondary').trim()};
            --accent: ${rootStyle.getPropertyValue('--accent').trim()};
            --accent-foreground: ${rootStyle.getPropertyValue('--accent-foreground').trim()};
            --destructive: ${rootStyle.getPropertyValue('--destructive').trim()};
            --destructive-foreground: ${rootStyle.getPropertyValue('--destructive-foreground').trim()};
            --border: ${rootStyle.getPropertyValue('--border').trim()};
            --font-geist-sans: ${rootStyle.getPropertyValue('--font-geist-sans').trim() || 'Arial, sans-serif'};
            --success-bg: ${rootStyle.getPropertyValue('--success-bg').trim()};
            --success-fg: ${rootStyle.getPropertyValue('--success-fg').trim()};
            --success-border: ${rootStyle.getPropertyValue('--success-border').trim()};
          }
        `;
     }
    
    setPreviewContent(`<html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><script src="https://cdn.tailwindcss.com"></script><style>${stylingVariables}${currentTemplate.cssContent}</style></head><body>${bodyContentWithInjectedData}</body></html>`);
  }, [currentTemplate, testName, questions, quizEndMessage]);

  useEffect(() => {
    if (!isInitialLoad && currentTemplate) {
      updatePreview();
    }
  }, [updatePreview, isInitialLoad, currentTemplate]);
  

  const handleAddQuestion = () => {
    const newQuestionTextDefaultValue = "New Question " + (questions.length + 1);
    const optionADefaultValue = "Option A";
    const optionBDefaultValue = "Option B";

    const newQuestion: Question = {
      id: generateId(),
      type: 'multiple-choice-text',
      text: t('editor.newQuestionText', {number: questions.length + 1, defaultValue: newQuestionTextDefaultValue}),
      allowMultipleAnswers: false,
      options: [
        { id: generateId(), text: t('editor.optionPlaceholder', {letter: 'A', defaultValue: optionADefaultValue}), isCorrect: false },
        { id: generateId(), text: t('editor.optionPlaceholder', {letter: 'B', defaultValue: optionBDefaultValue}), isCorrect: false },
      ],
      matchPairs: [],
      dragItems: [],
      dropTargets: [],
      categories: [],
      connectPairs: [],
    };
    setQuestions((prevQuestions) => [...prevQuestions, newQuestion]);
  };

  const handleUpdateQuestion = (questionId: string, field: keyof Question, value: any) => {
    setQuestions(prev => prev.map(q => q.id === questionId ? { ...q, [field]: value } : q));
  };
  
  const handleToggleAllowMultipleAnswers = (questionId: string, checked: boolean) => {
    setQuestions(prev => prev.map(q => {
      if (q.id === questionId) {
        const updatedQuestion = { ...q, allowMultipleAnswers: checked };
        // If switching from multiple to single, ensure only one option is correct
        if (!checked && q.options.filter(opt => opt.isCorrect).length > 1) {
          let firstCorrectFound = false;
          updatedQuestion.options = q.options.map(opt => {
            if (opt.isCorrect) {
              if (!firstCorrectFound) {
                firstCorrectFound = true;
                return opt;
              }
              return { ...opt, isCorrect: false };
            }
            return opt;
          });
        }
        return updatedQuestion;
      }
      return q;
    }));
  };


  const handleUpdateOption = (questionId: string, optionId: string, field: keyof QuestionOption, value: any) => {
    setQuestions(prev => prev.map(q => q.id === questionId ? {
      ...q, options: q.options.map(opt => opt.id === optionId ? { ...opt, [field]: value } : opt)
    } : q));
  };

  const handleSetCorrectOption = (questionId: string, optionIdToToggle: string) => {
    setQuestions(prev => prev.map(q => {
      if (q.id === questionId) {
        if (q.allowMultipleAnswers) {
          // Toggle correctness for this option
          return {
            ...q,
            options: q.options.map(opt =>
              opt.id === optionIdToToggle ? { ...opt, isCorrect: !opt.isCorrect } : opt
            ),
          };
        } else {
          // Only one can be correct
          return {
            ...q,
            options: q.options.map(opt => ({
              ...opt,
              isCorrect: opt.id === optionIdToToggle, // Set this one true, all others false
            })),
          };
        }
      }
      return q;
    }));
  };
  
  const handleAddOption = (questionId: string) => {
    const currentQuestion = questions.find(q => q.id === questionId);
    const newOptionNumber = (currentQuestion?.options.length || 0) + 1;
    const newOptionTextDefaultValue = "New Option " + newOptionNumber;
    setQuestions(prev => prev.map(q => q.id === questionId ? {
      ...q, options: [...q.options, { id: generateId(), text: t('editor.newOptionText', {number: newOptionNumber, defaultValue: newOptionTextDefaultValue}), isCorrect: false, imageUrl: '' }]
    } : q));
  };

  const handleRemoveOption = (questionId: string, optionId: string) => {
    setQuestions(prev => prev.map(q => q.id === questionId && q.options.length > 1 ? {
      ...q, options: q.options.filter(opt => opt.id !== optionId)
    } : q));
  };

  const handleAddMatchPair = (questionId: string) => {
    setQuestions(prev => prev.map(q => q.id === questionId ? {
      ...q, matchPairs: [...(q.matchPairs || []), { id: generateId(), prompt: '', target: '' }]
    } : q));
  };
  const handleUpdateMatchPair = (questionId: string, pairId: string, field: keyof MatchPair, value: string) => {
    setQuestions(prev => prev.map(q => q.id === questionId ? {
      ...q, matchPairs: (q.matchPairs || []).map(p => p.id === pairId ? { ...p, [field]: value } : p)
    } : q));
  };
  const handleRemoveMatchPair = (questionId: string, pairId: string) => {
    setQuestions(prev => prev.map(q => q.id === questionId ? {
      ...q, matchPairs: (q.matchPairs || []).filter(p => p.id !== pairId)
    } : q));
  };

  const handleAddDragItem = (questionId: string) => {
    setQuestions(prev => prev.map(q => q.id === questionId ? {
      ...q, dragItems: [...(q.dragItems || []), { id: generateId(), text: ''}]
    } : q));
  };
  const handleUpdateDragItem = (questionId: string, itemId: string, field: keyof DraggableItem, value: string) => {
     setQuestions(prev => prev.map(q => q.id === questionId ? {
      ...q, dragItems: (q.dragItems || []).map(item => item.id === itemId ? { ...item, [field]: value } : item)
    } : q));
  };
  const handleRemoveDragItem = (questionId: string, itemId: string) => {
     setQuestions(prev => prev.map(q => q.id === questionId ? {
      ...q, dragItems: (q.dragItems || []).filter(item => item.id !== itemId)
    } : q));
  };
  
  const handleAddDropTarget = (questionId: string) => {
     setQuestions(prev => prev.map(q => q.id === questionId ? {
      ...q, dropTargets: [...(q.dropTargets || []), { id: generateId(), text: '', expectedDragItemId: ''}]
    } : q));
  };
  const handleUpdateDropTarget = (questionId: string, targetId: string, field: keyof DropTarget, value: string) => {
    setQuestions(prev => prev.map(q => q.id === questionId ? {
      ...q, dropTargets: (q.dropTargets || []).map(target => target.id === targetId ? { ...target, [field]: value } : target)
    } : q));
  };
  const handleRemoveDropTarget = (questionId: string, targetId: string) => {
     setQuestions(prev => prev.map(q => q.id === questionId ? {
      ...q, dropTargets: (q.dropTargets || []).filter(target => target.id !== targetId)
    } : q));
  };

  // --- Categorization D&D handlers ---
  const handleAddCategory = (questionId: string) => {
    setQuestions(prev => prev.map(q => q.id === questionId ? {
      ...q, categories: [...(q.categories || []), { id: generateId(), name: '' }]
    } : q));
  };
  const handleUpdateCategory = (questionId: string, categoryId: string, name: string) => {
    setQuestions(prev => prev.map(q => q.id === questionId ? {
      ...q, categories: (q.categories || []).map(cat => cat.id === categoryId ? { ...cat, name } : cat)
    } : q));
  };
  const handleRemoveCategory = (questionId: string, categoryId: string) => {
    setQuestions(prev => prev.map(q => q.id === questionId ? {
      ...q, 
      categories: (q.categories || []).filter(cat => cat.id !== categoryId),
      // Also clear this categoryId from any drag items that might have used it
      dragItems: (q.dragItems || []).map(item => item.correctCategoryId === categoryId ? {...item, correctCategoryId: undefined} : item)
    } : q));
  };

  // --- Connect Points Matching handlers ---
  const handleAddConnectPair = (questionId: string) => {
    setQuestions(prev => prev.map(q => q.id === questionId ? {
      ...q, connectPairs: [...(q.connectPairs || []), { id: generateId(), leftItem: '', rightItem: '' }]
    } : q));
  };
  const handleUpdateConnectPair = (questionId: string, pairId: string, field: keyof ConnectPair, value: string) => {
    setQuestions(prev => prev.map(q => q.id === questionId ? {
      ...q, connectPairs: (q.connectPairs || []).map(p => p.id === pairId ? { ...p, [field]: value } : p)
    } : q));
  };
  const handleRemoveConnectPair = (questionId: string, pairId: string) => {
    setQuestions(prev => prev.map(q => q.id === questionId ? {
      ...q, connectPairs: (q.connectPairs || []).filter(p => p.id !== pairId)
    } : q));
  };

  const handleDeleteQuestion = (questionId: string) => setQuestions((prev) => prev.filter((q) => q.id !== questionId));

  const handleSaveTest = () => {
    if (!currentTemplate) {
        toast({title: t('editor.toast.templateNotSelectedErrorTitle'), description: t('editor.toast.templateNotSelectedErrorDescription'), variant: "destructive"});
        return;
    }
    const newTestId = 'new-' + generateId(); 
    const testData: Test = { 
        id: newTestId, 
        name: testName, 
        questions, 
        templateId: selectedTemplateId, 
        quizEndMessage, 
        createdAt: new Date().toISOString(), 
        updatedAt: new Date().toISOString() 
    };
    console.log("Saving test data (new):", JSON.stringify(testData, null, 2));
    toast({ title: t('editor.toast.saveSuccessTitle'), description: t('editor.toast.saveSuccessDescription') });
    localStorage.removeItem(localStorageKey);
    setHasUnsavedDraft(false);
    router.push(`/editor/${newTestId}`); 
  };
  
  const handleFullScreenPreview = () => {
    if (previewContent) {
      const blob = new Blob([previewContent], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      const newWindow = window.open(url);
      if (!newWindow) {
        toast({
          title: t('editor.toast.popupBlockedTitle'),
          description: t('editor.toast.popupBlockedDescription'),
          variant: "destructive",
        });
      }
      setTimeout(() => URL.revokeObjectURL(url), 100); 
    }
  };

  const questionTypes: {value: QuestionType; labelKey: string}[] = [
    { value: 'multiple-choice-text', labelKey: 'questionType.multiple-choice-text'},
    { value: 'multiple-choice-image', labelKey: 'questionType.multiple-choice-image'},
    { value: 'matching-text-text', labelKey: 'questionType.matching-text-text'},
    { value: 'drag-and-drop-text-text', labelKey: 'questionType.drag-and-drop-text-text'},
    { value: 'categorization-drag-and-drop', labelKey: 'questionType.categorization-drag-and-drop'},
    { value: 'connect-points-matching', labelKey: 'questionType.connect-points-matching'},
  ];

  const defaultTestNameFromTemplateBase = t('editor.defaultTestNameFromTemplate', {templateName: ''});
  const defaultTestNameFromTemplatePlaceholderIndex = defaultTestNameFromTemplateBase.indexOf('{{templateName}}');
  const defaultTestNameFromTemplatePrefix = defaultTestNameFromTemplatePlaceholderIndex !== -1 ? defaultTestNameFromTemplateBase.substring(0, defaultTestNameFromTemplatePlaceholderIndex) : defaultTestNameFromTemplateBase;
  
  const isEditing = questions.length > 0 ||
                    (testName &&
                     testName !== t('editor.defaultTestName', { defaultValue: "My Awesome Quiz"}) &&
                     (defaultTestNameFromTemplatePlaceholderIndex === -1 || !testName.startsWith(defaultTestNameFromTemplatePrefix)) &&
                     (currentTemplate?.name && testName !== ("Quiz from " + currentTemplate.name))
                    );

  const pageTitleKeyToUse = isEditing ? "editor.pageTitleEditing" : "editor.pageTitleNew";

  return (
    <AppLayout
      currentPageTitleKey={pageTitleKeyToUse}
      currentPageTitleParams={{ testNameOrId: testName }}
    >
      <div className="flex flex-col h-full">
        <header className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-semibold truncate pr-4">
             {t(pageTitleKeyToUse, { testNameOrId: testName || '...' })}
          </h1>
          <div className="space-x-2 flex-shrink-0 flex items-center">
            {hasUnsavedDraft && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <CloudOff className="h-5 w-5 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{t('editor.unsavedDraftTooltip')}</p>
                  </TooltipContent>
                </Tooltip>
            )}
            <Button variant="outline" onClick={updatePreview}><Eye className="mr-2 h-4 w-4" /> {t('editor.refreshPreview')}</Button>
            <Button variant="outline" onClick={handleFullScreenPreview}><ExternalLink className="mr-2 h-4 w-4" /> {t('editor.fullScreenPreview')}</Button>
            <Button onClick={handleSaveTest}><Save className="mr-2 h-4 w-4" /> {t('editor.saveTest')}</Button>
          </div>
        </header>

        <div className="grid md:grid-cols-3 gap-6 flex-1 min-h-0">
          {/* Configuration Pane */}
          <Card className="md:col-span-1 flex flex-col shadow-lg">
             <CardHeader>
                <CardTitle className="flex items-center"><Settings2 className="mr-2 h-5 w-5 text-primary" />{t('editor.config.title')}</CardTitle>
                <CardDescription>{t('editor.config.description')}</CardDescription>
              </CardHeader>
            <ScrollArea className="flex-grow">
              <CardContent className="space-y-6 p-4">
                <div>
                  <Label htmlFor="testName" className="text-sm font-medium">{t('editor.config.testNameLabel')}</Label>
                  <Input id="testName" placeholder={t('editor.config.testNamePlaceholder')} value={testName} onChange={(e) => setTestName(e.target.value)} className="mt-1" />
                </div>
                <Separator />
                <div>
                  <Label htmlFor="pageTemplateSelect" className="text-sm font-medium">{t('editor.config.templateLabel')}</Label>
                  <Select value={selectedTemplateId} onValueChange={setSelectedTemplateId}>
                    <SelectTrigger id="pageTemplateSelect" className="mt-1">
                      <SelectValue placeholder={t('editor.config.selectTemplatePlaceholder')} />
                    </SelectTrigger>
                    <SelectContent>
                      {pageTemplates.map(template => (
                        <SelectItem key={template.id} value={template.id}>{template.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {currentTemplate && (
                     <p className="text-xs text-muted-foreground mt-1">
                       {t('editor.config.templateDescriptionHint', {description: currentTemplate.description || 'No description.'})}
                       <Link href={`/templates/editor/${currentTemplate.id}`} className="ml-1 text-primary hover:underline text-xs">
                         ({t('editor.config.editTemplateLink')})
                       </Link>
                     </p>
                  )}
                </div>
                 <Separator />
                 <div>
                  <Label htmlFor="quizEndMessage" className="text-sm font-medium flex items-center"><MessageSquareText className="mr-2 h-4 w-4" /> {t('editor.config.endMessageLabel')}</Label>
                  <Textarea id="quizEndMessage" placeholder={t('editor.config.endMessagePlaceholder')} value={quizEndMessage} onChange={(e) => setQuizEndMessage(e.target.value)} className="mt-1" rows={3} />
                   <p className="text-xs text-muted-foreground mt-1">{t('editor.config.endMessageHint')}</p>
                </div>
                <Separator />
                 <Card>
                  <CardHeader><CardTitle className="text-base flex items-center"><Code className="mr-2 h-4 w-4" /> {t('editor.config.embedTitle')}</CardTitle></CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">{t('editor.config.embedDescription')}</p>
                    <Textarea readOnly value="<iframe src='...' width='100%' height='600px' frameborder='0'></iframe>" className="mt-2 font-mono text-xs bg-muted/50 cursor-not-allowed" rows={3} />
                  </CardContent>
                </Card>
              </CardContent>
            </ScrollArea>
          </Card>

          {/* Preview Pane */}
          <Card className="md:col-span-1 flex flex-col overflow-hidden shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center"><Eye className="mr-2 h-5 w-5 text-primary" />{t('editor.preview.title')}</CardTitle>
            </CardHeader>
            <CardContent className="flex-grow p-0 m-0">
              <iframe srcDoc={previewContent} title={t('editor.preview.iframeTitle')} className="w-full h-full border-0" sandbox="allow-scripts allow-same-origin allow-popups" />
            </CardContent>
          </Card>

          {/* Questions Data Pane */}
          <Card className="md:col-span-1 flex flex-col shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between">
              <div className="space-y-1.5">
                <CardTitle className="flex items-center"><HelpCircle className="mr-2 h-5 w-5 text-primary" />{t('editor.questions.title')}</CardTitle>
                <CardDescription>{t('editor.questions.description')}</CardDescription>
              </div>
              <Button onClick={handleAddQuestion} size="sm"><PlusCircle className="mr-2 h-4 w-4" /> {t('editor.questions.addQuestion')}</Button>
            </CardHeader>
            <ScrollArea className="flex-grow">
              <CardContent className="space-y-4 p-4">
                {questions.length === 0 ? (
                  <div className="text-center text-muted-foreground py-10">
                    <p>{t('editor.questions.noQuestions')}</p>
                    <Button variant="outline" className="mt-4" onClick={handleAddQuestion}><PlusCircle className="mr-2 h-4 w-4" /> {t('editor.questions.addFirstQuestion')}</Button>
                  </div>
                ) : (
                  questions.map((question, qIndex) => (
                    <Card key={question.id} className="shadow-md bg-card/50">
                      <CardHeader>
                        <div className="flex justify-between items-start">
                           <div className="flex-grow space-y-2">
                            <CardTitle className="text-lg">{t('editor.questions.questionLabel', {number: qIndex+1, defaultValue: "Question " + (qIndex + 1)})}</CardTitle>
                            <div>
                              <Label htmlFor={`q-type-${question.id}`}>{t('editor.questions.questionTypeLabel')}</Label>
                              <Select
                                  value={question.type}
                                  onValueChange={(value) => handleUpdateQuestion(question.id, 'type', value as QuestionType)}
                              >
                                  <SelectTrigger id={`q-type-${question.id}`} className="mt-1">
                                  <SelectValue placeholder={t('editor.questions.questionTypeLabel')} />
                                  </SelectTrigger>
                                  <SelectContent>
                                  {questionTypes.map(qt => (
                                      <SelectItem key={qt.value} value={qt.value}>{t(qt.labelKey)}</SelectItem>
                                  ))}
                                  </SelectContent>
                              </Select>
                            </div>
                          </div>
                          <Button variant="ghost" size="icon" onClick={() => handleDeleteQuestion(question.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div>
                          <Label htmlFor={`q-text-${question.id}`}>{t('editor.questions.questionTextLabel')}</Label>
                          <Textarea id={`q-text-${question.id}`} value={question.text} onChange={(e) => handleUpdateQuestion(question.id, 'text', e.target.value)} placeholder={t('editor.questions.questionTextPlaceholder')} className="mt-1" rows={2}/>
                        </div>
                        
                        {(question.type === 'multiple-choice-text' || question.type === 'multiple-choice-image') && (
                          <>
                            <div className="flex items-center space-x-2 mt-2">
                              <Checkbox 
                                id={`q-multi-answer-${question.id}`} 
                                checked={question.allowMultipleAnswers || false}
                                onCheckedChange={(checked) => handleToggleAllowMultipleAnswers(question.id, !!checked)}
                              />
                              <Label htmlFor={`q-multi-answer-${question.id}`} className="text-sm font-normal">
                                {t('editor.questions.allowMultipleAnswersLabel')}
                              </Label>
                            </div>
                            <p className="text-sm font-medium mt-2">{t('editor.questions.optionsLabel')}</p>
                            {question.options.map((option) => (
                              <div key={option.id} className="flex items-center space-x-2 p-2 border rounded-md">
                                <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-primary" onClick={() => handleSetCorrectOption(question.id, option.id)} title={option.isCorrect ? t('editor.questions.markIncorrect') : t('editor.questions.markCorrect')}>
                                  {option.isCorrect ? <CheckSquare className="h-5 w-5 text-primary" /> : <Square className="h-5 w-5" />}
                                </Button>
                                <div className="flex-grow space-y-1">
                                  <Input value={option.text} onChange={(e) => handleUpdateOption(question.id, option.id, 'text', e.target.value)} placeholder={t('editor.questions.optionTextPlaceholder')} />
                                  {question.type === 'multiple-choice-image' && (
                                    <>
                                    <Input value={option.imageUrl || ''} onChange={(e) => handleUpdateOption(question.id, option.id, 'imageUrl', e.target.value)} placeholder={t('editor.questions.optionImageUrlPlaceholder')} />
                                     {option.imageUrl && <Image src={option.imageUrl} alt={option.text || 'Option image'} width={48} height={48} className="rounded-sm object-contain mt-1 border" data-ai-hint="quiz option"/>}
                                    </>
                                  )}
                                </div>
                                <Button variant="ghost" size="icon" onClick={() => handleRemoveOption(question.id, option.id)} disabled={question.options.length <= 1} title={t('editor.questions.removeOption')}>
                                  <Trash2 className="h-4 w-4 text-destructive/70 hover:text-destructive" />
                                </Button>
                              </div>
                            ))}
                            <Button variant="outline" size="sm" onClick={() => handleAddOption(question.id)}><PlusCircle className="mr-2 h-4 w-4" /> {t('editor.questions.addOption')}</Button>
                          </>
                        )}
                        {question.type === 'matching-text-text' && (
                            <>
                                <p className="text-sm font-medium">{t('editor.questions.matchingPairsLabel')}</p>
                                {(question.matchPairs || []).map(pair => (
                                    <div key={pair.id} className="grid grid-cols-[1fr_1fr_auto] gap-2 items-center p-2 border rounded-md">
                                        <Input value={pair.prompt} onChange={(e) => handleUpdateMatchPair(question.id, pair.id, 'prompt', e.target.value)} placeholder={t('editor.questions.matchPromptPlaceholder')}/>
                                        <Input value={pair.target} onChange={(e) => handleUpdateMatchPair(question.id, pair.id, 'target', e.target.value)} placeholder={t('editor.questions.matchTargetPlaceholder')}/>
                                        <Button variant="ghost" size="icon" onClick={() => handleRemoveMatchPair(question.id, pair.id)} title={t('editor.questions.removeMatchPair')}>
                                            <Trash2 className="h-4 w-4 text-destructive/70 hover:text-destructive" />
                                        </Button>
                                    </div>
                                ))}
                                <Button variant="outline" size="sm" onClick={() => handleAddMatchPair(question.id)}><PlusCircle className="mr-2 h-4 w-4" /> {t('editor.questions.addMatchPair')}</Button>
                            </>
                        )}
                        {question.type === 'drag-and-drop-text-text' && (
                            <>
                                <p className="text-sm font-medium">{t('editor.questions.dragItemsLabel')}</p>
                                {(question.dragItems || []).map(item => (
                                    <div key={item.id} className="flex items-center space-x-2 p-2 border rounded-md">
                                        <Input value={item.text} onChange={(e) => handleUpdateDragItem(question.id, item.id, 'text', e.target.value)} placeholder={t('editor.questions.dragItemPlaceholder')} className="flex-grow"/>
                                        <Button variant="ghost" size="icon" onClick={() => handleRemoveDragItem(question.id, item.id)} title={t('editor.questions.removeDragItem')}>
                                            <Trash2 className="h-4 w-4 text-destructive/70 hover:text-destructive" />
                                        </Button>
                                    </div>
                                ))}
                                <Button variant="outline" size="sm" onClick={() => handleAddDragItem(question.id)} className="mb-2"><PlusCircle className="mr-2 h-4 w-4" /> {t('editor.questions.addDragItem')}</Button>

                                <p className="text-sm font-medium">{t('editor.questions.dropTargetsLabel')}</p>
                                 {(question.dropTargets || []).map(target => (
                                    <div key={target.id} className="grid grid-cols-[1fr_auto] gap-2 items-center p-2 border rounded-md">
                                      <div className="space-y-1">
                                        <Input value={target.text} onChange={(e) => handleUpdateDropTarget(question.id, target.id, 'text', e.target.value)} placeholder={t('editor.questions.dropTargetPlaceholder')} />
                                         <Select
                                          value={target.expectedDragItemId || NO_EXPECTED_DRAG_ITEM}
                                          onValueChange={(selectedValue) => {
                                            const actualValueToStore = selectedValue === NO_EXPECTED_DRAG_ITEM ? '' : selectedValue;
                                            handleUpdateDropTarget(question.id, target.id, 'expectedDragItemId', actualValueToStore);
                                          }}
                                        >
                                          <SelectTrigger className="text-xs h-8">
                                            <SelectValue placeholder={t('editor.questions.selectCorrectDragItem')} />
                                          </SelectTrigger>
                                          <SelectContent>
                                            <SelectItem value={NO_EXPECTED_DRAG_ITEM}>{t('editor.questions.noCorrectDragItem')}</SelectItem>
                                            {(question.dragItems || []).filter(di => di.correctCategoryId === undefined || di.correctCategoryId === null || di.correctCategoryId === '').map(dItem => ( // Filter out items meant for categorization
                                              <SelectItem key={dItem.id} value={dItem.id}>{dItem.text.substring(0,30)}{dItem.text.length > 30 ? '...' : ''}</SelectItem>
                                            ))}
                                          </SelectContent>
                                        </Select>
                                      </div>
                                      <Button variant="ghost" size="icon" onClick={() => handleRemoveDropTarget(question.id, target.id)} title={t('editor.questions.removeDropTarget')}>
                                          <Trash2 className="h-4 w-4 text-destructive/70 hover:text-destructive" />
                                      </Button>
                                    </div>
                                ))}
                                <Button variant="outline" size="sm" onClick={() => handleAddDropTarget(question.id)}><PlusCircle className="mr-2 h-4 w-4" /> {t('editor.questions.addDropTarget')}</Button>
                            </>
                        )}
                        {question.type === 'categorization-drag-and-drop' && (
                          <>
                            <p className="text-sm font-medium mt-2">{t('editor.questions.categoriesLabel')}</p>
                            {(question.categories || []).map(cat => (
                              <div key={cat.id} className="flex items-center space-x-2 p-2 border rounded-md">
                                <Input value={cat.name} onChange={(e) => handleUpdateCategory(question.id, cat.id, e.target.value)} placeholder={t('editor.questions.categoryNamePlaceholder')} className="flex-grow"/>
                                <Button variant="ghost" size="icon" onClick={() => handleRemoveCategory(question.id, cat.id)} title={t('editor.questions.removeCategory')}><Trash2 className="h-4 w-4 text-destructive/70 hover:text-destructive" /></Button>
                              </div>
                            ))}
                            <Button variant="outline" size="sm" onClick={() => handleAddCategory(question.id)} className="mb-2"><PlusCircle className="mr-2 h-4 w-4" /> {t('editor.questions.addCategory')}</Button>
                            
                            <p className="text-sm font-medium mt-2">{t('editor.questions.dragItemsLabel')}</p>
                            {(question.dragItems || []).map(item => (
                              <div key={item.id} className="flex items-center space-x-2 p-2 border rounded-md">
                                <Input value={item.text} onChange={(e) => handleUpdateDragItem(question.id, item.id, 'text', e.target.value)} placeholder={t('editor.questions.dragItemPlaceholder')} className="flex-grow"/>
                                <Select
                                  value={item.correctCategoryId || NO_CATEGORY_ASSIGNED}
                                  onValueChange={(value) => handleUpdateDragItem(question.id, item.id, 'correctCategoryId', value === NO_CATEGORY_ASSIGNED ? undefined : value)}
                                >
                                  <SelectTrigger className="w-[180px] text-xs h-8 ml-2">
                                    <SelectValue placeholder={t('editor.questions.selectCategoryPlaceholder')} />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value={NO_CATEGORY_ASSIGNED}>Uncategorized</SelectItem>
                                    {(question.categories || []).map(cat => (
                                      <SelectItem key={cat.id} value={cat.id}>{cat.name.substring(0,20)}{cat.name.length > 20 ? '...' : ''}</SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                                <Button variant="ghost" size="icon" onClick={() => handleRemoveDragItem(question.id, item.id)} title={t('editor.questions.removeDragItem')}><Trash2 className="h-4 w-4 text-destructive/70 hover:text-destructive" /></Button>
                              </div>
                            ))}
                            <Button variant="outline" size="sm" onClick={() => handleAddDragItem(question.id)}><PlusCircle className="mr-2 h-4 w-4" /> {t('editor.questions.addDragItem')}</Button>
                          </>
                        )}
                        {question.type === 'connect-points-matching' && (
                          <>
                            <p className="text-sm font-medium mt-2">{t('editor.questions.connectPairsLabel')}</p>
                            {(question.connectPairs || []).map(pair => (
                              <div key={pair.id} className="grid grid-cols-[1fr_auto_1fr_auto] gap-2 items-center p-2 border rounded-md">
                                <Input value={pair.leftItem} onChange={(e) => handleUpdateConnectPair(question.id, pair.id, 'leftItem', e.target.value)} placeholder={t('editor.questions.connectLeftItemPlaceholder')}/>
                                <span className="text-muted-foreground mx-1">&harr;</span>
                                <Input value={pair.rightItem} onChange={(e) => handleUpdateConnectPair(question.id, pair.id, 'rightItem', e.target.value)} placeholder={t('editor.questions.connectRightItemPlaceholder')}/>
                                <Button variant="ghost" size="icon" onClick={() => handleRemoveConnectPair(question.id, pair.id)} title={t('editor.questions.removeConnectPair')}><Trash2 className="h-4 w-4 text-destructive/70 hover:text-destructive" /></Button>
                              </div>
                            ))}
                            <Button variant="outline" size="sm" onClick={() => handleAddConnectPair(question.id)}><PlusCircle className="mr-2 h-4 w-4" /> {t('editor.questions.addConnectPair')}</Button>
                          </>
                        )}

                      </CardContent>
                    </Card>
                  ))
                )}
              </CardContent>
            </ScrollArea>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}

export default function NewTestEditorPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <NewTestEditorPageContent />
    </Suspense>
  );
}
