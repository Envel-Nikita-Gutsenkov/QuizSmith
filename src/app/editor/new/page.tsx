
'use client';

import { useState, useEffect, useCallback } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Save, Eye, PlusCircle, Settings2, Palette, HelpCircle, Trash2, CheckCircle, Circle, Code, MessageSquareText } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import type { Question, QuestionOption } from '@/lib/types';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';

const generateId = () => Math.random().toString(36).substr(2, 9);

const defaultHtmlContent = `
<div class="quiz-container p-8 rounded-xl shadow-2xl bg-card text-card-foreground max-w-2xl mx-auto my-10">
  <h1 data-quiz-title class="text-3xl font-bold mb-8 text-primary text-center">Your Quiz Title</h1>
  
  <!-- This div will host the active question or the end screen -->
  <div id="quiz-content-host">
    <!-- Question Block Template: This structure will be cloned by JS for each question -->
    <!-- It should be initially present for JS to find, then JS can remove/hide the template itself -->
    <div data-quiz-question-id="q_template_id" class="question-block mb-10 p-6 bg-background/70 border border-border rounded-lg shadow-md transition-all duration-300 hover:shadow-lg" style="display: none;">
      <h2 data-quiz-question-text="q_template_id" class="text-xl font-semibold mb-6 text-foreground">Sample Question: What is 2 + 2?</h2>
      <div data-quiz-options-for-question="q_template_id" class="options-grid grid grid-cols-1 md:grid-cols-2 gap-4">
        <!-- Option Button Template: This will be cloned by JS for each answer option -->
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
  </div>

  <!-- Data will be embedded here by the updatePreview function -->
  <script id="quiz-data" type="application/json"></script>
  <div id="quiz-end-message-text" style="display:none;"></div>

  <!-- Main Quiz Logic Script will be embedded here by updatePreview -->
</div>
`;

const defaultCssContent = `
/* Custom CSS for Quiz - Leverages HSL variables from globals.css */
body {
  background-color: hsl(var(--background)); /* Ensures iframe bg matches theme */
  color: hsl(var(--foreground));
  font-family: var(--font-geist-sans, sans-serif);
}

.quiz-container {
  font-family: var(--font-geist-sans), sans-serif;
}

.question-block {
  /* Base styles in HTML via Tailwind */
  opacity: 1;
  transform: translateX(0);
  transition: opacity 0.5s ease-out, transform 0.5s ease-out;
}

.option-button {
  /* Base styles in HTML via Tailwind */
  cursor: pointer;
}

.option-button.selected {
  background-color: hsl(var(--accent));
  color: hsl(var(--accent-foreground));
  border-color: hsl(var(--accent) / 0.8);
  box-shadow: 0 0 0 2px hsl(var(--accent) / 0.5);
  transform: scale(1.02); /* Slight emphasis */
}

.option-button.correct-answer {
  background-color: hsl(var(--primary)) !important;
  color: hsl(var(--primary-foreground)) !important;
  border-color: hsl(var(--primary)) !important;
  box-shadow: 0 0 0 3px hsl(var(--primary) / 0.7);
}

.option-button.incorrect-answer-selected {
  background-color: hsl(var(--destructive)) !important;
  color: hsl(var(--destructive-foreground)) !important;
  border-color: hsl(var(--destructive)) !important;
  box-shadow: 0 0 0 3px hsl(var(--destructive) / 0.7);
  opacity: 0.9;
}

.option-button.correct-answer-unselected {
  /* For highlighting the actual correct answer when user chose wrong */
  /* Keep it subtle, maybe just a strong border or slightly different bg */
  border: 2px solid hsl(var(--primary)) !important;
  background-color: hsl(var(--primary) / 0.1) !important;
  /* animation: pulse-green 1.5s infinite alternate; */
}


@keyframes pulse-green {
  from { box-shadow: 0 0 0 0px hsl(var(--primary) / 0.4); }
  to { box-shadow: 0 0 0 5px hsl(var(--primary) / 0.0); }
}


/* Question transition animations */
.animate-slide-out-left {
  opacity: 0 !important;
  transform: translateX(-50px) !important;
}

.animate-slide-in-right {
  opacity: 0;
  transform: translateX(50px);
  animation: slideInFromRight 0.5s ease-out forwards;
}

@keyframes slideInFromRight {
  from { opacity: 0; transform: translateX(50px); }
  to { opacity: 1; transform: translateX(0); }
}

.animate-fade-in {
  opacity: 0;
  animation: fadeIn 0.5s ease-out forwards;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

#quiz-end-screen {
  /* Styles for the end screen card, using Tailwind in JS for now */
}
`;

const quizLogicScript = `
document.addEventListener('DOMContentLoaded', () => {
  const questionsDataElement = document.getElementById('quiz-data');
  const endMessageElement = document.getElementById('quiz-end-message-text');
  
  if (!questionsDataElement || !endMessageElement) {
    console.error('Quiz data or end message element not found.');
    return;
  }

  const questions = JSON.parse(questionsDataElement.textContent || '[]');
  const rawQuizEndMessage = endMessageElement.textContent || 'Quiz Finished! Score: {{score}}/{{total}}';

  const quizContainer = document.querySelector('.quiz-container');
  const questionHost = document.getElementById('quiz-content-host');
  const questionTemplateElement = quizContainer.querySelector('[data-quiz-question-id="q_template_id"]');

  if (!quizContainer || !questionHost || !questionTemplateElement) {
    console.error('Essential quiz layout elements not found in HTML structure.');
    if (questionHost) questionHost.innerHTML = '<p class="text-center text-muted-foreground p-8">Error: Quiz structure incomplete in HTML template.</p>';
    return;
  }
  questionTemplateElement.remove(); // Remove the original template from DOM after cloning its HTML

  let currentQuestionIndex = 0;
  let score = 0;
  let activeQuestionElement = null;

  function displayQuestion(index) {
    if (activeQuestionElement) {
      activeQuestionElement.classList.add('animate-slide-out-left');
      setTimeout(() => {
        activeQuestionElement.remove();
        activeQuestionElement = null;
        if (index >= questions.length) {
          displayEndScreen();
        } else {
          renderQuestion(index);
        }
      }, 500); // Match CSS animation duration
    } else {
      if (index >= questions.length) {
        displayEndScreen();
      } else {
        renderQuestion(index);
      }
    }
  }
  
  function renderQuestion(index) {
    const question = questions[index];
    const newQuestionElement = questionTemplateElement.cloneNode(true);
    newQuestionElement.style.display = 'block'; // Make sure cloned template is visible
    newQuestionElement.setAttribute('data-quiz-question-id', question.id);

    const questionTextEl = newQuestionElement.querySelector('[data-quiz-question-text]');
    if (questionTextEl) {
      questionTextEl.textContent = question.text;
      questionTextEl.setAttribute('data-quiz-question-text', question.id);
    }

    const optionsContainerEl = newQuestionElement.querySelector('[data-quiz-options-for-question]');
    const optionTemplateEl = questionTemplateElement.querySelector('[data-quiz-answer-option]'); // Use original template for option button

    if (optionsContainerEl && optionTemplateEl) {
      const templateOptionButton = optionTemplateEl.cloneNode(true);
      optionsContainerEl.innerHTML = ''; 
      
      question.options.forEach(option => {
        const newOptionButton = templateOptionButton.cloneNode(true);
        newOptionButton.setAttribute('data-quiz-answer-option', \`\${question.id}.\${option.id}\`);
        newOptionButton.textContent = option.text;
        newOptionButton.onclick = (event) => handleOptionClick(event.currentTarget, option, question.options, newQuestionElement);
        optionsContainerEl.appendChild(newOptionButton);
      });
    }
    
    questionHost.appendChild(newQuestionElement);
    activeQuestionElement = newQuestionElement;
    newQuestionElement.classList.add('animate-slide-in-right');
  }

  function handleOptionClick(selectedButton, selectedOption, allOptions, questionElement) {
    const optionButtons = questionElement.querySelectorAll('.option-button');
    optionButtons.forEach(btn => btn.disabled = true);

    const isCorrect = selectedOption.isCorrect;
    const correctOption = allOptions.find(opt => opt.isCorrect);

    if (isCorrect) {
      selectedButton.classList.add('correct-answer');
      score++;
    } else {
      selectedButton.classList.add('incorrect-answer-selected');
      if (correctOption) {
        const correctButton = Array.from(optionButtons).find(btn => btn.getAttribute('data-quiz-answer-option').endsWith(correctOption.id));
        if (correctButton) {
          correctButton.classList.add('correct-answer-unselected');
        }
      }
    }

    setTimeout(() => {
      currentQuestionIndex++;
      displayQuestion(currentQuestionIndex);
    }, 2000); // 2 seconds delay to show feedback
  }

  function displayEndScreen() {
    questionHost.innerHTML = ''; // Clear any remaining question elements

    const finalEndMessage = rawQuizEndMessage.replace('{{score}}', score.toString()).replace('{{total}}', questions.length.toString());
    
    const endScreenDiv = document.createElement('div');
    endScreenDiv.id = 'quiz-end-screen';
    endScreenDiv.className = 'text-center p-8 bg-card rounded-lg shadow-xl animate-fade-in'; // Added Tailwind classes + animation
    endScreenDiv.innerHTML = \`
      <h2 class="text-2xl font-bold mb-4 text-primary">Quiz Complete!</h2>
      <p data-quiz-end-message class="text-lg text-foreground mb-6">\${finalEndMessage}</p>
      <button id="restart-quiz-button" class="mt-4 bg-primary text-primary-foreground px-6 py-3 rounded-md hover:bg-primary/90 transition-colors text-base font-medium shadow-md">Restart Quiz</button>
    \`;
    
    questionHost.appendChild(endScreenDiv);

    const restartButton = document.getElementById('restart-quiz-button');
    if (restartButton) {
      restartButton.onclick = () => {
        currentQuestionIndex = 0;
        score = 0;
        activeQuestionElement = null; 
        questionHost.innerHTML = ''; // Clear end screen
        // Re-add the question template host if it was cleared completely, or ensure logic re-uses main host
        // For simplicity, re-fetch questionHost if it was cleared. Here, we just clear its content.
        displayQuestion(currentQuestionIndex);
      };
    }
  }

  if (questions.length > 0) {
    displayQuestion(currentQuestionIndex);
  } else {
    questionHost.innerHTML = '<p class="text-center text-muted-foreground p-8">No questions have been added to this quiz yet.</p>';
  }
});
`;


export default function NewTestEditorPage() {
  const [testName, setTestName] = useState('My Awesome Quiz');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [htmlContent, setHtmlContent] = useState(defaultHtmlContent);
  const [cssContent, setCssContent] = useState(defaultCssContent);
  const [quizEndMessage, setQuizEndMessage] = useState('Congratulations! You completed the quiz. Your score is {{score}} out of {{total}}.');
  const [previewContent, setPreviewContent] = useState('');
  const { toast } = useToast();

  const updatePreview = useCallback(() => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlContent, 'text/html');

    const titleElement = doc.querySelector('[data-quiz-title]');
    if (titleElement) {
      titleElement.textContent = testName || 'Quiz Title';
    }

    // Embed questions data and end message into the HTML structure for the script
    const questionsDataScriptTag = doc.getElementById('quiz-data');
    if (questionsDataScriptTag) {
      questionsDataScriptTag.textContent = JSON.stringify(questions);
    }
    const endMessageDivTag = doc.getElementById('quiz-end-message-text');
    if (endMessageDivTag) {
      endMessageDivTag.textContent = quizEndMessage;
    }
    
    // The main quiz container HTML is now mostly static in defaultHtmlContent.
    // The script will handle dynamic question rendering.
    const finalHtmlBody = doc.body.innerHTML; // Get only body content

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
        --font-geist-sans: ${getComputedStyle(document.documentElement).getPropertyValue('--font-geist-sans').trim() || 'Arial, sans-serif'};
      }
    `;

    setPreviewContent(`
      <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <script src="https://cdn.tailwindcss.com"></script>
          <style>
            ${stylingVariables}
            ${cssContent}
          </style>
        </head>
        <body>
          ${finalHtmlBody}
          <script>${quizLogicScript}<\/script>
        </body>
      </html>
    `);
  }, [htmlContent, cssContent, testName, questions, quizEndMessage]);

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
        if (q.options.length > 1) { 
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
      quizEndMessage,
    };
    console.log("Saving test data:", JSON.stringify(testData, null, 2));
    toast({
      title: "Test Data Logged (Mock Save)",
      description: "Your test configuration has been logged to the console.",
    });
  };

  return (
    <AppLayout currentPageTitle={testName || "Create New Test"}>
      <div className="flex flex-col h-full">
        <header className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-semibold truncate pr-4">{testName || "New Test Editor"}</h1>
          <div className="space-x-2 flex-shrink-0">
            <Button variant="outline" onClick={updatePreview}><Eye className="mr-2 h-4 w-4" /> Refresh Preview</Button>
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
                  <Label htmlFor="quizEndMessage" className="text-sm font-medium flex items-center"><MessageSquareText className="mr-2 h-4 w-4" /> Quiz End Message</Label>
                  <Textarea
                    id="quizEndMessage"
                    placeholder="e.g., Congratulations! Your score: {{score}}/{{total}}"
                    value={quizEndMessage}
                    onChange={(e) => setQuizEndMessage(e.target.value)}
                    className="mt-1"
                    rows={3}
                  />
                   <p className="text-xs text-muted-foreground mt-1">Use {'{{score}}'} and {'{{total}}'} for dynamic values.</p>
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
              <CardDescription>Rendered output of your HTML, CSS, and questions. Fully interactive.</CardDescription>
            </CardHeader>
            <CardContent className="flex-grow p-0 m-0">
              <iframe
                srcDoc={previewContent}
                title="Test Preview"
                className="w-full h-full border-0"
                sandbox="allow-scripts allow-same-origin allow-popups" 
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
