
'use client'; 

import { useState, useEffect, useCallback, Suspense } from 'react'; 
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Save, Eye, Layers, Palette } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { useLanguage } from '@/contexts/LanguageContext';
import { pageTemplates, DEFAULT_TEMPLATE_ID } from '@/lib/mockPageTemplates'; 
import { useToast } from '@/hooks/use-toast';
import { useSearchParams } from 'next/navigation'; // Added for query params

function NewPageTemplateEditorPageContent() {
  const { t } = useLanguage(); 
  const { toast } = useToast();
  const searchParams = useSearchParams();

  const [templateName, setTemplateName] = useState('');
  const [templateDescription, setTemplateDescription] = useState('');
  const [htmlContent, setHtmlContent] = useState('');
  const [cssContent, setCssContent] = useState('');
  const [previewContent, setPreviewContent] = useState('');
  const [sourceTemplateName, setSourceTemplateName] = useState<string | null>(null);
  
  useEffect(() => {
    const sourceTemplateId = searchParams.get('from');
    let initialTemplate = pageTemplates.find(pt => pt.id === DEFAULT_TEMPLATE_ID); // Default to Blank Canvas

    if (sourceTemplateId) {
      const foundSourceTemplate = pageTemplates.find(pt => pt.id === sourceTemplateId);
      if (foundSourceTemplate) {
        initialTemplate = foundSourceTemplate;
        setTemplateName(t('pageTemplateEditor.new.pageTitleFromSource', { sourceName: foundSourceTemplate.name, defaultValue: `Copy of ${foundSourceTemplate.name}`}));
        setTemplateDescription(foundSourceTemplate.description || '');
        setSourceTemplateName(foundSourceTemplate.name); // For dynamic title
      } else {
        toast({
          title: t('pageTemplateEditor.toast.loadErrorTitle', {defaultValue: 'Load Error'}),
          description: t('pageTemplateEditor.toast.loadErrorDescription', {templateId: sourceTemplateId, defaultValue: `Could not load template "${sourceTemplateId}" to duplicate. Starting with a blank canvas.`}),
          variant: 'destructive',
        });
        setTemplateName(t('pageTemplateEditor.details.namePlaceholder', {defaultValue: 'My New Page Template'}));
      }
    } else {
      setTemplateName(t('pageTemplateEditor.details.namePlaceholder', {defaultValue: 'My New Page Template'}));
    }
    
    if (initialTemplate) {
      setHtmlContent(initialTemplate.htmlContent);
      setCssContent(initialTemplate.cssContent);
      // Only set default description if not duplicating and the initial template is the default blank canvas
      if (!sourceTemplateId && initialTemplate.id === DEFAULT_TEMPLATE_ID) { 
          setTemplateDescription(initialTemplate.description || '');
      } else if (!sourceTemplateId) { // If starting new (not duplicating) and it's not default blank, clear description
          setTemplateDescription('');
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, t, toast]); // toast dependency for error message

  const updatePreview = useCallback(() => {
    let processedHtml = htmlContent
      .replace(/\{\{template_title_placeholder\}\}/g, templateName || t('pageTemplateEditor.preview.sampleTitle', {defaultValue: 'Sample Page Template Title'}))
      .replace(/\{\{question_text_placeholder\}\}/g, t('pageTemplateEditor.preview.sampleQuestion', {defaultValue: 'This is where question content would appear.'}))
      .replace(/\{\{option_text_placeholder_1\}\}/g, t('pageTemplateEditor.preview.sampleOption1', {defaultValue: 'Sample Option 1'}))
      .replace(/\{\{option_text_placeholder_2\}\}/g, t('pageTemplateEditor.preview.sampleOption2', {defaultValue: 'Sample Option 2'}));
    
    const stylingVariables = `
      :root {
        --background: ${getComputedStyle(document.documentElement).getPropertyValue('--background').trim()};
        --foreground: ${getComputedStyle(document.documentElement).getPropertyValue('--foreground').trim()};
        --card: ${getComputedStyle(document.documentElement).getPropertyValue('--card').trim()};
        --card-foreground: ${getComputedStyle(document.documentElement).getPropertyValue('--card-foreground').trim()};
        --primary: ${getComputedStyle(document.documentElement).getPropertyValue('--primary').trim()};
        --secondary: ${getComputedStyle(document.documentElement).getPropertyValue('--secondary').trim()};
        --border: ${getComputedStyle(document.documentElement).getPropertyValue('--border').trim()};
        --radius: ${getComputedStyle(document.documentElement).getPropertyValue('--radius').trim()};
        --font-geist-sans: ${getComputedStyle(document.documentElement).getPropertyValue('--font-geist-sans').trim() || 'Arial, sans-serif'};
      }
    `;

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
    console.log("Saving new page template:", { templateName, templateDescription, htmlContent, cssContent });
    toast({ title: t('pageTemplateEditor.toast.saveSuccessTitle'), description: t('pageTemplateEditor.toast.saveSuccessDescription', { templateName }) });
  };

  const pageTitleKey = sourceTemplateName 
    ? "pageTemplateEditor.new.pageTitleFromSource" 
    : "pageTemplateEditor.new.pageTitle";
  const pageTitleParams = sourceTemplateName ? { sourceName: sourceTemplateName } : {defaultValue: t('pageTemplateEditor.new.pageTitle')};


  return (
    <AppLayout currentPageTitleKey={pageTitleKey} currentPageTitleParams={pageTitleParams}>
      <div className="flex flex-col h-full">
         <header className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-semibold">{t(pageTitleKey, pageTitleParams || {defaultValue: 'New Page Template'})}</h1>
          <div className="space-x-2">
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
                  You can include &lt;script&gt; tags here for template-specific JavaScript and animations.
                  Ensure your HTML includes key placeholders like <code>&lt;div id="quiz-content-host"&gt;&lt;/div&gt;</code> 
                  and a question template block like <code>&lt;div data-quiz-question-id="q_template_id"&gt;...&lt;/div&gt;</code> 
                  for the quiz logic to function.
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
                  Define your CSS animations and styles here. These will be applied to your HTML structure.
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

