
'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Save, Eye, PlusCircle, Settings2, Palette, HelpCircle, Trash2, CheckCircle, Circle, Code, MessageSquareText, ExternalLink, Image as ImageIcon } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import type { Question, QuestionOption, MatchPair, DraggableItem, DropTarget, QuestionType } from '@/lib/types';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/contexts/LanguageContext';
import { pageTemplates, DEFAULT_TEMPLATE_ID } from '@/lib/mockPageTemplates';
import { useSearchParams } from 'next/navigation';
import Image from 'next/image'; // Next.js Image component

const generateId = () => Math.random().toString(36).substr(2, 9);

const quizLogicScript = `
document.addEventListener('DOMContentLoaded', () => {
  const questionsDataElement = document.getElementById('quiz-data');
  const endMessageElement = document.getElementById('quiz-end-message-text');
  if (!questionsDataElement || !endMessageElement) { console.error('Quiz data or end message element not found.'); return; }
  
  const t = (key, replacements = {}, defaultValue = '') => { 
    let text = defaultValue || key; 
    if (typeof quizTranslations !== 'undefined' && quizTranslations[key]) {
        text = quizTranslations[key];
    }
    for (const placeholder in replacements) {
        text = text.replace(new RegExp('{{' + placeholder + '}}', 'g'), replacements[placeholder]);
    }
    return text;
  };
  const quizTranslations = { 
    'quiz.feedback.correct': 'Correct!',
    'quiz.feedback.incorrect': 'Incorrect!',
    'quiz.endScreen.title': 'Quiz Complete!',
    'quiz.restartButton': 'Restart Quiz',
    'quiz.matching.selectPrompt': 'Select a match for:',
    'quiz.dragDrop.dropHere': 'Drop here',
    'quiz.questionType.notImplemented': 'This question type is not fully interactive in preview yet.'
  };

  const questions = JSON.parse(questionsDataElement.textContent || '[]');
  const rawQuizEndMessage = endMessageElement.textContent || t('editor.defaultEndMessage', { score: '{{score}}', total: '{{total}}' }, 'Quiz Finished! Score: {{score}}/{{total}}');
  
  const quizContainer = document.querySelector('.quiz-container');
  const questionHost = document.getElementById('quiz-content-host');
  const questionTemplateElement = quizContainer?.querySelector('[data-quiz-question-id="q_template_id"]');
  
  if (!quizContainer || !questionHost || !questionTemplateElement) { 
    if (questionHost) questionHost.innerHTML = '<p>Error: Page template structure incomplete. Missing .quiz-container, #quiz-content-host, or [data-quiz-question-id="q_template_id"].</p>'; return; 
  }
  questionTemplateElement.style.display = 'none'; // Keep it as a template, don't remove
  
  let currentQuestionIndex = 0; 
  let score = 0; 
  let activeQuestionElement = null;

  function displayQuestion(index) {
    if (activeQuestionElement) {
      activeQuestionElement.classList.add('animate-slide-out-left');
      setTimeout(() => { 
        activeQuestionElement.remove(); 
        activeQuestionElement = null; 
        index >= questions.length ? displayEndScreen() : renderQuestion(index); 
      }, 500);
    } else { 
      index >= questions.length ? displayEndScreen() : renderQuestion(index); 
    }
  }

  function renderQuestion(index) {
    const question = questions[index];
    const newQuestionElement = questionTemplateElement.cloneNode(true);
    newQuestionElement.style.display = 'block'; 
    newQuestionElement.setAttribute('data-quiz-question-id', question.id);
    
    const questionTextEl = newQuestionElement.querySelector('[data-quiz-question-text]');
    if (questionTextEl) { 
      questionTextEl.textContent = question.text; 
      questionTextEl.setAttribute('data-quiz-question-text', question.id); 
    }
    
    const optionsContainerEl = newQuestionElement.querySelector('[data-quiz-options-for-question]');
    const feedbackEl = newQuestionElement.querySelector('[data-quiz-feedback]');
    if (feedbackEl) { feedbackEl.style.display = 'none'; feedbackEl.className = 'feedback-message mt-6 text-center font-medium text-lg'; }

    if (optionsContainerEl) {
      optionsContainerEl.innerHTML = ''; // Clear previous options
      
      if (question.type === 'multiple-choice-text' || question.type === 'multiple-choice-image') {
        const optionTemplateEl = questionTemplateElement.querySelector('[data-quiz-answer-option]');
        if (optionTemplateEl) {
            const templateOptionButton = optionTemplateEl.cloneNode(true);
            question.options.forEach(option => {
                const newOptionButton = templateOptionButton.cloneNode(true);
                newOptionButton.setAttribute('data-quiz-answer-option', \`\${question.id}.\${option.id}\`);
                if (question.type === 'multiple-choice-image' && option.imageUrl) {
                    newOptionButton.innerHTML = \`<img src="\${option.imageUrl}" alt="\${option.text}" class="max-h-40 mx-auto mb-2 rounded-md object-contain"><p class="text-center">\${option.text}</p>\`;
                    newOptionButton.classList.add('image-option');
                } else {
                    newOptionButton.textContent = option.text;
                }
                newOptionButton.onclick = (event) => handleOptionClick(event.currentTarget, option, question.options, newQuestionElement, feedbackEl);
                optionsContainerEl.appendChild(newOptionButton);
            });
        }
      } else if (question.type === 'matching-text-text') {
        const promptContainer = document.createElement('div');
        promptContainer.className = 'matching-prompts mb-4 space-y-2';
        question.matchPairs.forEach(pair => {
          const el = document.createElement('div');
          el.className = 'p-3 border rounded-md bg-card/80';
          el.textContent = \`\${t('quiz.matching.selectPrompt')} "\${pair.prompt}"\`;
          promptContainer.appendChild(el);
        });
        optionsContainerEl.appendChild(promptContainer);
        
        const targetContainer = document.createElement('div');
        targetContainer.className = 'matching-targets grid grid-cols-2 gap-3';
        // Shuffle targets for display (simple shuffle)
        const shuffledTargets = [...question.matchPairs].sort(() => 0.5 - Math.random()); 
        shuffledTargets.forEach(pair => {
          const btn = document.createElement('button');
          btn.className = 'option-button w-full text-left p-3 border rounded-md hover:bg-secondary';
          btn.textContent = pair.target;
          btn.onclick = () => { 
            if (feedbackEl) {
                feedbackEl.textContent = t('quiz.questionType.notImplemented'); 
                feedbackEl.classList.add('show');
            }
            setTimeout(() => { currentQuestionIndex++; displayQuestion(currentQuestionIndex); }, 1500);
          };
          targetContainer.appendChild(btn);
        });
        optionsContainerEl.appendChild(targetContainer);

      } else if (question.type === 'drag-and-drop-text-text') {
         const dragItemsDiv = document.createElement('div');
         dragItemsDiv.className = 'drag-items-container mb-4 flex flex-wrap gap-3 justify-center';
         question.dragItems.forEach(item => {
           const el = document.createElement('div');
           el.className = 'p-3 border rounded-md bg-muted cursor-grab';
           el.textContent = item.text;
           dragItemsDiv.appendChild(el);
         });
         optionsContainerEl.appendChild(dragItemsDiv);

         const dropTargetsDiv = document.createElement('div');
         dropTargetsDiv.className = 'drop-targets-container mt-4 grid grid-cols-1 md:grid-cols-2 gap-3';
         question.dropTargets.forEach(target => {
           const el = document.createElement('div');
           el.className = 'p-6 border-2 border-dashed border-border rounded-md text-center text-muted-foreground';
           el.textContent = target.text || t('quiz.dragDrop.dropHere');
            el.onclick = () => { 
                if (feedbackEl) {
                    feedbackEl.textContent = t('quiz.questionType.notImplemented');
                    feedbackEl.classList.add('show');
                }
                setTimeout(() => { currentQuestionIndex++; displayQuestion(currentQuestionIndex); }, 1500);
            };
           dropTargetsDiv.appendChild(el);
         });
         optionsContainerEl.appendChild(dropTargetsDiv);
      }
    }
    questionHost.appendChild(newQuestionElement); 
    activeQuestionElement = newQuestionElement; 
    newQuestionElement.classList.add('animate-slide-in-right');
  }

  function handleOptionClick(selectedButton, selectedOption, allOptions, questionElement, feedbackEl) {
    const optionButtons = questionElement.querySelectorAll('.option-button');
    optionButtons.forEach(btn => btn.disabled = true); 
    
    const isCorrect = selectedOption.isCorrect;
    const correctOption = allOptions.find(opt => opt.isCorrect);

    if (feedbackEl) {
      feedbackEl.style.display = 'block';
      feedbackEl.classList.remove('correct', 'incorrect', 'show'); 
    }

    if (isCorrect) {
      selectedButton.classList.add('correct-answer');
      if (feedbackEl) {
        feedbackEl.textContent = t('quiz.feedback.correct');
        feedbackEl.classList.add('correct', 'show');
      }
      score++;
    } else {
      selectedButton.classList.add('incorrect-answer-selected');
      if (feedbackEl) {
        feedbackEl.textContent = t('quiz.feedback.incorrect');
        feedbackEl.classList.add('incorrect', 'show');
      }
      if (correctOption) {
        const correctButton = Array.from(optionButtons).find(btn => {
          const btnOptionId = btn.getAttribute('data-quiz-answer-option');
          return btnOptionId && btnOptionId.endsWith(correctOption.id);
        });
        if (correctButton) {
          correctButton.classList.add('always-correct-answer'); 
        }
      }
    }
    
    setTimeout(() => {
      currentQuestionIndex++;
      displayQuestion(currentQuestionIndex);
    }, 2500);
  }

  function displayEndScreen() {
    questionHost.innerHTML = ''; 
    const finalEndMessage = rawQuizEndMessage.replace('{{score}}', score.toString()).replace('{{total}}', questions.length.toString());
    const endScreenDiv = document.createElement('div');
    endScreenDiv.id = 'quiz-end-screen';
    endScreenDiv.className = 'text-center p-8 bg-card rounded-lg shadow-xl animate-fade-in';
    endScreenDiv.innerHTML = \`<h2 class="text-2xl font-bold mb-4 text-primary">\${t('quiz.endScreen.title')}</h2><p data-quiz-end-message class="text-lg text-foreground mb-6">\${finalEndMessage}</p><button id="restart-quiz-button" class="mt-4 bg-primary text-primary-foreground px-6 py-3 rounded-md hover:bg-primary/90 transition-colors text-base font-medium shadow-md">\${t('quiz.restartButton')}</button>\`;
    questionHost.appendChild(endScreenDiv);
    
    const restartButton = document.getElementById('restart-quiz-button');
    if (restartButton) {
      restartButton.onclick = () => {
        currentQuestionIndex = 0;
        score = 0;
        activeQuestionElement = null;
        questionHost.innerHTML = '';
        displayQuestion(currentQuestionIndex);
      };
    }
  }
  
  questions.length > 0 ? displayQuestion(currentQuestionIndex) : (questionHost.innerHTML = '<p>No questions added.</p>');
});
`;

function NewTestEditorPageContent() {
  const { t } = useLanguage();
  const searchParams = useSearchParams();
  const { toast } = useToast();

  const [testName, setTestName] = useState('');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [htmlContent, setHtmlContent] = useState('');
  const [cssContent, setCssContent] = useState('');
  const [quizEndMessage, setQuizEndMessage] = useState('');
  const [previewContent, setPreviewContent] = useState('');

  useEffect(() => {
    const templateId = searchParams.get('template') || DEFAULT_TEMPLATE_ID;
    const selectedTemplate = pageTemplates.find(pt => pt.id === templateId);

    if (selectedTemplate) {
      setHtmlContent(selectedTemplate.htmlContent);
      setCssContent(selectedTemplate.cssContent);
      if (templateId && templateId !== DEFAULT_TEMPLATE_ID) {
        setTestName(t('editor.defaultTestNameFromTemplate', {templateName: selectedTemplate.name, defaultValue: `Quiz from ${selectedTemplate.name}`}));
      } else {
        setTestName(t('editor.defaultTestName', {defaultValue: 'My Awesome Quiz'}));
      }
    } else {
      // Fallback to default blank if template not found
      const defaultTemplate = pageTemplates.find(pt => pt.id === DEFAULT_TEMPLATE_ID)!;
      setHtmlContent(defaultTemplate.htmlContent);
      setCssContent(defaultTemplate.cssContent);
      setTestName(t('editor.defaultTestName', {defaultValue: 'My Awesome Quiz'}));
      if (templateId) {
        toast({
            title: t('editor.toast.templateNotFoundTitle', {defaultValue: 'Page Template Not Found'}),
            description: t('editor.toast.templateNotFoundDescription', {templateId, defaultValue: `The page template "${templateId}" was not found. Loaded default blank canvas.`}),
            variant: "destructive",
        });
      }
    }
    setQuizEndMessage(t('editor.defaultEndMessage', {defaultValue: 'Congratulations! Score: {{score}}/{{total}}.'}));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, t]);


  const updatePreview = useCallback(() => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlContent, 'text/html');
    const titleElement = doc.querySelector('[data-quiz-title]');
    if (titleElement) titleElement.textContent = testName || t('editor.quizTitlePlaceholder', {defaultValue: 'Quiz Title'});
    
    const questionsDataScriptTag = doc.getElementById('quiz-data');
    if (questionsDataScriptTag) questionsDataScriptTag.textContent = JSON.stringify(questions);
    
    const endMessageDivTag = doc.getElementById('quiz-end-message-text');
    if (endMessageDivTag) endMessageDivTag.textContent = quizEndMessage;
    
    const finalHtmlBody = doc.body.innerHTML;
    
    const stylingVariables = `
      :root {
        --background: ${getComputedStyle(document.documentElement).getPropertyValue('--background').trim()};
        --foreground: ${getComputedStyle(document.documentElement).getPropertyValue('--foreground').trim()};
        --card: ${getComputedStyle(document.documentElement).getPropertyValue('--card').trim()};
        --card-foreground: ${getComputedStyle(document.documentElement).getPropertyValue('--card-foreground').trim()};
        --primary: ${getComputedStyle(document.documentElement).getPropertyValue('--primary').trim()};
        --primary-foreground: ${getComputedStyle(document.documentElement).getPropertyValue('--primary-foreground').trim()};
        --secondary: ${getComputedStyle(document.documentElement).getPropertyValue('--secondary').trim()};
        --accent: ${getComputedStyle(document.documentElement).getPropertyValue('--accent').trim()};
        --accent-foreground: ${getComputedStyle(document.documentElement).getPropertyValue('--accent-foreground').trim()};
        --destructive: ${getComputedStyle(document.documentElement).getPropertyValue('--destructive').trim()};
        --destructive-foreground: ${getComputedStyle(document.documentElement).getPropertyValue('--destructive-foreground').trim()};
        --border: ${getComputedStyle(document.documentElement).getPropertyValue('--border').trim()};
        --font-geist-sans: ${getComputedStyle(document.documentElement).getPropertyValue('--font-geist-sans').trim() || 'Arial, sans-serif'};
        --success-bg: ${getComputedStyle(document.documentElement).getPropertyValue('--success-bg').trim()};
        --success-fg: ${getComputedStyle(document.documentElement).getPropertyValue('--success-fg').trim()};
        --success-border: ${getComputedStyle(document.documentElement).getPropertyValue('--success-border').trim()};
      }
    `;
    setPreviewContent(`<html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><script src="https://cdn.tailwindcss.com"></script><style>${stylingVariables}${cssContent}</style></head><body>${finalHtmlBody}<script>${quizLogicScript}<\/script></body></html>`);
  }, [htmlContent, cssContent, testName, questions, quizEndMessage, t]);

  useEffect(() => { updatePreview(); }, [updatePreview]);
  

  const handleAddQuestion = () => {
    const newQuestion: Question = {
      id: generateId(), 
      type: 'multiple-choice-text',
      text: t('editor.newQuestionText', {number: questions.length + 1, defaultValue: `New Question ${questions.length + 1}`}),
      options: [
        { id: generateId(), text: t('editor.optionPlaceholder', {letter: 'A', defaultValue: 'Option A'}), isCorrect: false },
        { id: generateId(), text: t('editor.optionPlaceholder', {letter: 'B', defaultValue: 'Option B'}), isCorrect: false },
      ],
      matchPairs: [],
      dragItems: [],
      dropTargets: [],
    };
    setQuestions((prevQuestions) => [...prevQuestions, newQuestion]);
  };

  const handleUpdateQuestion = (questionId: string, field: keyof Question, value: any) => {
    setQuestions(prev => prev.map(q => q.id === questionId ? { ...q, [field]: value } : q));
  };

  const handleUpdateOption = (questionId: string, optionId: string, field: keyof QuestionOption, value: any) => {
    setQuestions(prev => prev.map(q => q.id === questionId ? {
      ...q, options: q.options.map(opt => opt.id === optionId ? { ...opt, [field]: value } : opt)
    } : q));
  };

  const handleSetCorrectOption = (questionId: string, correctOptionId: string) => {
    setQuestions(prev => prev.map(q => q.id === questionId ? {
      ...q, options: q.options.map(opt => ({ ...opt, isCorrect: opt.id === correctOptionId }))
    } : q));
  };
  
  const handleAddOption = (questionId: string) => {
    setQuestions(prev => prev.map(q => q.id === questionId ? {
      ...q, options: [...q.options, { id: generateId(), text: t('editor.newOptionText', {number: q.options.length + 1}), isCorrect: false, imageUrl: '' }]
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
  const handleUpdateDragItem = (questionId: string, itemId: string, value: string) => {
     setQuestions(prev => prev.map(q => q.id === questionId ? {
      ...q, dragItems: (q.dragItems || []).map(item => item.id === itemId ? { ...item, text: value } : item)
    } : q));
  };
  const handleRemoveDragItem = (questionId: string, itemId: string) => {
     setQuestions(prev => prev.map(q => q.id === questionId ? {
      ...q, dragItems: (q.dragItems || []).filter(item => item.id !== itemId)
    } : q));
  };
  
  const handleAddDropTarget = (questionId: string) => {
     setQuestions(prev => prev.map(q => q.id === questionId ? {
      ...q, dropTargets: [...(q.dropTargets || []), { id: generateId(), text: ''}]
    } : q));
  };
  const handleUpdateDropTarget = (questionId: string, targetId: string, value: string) => {
    setQuestions(prev => prev.map(q => q.id === questionId ? {
      ...q, dropTargets: (q.dropTargets || []).map(target => target.id === targetId ? { ...target, text: value } : target)
    } : q));
  };
  const handleRemoveDropTarget = (questionId: string, targetId: string) => {
     setQuestions(prev => prev.map(q => q.id === questionId ? {
      ...q, dropTargets: (q.dropTargets || []).filter(target => target.id !== targetId)
    } : q));
  };


  const handleDeleteQuestion = (questionId: string) => setQuestions((prev) => prev.filter((q) => q.id !== questionId));

  const handleSaveTest = () => {
    const testData = { testName, questions, htmlContent, cssContent, quizEndMessage, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
    console.log("Saving test data:", JSON.stringify(testData, null, 2));
    toast({ title: t('editor.toast.saveSuccessTitle', {defaultValue: "Test Data Logged"}), description: t('editor.toast.saveSuccessDescription', {defaultValue: "Test config logged to console."}) });
  };
  
  const handleFullScreenPreview = () => {
    if (previewContent) {
      const blob = new Blob([previewContent], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      const newWindow = window.open(url);
      if (!newWindow) {
        toast({
          title: t('editor.toast.popupBlockedTitle', { defaultValue: "Popup Blocked" }),
          description: t('editor.toast.popupBlockedDescription', { defaultValue: "Please allow popups for this site to use full screen preview." }),
          variant: "destructive",
        });
      }
      setTimeout(() => URL.revokeObjectURL(url), 100); // Clean up
    }
  };

  const questionTypes: {value: QuestionType; labelKey: string}[] = [
    { value: 'multiple-choice-text', labelKey: 'questionType.multiple-choice-text'},
    { value: 'multiple-choice-image', labelKey: 'questionType.multiple-choice-image'},
    { value: 'matching-text-text', labelKey: 'questionType.matching-text-text'},
    { value: 'drag-and-drop-text-text', labelKey: 'questionType.drag-and-drop-text-text'},
  ];

  const isEditing = questions.length > 0 || (testName && testName !== t('editor.defaultTestName') && testName !== t('editor.defaultTestNameFromTemplate', {templateName: ''}).substring(0, t('editor.defaultTestNameFromTemplate', {templateName: ''}).indexOf('{{templateName}}')) ) ;
  const pageTitleKeyToUse = isEditing ? "editor.pageTitleEditing" : "editor.pageTitleNew";
  const pageTitleParamsToUse = isEditing ? { testNameOrId: testName } : undefined;


  return (
    <AppLayout
      currentPageTitleKey={pageTitleKeyToUse}
      currentPageTitleParams={pageTitleParamsToUse}
    >
      <div className="flex flex-col h-full">
        <header className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-semibold truncate pr-4">
             {t(pageTitleKeyToUse, { testNameOrId: testName || '...' })}
          </h1>
          <div className="space-x-2 flex-shrink-0 flex items-center">
            <Button variant="outline" onClick={updatePreview}><Eye className="mr-2 h-4 w-4" /> {t('editor.refreshPreview', {defaultValue: 'Refresh Preview'})}</Button>
            <Button variant="outline" onClick={handleFullScreenPreview}><ExternalLink className="mr-2 h-4 w-4" /> {t('editor.fullScreenPreview', {defaultValue: 'Full Screen'})}</Button>
            <Button onClick={handleSaveTest}><Save className="mr-2 h-4 w-4" /> {t('editor.saveTest', {defaultValue: 'Save Test'})}</Button>
          </div>
        </header>

        <div className="grid md:grid-cols-3 gap-6 flex-1 min-h-0">
          <Card className="md:col-span-1 flex flex-col shadow-lg">
             <CardHeader>
                <CardTitle className="flex items-center"><Settings2 className="mr-2 h-5 w-5 text-primary" />{t('editor.config.title', {defaultValue: 'Configuration & Page Style'})}</CardTitle>
                <CardDescription>{t('editor.config.description', {defaultValue: 'Basic settings, page style (HTML/CSS), and embed information.'})}</CardDescription>
              </CardHeader>
            <ScrollArea className="flex-grow">
              <CardContent className="space-y-6 p-4">
                <div>
                  <Label htmlFor="testName" className="text-sm font-medium">{t('editor.config.testNameLabel', {defaultValue: 'Test Name'})}</Label>
                  <Input id="testName" placeholder={t('editor.config.testNamePlaceholder', {defaultValue: 'e.g., General Knowledge'})} value={testName} onChange={(e) => setTestName(e.target.value)} className="mt-1" />
                </div>
                <Separator />
                 <div>
                  <Label htmlFor="quizEndMessage" className="text-sm font-medium flex items-center"><MessageSquareText className="mr-2 h-4 w-4" /> {t('editor.config.endMessageLabel', {defaultValue: 'Quiz End Message'})}</Label>
                  <Textarea id="quizEndMessage" placeholder={t('editor.config.endMessagePlaceholder', {defaultValue: 'e.g., Congrats! Score: {{score}}/{{total}}'})} value={quizEndMessage} onChange={(e) => setQuizEndMessage(e.target.value)} className="mt-1" rows={3} />
                   <p className="text-xs text-muted-foreground mt-1">{t('editor.config.endMessageHint', {defaultValue: "Use {{score}} and {{total}}."})}</p>
                </div>
                <Separator />
                <div>
                  <Label htmlFor="htmlContent" className="text-sm font-medium flex items-center"><Palette className="mr-2 h-4 w-4" /> {t('editor.config.htmlLabel', {defaultValue: 'Page HTML Structure'})}</Label>
                  <Textarea id="htmlContent" value={htmlContent} onChange={(e) => setHtmlContent(e.target.value)} className="mt-1 font-mono text-xs min-h-[200px] resize-y" rows={10} />
                </div>
                <div>
                  <Label htmlFor="cssContent" className="text-sm font-medium flex items-center"><Palette className="mr-2 h-4 w-4" /> {t('editor.config.cssLabel', {defaultValue: 'Page CSS Styles'})}</Label>
                  <Textarea id="cssContent" value={cssContent} onChange={(e) => setCssContent(e.target.value)} className="mt-1 font-mono text-xs min-h-[200px] resize-y" rows={10} />
                </div>
                <Separator />
                 <Card>
                  <CardHeader><CardTitle className="text-base flex items-center"><Code className="mr-2 h-4 w-4" /> {t('editor.config.embedTitle', {defaultValue: 'Embed Your Test'})}</CardTitle></CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">{t('editor.config.embedDescription', {defaultValue: 'After saving, embed code will appear here.'})}</p>
                    <Textarea readOnly value="<iframe src='...' width='100%' height='600px' frameborder='0'></iframe>" className="mt-2 font-mono text-xs bg-muted/50 cursor-not-allowed" rows={3} />
                  </CardContent>
                </Card>
              </CardContent>
            </ScrollArea>
          </Card>

          <Card className="md:col-span-1 flex flex-col overflow-hidden shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center"><Eye className="mr-2 h-5 w-5 text-primary" />{t('editor.preview.title', {defaultValue: 'Live Preview'})}</CardTitle>
              <CardDescription>{t('editor.preview.description', {defaultValue: 'Rendered output of your test. Fully interactive.'})}</CardDescription>
            </CardHeader>
            <CardContent className="flex-grow p-0 m-0">
              <iframe srcDoc={previewContent} title="Test Preview" className="w-full h-full border-0" sandbox="allow-scripts allow-same-origin allow-popups" />
            </CardContent>
          </Card>

          <Card className="md:col-span-1 flex flex-col shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between">
              <div className="space-y-1.5">
                <CardTitle className="flex items-center"><HelpCircle className="mr-2 h-5 w-5 text-primary" />{t('editor.questions.title', {defaultValue: 'Questions'})}</CardTitle>
                <CardDescription>{t('editor.questions.description', {defaultValue: 'Add and manage your questions and answers.'})}</CardDescription>
              </div>
              <Button onClick={handleAddQuestion} size="sm"><PlusCircle className="mr-2 h-4 w-4" /> {t('editor.questions.addQuestion', {defaultValue: 'Add Question'})}</Button>
            </CardHeader>
            <ScrollArea className="flex-grow">
              <CardContent className="space-y-4 p-4">
                {questions.length === 0 ? (
                  <div className="text-center text-muted-foreground py-10">
                    <p>{t('editor.questions.noQuestions', {defaultValue: 'No questions added yet.'})}</p>
                    <Button variant="outline" className="mt-4" onClick={handleAddQuestion}><PlusCircle className="mr-2 h-4 w-4" /> {t('editor.questions.addFirstQuestion', {defaultValue: 'Add First Question'})}</Button>
                  </div>
                ) : (
                  questions.map((question, qIndex) => (
                    <Card key={question.id} className="shadow-md bg-card/50">
                      <CardHeader>
                        <div className="flex justify-between items-start">
                          <div className="flex-grow">
                            <CardTitle className="text-lg mb-2">{t('editor.questions.questionLabel', {number: qIndex+1, defaultValue: `Question ${qIndex + 1}`})}</CardTitle>
                            <Label htmlFor={`q-type-${question.id}`}>{t('editor.questions.questionTypeLabel', {defaultValue: 'Question Type'})}</Label>
                            <Select
                                value={question.type}
                                onValueChange={(value) => handleUpdateQuestion(question.id, 'type', value as QuestionType)}
                            >
                                <SelectTrigger id={`q-type-${question.id}`} className="mt-1">
                                <SelectValue placeholder={t('editor.questions.questionTypeLabel', {defaultValue: 'Select type'})} />
                                </SelectTrigger>
                                <SelectContent>
                                {questionTypes.map(qt => (
                                    <SelectItem key={qt.value} value={qt.value}>{t(qt.labelKey, {defaultValue: qt.value})}</SelectItem>
                                ))}
                                </SelectContent>
                            </Select>
                          </div>
                          <Button variant="ghost" size="icon" onClick={() => handleDeleteQuestion(question.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div>
                          <Label htmlFor={`q-text-${question.id}`}>{t('editor.questions.questionTextLabel', {defaultValue: 'Question Text'})}</Label>
                          <Textarea id={`q-text-${question.id}`} value={question.text} onChange={(e) => handleUpdateQuestion(question.id, 'text', e.target.value)} placeholder={t('editor.questions.questionTextPlaceholder', {defaultValue: 'Enter question text'})} className="mt-1" rows={2}/>
                        </div>
                        
                        {/* Multiple Choice Options UI */}
                        {(question.type === 'multiple-choice-text' || question.type === 'multiple-choice-image') && (
                          <>
                            <p className="text-sm font-medium">{t('editor.questions.optionsLabel', {defaultValue: 'Options:'})}</p>
                            {question.options.map((option) => (
                              <div key={option.id} className="flex items-center space-x-2 p-2 border rounded-md">
                                <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-primary" onClick={() => handleSetCorrectOption(question.id, option.id)} title={option.isCorrect ? t('editor.questions.markIncorrect') : t('editor.questions.markCorrect')}>
                                  {option.isCorrect ? <CheckCircle className="h-5 w-5 text-primary" /> : <Circle className="h-5 w-5" />}
                                </Button>
                                <div className="flex-grow space-y-1">
                                  <Input value={option.text} onChange={(e) => handleUpdateOption(question.id, option.id, 'text', e.target.value)} placeholder={t('editor.questions.optionTextPlaceholder', {defaultValue: 'Option text'})} />
                                  {question.type === 'multiple-choice-image' && (
                                    <>
                                    <Input value={option.imageUrl || ''} onChange={(e) => handleUpdateOption(question.id, option.id, 'imageUrl', e.target.value)} placeholder={t('editor.questions.optionImageUrlPlaceholder', {defaultValue: 'Image URL (optional)'})} />
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

                        {/* Matching Pairs UI */}
                        {question.type === 'matching-text-text' && (
                            <>
                                <p className="text-sm font-medium">{t('editor.questions.matchingPairsLabel', {defaultValue: 'Matching Pairs:'})}</p>
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
                        
                        {/* Drag and Drop UI */}
                        {question.type === 'drag-and-drop-text-text' && (
                            <>
                                <p className="text-sm font-medium">{t('editor.questions.dragItemsLabel', {defaultValue: 'Draggable Items:'})}</p>
                                {(question.dragItems || []).map(item => (
                                    <div key={item.id} className="flex items-center space-x-2 p-2 border rounded-md">
                                        <Input value={item.text} onChange={(e) => handleUpdateDragItem(question.id, item.id, e.target.value)} placeholder={t('editor.questions.dragItemPlaceholder')} className="flex-grow"/>
                                        <Button variant="ghost" size="icon" onClick={() => handleRemoveDragItem(question.id, item.id)} title={t('editor.questions.removeDragItem')}>
                                            <Trash2 className="h-4 w-4 text-destructive/70 hover:text-destructive" />
                                        </Button>
                                    </div>
                                ))}
                                <Button variant="outline" size="sm" onClick={() => handleAddDragItem(question.id)} className="mb-2"><PlusCircle className="mr-2 h-4 w-4" /> {t('editor.questions.addDragItem')}</Button>

                                <p className="text-sm font-medium">{t('editor.questions.dropTargetsLabel', {defaultValue: 'Drop Targets:'})}</p>
                                 {(question.dropTargets || []).map(target => (
                                    <div key={target.id} className="flex items-center space-x-2 p-2 border rounded-md">
                                        <Input value={target.text} onChange={(e) => handleUpdateDropTarget(question.id, target.id, e.target.value)} placeholder={t('editor.questions.dropTargetPlaceholder')} className="flex-grow"/>
                                        <Button variant="ghost" size="icon" onClick={() => handleRemoveDropTarget(question.id, target.id)} title={t('editor.questions.removeDropTarget')}>
                                            <Trash2 className="h-4 w-4 text-destructive/70 hover:text-destructive" />
                                        </Button>
                                    </div>
                                ))}
                                <Button variant="outline" size="sm" onClick={() => handleAddDropTarget(question.id)}><PlusCircle className="mr-2 h-4 w-4" /> {t('editor.questions.addDropTarget')}</Button>
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

