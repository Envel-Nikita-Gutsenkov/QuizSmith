
'use client';

import { useState, useEffect, useCallback } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Save, Eye, PlusCircle, Settings2, Palette, HelpCircle, Trash2, CheckCircle, Circle } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import type { Question, QuestionOption } from '@/lib/types'; // Import types
import { ScrollArea } from '@/components/ui/scroll-area';

// Helper to generate unique IDs
const generateId = () => Math.random().toString(36).substr(2, 9);

export default function NewTestEditorPage() {
  const [testName, setTestName] = useState('');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [htmlContent, setHtmlContent] = useState(
`<!-- Your HTML structure here -->
<!-- Use data attributes to target elements for dynamic content -->
<div class="quiz-container p-6 rounded-lg shadow-lg bg-card text-card-foreground">
  <h1 data-quiz-title class="text-2xl font-bold mb-6 text-primary">Sample Quiz Title</h1>
  
  <!-- Question Block: Repeat this structure for each question -->
  <div data-quiz-question-id="q1" class="mb-8 p-4 border border-border rounded-md">
    <h2 data-quiz-question-text="q1" class="text-lg font-semibold mb-4 text-foreground">1. What is the capital of France?</h2>
    <div data-quiz-options-for-question="q1" class="space-y-2">
      <!-- Option Button: Repeat for each option -->
      <button data-quiz-answer-option="q1.A" class="w-full text-left p-3 border border-border rounded-md hover:bg-secondary transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary">
        A) Berlin
      </button>
      <button data-quiz-answer-option="q1.B" class="w-full text-left p-3 border border-border rounded-md hover:bg-secondary transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary">
        B) Madrid
      </button>
      <button data-quiz-answer-option="q1.C" class="w-full text-left p-3 border border-border rounded-md hover:bg-secondary transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary">
        C) Paris
      </button>
      <button data-quiz-answer-option="q1.D" class="w-full text-left p-3 border border-border rounded-md hover:bg-secondary transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary">
        D) Rome
      </button>
    </div>
  </div>
  <!-- End Question Block -->

  <!-- Example of another question structure if needed -->
  <!-- <div data-quiz-question-id="q2" class="mb-8 p-4 border rounded-md"> ... </div> -->

</div>
`
  );
  const [cssContent, setCssContent] = useState(
`/* Your CSS styles here - Use HSL variables from globals.css for theme consistency */
.quiz-container {
  font-family: var(--font-geist-sans), sans-serif;
}

[data-quiz-title] {
  /* Already styled by Tailwind, but you can add more if needed */
}

[data-quiz-question-text] {
  /* Already styled by Tailwind */
}

[data-quiz-answer-option] {
  /* Base styles applied via Tailwind classes in HTML */
  /* Add custom styles for selected/correct/incorrect states */
}

[data-quiz-answer-option]:hover {
  /* Tailwind hover:bg-secondary is used in HTML */
  /* You could add transform effects here if desired */
  /* transform: translateY(-2px); */
}

[data-quiz-answer-option].selected {
  background-color: hsl(var(--accent));
  color: hsl(var(--accent-foreground));
  border-color: hsl(var(--accent));
}

[data-quiz-answer-option].correct {
  background-color: hsl(var(--primary)); /* Or a success color */
  color: hsl(var(--primary-foreground));
  border-color: hsl(var(--primary));
}

[data-quiz-answer-option].incorrect {
  background-color: hsl(var(--destructive));
  color: hsl(var(--destructive-foreground));
  border-color: hsl(var(--destructive));
}

/* Animation example */
[data-quiz-answer-option] {
  transition: background-color 0.2s ease-in-out, border-color 0.2s ease-in-out, transform 0.1s ease-in-out;
}
[data-quiz-answer-option]:active {
  transform: scale(0.98);
}
`
  );
  const [previewContent, setPreviewContent] = useState('');

  const updatePreview = useCallback(() => {
    // For now, preview uses the static HTML/CSS.
    // Later, this could inject dynamic question data into a template.
    const fullHtml = `
      <html>
        <head>
          <style>
            /* Minimal reset and theme variables for iframe */
            body { margin: 0; font-family: var(--font-geist-sans, sans-serif); background-color: hsl(var(--background)); }
            :root {
              --background: ${getComputedStyle(document.documentElement).getPropertyValue('--background').trim()};
              --foreground: ${getComputedStyle(document.documentElement).getPropertyValue('--foreground').trim()};
              --card: ${getComputedStyle(document.documentElement).getPropertyValue('--card').trim()};
              --card-foreground: ${getComputedStyle(document.documentElement).getPropertyValue('--card-foreground').trim()};
              --primary: ${getComputedStyle(document.documentElement).getPropertyValue('--primary').trim()};
              --primary-foreground: ${getComputedStyle(document.documentElement).getPropertyValue('--primary-foreground').trim()};
              --secondary: ${getComputedStyle(document.documentElement).getPropertyValue('--secondary').trim()};
              --secondary-foreground: ${getComputedStyle(document.documentElement).getPropertyValue('--secondary-foreground').trim()};
              --accent: ${getComputedStyle(document.documentElement).getPropertyValue('--accent').trim()};
              --accent-foreground: ${getComputedStyle(document.documentElement).getPropertyValue('--accent-foreground').trim()};
              --destructive: ${getComputedStyle(document.documentElement).getPropertyValue('--destructive').trim()};
              --destructive-foreground: ${getComputedStyle(document.documentElement).getPropertyValue('--destructive-foreground').trim()};
              --border: ${getComputedStyle(document.documentElement).getPropertyValue('--border').trim()};
              --font-geist-sans: ${getComputedStyle(document.documentElement).getPropertyValue('--font-geist-sans').trim()};
            }
            ${cssContent}
          </style>
        </head>
        <body>${htmlContent}</body>
      </html>
    `;
    setPreviewContent(fullHtml);
  }, [htmlContent, cssContent]);

  useEffect(() => {
    updatePreview();
  }, [updatePreview]);

  const handleAddQuestion = () => {
    const newQuestion: Question = {
      id: generateId(),
      type: 'multiple-choice',
      text: 'New Question',
      options: [
        { id: generateId(), text: 'Option 1', isCorrect: false },
        { id: generateId(), text: 'Option 2', isCorrect: false },
        { id: generateId(), text: 'Option 3', isCorrect: false },
        { id: generateId(), text: 'Option 4', isCorrect: false },
      ],
    };
    setQuestions((prevQuestions) => [...prevQuestions, newQuestion]);
  };

  const handleUpdateQuestionText = (questionId: string, newText: string) => {
    setQuestions((prevQuestions) =>
      prevQuestions.map((q) => (q.id === questionId ? { ...q, text: newText } : q))
    );
  };

  const handleUpdateOptionText = (questionId: string, optionId: string, newText: string) => {
    setQuestions((prevQuestions) =>
      prevQuestions.map((q) =>
        q.id === questionId
          ? {
              ...q,
              options: q.options.map((opt) =>
                opt.id === optionId ? { ...opt, text: newText } : opt
              ),
            }
          : q
      )
    );
  };

  const handleSetCorrectOption = (questionId: string, correctOptionId: string) => {
    setQuestions((prevQuestions) =>
      prevQuestions.map((q) =>
        q.id === questionId
          ? {
              ...q,
              options: q.options.map((opt) => ({
                ...opt,
                isCorrect: opt.id === correctOptionId,
              })),
            }
          : q
      )
    );
  };
  
  const handleAddOption = (questionId: string) => {
    setQuestions(prevQuestions => prevQuestions.map(q => {
      if (q.id === questionId) {
        const newOption: QuestionOption = { id: generateId(), text: `New Option ${q.options.length + 1}`, isCorrect: false };
        return { ...q, options: [...q.options, newOption] };
      }
      return q;
    }));
  };

  const handleRemoveOption = (questionId: string, optionId: string) => {
    setQuestions(prevQuestions => prevQuestions.map(q => {
      if (q.id === questionId) {
        // Prevent removing the last option if desired, or ensure at least one option.
        // For now, allows removing until 0.
        return { ...q, options: q.options.filter(opt => opt.id !== optionId) };
      }
      return q;
    }));
  };


  const handleDeleteQuestion = (questionId: string) => {
    setQuestions((prevQuestions) => prevQuestions.filter((q) => q.id !== questionId));
  };

  return (
    <AppLayout currentPageTitle={testName || "Create New Test"}>
      <div className="flex flex-col h-full">
        <header className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-semibold">{testName || "New Test Editor"}</h1>
          <div className="space-x-2">
            <Button variant="outline" onClick={updatePreview}><Eye className="mr-2 h-4 w-4" /> Update Preview</Button>
            <Button><Save className="mr-2 h-4 w-4" /> Save Test</Button>
          </div>
        </header>

        <div className="grid md:grid-cols-3 gap-6 flex-1 min-h-0">
          {/* Left Panel: Settings & Design */}
          <Card className="md:col-span-1 flex flex-col shadow-lg">
             <CardHeader>
                <CardTitle className="flex items-center"><Settings2 className="mr-2 h-5 w-5 text-primary" />Configuration</CardTitle>
                <CardDescription>Basic settings and design inputs for your test.</CardDescription>
              </CardHeader>
            <ScrollArea className="flex-grow">
              <CardContent className="space-y-6 p-4">
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
            </ScrollArea>
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
                sandbox="allow-scripts allow-same-origin"
              />
            </CardContent>
          </Card>

          {/* Right Panel: Questions */}
          <Card className="md:col-span-1 flex flex-col shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between">
              <div className="space-y-1.5">
                <CardTitle className="flex items-center"><HelpCircle className="mr-2 h-5 w-5 text-primary" />Questions</CardTitle>
                <CardDescription>Add and manage questions for your test.</CardDescription>
              </div>
              <Button onClick={handleAddQuestion} size="sm">
                <PlusCircle className="mr-2 h-4 w-4" /> Add Question
              </Button>
            </CardHeader>
            <ScrollArea className="flex-grow">
              <CardContent className="space-y-4 p-4">
                {questions.length === 0 ? (
                  <div className="text-center text-muted-foreground py-10">
                    <p>No questions added yet.</p>
                    <Button variant="outline" className="mt-4" onClick={handleAddQuestion}>
                      <PlusCircle className="mr-2 h-4 w-4" /> Add First Question
                    </Button>
                  </div>
                ) : (
                  questions.map((question, qIndex) => (
                    <Card key={question.id} className="shadow-md">
                      <CardHeader>
                        <div className="flex justify-between items-center">
                          <CardTitle className="text-lg">Question {qIndex + 1}</CardTitle>
                          <Button variant="ghost" size="icon" onClick={() => handleDeleteQuestion(question.id)}>
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div>
                          <Label htmlFor={`q-text-${question.id}`}>Question Text</Label>
                          <Textarea
                            id={`q-text-${question.id}`}
                            value={question.text}
                            onChange={(e) => handleUpdateQuestionText(question.id, e.target.value)}
                            placeholder="Enter question text"
                            className="mt-1"
                            rows={2}
                          />
                        </div>
                        <p className="text-sm font-medium">Options:</p>
                        {question.options.map((option) => (
                          <div key={option.id} className="flex items-center space-x-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-muted-foreground hover:text-primary"
                              onClick={() => handleSetCorrectOption(question.id, option.id)}
                            >
                              {option.isCorrect ? <CheckCircle className="h-5 w-5 text-primary" /> : <Circle className="h-5 w-5" />}
                            </Button>
                            <Input
                              value={option.text}
                              onChange={(e) => handleUpdateOptionText(question.id, option.id, e.target.value)}
                              placeholder="Option text"
                              className="flex-grow"
                            />
                            <Button variant="ghost" size="icon" onClick={() => handleRemoveOption(question.id, option.id)} disabled={question.options.length <= 1}>
                              <Trash2 className="h-4 w-4 text-destructive/70 hover:text-destructive" />
                            </Button>
                          </div>
                        ))}
                         <Button variant="outline" size="sm" onClick={() => handleAddOption(question.id)}>
                            <PlusCircle className="mr-2 h-4 w-4" /> Add Option
                        </Button>
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
