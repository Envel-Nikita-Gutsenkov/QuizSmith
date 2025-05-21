
'use client';

import { useState, useEffect, useCallback } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Save, Eye, PlusCircle, Settings2, Palette, HelpCircle, Trash2, CheckCircle, Circle, Code } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import type { Question, QuestionOption } from '@/lib/types';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';

const generateId = () => Math.random().toString(36).substr(2, 9);

const defaultHtmlContent = `
<div class="quiz-container p-8 rounded-xl shadow-2xl bg-card text-card-foreground max-w-2xl mx-auto my-10">
  <h1 data-quiz-title class="text-3xl font-bold mb-8 text-primary text-center">Your Quiz Title</h1>
  
  <!-- Question Block Template: This structure will be used for each question -->
  <div data-quiz-question-id="q_template_id" class="question-block mb-10 p-6 bg-background/70 border border-border rounded-lg shadow-md transition-all duration-300 hover:shadow-lg">
    <h2 data-quiz-question-text="q_template_id" class="text-xl font-semibold mb-6 text-foreground">Sample Question: What is 2 + 2?</h2>
    <div data-quiz-options-for-question="q_template_id" class="options-grid grid grid-cols-1 md:grid-cols-2 gap-4">
      <!-- Option Button Template: This will be repeated for each answer option -->
      <button data-quiz-answer-option="q_template_id.opt_template_id" 
              class="option-button w-full text-left p-4 border border-border rounded-md text-foreground
                     hover:bg-secondary hover:border-primary hover:shadow-md 
                     focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background
                     transition-all duration-200 ease-in-out transform hover:scale-105">
        Sample Option Text
      </button>
    </div>
  </div>
  <!-- End Question Block Template -->

  <!-- Dynamically generated questions will be inserted above this comment by the preview logic -->
</div>
`;

const defaultCssContent = `
/* Custom CSS for Quiz - Leverages HSL variables from globals.css */
.quiz-container {
  font-family: var(--font-geist-sans), sans-serif;
}

.question-block {
  /* Base styles in HTML via Tailwind */
}

.option-button {
  /* Base styles in HTML via Tailwind */
  cursor: pointer;
}

/* Example of a 'selected' state for an option */
.option-button.selected {
  background-color: hsl(var(--accent));
  color: hsl(var(--accent-foreground));
  border-color: hsl(var(--accent) / 0.8);
  box-shadow: 0 0 0 2px hsl(var(--accent) / 0.5);
  transform: scale(1.02); /* Slight emphasis */
}

/* Example of a 'correct' state (if you implement feedback logic) */
.option-button.correct {
  background-color: hsl(var(--primary) / 0.9); /* Using primary, could be a specific success color */
  color: hsl(var(--primary-foreground));
  border-color: hsl(var(--primary));
}

/* Example of an 'incorrect' state */
.option-button.incorrect {
  background-color: hsl(var(--destructive) / 0.8);
  color: hsl(var(--destructive-foreground));
  border-color: hsl(var(--destructive));
  opacity: 0.7;
}

/* Subtle animation for question blocks appearing, if dynamically added */
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

.question-block {
  animation: fadeIn 0.5s ease-out forwards;
}
`;

export default function NewTestEditorPage() {
  const [testName, setTestName] = useState('My Awesome Quiz');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [htmlContent, setHtmlContent] = useState(defaultHtmlContent);
  const [cssContent, setCssContent] = useState(defaultCssContent);
  const [previewContent, setPreviewContent] = useState('');
  const { toast } = useToast();

  const updatePreview = useCallback(() => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlContent, 'text/html');

    const titleElement = doc.querySelector('[data-quiz-title]');
    if (titleElement) {
      titleElement.textContent = testName || 'Quiz Title';
    }

    const questionHost = doc.querySelector('.quiz-container'); // Assuming questions are direct children or placed specifically
    const questionTemplate = doc.querySelector('[data-quiz-question-id]');

    if (questionHost && questionTemplate) {
      const templateQuestionElement = questionTemplate.cloneNode(true) as HTMLElement;
      
      // Remove the template itself from the live DOM before adding new ones
      questionTemplate.remove();

      questions.forEach(question => {
        const newQuestionElement = templateQuestionElement.cloneNode(true) as HTMLElement;
        newQuestionElement.setAttribute('data-quiz-question-id', question.id);

        const questionTextEl = newQuestionElement.querySelector('[data-quiz-question-text]');
        if (questionTextEl) {
          questionTextEl.textContent = question.text;
          questionTextEl.setAttribute('data-quiz-question-text', question.id);
        }

        const optionsContainerEl = newQuestionElement.querySelector('[data-quiz-options-for-question]');
        const optionTemplateEl = optionsContainerEl?.querySelector('[data-quiz-answer-option]');

        if (optionsContainerEl && optionTemplateEl) {
          const templateOptionElement = optionTemplateEl.cloneNode(true) as HTMLElement;
          // Clear template options from this new question block
          optionsContainerEl.innerHTML = ''; 
          
          question.options.forEach(option => {
            const newOptionElement = templateOptionElement.cloneNode(true) as HTMLElement;
            newOptionElement.setAttribute('data-quiz-answer-option', `${question.id}.${option.id}`);
            newOptionElement.textContent = option.text;
            // Example: Add 'selected' class if option were interactive in preview
            // if (option.isCorrect) { // This is for marking, not selection state
            //    newOptionElement.classList.add('selected'); // Example for visual cue
            // }
            optionsContainerEl.appendChild(newOptionElement);
          });
        }
        questionHost.appendChild(newQuestionElement);
      });
    }
    
    const finalHtml = doc.documentElement.innerHTML;

    const stylingVariables = `
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
        --input: ${getComputedStyle(document.documentElement).getPropertyValue('--input').trim()};
        --ring: ${getComputedStyle(document.documentElement).getPropertyValue('--ring').trim()};
        --font-geist-sans: ${getComputedStyle(document.documentElement).getPropertyValue('--font-geist-sans').trim()};
      }
    `;

    setPreviewContent(`
      <html>
        <head>
          <style>
            body { margin: 0; font-family: var(--font-geist-sans, sans-serif); background-color: hsl(var(--background)); color: hsl(var(--foreground)); }
            ${stylingVariables}
            ${cssContent}
          </style>
          <script src="https://cdn.tailwindcss.com"></script>
        </head>
        <body>${finalHtml}</body>
      </html>
    `);
  }, [htmlContent, cssContent, testName, questions]);

  useEffect(() => {
    updatePreview();
  }, [updatePreview]);

  const handleAddQuestion = () => {
    const newQuestion: Question = {
      id: generateId(),
      type: 'multiple-choice',
      text: `New Question ${questions.length + 1}`,
      options: [
        { id: generateId(), text: 'Option A', isCorrect: false },
        { id: generateId(), text: 'Option B', isCorrect: false },
        { id: generateId(), text: 'Option C', isCorrect: false },
        { id: generateId(), text: 'Option D', isCorrect: false },
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
        if (q.options.length > 1) { // Ensure at least one option remains
          return { ...q, options: q.options.filter(opt => opt.id !== optionId) };
        }
      }
      return q;
    }));
  };

  const handleDeleteQuestion = (questionId: string) => {
    setQuestions((prevQuestions) => prevQuestions.filter((q) => q.id !== questionId));
  };

  const handleSaveTest = () => {
    const testData = {
      testName,
      questions,
      htmlContent,
      cssContent,
    };
    console.log("Saving test data:", JSON.stringify(testData, null, 2));
    toast({
      title: "Test Data Logged (Mock Save)",
      description: "Your test configuration has been logged to the console. Backend integration is needed for actual saving.",
    });
  };

  return (
    <AppLayout currentPageTitle={testName || "Create New Test"}>
      <div className="flex flex-col h-full">
        <header className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-semibold truncate pr-4">{testName || "New Test Editor"}</h1>
          <div className="space-x-2 flex-shrink-0">
            <Button variant="outline" onClick={updatePreview}><Eye className="mr-2 h-4 w-4" /> Update Preview</Button>
            <Button onClick={handleSaveTest}><Save className="mr-2 h-4 w-4" /> Save Test</Button>
          </div>
        </header>

        <div className="grid md:grid-cols-3 gap-6 flex-1 min-h-0">
          {/* Left Panel: Settings & Design */}
          <Card className="md:col-span-1 flex flex-col shadow-lg">
             <CardHeader>
                <CardTitle className="flex items-center"><Settings2 className="mr-2 h-5 w-5 text-primary" />Configuration</CardTitle>
                <CardDescription>Basic settings, design inputs, and embed information for your test.</CardDescription>
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
                <Separator />
                 <Card>
                  <CardHeader>
                    <CardTitle className="text-base flex items-center"><Code className="mr-2 h-4 w-4" /> Embed Your Test</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      After saving your test (backend integration required), your embed code will appear here.
                    </p>
                    <Textarea 
                      readOnly 
                      value="<iframe src='...' width='100%' height='600px' frameborder='0'></iframe>" 
                      className="mt-2 font-mono text-xs bg-muted/50 cursor-not-allowed" 
                      rows={3}
                    />
                  </CardContent>
                </Card>
              </CardContent>
            </ScrollArea>
          </Card>

          {/* Center Panel: Preview */}
          <Card className="md:col-span-1 flex flex-col overflow-hidden shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center"><Eye className="mr-2 h-5 w-5 text-primary" />Live Preview</CardTitle>
              <CardDescription>Rendered output of your HTML, CSS, and questions.</CardDescription>
            </CardHeader>
            <CardContent className="flex-grow p-0 m-0">
              <iframe
                srcDoc={previewContent}
                title="Test Preview"
                className="w-full h-full border-0"
                sandbox="allow-scripts allow-same-origin" // allow-same-origin is needed for scripts if any, and for styles to apply correctly from parent context vars
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
                    <Card key={question.id} className="shadow-md bg-card/50">
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
                              title={option.isCorrect ? "Mark as incorrect" : "Mark as correct"}
                            >
                              {option.isCorrect ? <CheckCircle className="h-5 w-5 text-primary" /> : <Circle className="h-5 w-5" />}
                            </Button>
                            <Input
                              value={option.text}
                              onChange={(e) => handleUpdateOptionText(question.id, option.id, e.target.value)}
                              placeholder="Option text"
                              className="flex-grow"
                            />
                            <Button variant="ghost" size="icon" onClick={() => handleRemoveOption(question.id, option.id)} disabled={question.options.length <= 1} title="Remove option">
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

    