
'use client'; 

import { useState, useEffect } from 'react'; // Added useEffect
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Save, Eye, Layers, Palette } from 'lucide-react'; // Settings2 removed as Palette is used
import { Separator } from '@/components/ui/separator';
import { useLanguage } from '@/contexts/LanguageContext'; // Added

// TODO: Translate static strings in this component using useLanguage()
export default function NewTemplateEditorPage() {
  const { t } = useLanguage(); // Added

  const [templateName, setTemplateName] = useState('');
  const [templateDescription, setTemplateDescription] = useState('');
  const [htmlContent, setHtmlContent] = useState(
    '<!-- Template HTML structure -->\n' +
    '<!-- Use placeholders like {{question_text}} or <div data-quiz-options></div> -->\n' +
    '<div class="template-container">\n' +
    '  <h2 data-template-title>{{template_title_placeholder}}</h2>\n' +
    '  <div data-quiz-question-text>{{question_text_placeholder}}</div>\n' +
    '  <div data-quiz-options-host>\n' +
    '    <!-- Options will be dynamically inserted here by the test editor -->\n' +
    '    <button class="option-button">{{option_text_placeholder_1}}</button>\n' +
    '    <button class="option-button">{{option_text_placeholder_2}}</button>\n' +
    '  </div>\n' +
    '</div>'
  );
  const [cssContent, setCssContent] = useState(
    '/* Template CSS styles */\n' +
    '.template-container {\n' +
    '  font-family: sans-serif;\n' +
    '  padding: 1rem;\n' +
    '  border: 2px dashed hsl(var(--primary));\n' +
    '  background-color: hsl(var(--card));\n' +
    '  color: hsl(var(--card-foreground));\n' +
    '}\n' +
    '.template-container h2 {\n' +
    '  color: hsl(var(--primary));\n' +
    '  margin-bottom: 0.5rem;\n' +
    '}\n' +
    '[data-quiz-question-text] {\n' +
    '  margin-bottom: 1rem;\n' +
    '  font-size: 1.1rem;\n' +
    '}\n' +
    '.option-button {\n' +
    '  display: block;\n' +
    '  width: 100%;\n' +
    '  padding: 0.75rem;\n' +
    '  margin-bottom: 0.5rem;\n' +
    '  border: 1px solid hsl(var(--border));\n' +
    '  background-color: hsl(var(--background));\n' +
    '  color: hsl(var(--foreground));\n' +
    '  border-radius: var(--radius);\n' +
    '  text-align: left;\n' +
    '  cursor: pointer;\n' +
    '}\n' +
    '.option-button:hover {\n' +
    '  background-color: hsl(var(--secondary));\n' +
    '}'
  );
  const [previewContent, setPreviewContent] = useState('');
  
  // Define page title key
  const pageTitleKey = "templateEditor.new.pageTitle"; // Example key

  const updatePreview = () => {
    let processedHtml = htmlContent
      .replace(/\{\{template_title_placeholder\}\}/g, templateName || t('templateEditor.preview.sampleTitle', {defaultValue: 'Sample Template Title'}))
      .replace(/\{\{question_text_placeholder\}\}/g, t('templateEditor.preview.sampleQuestion', {defaultValue: 'This is a sample question text.'}))
      .replace(/\{\{option_text_placeholder_1\}\}/g, t('templateEditor.preview.sampleOption1', {defaultValue: 'Sample Option 1'}))
      .replace(/\{\{option_text_placeholder_2\}\}/g, t('templateEditor.preview.sampleOption2', {defaultValue: 'Sample Option 2'}));
    
    // Inject current theme variables
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
  };
  
  useEffect(() => {
    updatePreview();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [htmlContent, cssContent, templateName, t]); // Added t to dependency array

  return (
    <AppLayout currentPageTitleKey={pageTitleKey}>
      <div className="flex flex-col h-full">
         <header className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-semibold">{t(pageTitleKey, {defaultValue: 'New Template Editor'})}</h1>
          <div className="space-x-2">
            <Button variant="outline" onClick={updatePreview}><Eye className="mr-2 h-4 w-4" /> {t('templateEditor.updatePreview', {defaultValue: 'Update Preview'})}</Button>
            <Button><Save className="mr-2 h-4 w-4" /> {t('templateEditor.saveTemplate', {defaultValue: 'Save Template'})}</Button>
          </div>
        </header>

        <div className="grid md:grid-cols-2 gap-6 flex-1 min-h-0">
          <Card className="md:col-span-1 flex flex-col overflow-y-auto shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center"><Layers className="mr-2 h-5 w-5 text-primary" />{t('templateEditor.details.title', {defaultValue: 'Template Details & Design'})}</CardTitle>
              <CardDescription>{t('templateEditor.details.description', {defaultValue: 'Define the structure and style of your reusable quiz template.'})}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 flex-grow p-4">
              <div>
                <Label htmlFor="templateName" className="text-sm font-medium">{t('templateEditor.details.nameLabel', {defaultValue: 'Template Name'})}</Label>
                <Input
                  id="templateName"
                  placeholder={t('templateEditor.details.namePlaceholder', {defaultValue: 'e.g., Modern MCQ Template'})}
                  value={templateName}
                  onChange={(e) => setTemplateName(e.target.value)}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="templateDescription" className="text-sm font-medium">{t('templateEditor.details.descriptionLabel', {defaultValue: 'Description (Optional)'})}</Label>
                <Textarea
                  id="templateDescription"
                  placeholder={t('templateEditor.details.descriptionPlaceholder', {defaultValue: 'A brief description...'})}
                  value={templateDescription}
                  onChange={(e) => setTemplateDescription(e.target.value)}
                  className="mt-1"
                  rows={3}
                />
              </div>
              <Separator/>
              <div>
                <Label htmlFor="htmlContent" className="text-sm font-medium flex items-center"><Palette className="mr-2 h-4 w-4" /> {t('templateEditor.details.htmlLabel', {defaultValue: 'HTML Structure'})}</Label>
                <Textarea
                  id="htmlContent"
                  placeholder={t('templateEditor.details.htmlPlaceholder', {defaultValue: 'Enter template HTML...'})}
                  value={htmlContent}
                  onChange={(e) => setHtmlContent(e.target.value)}
                  className="mt-1 font-mono text-xs min-h-[250px] resize-y"
                  rows={12}
                />
              </div>
              <div>
                <Label htmlFor="cssContent" className="text-sm font-medium flex items-center"><Palette className="mr-2 h-4 w-4" /> {t('templateEditor.details.cssLabel', {defaultValue: 'CSS Styles'})}</Label>
                <Textarea
                  id="cssContent"
                  placeholder={t('templateEditor.details.cssPlaceholder', {defaultValue: 'Enter template CSS...'})}
                  value={cssContent}
                  onChange={(e) => setCssContent(e.target.value)}
                  className="mt-1 font-mono text-xs min-h-[250px] resize-y"
                  rows={12}
                />
              </div>
            </CardContent>
          </Card>

          <Card className="md:col-span-1 flex flex-col overflow-hidden shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center"><Eye className="mr-2 h-5 w-5 text-primary" />{t('templateEditor.preview.titlePane', {defaultValue: 'Template Preview'})}</CardTitle>
              <CardDescription>{t('templateEditor.preview.descriptionPane', {defaultValue: 'This is how your template structure will look.'})}</CardDescription>
            </CardHeader>
            <CardContent className="flex-grow p-0 m-0">
              <iframe
                srcDoc={previewContent}
                title={t('templateEditor.preview.iframeTitle', {defaultValue: 'Template Preview'})}
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
