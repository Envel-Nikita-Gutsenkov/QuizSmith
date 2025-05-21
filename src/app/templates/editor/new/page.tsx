'use client'; // Required for useState, useEffect

import { useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Save, Eye, Settings2, Palette, Layers } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

export default function NewTemplateEditorPage() {
  const [templateName, setTemplateName] = useState('');
  const [templateDescription, setTemplateDescription] = useState('');
  const [htmlContent, setHtmlContent] = useState('<!-- Template HTML structure -->\n<!-- Use placeholders like {{question_text}} or <div data-quiz-options></div> -->\n<div class="template-container">\n  <h2>{{template_title}}</h2>\n  <div data-quiz-question-area></div>\n</div>');
  const [cssContent, setCssContent] = useState('/* Template CSS styles */\n.template-container {\n  font-family: sans-serif;\n  padding: 1rem;\n  border: 2px dashed hsl(var(--primary));\n}');
  const [previewContent, setPreviewContent] = useState('');

  const updatePreview = () => {
    // In a real scenario, you'd replace placeholders with sample data
    let processedHtml = htmlContent
      .replace(/\{\{template_title\}\}/g, 'Sample Template Title')
      // Add more placeholder processing as needed
    
    const fullHtml = `
      <html>
        <head>
          <style>
            :root {
              --primary: 217 91% 57%;
              /* Add other necessary theme variables if your CSS uses them */
            }
            body { margin: 0; font-family: var(--font-geist-sans); }
            ${cssContent}
          </style>
        </head>
        <body>${processedHtml}</body>
      </html>
    `;
    setPreviewContent(fullHtml);
  };
  
  useState(() => {
    updatePreview();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  });

  return (
    <AppLayout currentPageTitle="Create New Template">
      <div className="flex flex-col h-full">
         <header className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-semibold">New Template Editor</h1>
          <div className="space-x-2">
            <Button variant="outline" onClick={updatePreview}><Eye className="mr-2 h-4 w-4" /> Update Preview</Button>
            <Button><Save className="mr-2 h-4 w-4" /> Save Template</Button>
          </div>
        </header>

        <div className="grid md:grid-cols-2 gap-6 flex-1 min-h-0">
          {/* Left Panel: Settings & Design */}
          <Card className="md:col-span-1 flex flex-col overflow-y-auto shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center"><Layers className="mr-2 h-5 w-5 text-primary" />Template Details & Design</CardTitle>
              <CardDescription>Define the structure and style of your reusable quiz template.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 flex-grow p-4">
              <div>
                <Label htmlFor="templateName" className="text-sm font-medium">Template Name</Label>
                <Input
                  id="templateName"
                  placeholder="e.g., Modern MCQ Template"
                  value={templateName}
                  onChange={(e) => setTemplateName(e.target.value)}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="templateDescription" className="text-sm font-medium">Description (Optional)</Label>
                <Textarea
                  id="templateDescription"
                  placeholder="A brief description of this template..."
                  value={templateDescription}
                  onChange={(e) => setTemplateDescription(e.target.value)}
                  className="mt-1"
                  rows={3}
                />
              </div>
              <Separator/>
              <div>
                <Label htmlFor="htmlContent" className="text-sm font-medium flex items-center"><Palette className="mr-2 h-4 w-4" /> HTML Structure</Label>
                <Textarea
                  id="htmlContent"
                  placeholder="Enter template HTML. Use placeholders like {{question_title}}."
                  value={htmlContent}
                  onChange={(e) => setHtmlContent(e.target.value)}
                  className="mt-1 font-mono text-xs min-h-[250px] resize-y"
                  rows={12}
                />
              </div>
              <div>
                <Label htmlFor="cssContent" className="text-sm font-medium flex items-center"><Palette className="mr-2 h-4 w-4" /> CSS Styles</Label>
                <Textarea
                  id="cssContent"
                  placeholder="Enter template CSS."
                  value={cssContent}
                  onChange={(e) => setCssContent(e.target.value)}
                  className="mt-1 font-mono text-xs min-h-[250px] resize-y"
                  rows={12}
                />
              </div>
            </CardContent>
          </Card>

          {/* Right Panel: Preview */}
          <Card className="md:col-span-1 flex flex-col overflow-hidden shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center"><Eye className="mr-2 h-5 w-5 text-primary" />Template Preview</CardTitle>
              <CardDescription>This is how your template structure will look.</CardDescription>
            </CardHeader>
            <CardContent className="flex-grow p-0 m-0">
              <iframe
                srcDoc={previewContent}
                title="Template Preview"
                className="w-full h-full border-0"
                sandbox="allow-scripts allow-same-origin" // Be cautious with allow-scripts
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}
