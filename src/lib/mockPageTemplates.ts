
import type { PageTemplate } from './types';

export const DEFAULT_TEMPLATE_ID = 'tpl-blank-canvas-engine';

// =====================================================================================
// ADVANCED "BLANK CANVAS (FULL QUIZ ENGINE)" TEMPLATE
// This HTML includes all necessary JavaScript for a multi-type quiz.
// The Test Editor injects data into the placeholder elements.
// This template's script reads that data and runs the quiz.
// =====================================================================================
const defaultHtmlContent = `
<!-- 
  QuizSmith ADVANCED Page Template: Blank Canvas (Full Quiz Engine)
  This HTML is a self-contained quiz engine. It includes structure, placeholders for data injection,
  and a comprehensive <script> block to handle quiz logic, rendering, and interactions.

  DATA INJECTION (from Test Editor into THIS template's DOM):
  - <script id="quiz-data" type="application/json">[QUESTIONS_ARRAY_JSON_STRING]</script>
  - <div id="quiz-name-data" style="display:none;">[QUIZ_NAME_STRING]</div>
  - <div id="quiz-end-message-data" style="display:none;">[QUIZ_END_MESSAGE_STRING_WITH_PLACEHOLDERS]</div>

  THE JAVASCRIPT WITHIN THIS TEMPLATE IS RESPONSIBLE FOR:
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
  8. Defining UI text like "Correct!", "Incorrect!", "Restart Quiz" directly in THIS SCRIPT.
  9. Handling all animations and operational logic for the quiz flow.

  CUSTOMIZATION:
  - Modify the HTML structure below as desired.
  - Modify the CSS in the companion CSS editor for this template.
  - Modify or extend the JavaScript engine in the <script> block at the end of this HTML.
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

  <!-- Template for a single question (cloned and populated by this template's script) -->
  <div id="template-question-blueprint" style="display: none;" class="question-block p-5 bg-background/70 border border-border rounded-lg shadow-md">
    <h2 data-element="question-text" class="text-xl font-semibold mb-5 text-foreground"></h2>
    <div data-element="options-container" class="options-area space-y-3">
      <!-- Options/interactive elements populated here by script -->
    </div>
    <div data-element="feedback-message" class="feedback-text mt-4 text-center font-medium text-lg" style="min-height: 28px;"></div>
  </div>

  <!-- Template for an end screen (populated by this template's script) -->
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

      // --- DATA FETCHING (from elements injected by Test Editor) ---
      let questions = [];
      let quizName = "Quiz Title";
      let rawQuizEndMessage = "Finished! Your score: {{score}}/{{total}}";

      try {
        const questionsDataEl = document.getElementById('quiz-data');
        if (questionsDataEl && questionsDataEl.textContent) {
          questions = JSON.parse(questionsDataEl.textContent);
        } else {
          console.warn("QuizSmith Template: Quiz data element not found or empty.");
        }
      } catch (e) { console.error("QuizSmith Template: Error parsing quiz data:", e); }

      const quizNameEl = document.getElementById('quiz-name-data');
      if (quizNameEl) quizName = quizNameEl.textContent || quizName;
      const titleDisplayEl = document.getElementById('template-quiz-title');
      if(titleDisplayEl) titleDisplayEl.textContent = quizName;
      
      const endMessageEl = document.getElementById('quiz-end-message-data');
      if (endMessageEl) rawQuizEndMessage = endMessageEl.textContent || rawQuizEndMessage;

      // --- DOM ELEMENTS (Blueprints) ---
      const contentHost = document.getElementById('template-quiz-content-host');
      const questionBlueprint = document.getElementById('template-question-blueprint');
      const endScreenBlueprint = document.getElementById('template-quiz-end-screen');

      if (!contentHost || !questionBlueprint || !endScreenBlueprint) {
        console.error("QuizSmith Template: Essential template elements (content-host, question-blueprint, end-screen-blueprint) not found.");
        if(contentHost) contentHost.innerHTML = "<p>Error: Template structure is incomplete. Please ensure the core blueprint elements exist.</p>";
        return;
      }

      // --- QUIZ STATE ---
      let currentQuestionIndex = 0;
      let score = 0;
      let activeQuestionElement = null; // Holds the currently displayed question's DOM element
      let selectedMatchPromptElement = null; // For matching questions

      // --- RENDER FUNCTIONS ---
      function displayCurrentQuestion() {
        if (activeQuestionElement) {
          // Animate out old question
          activeQuestionElement.classList.remove('animate-slide-in-right', 'animate-fade-in');
          activeQuestionElement.classList.add('animate-slide-out-left');
          setTimeout(() => { 
            if (activeQuestionElement) activeQuestionElement.remove(); 
            activeQuestionElement = null; 
            proceedToNextStep();
          }, 500); // Match CSS animation duration
        } else { 
          proceedToNextStep();
        }
      }
      
      function proceedToNextStep() {
        if (currentQuestionIndex >= questions.length) {
          displayEndScreen();
        } else {
          renderQuestion(questions[currentQuestionIndex]);
        }
      }

      function renderQuestion(question) {
        activeQuestionElement = questionBlueprint.cloneNode(true);
        activeQuestionElement.id = 'q-' + question.id; // Unique ID for the question block
        activeQuestionElement.style.display = 'block'; // Make it visible

        activeQuestionElement.querySelector('[data-element="question-text"]').textContent = question.text;
        const optionsContainer = activeQuestionElement.querySelector('[data-element="options-container"]');
        optionsContainer.innerHTML = ''; // Clear previous options

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
        
        contentHost.innerHTML = ''; // Clear previous content
        contentHost.appendChild(activeQuestionElement);
        activeQuestionElement.classList.remove('animate-slide-out-left');
        activeQuestionElement.classList.add('animate-slide-in-right');
      }

      function renderMCQ(question, container, questionEl) {
        question.options.forEach(option => {
          const button = document.createElement('button');
          button.className = 'template-option-button w-full text-left p-3.5 border border-input rounded-md text-foreground hover:bg-secondary hover:border-primary focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1 focus:ring-offset-background transition-all duration-150 ease-in-out transform hover:-translate-y-0.5';
          if (question.type === 'multiple-choice-image' && option.imageUrl) {
            const img = document.createElement('img');
            img.src = option.imageUrl;
            img.alt = option.text || 'Option image';
            img.className = 'max-h-32 mx-auto mb-2 rounded-sm object-contain border';
            button.appendChild(img);
            const p = document.createElement('p');
            p.className = 'text-center text-sm';
            p.textContent = option.text || '';
            button.appendChild(p);
            button.classList.add('image-option');
          } else {
            button.textContent = option.text;
          }
          button.onclick = () => handleMCQAnswer(button, option, question, questionEl);
          container.appendChild(button);
        });
      }
      
      function renderMatching(question, container, questionEl) {
        selectedMatchPromptElement = null; 
        const promptsDiv = document.createElement('div');
        promptsDiv.className = 'matching-prompts grid grid-cols-1 md:grid-cols-2 gap-3 mb-4';
        
        const targetsDiv = document.createElement('div');
        targetsDiv.className = 'matching-targets grid grid-cols-1 md:grid-cols-2 gap-3';

        // Store original pairs and shuffle targets for display
        const originalPairs = question.matchPairs.map(p => ({...p, answered: false, matchedCorrectly: null}));
        const shuffledTargets = [...originalPairs].sort(() => 0.5 - Math.random());

        originalPairs.forEach(pair => {
          const promptEl = document.createElement('div');
          promptEl.className = 'prompt-item p-3 border rounded-md bg-muted cursor-pointer hover:bg-accent/20 transition-colors';
          promptEl.textContent = pair.prompt;
          promptEl.dataset.pairId = pair.id;
          promptEl.onclick = () => handleMatchPromptSelect(promptEl, pair, questionEl);
          promptsDiv.appendChild(promptEl);
        });

        shuffledTargets.forEach(pair => {
          const targetEl = document.createElement('div');
          targetEl.className = 'target-item p-3 border-2 border-dashed border-border rounded-md cursor-pointer hover:border-primary hover:bg-secondary/50 transition-colors';
          targetEl.textContent = pair.target;
          targetEl.dataset.targetForPairId = pair.id; 
          targetEl.onclick = () => handleMatchTargetSelect(targetEl, pair.id, originalPairs, questionEl);
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
          el.id = \`drag-\${question.id}-\${item.id}\`; // Ensure unique IDs for draggable elements
          el.className = 'drag-item p-2 border rounded bg-primary text-primary-foreground cursor-grab shadow-md';
          el.textContent = item.text;
          el.draggable = true;
          el.ondragstart = (event) => {
            event.dataTransfer.setData('text/plain', item.id); // Store item.id
            event.dataTransfer.setData('text/questionId', question.id); // Store question id
            event.target.classList.add('dragging');
          };
          el.ondragend = (event) => {
             event.target.classList.remove('dragging');
          };
          dragItemsPool.appendChild(el);
        });
        container.appendChild(dragItemsPool);

        const dropTargetsContainer = document.createElement('div');
        dropTargetsContainer.className = 'drop-targets-area grid grid-cols-1 md:grid-cols-${Math.min(3, question.dropTargets.length || 1)} gap-4';

        question.dropTargets.forEach(target => {
          const el = document.createElement('div');
          el.id = \`drop-\${question.id}-\${target.id}\`; // Ensure unique IDs for drop targets
          el.className = 'drop-target p-4 border-2 border-dashed border-border rounded-md min-h-[60px] flex items-center justify-center text-muted-foreground transition-colors';
          el.textContent = target.text || TEXT_DRAG_DROP_HERE; 
          el.dataset.expectedDragItemId = target.expectedDragItemId;
          el.dataset.targetId = target.id;

          el.ondragover = (event) => {
            event.preventDefault();
            el.classList.add('drag-over');
          };
          el.ondragleave = () => el.classList.remove('drag-over');
          el.ondrop = (event) => {
            event.preventDefault();
            el.classList.remove('drag-over');
            const droppedItemId = event.dataTransfer.getData('text/plain');
            const originatingQuestionId = event.dataTransfer.getData('text/questionId');
            
            if (originatingQuestionId !== question.id) return; // Item from another question

            const draggedEl = document.getElementById(\`drag-\${question.id}-\${droppedItemId}\`);
            if (draggedEl) {
              // If target already has an item, move it back to pool
              if(el.firstChild && el.firstChild.classList && el.firstChild.classList.contains('drag-item')) {
                 dragItemsPool.appendChild(el.firstChild);
              }
              el.innerHTML = ''; // Clear "Drop here" text or previous item
              el.appendChild(draggedEl); 
              draggedEl.classList.remove('dragging');
              el.dataset.droppedItemId = droppedItemId; 
              checkAllDragDropAnswers(question, questionEl, dragItemsPool);
            }
          };
          dropTargetsContainer.appendChild(el);
        });
        container.appendChild(dropTargetsContainer);
      }

      // --- INTERACTION HANDLERS ---
      function handleMCQAnswer(button, selectedOption, questionData, questionEl) {
        const feedbackEl = questionEl.querySelector('[data-element="feedback-message"]');
        questionEl.querySelectorAll('.template-option-button').forEach(btn => btn.disabled = true);

        if (selectedOption.isCorrect) {
          score++;
          button.classList.add('correct-answer');
          feedbackEl.textContent = TEXT_CORRECT;
          feedbackEl.className = 'feedback-text mt-4 text-center font-medium text-lg correct-feedback';
        } else {
          button.classList.add('incorrect-answer-selected');
          const correctOptData = questionData.options.find(opt => opt.isCorrect);
          if (correctOptData) {
            // Find the button corresponding to correctOptData
            const allButtons = Array.from(questionEl.querySelectorAll('.template-option-button'));
            const correctBtn = allButtons.find(btn => {
                if (questionData.type === 'multiple-choice-image') {
                    const pText = btn.querySelector('p');
                    return pText && pText.textContent === correctOptData.text;
                }
                return btn.textContent === correctOptData.text;
            });
            if (correctBtn) correctBtn.classList.add('always-correct-answer');
          }
          feedbackEl.textContent = TEXT_INCORRECT;
          feedbackEl.className = 'feedback-text mt-4 text-center font-medium text-lg incorrect-feedback';
        }
        feedbackEl.classList.add('show-feedback');

        setTimeout(() => {
          currentQuestionIndex++;
          displayCurrentQuestion();
        }, 2000);
      }

      function handleMatchPromptSelect(promptElement, pairData, questionEl) {
        if (selectedMatchPromptElement) {
          selectedMatchPromptElement.classList.remove('selected-prompt');
        }
        selectedMatchPromptElement = promptElement;
        promptElement.classList.add('selected-prompt');
      }

      function handleMatchTargetSelect(targetElement, targetPairId, allPairsData, questionEl) {
        if (!selectedMatchPromptElement) return; // No prompt selected

        const selectedPromptPairId = selectedMatchPromptElement.dataset.pairId;
        const actualPair = allPairsData.find(p => p.id === selectedPromptPairId);
        
        if (!actualPair || actualPair.answered) return; // Already answered or invalid

        actualPair.answered = true;
        targetElement.onclick = null; // Disable target
        selectedMatchPromptElement.onclick = null; // Disable prompt
        selectedMatchPromptElement.classList.remove('selected-prompt');

        if (selectedPromptPairId === targetPairId) { // Correct match
          actualPair.matchedCorrectly = true;
          selectedMatchPromptElement.classList.add('correct-match');
          targetElement.classList.add('correct-match');
        } else {
          actualPair.matchedCorrectly = false;
          selectedMatchPromptElement.classList.add('incorrect-match');
          targetElement.classList.add('incorrect-match');
          // Optionally, highlight the correct target for the selected prompt
          const correctTargetForPrompt = questionEl.querySelector(\`.target-item[data-target-for-pair-id="\${selectedPromptPairId}"]\`);
          if (correctTargetForPrompt) {
            correctTargetForPrompt.classList.add('always-correct-target-highlight'); // Define this class in CSS
          }
        }
        selectedMatchPromptElement = null;

        const allAnswered = allPairsData.every(p => p.answered);
        if (allAnswered) {
          const correctCount = allPairsData.filter(p => p.matchedCorrectly).length;
          score += correctCount; // Or some other scoring logic for matching
          const feedbackEl = questionEl.querySelector('[data-element="feedback-message"]');
          feedbackEl.textContent = \`Matched \${correctCount} / \${allPairsData.length}\`;
          feedbackEl.className = 'feedback-text mt-4 text-center font-medium text-lg show-feedback';
           setTimeout(() => {
            currentQuestionIndex++;
            displayCurrentQuestion();
          }, 2500);
        }
      }
      
      function checkAllDragDropAnswers(question, questionEl, dragItemsPool) {
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
            const droppedItemEl = target.querySelector('.drag-item');
            if (target.dataset.droppedItemId === target.dataset.expectedDragItemId) {
              correctDrops++;
              target.classList.add('correct-drop');
              if(droppedItemEl) droppedItemEl.classList.add('correct-drop-item');
            } else {
              target.classList.add('incorrect-drop');
              if(droppedItemEl) droppedItemEl.classList.add('incorrect-drop-item');
            }
            // Disable further dnd on this target and item
            target.ondragover = null;
            target.ondrop = null;
            if(droppedItemEl) droppedItemEl.draggable = false;
          });
          
          // Move any remaining items in the pool to be un-draggable
          dragItemsPool.querySelectorAll('.drag-item').forEach(item => item.draggable = false);

          score += correctDrops;
          const feedbackEl = questionEl.querySelector('[data-element="feedback-message"]');
          feedbackEl.textContent = \`Correct Drops: \${correctDrops} / \${question.dropTargets.length}\`;
          feedbackEl.className = 'feedback-text mt-4 text-center font-medium text-lg show-feedback';
          setTimeout(() => {
            currentQuestionIndex++;
            displayCurrentQuestion();
          }, 2500);
        }
      }

      // --- END SCREEN ---
      function displayEndScreen() {
        contentHost.innerHTML = ''; 
        const endScreen = endScreenBlueprint.cloneNode(true);
        endScreen.id = 'quiz-final-screen';
        endScreen.style.display = 'block';
        
        endScreen.querySelector('[data-element="end-screen-title"]').textContent = TEXT_QUIZ_COMPLETE;
        const finalMessage = rawQuizEndMessage
                                .replace(/{{score}}/g, score.toString()) // Use regex for global replace
                                .replace(/{{total}}/g, questions.length.toString());
        endScreen.querySelector('[data-element="end-screen-message"]').textContent = finalMessage;
        
        const restartBtn = endScreen.querySelector('[data-element="restart-button"]');
        restartBtn.textContent = TEXT_RESTART_QUIZ;
        restartBtn.onclick = () => {
          currentQuestionIndex = 0;
          score = 0;
          // Reset any per-question state if added (e.g., for matching pairs)
          questions.forEach(q => {
            if(q.matchPairs) q.matchPairs.forEach(p => { 
                p.answered = false; 
                p.matchedCorrectly = null;
            });
            // No specific reset needed for D&D items as they are re-rendered
          });
          activeQuestionElement = null; 
          displayCurrentQuestion();
        };
        
        contentHost.appendChild(endScreen);
        endScreen.classList.remove('animate-slide-out-left'); // Ensure no conflicting animation
        endScreen.classList.add('animate-fade-in');
      }

      // --- INITIALIZATION ---
      if (questions && questions.length > 0) {
        displayCurrentQuestion();
      } else {
        if(contentHost) contentHost.innerHTML = "<p>No questions loaded for this quiz. Please add questions in the editor.</p>";
      }
    });
  <\/script>
</div>
`;

const defaultCssContent = `
/* 
  QuizSmith ADVANCED Page Template CSS (Blank Canvas - Full Quiz Engine)
  This CSS styles the HTML structure and elements managed by THIS TEMPLATE'S JavaScript.
  Users can fully customize this CSS in the template editor.
*/
body { /* Applied within iframe */
  background-color: hsl(var(--background)); 
  color: hsl(var(--foreground));
  font-family: var(--font-geist-sans, sans-serif);
  margin:0; /* Ensure no body margin in iframe */
}
.quiz-engine-container { 
  font-family: var(--font-geist-sans), sans-serif;
  /* Add any global styles for the quiz container if needed */
}

/* MCQ Option Button Styling */
.template-option-button {
  /* Base style for options generated by template script */
  /* Tailwind classes in HTML provide most styling, add specifics here */
}
.template-option-button.image-option {
  padding: 0.75rem; /* More padding for image options */
  background-color: hsl(var(--card) / 0.8);
}
.template-option-button.image-option img {
  max-height: 150px; /* Slightly larger images */
  display: block;
  margin-left: auto;
  margin-right: auto;
  margin-bottom: 0.75rem;
  border-radius: var(--radius);
  border: 1px solid hsl(var(--border));
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
}

/* Feedback Styling (applied by template script) */
.template-option-button.correct-answer,
.prompt-item.correct-match, 
.target-item.correct-match,
.drop-target.correct-drop .drag-item {
  background-color: hsl(var(--success-bg)) !important;
  color: hsl(var(--success-fg)) !important;
  border-color: hsl(var(--success-border)) !important;
  box-shadow: 0 0 0 2px hsl(var(--success-border) / 0.7);
}
.drop-target.correct-drop { /* For the drop target itself */
   border-color: hsl(var(--success-border)) !important;
   background-color: hsl(var(--success-bg) / 0.3) !important;
}

.template-option-button.incorrect-answer-selected,
.prompt-item.incorrect-match, 
.target-item.incorrect-match,
.drop-target.incorrect-drop .drag-item {
  background-color: hsl(var(--destructive)) !important;
  color: hsl(var(--destructive-foreground)) !important;
  border-color: hsl(var(--destructive) / 0.8) !important;
  box-shadow: 0 0 0 2px hsl(var(--destructive) / 0.5);
  opacity: 0.9;
}
.drop-target.incorrect-drop { /* For the drop target itself */
   border-color: hsl(var(--destructive) / 0.7) !important;
   background-color: hsl(var(--destructive) / 0.2) !important;
}
.target-item.incorrect-match, .prompt-item.incorrect-match, .drag-item.incorrect-drop-item {
  text-decoration: line-through;
  opacity: 0.7;
}


.template-option-button.always-correct-answer {
  background-color: hsl(var(--success-bg) / 0.7) !important;
  color: hsl(var(--success-fg)) !important;
  border: 2px solid hsl(var(--success-border)) !important;
}
.target-item.always-correct-target-highlight { /* For matching: if selected wrong, highlight correct target */
  border-color: hsl(var(--success-border)) !important;
  box-shadow: 0 0 5px hsl(var(--success-border));
}


.feedback-text { 
  opacity: 0; 
  transform: translateY(10px); 
  transition: opacity 0.3s ease-out, transform 0.3s ease-out; 
  font-size: 1.1rem; /* Slightly larger feedback text */
}
.feedback-text.show-feedback { 
  opacity: 1; 
  transform: translateY(0); 
  animation: templatePopFeedback 0.4s cubic-bezier(0.68, -0.55, 0.27, 1.55); 
}
.feedback-text.correct-feedback { color: hsl(var(--success-fg)); }
.feedback-text.incorrect-feedback { color: hsl(var(--destructive)); }

/* Question Transition Animations (applied by template script) */
.question-block, #quiz-final-screen {
  /* Base state for animations */
  opacity: 1;
  transform: translateX(0);
}
.animate-slide-out-left { 
  animation: templateSlideOutLeft 0.5s ease-out forwards;
}
.animate-slide-in-right { 
  animation: templateSlideInRight 0.5s ease-out forwards; 
}
.animate-fade-in {
  animation: templateFadeIn 0.6s ease-out forwards;
}

@keyframes templateSlideOutLeft {
  from { opacity: 1; transform: translateX(0); }
  to { opacity: 0; transform: translateX(-60px); } /* Increased slide distance */
}
@keyframes templateSlideInRight { 
  from { opacity: 0; transform: translateX(60px); } /* Increased slide distance */
  to { opacity: 1; transform: translateX(0); } 
}
@keyframes templateFadeIn { 
  from { opacity: 0; transform: translateY(20px); } /* Fade in with slight upward move */
  to { opacity: 1; transform: translateY(0); } 
}
@keyframes templatePopFeedback { 
  0% { transform: scale(0.9) translateY(5px); opacity: 0.7; } 
  70% { transform: scale(1.05) translateY(0px); opacity: 1; } 
  100% { transform: scale(1) translateY(0px); opacity: 1; } 
}

/* Matching Question Specific Styles */
.prompt-item.selected-prompt, .target-item.selected-target { /* Generic selected state if needed */
  background-color: hsl(var(--accent) / 0.2) !important;
  border-color: hsl(var(--accent)) !important;
  font-weight: 600;
  box-shadow: 0 0 8px hsl(var(--accent) / 0.5);
}

/* Drag & Drop Specific Styles */
.drag-item {
  transition: transform 0.15s ease-out, box-shadow 0.15s ease-out;
}
.drag-item.dragging {
  opacity: 0.6;
  transform: scale(0.92) rotate(-3deg); /* Slight tilt while dragging */
  box-shadow: 0 6px 12px rgba(0,0,0,0.25);
}
.drop-target.drag-over {
  background-color: hsl(var(--primary) / 0.1);
  border-color: hsl(var(--primary));
  border-style: solid;
  box-shadow: inset 0 0 10px hsl(var(--primary) / 0.3);
}

/* General button styling from template script if not using Tailwind */
button[data-element="restart-button"] {
  /* Styles for restart button if Tailwind is not fully utilized by user in template */
}
`;

export const pageTemplates: PageTemplate[] = [
  {
    id: DEFAULT_TEMPLATE_ID,
    name: 'Blank Canvas (Full Quiz Engine)',
    description: 'A foundational, well-commented starting point. Includes a built-in JavaScript quiz engine supporting multiple question types (MCQ text/image, Text Matching, Text Drag & Drop) and user-customizable HTML/CSS/JS. This template is a complete quiz experience out-of-the-box, demonstrating full customization capabilities.',
    htmlContent: defaultHtmlContent,
    cssContent: defaultCssContent,
    previewImageUrl: 'https://placehold.co/600x400.png',
    aiHint: 'quiz interface app',
    tags: ['Standard', 'Engine', 'Customizable', 'All Types', 'Base'],
  },
  {
    id: 'tpl-minimalist-mcq-engine',
    name: 'Minimalist MCQ Engine',
    description: 'A clean, focused quiz engine template specifically for text-based and image-based Multiple Choice Questions. Includes its own JavaScript for MCQ logic. (This is an example of a specialized engine).',
    // For a real specialized template, htmlContent would contain a script focused *only* on MCQs.
    // For demonstration, it reuses the default engine's structure but implies specialization.
    htmlContent: defaultHtmlContent.replace(/Blank Canvas \(Full Quiz Engine\)/g, 'Minimalist MCQ Engine').replace('max-w-3xl', 'max-w-xl'), // Example structural tweak
    cssContent: defaultCssContent.replace('/* QuizSmith ADVANCED Page Template CSS (Blank Canvas - Full Quiz Engine) */', '/* Minimalist MCQ Engine CSS */\n.quiz-engine-container { /* Maybe different padding or font */ }'),
    previewImageUrl: 'https://placehold.co/600x400.png',
    aiHint: 'simple modern quiz',
    tags: ['MCQ', 'Minimalist', 'Engine', 'Focused'],
  },
  // Add more diverse templates here, each with its own full HTML/CSS/JS engine
  // For example, a template that heavily uses 3D animations, or one with a game-like interface.
];
