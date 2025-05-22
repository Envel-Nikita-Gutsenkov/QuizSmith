
import type { PageTemplate } from './types';

export const DEFAULT_TEMPLATE_ID = 'tpl-blank-canvas';

// =====================================================================================
// ADVANCED "BLANK CANVAS (STANDARD)" - NOW A FULL QUIZ ENGINE TEMPLATE
// This HTML now includes all necessary JavaScript for a multi-type quiz.
// =====================================================================================
const defaultHtmlContent = `
<!-- 
  QuizSmith ADVANCED Page Template: Blank Canvas (Full Quiz Engine)
  This HTML is a self-contained quiz engine. It includes structure, placeholders for data injection,
  and a comprehensive <script> block to handle quiz logic, rendering, and interactions.

  DATA INJECTION (from Test Editor):
  - <script id="quiz-data" type="application/json">[QUESTIONS_ARRAY_JSON_STRING]</script>
  - <div id="quiz-name-data" style="display:none;">[QUIZ_NAME_STRING]</div>
  - <div id="quiz-end-message-data" style="display:none;">[QUIZ_END_MESSAGE_STRING_WITH_PLACEHOLDERS]</div>

  The JavaScript within THIS template is responsible for:
  1. Reading the injected data.
  2. Rendering the quiz title.
  3. Iterating through questions and rendering them based on their 'type'.
     - Multiple Choice (Text & Image)
     - Matching (Text-to-Text)
     - Drag & Drop (Text-on-Text)
  4. Handling user interactions for each question type.
  5. Providing visual feedback (using CSS classes defined in this template's CSS).
  6. Calculating the score and managing question progression.
  7. Displaying the end screen with the score.
  8. Defining UI text like "Correct!", "Incorrect!", "Restart Quiz" directly.
-->
<div class="quiz-engine-container p-4 md:p-8 rounded-xl shadow-2xl bg-card text-card-foreground max-w-3xl mx-auto my-6">
  
  <!-- Data injection elements (populated by Test Editor) -->
  <script id="quiz-data" type="application/json"></script>
  <div id="quiz-name-data" style="display:none;"></div>
  <div id="quiz-end-message-data" style="display:none;"></div>

  <h1 id="template-quiz-title" class="text-3xl font-bold mb-6 text-primary text-center"></h1>
  
  <div id="template-quiz-content-host" class="space-y-8">
    <!-- Questions will be rendered here by this template's script -->
  </div>

  <!-- Template for a single question (cloned and populated by script) -->
  <div id="template-question-blueprint" style="display: none;" class="question-block p-5 bg-background/70 border border-border rounded-lg shadow-md">
    <h2 data-element="question-text" class="text-xl font-semibold mb-5 text-foreground"></h2>
    <div data-element="options-container" class="options-area space-y-3">
      <!-- Options/interactive elements populated here by script -->
    </div>
    <div data-element="feedback-message" class="feedback-text mt-4 text-center font-medium text-lg" style="min-height: 28px;"></div>
  </div>

  <!-- Template for an end screen (populated by script) -->
  <div id="template-quiz-end-screen" style="display: none;" class="text-center p-6 bg-card rounded-lg shadow-xl">
    <h2 data-element="end-screen-title" class="text-2xl font-bold mb-4 text-primary"></h2>
    <p data-element="end-screen-message" class="text-lg text-foreground mb-6"></p>
    <button data-element="restart-button" class="mt-4 bg-primary text-primary-foreground px-6 py-3 rounded-md hover:bg-primary/90 transition-colors text-base font-medium shadow-md"></button>
  </div>

  <!-- THE CORE QUIZ ENGINE JAVASCRIPT FOR THIS TEMPLATE -->
  <script>
    document.addEventListener('DOMContentLoaded', () => {
      // --- CONFIGURABLE TEXT (within this template's script) ---
      const TEXT_CORRECT = "Correct!";
      const TEXT_INCORRECT = "Incorrect!";
      const TEXT_QUIZ_COMPLETE = "Quiz Complete!";
      const TEXT_RESTART_QUIZ = "Restart Quiz";
      const TEXT_MATCHING_SELECT_PROMPT = "Select a match for:";
      const TEXT_DRAG_DROP_HERE = "Drop here";

      // --- DATA FETCHING ---
      let questions = [];
      let quizName = "Quiz Title";
      let rawQuizEndMessage = "Finished! Your score: {{score}}/{{total}}";

      try {
        const questionsDataEl = document.getElementById('quiz-data');
        if (questionsDataEl && questionsDataEl.textContent) {
          questions = JSON.parse(questionsDataEl.textContent);
        }
      } catch (e) { console.error("Error parsing quiz data:", e); }

      const quizNameEl = document.getElementById('quiz-name-data');
      if (quizNameEl) quizName = quizNameEl.textContent || quizName;
      document.getElementById('template-quiz-title').textContent = quizName;
      
      const endMessageEl = document.getElementById('quiz-end-message-data');
      if (endMessageEl) rawQuizEndMessage = endMessageEl.textContent || rawQuizEndMessage;

      // --- DOM ELEMENTS ---
      const contentHost = document.getElementById('template-quiz-content-host');
      const questionBlueprint = document.getElementById('template-question-blueprint');
      const endScreenBlueprint = document.getElementById('template-quiz-end-screen');

      if (!contentHost || !questionBlueprint || !endScreenBlueprint) {
        console.error("Essential template elements not found.");
        if(contentHost) contentHost.innerHTML = "<p>Error: Template structure is incomplete.</p>";
        return;
      }

      // --- STATE ---
      let currentQuestionIndex = 0;
      let score = 0;
      let activeQuestionElement = null;
      let selectedMatchPrompt = null; // For matching questions

      // --- RENDER FUNCTIONS ---
      function displayQuestion(index) {
        if (activeQuestionElement) {
          activeQuestionElement.classList.add('animate-slide-out-left'); // Defined in template CSS
          setTimeout(() => { 
            if (activeQuestionElement) activeQuestionElement.remove(); 
            activeQuestionElement = null; 
            index >= questions.length ? displayEndScreen() : renderQuestion(index); 
          }, 500); // Match CSS animation duration
        } else { 
          index >= questions.length ? displayEndScreen() : renderQuestion(index); 
        }
      }

      function renderQuestion(index) {
        const question = questions[index];
        activeQuestionElement = questionBlueprint.cloneNode(true);
        activeQuestionElement.id = 'q-' + question.id;
        activeQuestionElement.style.display = 'block';

        activeQuestionElement.querySelector('[data-element="question-text"]').textContent = question.text;
        const optionsContainer = activeQuestionElement.querySelector('[data-element="options-container"]');
        optionsContainer.innerHTML = ''; // Clear previous

        // Render based on question type
        if (question.type === 'multiple-choice-text' || question.type === 'multiple-choice-image') {
          renderMCQ(question, optionsContainer, activeQuestionElement);
        } else if (question.type === 'matching-text-text') {
          renderMatching(question, optionsContainer, activeQuestionElement);
        } else if (question.type === 'drag-and-drop-text-text') {
          renderDragAndDrop(question, optionsContainer, activeQuestionElement);
        } else {
          optionsContainer.innerHTML = '<p>Unsupported question type in this template.</p>';
        }
        
        contentHost.innerHTML = ''; // Clear previous question or end screen
        contentHost.appendChild(activeQuestionElement);
        activeQuestionElement.classList.add('animate-slide-in-right'); // Defined in template CSS
      }

      function renderMCQ(question, container, questionEl) {
        question.options.forEach(option => {
          const button = document.createElement('button');
          button.className = 'template-option-button w-full text-left p-3.5 border border-input rounded-md text-foreground hover:bg-secondary hover:border-primary focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1 focus:ring-offset-background transition-all duration-150 ease-in-out transform hover:-translate-y-0.5';
          if (question.type === 'multiple-choice-image' && option.imageUrl) {
            button.innerHTML = \`<img src="\${option.imageUrl}" alt="\${option.text || 'Option image'}" class="max-h-32 mx-auto mb-2 rounded-sm object-contain border"><p class="text-center text-sm">\${option.text || ''}</p>\`;
            button.classList.add('image-option');
          } else {
            button.textContent = option.text;
          }
          button.onclick = () => handleMCQAnswer(button, option, question.options, questionEl);
          container.appendChild(button);
        });
      }
      
      function renderMatching(question, container, questionEl) {
        selectedMatchPrompt = null; // Reset for new matching question
        const promptsDiv = document.createElement('div');
        promptsDiv.className = 'matching-prompts grid grid-cols-1 md:grid-cols-2 gap-3 mb-4';
        
        const targetsDiv = document.createElement('div');
        targetsDiv.className = 'matching-targets grid grid-cols-1 md:grid-cols-2 gap-3';

        const shuffledTargets = [...question.matchPairs].sort(() => 0.5 - Math.random());

        question.matchPairs.forEach(pair => {
          const promptEl = document.createElement('div');
          promptEl.className = 'prompt-item p-3 border rounded-md bg-muted cursor-pointer hover:bg-accent/20';
          promptEl.textContent = pair.prompt;
          promptEl.dataset.pairId = pair.id;
          promptEl.onclick = () => handleMatchPromptSelect(promptEl, pair, questionEl);
          promptsDiv.appendChild(promptEl);
        });

        shuffledTargets.forEach(pair => {
          const targetEl = document.createElement('div');
          targetEl.className = 'target-item p-3 border-2 border-dashed border-border rounded-md cursor-pointer hover:border-primary hover:bg-secondary/50';
          targetEl.textContent = pair.target;
          targetEl.dataset.targetId = pair.id; // Use pair.id as targetId for simplicity in this example
          targetEl.onclick = () => handleMatchTargetSelect(targetEl, pair, question.matchPairs, questionEl);
          targetsDiv.appendChild(targetEl);
        });
        container.appendChild(promptsDiv);
        container.appendChild(document.createElement('hr'));
        container.appendChild(targetsDiv);
      }

      function renderDragAndDrop(question, container, questionEl) {
        const dragItemsPool = document.createElement('div');
        dragItemsPool.className = 'drag-items-pool mb-4 p-3 border rounded-md bg-muted/50 flex flex-wrap gap-2 justify-center min-h-[50px]';
        
        question.dragItems.forEach(item => {
          const el = document.createElement('div');
          el.id = \`drag-\${item.id}\`;
          el.className = 'drag-item p-2 border rounded bg-primary text-primary-foreground cursor-grab shadow-md';
          el.textContent = item.text;
          el.draggable = true;
          el.ondragstart = (event) => {
            event.dataTransfer.setData('text/plain', item.id);
            event.target.classList.add('dragging');
          };
          el.ondragend = (event) => {
             event.target.classList.remove('dragging');
          };
          dragItemsPool.appendChild(el);
        });
        container.appendChild(dragItemsPool);

        const dropTargetsContainer = document.createElement('div');
        dropTargetsContainer.className = 'drop-targets-area grid grid-cols-1 md:grid-cols-2 lg:grid-cols-${question.dropTargets.length} gap-4';

        question.dropTargets.forEach(target => {
          const el = document.createElement('div');
          el.id = \`drop-\${target.id}\`;
          el.className = 'drop-target p-4 border-2 border-dashed border-border rounded-md min-h-[60px] flex items-center justify-center text-muted-foreground';
          el.textContent = target.text || TEXT_DRAG_DROP_HERE; // Use target.text for label if provided
          el.dataset.expectedItemId = target.expectedDragItemId; // Store expected ID

          el.ondragover = (event) => {
            event.preventDefault();
            el.classList.add('drag-over');
          };
          el.ondragleave = () => el.classList.remove('drag-over');
          el.ondrop = (event) => {
            event.preventDefault();
            el.classList.remove('drag-over');
            const droppedItemId = event.dataTransfer.getData('text/plain');
            const draggedEl = document.getElementById(\`drag-\${droppedItemId}\`);
            if (draggedEl) {
              // If target already has an item, move it back to pool (optional)
              if(el.firstChild && el.firstChild.classList && el.firstChild.classList.contains('drag-item')) {
                 dragItemsPool.appendChild(el.firstChild);
              }
              el.innerHTML = ''; // Clear "Drop here" text or previous item
              el.appendChild(draggedEl); // Move item
              draggedEl.classList.remove('dragging');
              el.dataset.droppedItemId = droppedItemId; // Store what was dropped
              checkAllDragDropAnswers(question, questionEl);
            }
          };
          dropTargetsContainer.appendChild(el);
        });
        container.appendChild(dropTargetsContainer);
      }

      // --- INTERACTION HANDLERS ---
      function handleMCQAnswer(button, selectedOption, allOptions, questionEl) {
        const feedbackEl = questionEl.querySelector('[data-element="feedback-message"]');
        questionEl.querySelectorAll('.template-option-button').forEach(btn => btn.disabled = true);

        if (selectedOption.isCorrect) {
          score++;
          button.classList.add('correct-answer'); // CSS class from template
          feedbackEl.textContent = TEXT_CORRECT;
          feedbackEl.className = 'feedback-text mt-4 text-center font-medium text-lg correct-feedback'; // CSS class from template
        } else {
          button.classList.add('incorrect-answer-selected'); // CSS class from template
          const correctOpt = allOptions.find(opt => opt.isCorrect);
          if (correctOpt) {
            const correctBtn = Array.from(questionEl.querySelectorAll('.template-option-button')).find(btn => {
              // This logic needs to be more robust if image options don't have clear text match
              return (question.type === 'multiple-choice-image' && btn.querySelector('p') && btn.querySelector('p').textContent === correctOpt.text) || btn.textContent === correctOpt.text;
            });
            if (correctBtn) correctBtn.classList.add('always-correct-answer'); // CSS class from template
          }
          feedbackEl.textContent = TEXT_INCORRECT;
          feedbackEl.className = 'feedback-text mt-4 text-center font-medium text-lg incorrect-feedback'; // CSS class from template
        }
        feedbackEl.classList.add('show-feedback');

        setTimeout(() => {
          currentQuestionIndex++;
          displayQuestion(currentQuestionIndex);
        }, 2000);
      }

      function handleMatchPromptSelect(promptEl, pair, questionEl) {
        if (selectedMatchPrompt) {
          selectedMatchPrompt.classList.remove('selected-prompt');
        }
        selectedMatchPrompt = promptEl;
        promptEl.classList.add('selected-prompt'); // Style in template CSS
      }

      function handleMatchTargetSelect(targetEl, targetPair, allPairs, questionEl) {
        if (!selectedMatchPrompt) return; // Must select a prompt first

        const feedbackEl = questionEl.querySelector('[data-element="feedback-message"]');
        const promptPairId = selectedMatchPrompt.dataset.pairId;

        // Disable further interaction for this pair
        selectedMatchPrompt.onclick = null;
        targetEl.onclick = null;
        selectedMatchPrompt.classList.remove('selected-prompt');
        
        if (promptPairId === targetPair.id) { // Correct match
          selectedMatchPrompt.classList.add('correct-match');
          targetEl.classList.add('correct-match');
          const matchedPair = allPairs.find(p => p.id === promptPairId);
          if(matchedPair) matchedPair.userAnsweredCorrectly = true;
        } else {
          selectedMatchPrompt.classList.add('incorrect-match');
          targetEl.classList.add('incorrect-match');
           const matchedPair = allPairs.find(p => p.id === promptPairId);
           if(matchedPair) matchedPair.userAnsweredCorrectly = false;
        }
        selectedMatchPrompt = null; // Reset selected prompt

        // Check if all pairs are matched
        const allMatched = allPairs.every(p => p.userAnsweredCorrectly !== undefined);
        if (allMatched) {
          let correctMatches = allPairs.filter(p => p.userAnsweredCorrectly === true).length;
          score += correctMatches; // Or some other scoring logic for matching
          feedbackEl.textContent = \`Matched \${correctMatches} / \${allPairs.length}\`;
          feedbackEl.className = 'feedback-text mt-4 text-center font-medium text-lg show-feedback';
          setTimeout(() => {
            currentQuestionIndex++;
            displayQuestion(currentQuestionIndex);
          }, 2000);
        }
      }
      
      function checkAllDragDropAnswers(question, questionEl) {
        const targets = questionEl.querySelectorAll('.drop-target');
        let allTargetsFilled = true;
        targets.forEach(target => {
          if (!target.dataset.droppedItemId) {
            allTargetsFilled = false;
          }
        });

        if (allTargetsFilled) {
          let correctDrops = 0;
          targets.forEach(target => {
            if (target.dataset.droppedItemId === target.dataset.expectedItemId) {
              correctDrops++;
              target.classList.add('correct-drop');
              target.querySelector('.drag-item')?.classList.add('correct-drop-item');
            } else {
              target.classList.add('incorrect-drop');
              target.querySelector('.drag-item')?.classList.add('incorrect-drop-item');
            }
            // Disable further dnd on this target
            target.ondragover = null;
            target.ondrop = null;
            target.querySelector('.drag-item').draggable = false;
          });
          score += correctDrops;
          const feedbackEl = questionEl.querySelector('[data-element="feedback-message"]');
          feedbackEl.textContent = \`Correct Drops: \${correctDrops} / \${question.dropTargets.length}\`;
          feedbackEl.className = 'feedback-text mt-4 text-center font-medium text-lg show-feedback';
          setTimeout(() => {
            currentQuestionIndex++;
            displayQuestion(currentQuestionIndex);
          }, 2500);
        }
      }

      // --- END SCREEN ---
      function displayEndScreen() {
        contentHost.innerHTML = ''; // Clear content host
        const endScreen = endScreenBlueprint.cloneNode(true);
        endScreen.id = 'quiz-final-screen';
        endScreen.style.display = 'block';
        
        endScreen.querySelector('[data-element="end-screen-title"]').textContent = TEXT_QUIZ_COMPLETE;
        const finalMessage = rawQuizEndMessage
                                .replace('{{score}}', score.toString())
                                .replace('{{total}}', questions.length.toString());
        endScreen.querySelector('[data-element="end-screen-message"]').textContent = finalMessage;
        
        const restartBtn = endScreen.querySelector('[data-element="restart-button"]');
        restartBtn.textContent = TEXT_RESTART_QUIZ;
        restartBtn.onclick = () => {
          currentQuestionIndex = 0;
          score = 0;
          questions.forEach(q => { // Reset any per-question state if needed
            if(q.matchPairs) q.matchPairs.forEach(p => p.userAnsweredCorrectly = undefined);
            if(q.dropTargets) q.dropTargets.forEach(t => t.droppedItemId = null);
          });
          activeQuestionElement = null;
          displayQuestion(currentQuestionIndex);
        };
        
        contentHost.appendChild(endScreen);
        endScreen.classList.add('animate-fade-in'); // Defined in template CSS
      }

      // --- INITIALIZATION ---
      if (questions && questions.length > 0) {
        displayQuestion(currentQuestionIndex);
      } else {
        contentHost.innerHTML = "<p>No questions loaded for this quiz.</p>";
      }
    });
  <\/script>
</div>
`;

const defaultCssContent = `
/* 
  QuizSmith ADVANCED Page Template CSS (Blank Canvas - Full Quiz Engine)
  This CSS styles the HTML structure and elements managed by THIS TEMPLATE'S JavaScript.
*/
body {
  background-color: hsl(var(--background)); 
  color: hsl(var(--foreground));
  font-family: var(--font-geist-sans, sans-serif);
}
.quiz-engine-container { 
  font-family: var(--font-geist-sans), sans-serif;
}

/* MCQ Option Button Styling */
.template-option-button { /* Base style for options generated by template script */
  /* Tailwind classes in HTML provide most styling, add specifics here */
}
.template-option-button.image-option {
  padding: 0.5rem; 
  background-color: hsl(var(--card) / 0.8); /* Light background for image options */
}
.template-option-button.image-option img {
  max-height: 120px; 
  display: block;
  margin-left: auto;
  margin-right: auto;
  margin-bottom: 0.5rem;
  border-radius: var(--radius);
  border: 1px solid hsl(var(--border));
}

/* Feedback Styling (applied by template script) */
.template-option-button.correct-answer {
  background-color: hsl(var(--success-bg)) !important;
  color: hsl(var(--success-fg)) !important;
  border-color: hsl(var(--success-border)) !important;
  box-shadow: 0 0 0 3px hsl(var(--success-border) / 0.7);
}
.template-option-button.incorrect-answer-selected {
  background-color: hsl(var(--destructive)) !important;
  color: hsl(var(--destructive-foreground)) !important;
  border-color: hsl(var(--destructive) / 0.8) !important; /* Reduced alpha for border */
  box-shadow: 0 0 0 3px hsl(var(--destructive) / 0.5); /* Reduced alpha for shadow */
  opacity: 0.9;
}
.template-option-button.always-correct-answer {
  /* Subtly highlight the actual correct answer if user chose wrong */
  background-color: hsl(var(--success-bg) / 0.7) !important;
  color: hsl(var(--success-fg)) !important;
  border: 2px solid hsl(var(--success-border)) !important;
}

.feedback-text { 
  opacity: 0; 
  transform: translateY(10px); 
  transition: opacity 0.3s ease-out, transform 0.3s ease-out; 
}
.feedback-text.show-feedback { 
  opacity: 1; 
  transform: translateY(0); 
  animation: templatePopFeedback 0.4s cubic-bezier(0.68, -0.55, 0.27, 1.55); 
}
.feedback-text.correct-feedback { color: hsl(var(--success-fg)); }
.feedback-text.incorrect-feedback { color: hsl(var(--destructive)); }

/* Question Transition Animations (applied by template script) */
.animate-slide-out-left { 
  animation: templateSlideOutLeft 0.5s ease-out forwards;
}
.animate-slide-in-right { 
  animation: templateSlideInRight 0.5s ease-out forwards; 
}
@keyframes templateSlideOutLeft {
  from { opacity: 1; transform: translateX(0); }
  to { opacity: 0; transform: translateX(-50px); }
}
@keyframes templateSlideInRight { 
  from { opacity: 0; transform: translateX(50px); } 
  to { opacity: 1; transform: translateX(0); } 
}

/* End Screen Animation (applied by template script) */
.animate-fade-in { 
  animation: templateFadeIn 0.5s ease-out forwards; 
}
@keyframes templateFadeIn { 
  from { opacity: 0; transform: translateY(10px); } 
  to { opacity: 1; transform: translateY(0); } 
}

@keyframes templatePopFeedback { 
  0% { transform: scale(0.9) translateY(5px); } 
  70% { transform: scale(1.05) translateY(0px); } 
  100% { transform: scale(1) translateY(0px); } 
}

/* Matching Question Specific Styles */
.prompt-item.selected-prompt, .target-item.selected-target {
  background-color: hsl(var(--primary) / 0.2) !important;
  border-color: hsl(var(--primary)) !important;
  font-weight: 600;
}
.prompt-item.correct-match, .target-item.correct-match {
  background-color: hsl(var(--success-bg) / 0.5) !important;
  border-color: hsl(var(--success-border)) !important;
  color: hsl(var(--success-fg)) !important;
  cursor: default !important;
}
.prompt-item.incorrect-match, .target-item.incorrect-match {
  background-color: hsl(var(--destructive) / 0.3) !important;
  border-color: hsl(var(--destructive) / 0.5) !important;
  color: hsl(var(--destructive)) !important;
  text-decoration: line-through;
  cursor: default !important;
}

/* Drag & Drop Specific Styles */
.drag-item {
  transition: transform 0.1s ease-out, box-shadow 0.1s ease-out;
}
.drag-item.dragging {
  opacity: 0.7;
  transform: scale(0.95);
  box-shadow: 0 4px 10px rgba(0,0,0,0.2);
}
.drop-target.drag-over {
  background-color: hsl(var(--accent) / 0.1);
  border-color: hsl(var(--accent));
  border-style: solid;
}
.drop-target.correct-drop {
  border-color: hsl(var(--success-border)) !important;
  background-color: hsl(var(--success-bg) / 0.3) !important;
}
.drop-target .drag-item.correct-drop-item {
  background-color: hsl(var(--success-fg)) !important;
  color: hsl(var(--success-bg)) !important;
  border: 1px solid hsl(var(--success-border));
}
.drop-target.incorrect-drop {
  border-color: hsl(var(--destructive) / 0.7) !important;
  background-color: hsl(var(--destructive) / 0.2) !important;
}
.drop-target .drag-item.incorrect-drop-item {
   background-color: hsl(var(--destructive)) !important;
   color: hsl(var(--destructive-foreground)) !important;
   border: 1px solid hsl(var(--destructive) / 0.5);
   text-decoration: line-through;
}
`;


export const pageTemplates: PageTemplate[] = [
  {
    id: DEFAULT_TEMPLATE_ID,
    name: 'Blank Canvas (Quiz Engine)',
    description: 'A foundational, well-commented starting point. Includes a built-in JavaScript quiz engine supporting multiple question types (MCQ text/image, Text Matching, Text Drag & Drop) and user-customizable HTML/CSS. This template is a complete quiz experience out-of-the-box.',
    htmlContent: defaultHtmlContent,
    cssContent: defaultCssContent,
    previewImageUrl: 'https://placehold.co/600x400.png',
    aiHint: 'quiz interface app',
    tags: ['Standard', 'Engine', 'Customizable', 'All Types', 'Base'],
  },
  {
    id: 'tpl-minimalist-mcq-engine',
    name: 'Minimalist MCQ Engine',
    description: 'A clean, focused quiz engine template optimized specifically for text-based and image-based Multiple Choice Questions. Includes its own JavaScript for MCQ logic.',
    // For brevity, this would be a variation of defaultHtmlContent, potentially stripping out
    // matching/D&D logic from its script and having simpler HTML/CSS.
    // For now, it reuses the default engine for demonstration.
    htmlContent: defaultHtmlContent.replace(/Blank Canvas \(Quiz Engine\)/g, 'Minimalist MCQ Engine'),
    cssContent: defaultCssContent.replace('/* QuizSmith ADVANCED Page Template CSS (Blank Canvas - Full Quiz Engine) */', '/* Minimalist MCQ Engine CSS */\n.quiz-engine-container { max-width: 768px; /* Example tweak */ }'),
    previewImageUrl: 'https://placehold.co/600x400.png',
    aiHint: 'simple modern quiz',
    tags: ['MCQ', 'Minimalist', 'Engine', 'Focused'],
  },
  // Add more diverse templates here if needed, each with its own full HTML/CSS/JS engine
];
