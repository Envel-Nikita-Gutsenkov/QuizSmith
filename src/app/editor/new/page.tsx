
'use client'; // Required for useState, useEffect

import { useState, useEffect, useCallback } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Save, Eye, PlusCircle, Settings2, Palette, HelpCircle } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

export default function NewTestEditorPage() {
  const [testName, setTestName] = useState('');
  const [htmlContent, setHtmlContent] = useState(
`<!-- Your HTML structure here -->
<div class="quiz-container">
  <h1 data-quiz-title>Test Title</h1>
  <div data-quiz-question="1"></div>
  <div data-quiz-options-for-question="1">
    <button data-quiz-answer-option="1.A"></button>
    <button data-quiz-answer-option="1.B"></button>
  </div>
</div>`
  );
  const [cssContent, setCssContent] = useState(
`/* Your CSS styles here */
.quiz-container {
  padding: 20px;
  border: 1px solid #ccc;
  border-radius: 8px;
}

[data-quiz-title] {
  color: hsl(var(--primary));
}`
  );
  const [previewContent, setPreviewContent] = useState('');

  const updatePreview = useCallback(() => {
    const fullHtml = `
      <html>
        <head>
          <style>${cssContent}</style>
        </head>
        <body>${htmlContent}</body>
      </html>
    `;
    setPreviewContent(fullHtml);
  }, [htmlContent, cssContent]);

  // Update preview when HTML or CSS changes
  useEffect(() => {
    updatePreview();
  }, [htmlContent, cssContent, updatePreview]);


  return (
    <AppLayout currentPageTitle="Create New Test">
      <div className="flex flex-col h-full">
        <header className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-semibold">New Test Editor</h1>
          <div className="space-x-2">
            <Button variant="outline" onClick={updatePreview}><Eye className="mr-2 h-4 w-4" /> Update Preview</Button>
            <Button><Save className="mr-2 h-4 w-4" /> Save Test</Button>
          </div>
        </header>

        <div className="grid md:grid-cols-3 gap-6 flex-1 min-h-0">
          {/* Left Panel: Settings & Design */}
          <Card className="md:col-span-1 flex flex-col overflow-y-auto shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center"><Settings2 className="mr-2 h-5 w-5 text-primary" />Configuration</CardTitle>
              <CardDescription>Basic settings and design inputs for your test.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 flex-grow p-4">
              <div>
                <Label htmlFor="testName" className="text-sm font-medium">Test Name</Label>
                <Input
                  id="testName"
                  placeholder="e.g., General Knowledge Quiz"
                  value={testName}
                  onChange={(e) => setTestName(e.target.value)}
                  className="mt-1"
                />
              </div>
              <Separator />
              <div>
                <Label htmlFor="htmlContent" className="text-sm font-medium flex items-center"><Palette className="mr-2 h-4 w-4" /> HTML Structure</Label>
                 <Textarea
                  id="htmlContent"
                  placeholder="Enter your HTML code here..."
                  value={htmlContent}
                  onChange={(e) => setHtmlContent(e.target.value)}
                  className="mt-1 font-mono text-xs min-h-[200px] resize-y"
                  rows={10}
                />
              </div>
              <div>
                <Label htmlFor="cssContent" className="text-sm font-medium flex items-center"><Palette className="mr-2 h-4 w-4" /> CSS Styles</Label>
                <Textarea
                  id="cssContent"
                  placeholder="Enter your CSS code here..."
                  value={cssContent}
                  onChange={(e) => setCssContent(e.target.value)}
                  className="mt-1 font-mono text-xs min-h-[200px] resize-y"
                  rows={10}
                />
              </div>
            </CardContent>
          </Card>

          {/* Center Panel: Preview */}
          <Card className="md:col-span-1 flex flex-col overflow-hidden shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center"><Eye className="mr-2 h-5 w-5 text-primary" />Live Preview</CardTitle>
              <CardDescription>Rendered output of your HTML and CSS design.</CardDescription>
            </CardHeader>
            <CardContent className="flex-grow p-0 m-0">
              <iframe
                srcDoc={previewContent}
                title="Test Preview"
                className="w-full h-full border-0"
                sandbox="allow-scripts allow-same-origin" // Be cautious with allow-scripts
              />
            </CardContent>
          </Card>

          {/* Right Panel: Questions */}
          <Card className="md:col-span-1 flex flex-col overflow-y-auto shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center"><HelpCircle className="mr-2 h-5 w-5 text-primary" />Questions</CardTitle>
               <CardDescription>Add and manage questions for your test.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 flex-grow p-4">
              <div className="text-center text-muted-foreground py-10">
                <p>No questions added yet.</p>
                <Button variant="outline" className="mt-4">
                  <PlusCircle className="mr-2 h-4 w-4" /> Add Question
                </Button>
              </div>
              {/* Placeholder for question list and editor */}
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}
