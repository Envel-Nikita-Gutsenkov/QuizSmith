
'use client'; 

import { useState, useEffect, useCallback, Suspense } from 'react'; 
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Save, Eye, Layers, Palette, CloudOff } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { useLanguage } from '@/contexts/LanguageContext';
import { pageTemplates, DEFAULT_TEMPLATE_ID } from '@/lib/mockPageTemplates'; 
import { useToast } from '@/hooks/use-toast';
import { useSearchParams, useRouter } from 'next/navigation'; // Added useRouter
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';


interface PageTemplateDraft {
  name: string;
  description: string;
  htmlContent: string;
  cssContent: string;
}

function NewPageTemplateEditorPageContent() {
  const { t } = useLanguage(); 
  const { toast } = useToast();
  const searchParams = useSearchParams();
  const router = useRouter(); // Added router

  const [templateName, setTemplateName] = useState('');
  const [templateDescription, setTemplateDescription] = useState('');
  const [htmlContent, setHtmlContent] = useState('');
  const [cssContent, setCssContent] = useState('');
  const [previewContent, setPreviewContent] = useState('');
  const [sourceTemplateName, setSourceTemplateName] = useState<string | null>(null);
  
  const [hasUnsavedDraft, setHasUnsavedDraft] = useState(false);
  const localStorageKey = 'quizsmith-new-template-draft';
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [debounceTimer, setDebounceTimer] = useState<NodeJS.Timeout | null>(null);

  // Load from localStorage on mount
  useEffect(() => {
    if (!isInitialLoad) return;

    const savedDraft = localStorage.getItem(localStorageKey);
    const sourceTemplateId = searchParams.get('from');
    let templateToLoad: typeof pageTemplates[0] | undefined = undefined;
    let isDuplicating = false;

    if (savedDraft) {
      try {
        const draft: PageTemplateDraft = JSON.parse(savedDraft);
        setTemplateName(draft.name);
        setTemplateDescription(draft.description);
        setHtmlContent(draft.htmlContent);
        setCssContent(draft.cssContent);
        setHasUnsavedDraft(true);
        toast({ title: t('pageTemplateEditor.toast.draftRestoredTitle'), description: t('pageTemplateEditor.toast.draftRestoredDescriptionNew') });
        setIsInitialLoad(false);
        return;
      } catch (e) {
        console.error("Failed to parse template draft from localStorage", e);
        localStorage.removeItem(localStorageKey); // Clear corrupted draft
      }
    }
    
    if (sourceTemplateId) {
      templateToLoad = pageTemplates.find(pt => pt.id === sourceTemplateId);
      isDuplicating = true;
      if (templateToLoad) {
        const newNameDefault = "Copy of " + templateToLoad.name;
        setTemplateName(t('pageTemplateEditor.new.pageTitleFromSource', { sourceName: templateToLoad.name, defaultValue: newNameDefault }));
        setTemplateDescription(templateToLoad.description || '');
        setSourceTemplateName(templateToLoad.name); 
        setHtmlContent(templateToLoad.htmlContent);
        setCssContent(templateToLoad.cssContent);
        setHasUnsavedDraft(true); 
      } else {
        const loadErrorDescDefault = "Could not load template \"" + sourceTemplateId + "\" to duplicate. Starting with a blank canvas.";
        toast({
          title: t('pageTemplateEditor.toast.loadErrorTitle'),
          description: t('pageTemplateEditor.toast.loadErrorDescription', {templateId: sourceTemplateId, defaultValue: loadErrorDescDefault}),
          variant: 'destructive',
        });
        templateToLoad = pageTemplates.find(pt => pt.id === DEFAULT_TEMPLATE_ID);
      }
    } else {
      templateToLoad = pageTemplates.find(pt => pt.id === DEFAULT_TEMPLATE_ID);
      setTemplateName(t('pageTemplateEditor.details.namePlaceholder', {defaultValue: 'My New Quiz Engine Template'}));
    }
    
    if (templateToLoad && !isDuplicating) { 
      setHtmlContent(templateToLoad.htmlContent);
      setCssContent(templateToLoad.cssContent);
      if (templateToLoad.id === DEFAULT_TEMPLATE_ID || !templateToLoad.description) { 
          setTemplateDescription(templateToLoad.description || '');
      } else {
          setTemplateDescription(''); // Clear description for non-default duplicated templates
      }
    }
    setIsInitialLoad(false);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, t, toast]); // isInitialLoad removed from deps

  // Save to localStorage on change (debounced)
  useEffect(() => {
    if (isInitialLoad) return; 

    if (debounceTimer) clearTimeout(debounceTimer);

    const timer = setTimeout(() => {
      const draft: PageTemplateDraft = { name: templateName, description: templateDescription, htmlContent, cssContent };
      localStorage.setItem(localStorageKey, JSON.stringify(draft));
      setHasUnsavedDraft(true);
    }, 1000);
    setDebounceTimer(timer);

    return () => {
      if (timer) clearTimeout(timer);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [templateName, templateDescription, htmlContent, cssContent, isInitialLoad]);


  const updatePreview = useCallback(() => {
    // For template editor preview, replace quiz data placeholders with sample static text
    let processedHtml = htmlContent
      .replace(/<script id="quiz-data" type="application\/json">.*<\/script>/s, '<script id="quiz-data" type="application/json">[]<\/script>') // Empty questions
      .replace(/<div id="quiz-name-data"[^>]*>.*<\/div>/s, `<div id="quiz-name-data" style="display:none;">${templateName || t('pageTemplateEditor.preview.sampleTitle')}</div>`)
      .replace(/<div id="quiz-end-message-data"[^>]*>.*<\/div>/s, '<div id="quiz-end-message-data" style="display:none;">Sample end message.</div>');
    
    // The template's own JS engine will run. If it relies on {{placeholders}} for preview, they should be defined or handled.
    // For simplicity, we're assuming the engine is robust enough or the primary preview is for HTML/CSS structure.
    
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
            --secondary: ${rootStyle.getPropertyValue('--secondary').trim()};
            --border: ${rootStyle.getPropertyValue('--border').trim()};
            --radius: ${rootStyle.getPropertyValue('--radius').trim()};
            --font-geist-sans: ${rootStyle.getPropertyValue('--font-geist-sans').trim() || 'Arial, sans-serif'};
          }
        `;
    }

    const fullHtml = `
      <html>
        <head>
          <meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
          <script src="https://cdn.tailwindcss.com"><\/script>
          <style>
            ${stylingVariables}
            body { margin: 0; font-family: var(--font-geist-sans); background-color: hsl(var(--background)); }
            ${cssContent}
          </style>
        </head>
        <body>${processedHtml}</body>
      </html>
    `;
    setPreviewContent(fullHtml);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [htmlContent, cssContent, templateName, t]); 
  
  useEffect(() => {
    updatePreview();
  }, [updatePreview]);

  const handleSaveTemplate = () => {
    const newTemplateId = 'tpl-' + generateId();
    // In a real app, this would save to a backend. For now, it's a mock save.
    console.log("Saving new page template:", { id: newTemplateId, templateName, templateDescription, htmlContent, cssContent });
    toast({ title: t('pageTemplateEditor.toast.saveSuccessTitle'), description: t('pageTemplateEditor.toast.saveSuccessDescription', { templateName }) });
    localStorage.removeItem(localStorageKey);
    setHasUnsavedDraft(false);
    // Navigate to the edit page of the "saved" template
    router.push(`/templates/editor/${newTemplateId}`);
  };

  const pageTitleKey = sourceTemplateName 
    ? "pageTemplateEditor.new.pageTitleFromSource" 
    : "pageTemplateEditor.new.pageTitle";
  const pageTitleParams = sourceTemplateName ? { sourceName: sourceTemplateName } : {defaultValue: t('pageTemplateEditor.new.pageTitle')};


  return (
    <AppLayout currentPageTitleKey={pageTitleKey} currentPageTitleParams={pageTitleParams}>
      <div className="flex flex-col h-full">
         <header className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-semibold">{t(pageTitleKey, pageTitleParams || {defaultValue: 'New Quiz Engine Template'})}</h1>
          <div className="space-x-2 flex items-center">
            {hasUnsavedDraft && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <CloudOff className="h-5 w-5 text-muted-foreground" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>{t('pageTemplateEditor.unsavedDraftTooltip')}</p>
                </TooltipContent>
              </Tooltip>
            )}
            <Button variant="outline" onClick={updatePreview}><Eye className="mr-2 h-4 w-4" /> {t('pageTemplateEditor.updatePreview')}</Button>
            <Button onClick={handleSaveTemplate}><Save className="mr-2 h-4 w-4" /> {t('pageTemplateEditor.saveTemplate')}</Button>
          </div>
        </header>

        <div className="grid md:grid-cols-2 gap-6 flex-1 min-h-0">
          <Card className="md:col-span-1 flex flex-col overflow-y-auto shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center"><Layers className="mr-2 h-5 w-5 text-primary" />{t('pageTemplateEditor.details.title')}</CardTitle>
              <CardDescription>{t('pageTemplateEditor.details.description')}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 flex-grow p-4">
              <div>
                <Label htmlFor="templateName" className="text-sm font-medium">{t('pageTemplateEditor.details.nameLabel')}</Label>
                <Input
                  id="templateName"
                  placeholder={t('pageTemplateEditor.details.namePlaceholder')}
                  value={templateName}
                  onChange={(e) => setTemplateName(e.target.value)}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="templateDescription" className="text-sm font-medium">{t('pageTemplateEditor.details.descriptionLabel')}</Label>
                <Textarea
                  id="templateDescription"
                  placeholder={t('pageTemplateEditor.details.descriptionPlaceholder')}
                  value={templateDescription}
                  onChange={(e) => setTemplateDescription(e.target.value)}
                  className="mt-1"
                  rows={3}
                />
              </div>
              <Separator/>
              <div>
                <Label htmlFor="htmlContent" className="text-sm font-medium flex items-center"><Palette className="mr-2 h-4 w-4" /> {t('pageTemplateEditor.details.htmlLabel')}</Label>
                <Textarea
                  id="htmlContent"
                  placeholder={t('pageTemplateEditor.details.htmlPlaceholder')}
                  value={htmlContent}
                  onChange={(e) => setHtmlContent(e.target.value)}
                  className="mt-1 font-mono text-xs min-h-[250px] resize-y"
                  rows={12}
                />
                 <p className="text-xs text-muted-foreground mt-1">
                  {t('pageTemplateEditor.details.htmlHint')}
                </p>
              </div>
              <div>
                <Label htmlFor="cssContent" className="text-sm font-medium flex items-center"><Palette className="mr-2 h-4 w-4" /> {t('pageTemplateEditor.details.cssLabel')}</Label>
                <Textarea
                  id="cssContent"
                  placeholder={t('pageTemplateEditor.details.cssPlaceholder')}
                  value={cssContent}
                  onChange={(e) => setCssContent(e.target.value)}
                  className="mt-1 font-mono text-xs min-h-[250px] resize-y"
                  rows={12}
                />
                <p className="text-xs text-muted-foreground mt-1">
                   {t('pageTemplateEditor.details.cssHint')}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="md:col-span-1 flex flex-col overflow-hidden shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center"><Eye className="mr-2 h-5 w-5 text-primary" />{t('pageTemplateEditor.preview.titlePane')}</CardTitle>
              <CardDescription>{t('pageTemplateEditor.preview.descriptionPane')}</CardDescription>
            </CardHeader>
            <CardContent className="flex-grow p-0 m-0">
              <iframe
                srcDoc={previewContent}
                title={t('pageTemplateEditor.preview.iframeTitle')}
                className="w-full h-full border-0"
                sandbox="allow-scripts allow-same-origin"
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}

export default function NewPageTemplateEditorPage() {
  return (
    <Suspense fallback={<div>Loading template editor...</div>}>
      <NewPageTemplateEditorPageContent />
    </Suspense>
  );
}
