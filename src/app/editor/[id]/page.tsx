
'use client';

import { useState, useEffect, useCallback } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Save, Eye, PlusCircle, Settings2, Palette, HelpCircle, Trash2, CheckCircle, Circle, Code, MessageSquareText } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import type { Question } from '@/lib/types'; // QuestionOption implicitly imported
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/contexts/LanguageContext';
import { useParams } from 'next/navigation';

const generateId = () => Math.random().toString(36).substr(2, 9);

// Default HTML and CSS, script content - same as new/page.tsx for now
const defaultHtmlContent = `
<div class="quiz-container p-8 rounded-xl shadow-2xl bg-card text-card-foreground max-w-2xl mx-auto my-10">
  <h1 data-quiz-title class="text-3xl font-bold mb-8 text-primary text-center">Your Quiz Title</h1>
  
  <div id="quiz-content-host">
    <div data-quiz-question-id="q_template_id" class="question-block mb-10 p-6 bg-background/70 border border-border rounded-lg shadow-md transition-all duration-300 hover:shadow-lg" style="display: none;">
      <h2 data-quiz-question-text="q_template_id" class="text-xl font-semibold mb-6 text-foreground">Sample Question: What is 2 + 2?</h2>
      <div data-quiz-options-for-question="q_template_id" class="options-grid grid grid-cols-1 md:grid-cols-2 gap-4">
        <button data-quiz-answer-option="q_template_id.opt_template_id" 
                class="option-button w-full text-left p-4 border border-border rounded-md text-foreground
                       hover:bg-secondary hover:border-primary hover:shadow-md 
                       focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background
                       transition-all duration-200 ease-in-out transform hover:scale-105">
          Sample Option Text
        </button>
      </div>
      <div data-quiz-feedback="q_template_id" class="feedback-message mt-6 text-center font-medium text-lg" style="display: none; min-height: 28px;"></div>
    </div>
  </div>

  <script id="quiz-data" type="application/json"></script>
  <div id="quiz-end-message-text" style="display:none;"></div>
</div>
`;

const defaultCssContent = `
body {
  background-color: hsl(var(--background)); 
  color: hsl(var(--foreground));
  font-family: var(--font-geist-sans, sans-serif);
}
.quiz-container { font-family: var(--font-geist-sans), sans-serif; }
.option-button.selected {
  background-color: hsl(var(--accent));
  color: hsl(var(--accent-foreground));
  border-color: hsl(var(--accent) / 0.8);
  box-shadow: 0 0 0 2px hsl(var(--accent) / 0.5);
  transform: scale(1.02); 
  animation: pop 0.3s ease-out;
}
.option-button.correct-answer { /* User selected correct answer */
  background-color: hsl(var(--success-bg)) !important;
  color: hsl(var(--success-fg)) !important;
  border-color: hsl(var(--success-border)) !important;
  box-shadow: 0 0 0 3px hsl(var(--success-border) / 0.7);
  animation: pop 0.3s ease-out;
}
.option-button.incorrect-answer-selected { /* User selected incorrect answer */
  background-color: hsl(var(--destructive)) !important;
  color: hsl(var(--destructive-foreground)) !important;
  border-color: hsl(var(--destructive)) !important;
  box-shadow: 0 0 0 3px hsl(var(--destructive) / 0.7);
  opacity: 0.9;
  animation: pop 0.3s ease-out;
}
.option-button.always-correct-answer { /* To show the correct answer if user was wrong */
  background-color: hsl(var(--success-bg)) !important;
  color: hsl(var(--success-fg)) !important;
  border: 2px solid hsl(var(--success-border)) !important;
}
.feedback-message { opacity: 0; transform: translateY(10px); transition: opacity 0.3s ease-out, transform 0.3s ease-out; }
.feedback-message.show { opacity: 1; transform: translateY(0); animation: fadeInFeedback 0.3s ease-out, popFeedback 0.4s cubic-bezier(0.68, -0.55, 0.27, 1.55); }
.feedback-message.correct { color: hsl(var(--success-fg)); }
.feedback-message.incorrect { color: hsl(var(--destructive)); }

.animate-slide-out-left { opacity: 0 !important; transform: translateX(-50px) !important; transition: opacity 0.5s ease-out, transform 0.5s ease-out; }
.animate-slide-in-right { opacity: 0; transform: translateX(50px); animation: slideInFromRight 0.5s ease-out forwards; }
@keyframes slideInFromRight { from { opacity: 0; transform: translateX(50px); } to { opacity: 1; transform: translateX(0); } }

.animate-fade-in { opacity: 0; animation: fadeIn 0.5s ease-out forwards; }
@keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }

@keyframes pop { 0% { transform: scale(1); } 50% { transform: scale(1.05); } 100% { transform: scale(1); } }
@keyframes fadeInFeedback { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0px); } }
@keyframes popFeedback { 0% { transform: scale(0.9) translateY(5px); } 70% { transform: scale(1.05) translateY(0px); } 100% { transform: scale(1) translateY(0px); } }
`;

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
    'quiz.restartButton': 'Restart Quiz'
  };

  const questions = JSON.parse(questionsDataElement.textContent || '[]');
  const rawQuizEndMessage = endMessageElement.textContent || t('editor.defaultEndMessage', { score: '{{score}}', total: '{{total}}' }, 'Quiz Finished! Score: {{score}}/{{total}}');
  
  const quizContainer = document.querySelector('.quiz-container');
  const questionHost = document.getElementById('quiz-content-host');
  const questionTemplateElement = quizContainer.querySelector('[data-quiz-question-id="q_template_id"]');
  
  if (!quizContainer || !questionHost || !questionTemplateElement) { 
    if (questionHost) questionHost.innerHTML = '<p>Error: Quiz structure incomplete.</p>'; return; 
  }
  questionTemplateElement.remove();
  
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
    const optionTemplateEl = questionTemplateElement.querySelector('[data-quiz-answer-option]');
    const feedbackEl = newQuestionElement.querySelector('[data-quiz-feedback]');
    if (feedbackEl) { feedbackEl.style.display = 'none'; feedbackEl.className = 'feedback-message mt-6 text-center font-medium text-lg'; }

    if (optionsContainerEl && optionTemplateEl) {
      const templateOptionButton = optionTemplateEl.cloneNode(true); 
      optionsContainerEl.innerHTML = ''; 
      question.options.forEach(option => {
        const newOptionButton = templateOptionButton.cloneNode(true);
        newOptionButton.setAttribute('data-quiz-answer-option', \`\${question.id}.\${option.id}\`);
        newOptionButton.textContent = option.text;
        newOptionButton.onclick = (event) => handleOptionClick(event.currentTarget, option, question.options, newQuestionElement, feedbackEl);
        optionsContainerEl.appendChild(newOptionButton);
      });
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
        const correctButton = Array.from(optionButtons).find(btn => btn.getAttribute('data-quiz-answer-option').endsWith(correctOption.id));
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


export default function EditTestEditorPage() {
  const { t } = useLanguage();
  const params = useParams();
  const testId = params?.id as string || 'unknown';

  const [testName, setTestName] = useState(''); 
  const [questions, setQuestions] = useState<Question[]>([]);
  const [htmlContent, setHtmlContent] = useState(defaultHtmlContent);
  const [cssContent, setCssContent] = useState(defaultCssContent);
  const [quizEndMessage, setQuizEndMessage] = useState(''); 
  const [previewContent, setPreviewContent] = useState('');
  const { toast } = useToast();

  // In a real app, this useEffect would fetch data for `testId`
  useEffect(() => {
    setTestName(t('editor.defaultTestNameExisting', { testId, defaultValue: `Test ${testId}` }));
    setQuizEndMessage(t('editor.defaultEndMessage', {defaultValue: 'Congratulations! Score: {{score}}/{{total}}.'}));
    // Potentially load questions, htmlContent, cssContent for testId here
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [testId, t]);


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
      id: generateId(), type: 'multiple-choice',
      text: t('editor.newQuestionText', {number: questions.length + 1, defaultValue: `New Question ${questions.length + 1}`}),
      options: [
        { id: generateId(), text: t('editor.optionPlaceholder', {letter: 'A', defaultValue: 'Option A'}), isCorrect: false },
        { id: generateId(), text: t('editor.optionPlaceholder', {letter: 'B', defaultValue: 'Option B'}), isCorrect: false },
        { id: generateId(), text: t('editor.optionPlaceholder', {letter: 'C', defaultValue: 'Option C'}), isCorrect: false },
        { id: generateId(), text: t('editor.optionPlaceholder', {letter: 'D', defaultValue: 'Option D'}), isCorrect: false },
      ],
    };
    setQuestions((prevQuestions) => [...prevQuestions, newQuestion]);
  };

  const handleUpdateQuestionText = (questionId: string, newText: string) => setQuestions((prev) => prev.map((q) => (q.id === questionId ? { ...q, text: newText } : q)));
  const handleUpdateOptionText = (questionId: string, optionId: string, newText: string) => setQuestions((prev) => prev.map((q) => q.id === questionId ? { ...q, options: q.options.map((opt) => opt.id === optionId ? { ...opt, text: newText } : opt) } : q ));
  const handleSetCorrectOption = (questionId: string, correctOptionId: string) => setQuestions((prev) => prev.map((q) => q.id === questionId ? { ...q, options: q.options.map((opt) => ({ ...opt, isCorrect: opt.id === correctOptionId })) } : q ));
  const handleAddOption = (questionId: string) => setQuestions(prev => prev.map(q => q.id === questionId ? { ...q, options: [...q.options, { id: generateId(), text: t('editor.newOptionText', {number: q.options.length + 1, defaultValue: `New Option ${q.options.length + 1}`}), isCorrect: false }] } : q));
  const handleRemoveOption = (questionId: string, optionId: string) => setQuestions(prev => prev.map(q => q.id === questionId && q.options.length > 1 ? { ...q, options: q.options.filter(opt => opt.id !== optionId) } : q));
  const handleDeleteQuestion = (questionId: string) => setQuestions((prev) => prev.filter((q) => q.id !== questionId));

  const handleSaveTest = () => {
    const testData = { testId, testName, questions, htmlContent, cssContent, quizEndMessage };
    console.log("Saving test data (existing):", JSON.stringify(testData, null, 2));
    toast({ title: t('editor.toast.saveSuccessTitleExisting', {defaultValue: "Existing Test Data Logged"}), description: t('editor.toast.saveSuccessDescriptionExisting', {defaultValue: `Test ${testId} config logged to console.`}) });
  };
  
  const pageTitleKeyToUse = "editor.pageTitleExisting";

  return (
    <AppLayout
      currentPageTitleKey={pageTitleKeyToUse}
      currentPageTitleParams={{ testNameOrId: testName || testId }}
    >
      <div className="flex flex-col h-full">
        <header className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-semibold truncate pr-4">
             {t(pageTitleKeyToUse, { testNameOrId: testName || testId })}
          </h1>
          <div className="space-x-2 flex-shrink-0">
            <Button variant="outline" onClick={updatePreview}><Eye className="mr-2 h-4 w-4" /> {t('editor.refreshPreview', {defaultValue: 'Refresh Preview'})}</Button>
            <Button onClick={handleSaveTest}><Save className="mr-2 h-4 w-4" /> {t('editor.saveTest', {defaultValue: 'Save Test'})}</Button>
          </div>
        </header>

        <div className="grid md:grid-cols-3 gap-6 flex-1 min-h-0">
          <Card className="md:col-span-1 flex flex-col shadow-lg">
             <CardHeader>
                <CardTitle className="flex items-center"><Settings2 className="mr-2 h-5 w-5 text-primary" />{t('editor.config.title', {defaultValue: 'Configuration'})}</CardTitle>
                <CardDescription>{t('editor.config.description', {defaultValue: 'Basic settings, design inputs, and embed information.'})}</CardDescription>
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
                  <Label htmlFor="htmlContent" className="text-sm font-medium flex items-center"><Palette className="mr-2 h-4 w-4" /> {t('editor.config.htmlLabel', {defaultValue: 'HTML Structure'})}</Label>
                  <Textarea id="htmlContent" value={htmlContent} onChange={(e) => setHtmlContent(e.target.value)} className="mt-1 font-mono text-xs min-h-[200px] resize-y" rows={10} />
                </div>
                <div>
                  <Label htmlFor="cssContent" className="text-sm font-medium flex items-center"><Palette className="mr-2 h-4 w-4" /> {t('editor.config.cssLabel', {defaultValue: 'CSS Styles'})}</Label>
                  <Textarea id="cssContent" value={cssContent} onChange={(e) => setCssContent(e.target.value)} className="mt-1 font-mono text-xs min-h-[200px] resize-y" rows={10} />
                </div>
                <Separator />
                 <Card>
                  <CardHeader><CardTitle className="text-base flex items-center"><Code className="mr-2 h-4 w-4" /> {t('editor.config.embedTitle', {defaultValue: 'Embed Your Test'})}</CardTitle></CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">{t('editor.config.embedDescription', {defaultValue: 'After saving, embed code will appear here.'})}</p>
                    <Textarea readOnly value={`<iframe src="/test/${testId}/player" width="100%" height="600px" frameborder="0"></iframe>`} className="mt-2 font-mono text-xs bg-muted/50" rows={3} />
                  </CardContent>
                </Card>
              </CardContent>
            </ScrollArea>
          </Card>

          <Card className="md:col-span-1 flex flex-col overflow-hidden shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center"><Eye className="mr-2 h-5 w-5 text-primary" />{t('editor.preview.title', {defaultValue: 'Live Preview'})}</CardTitle>
              <CardDescription>{t('editor.preview.description', {defaultValue: 'Rendered output. Fully interactive.'})}</CardDescription>
            </CardHeader>
            <CardContent className="flex-grow p-0 m-0">
              <iframe srcDoc={previewContent} title="Test Preview" className="w-full h-full border-0" sandbox="allow-scripts allow-same-origin allow-popups" />
            </CardContent>
          </Card>

          <Card className="md:col-span-1 flex flex-col shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between">
              <div className="space-y-1.5">
                <CardTitle className="flex items-center"><HelpCircle className="mr-2 h-5 w-5 text-primary" />{t('editor.questions.title', {defaultValue: 'Questions'})}</CardTitle>
                <CardDescription>{t('editor.questions.description', {defaultValue: 'Add and manage questions.'})}</CardDescription>
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
                        <div className="flex justify-between items-center">
                          <CardTitle className="text-lg">{t('editor.questions.questionLabel', {number: qIndex+1, defaultValue: `Question ${qIndex + 1}`})}</CardTitle>
                          <Button variant="ghost" size="icon" onClick={() => handleDeleteQuestion(question.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div>
                          <Label htmlFor={`q-text-${question.id}`}>{t('editor.questions.questionTextLabel', {defaultValue: 'Question Text'})}</Label>
                          <Textarea id={`q-text-${question.id}`} value={question.text} onChange={(e) => handleUpdateQuestionText(question.id, e.target.value)} placeholder={t('editor.questions.questionTextPlaceholder', {defaultValue: 'Enter question text'})} className="mt-1" rows={2}/>
                        </div>
                        <p className="text-sm font-medium">{t('editor.questions.optionsLabel', {defaultValue: 'Options:'})}</p>
                        {question.options.map((option) => (
                          <div key={option.id} className="flex items-center space-x-2">
                            <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-primary" onClick={() => handleSetCorrectOption(question.id, option.id)} title={option.isCorrect ? t('editor.questions.markIncorrect', {defaultValue: "Mark as incorrect"}) : t('editor.questions.markCorrect', {defaultValue: "Mark as correct"})}>
                              {option.isCorrect ? <CheckCircle className="h-5 w-5 text-primary" /> : <Circle className="h-5 w-5" />}
                            </Button>
                            <Input value={option.text} onChange={(e) => handleUpdateOptionText(question.id, option.id, e.target.value)} placeholder={t('editor.questions.optionTextPlaceholder', {defaultValue: 'Option text'})} className="flex-grow" />
                            <Button variant="ghost" size="icon" onClick={() => handleRemoveOption(question.id, option.id)} disabled={question.options.length <= 1} title={t('editor.questions.removeOption', {defaultValue: "Remove option"})}>
                              <Trash2 className="h-4 w-4 text-destructive/70 hover:text-destructive" />
                            </Button>
                          </div>
                        ))}
                         <Button variant="outline" size="sm" onClick={() => handleAddOption(question.id)}><PlusCircle className="mr-2 h-4 w-4" /> {t('editor.questions.addOption', {defaultValue: 'Add Option'})}</Button>
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

    