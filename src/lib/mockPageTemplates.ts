
import type { PageTemplate } from './types';

export const DEFAULT_TEMPLATE_ID = 'tpl-blank-canvas-engine';

// =====================================================================================
// "BLANK CANVAS (FULL QUIZ ENGINE)" TEMPLATE
// This HTML includes all necessary JavaScript for a multi-type quiz.
// The Test Editor injects data into placeholder elements.
// This template's script reads that data and runs the quiz.
// All UI text (Correct, Incorrect, etc.) is defined within this template's script.
// =====================================================================================
const defaultHtmlContent = `
<!-- 
  QuizSmith ADVANCED Page Template: Blank Canvas (Full Quiz Engine)
  This HTML is a self-contained quiz engine. It includes structure, placeholders for data injection,
  and a comprehensive <script> block to handle quiz logic, rendering, and interactions for various question types.

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
  8. DEFINING UI TEXT (e.g., "Correct!", "Incorrect!", "Restart Quiz") DIRECTLY IN THIS SCRIPT.
  9. Handling all animations and operational logic for the quiz flow.

  CUSTOMIZATION:
  - Modify the HTML structure below.
  - Modify the CSS in this template's CSS definition.
  - Modify or extend the JavaScript engine in the <script> block at the end of this HTML.
  
  ACCESSIBILITY NOTE: This template engine uses basic HTML elements. 
  For production, ensure proper ARIA attributes are added for accessibility.
-->
<div class="quiz-engine-container p-4 md:p-8 rounded-xl shadow-2xl bg-card text-card-foreground max-w-3xl mx-auto my-6">
  
  <!-- These elements are populated by the Test Editor before the preview is rendered -->
  <script id="quiz-data" type="application/json"></script>
  <div id="quiz-name-data" style="display:none;"></div>
  <div id="quiz-end-message-data" style="display:none;"></div>

  <h1 id="template-quiz-title" class="text-3xl font-bold mb-6 text-primary text-center"></h1>
  
  <div id="template-quiz-content-host" class="space-y-8">
    <!-- Questions will be rendered here by this template's script -->
  </div>

  <!-- Blueprint for a single question (cloned and populated by script) -->
  <div id="template-question-blueprint" style="display: none;" class="question-block p-5 bg-background/70 border border-border rounded-lg shadow-md">
    <h2 data-element="question-text" class="text-xl font-semibold mb-5 text-foreground"></h2>
    <div data-element="options-container" class="options-area space-y-3">
      <!-- Options/interactive elements populated here by script -->
    </div>
    <div data-element="feedback-message" class="feedback-text mt-4 text-center font-medium text-lg" style="min-height: 28px;"></div>
  </div>

  <!-- Blueprint for an end screen (populated by script) -->
  <div id="template-quiz-end-screen" style="display: none;" class="text-center p-6 bg-card rounded-lg shadow-xl">
    <h2 data-element="end-screen-title" class="text-2xl font-bold mb-4 text-primary"></h2>
    <p data-element="end-screen-message" class="text-lg text-foreground mb-6"></p>
    <button data-element="restart-button" class="mt-4 bg-primary text-primary-foreground px-6 py-3 rounded-md hover:bg-primary/90 transition-colors text-base font-medium shadow-md"></button>
  </div>
  
  <!-- 
    CUSTOM JAVASCRIPT FOR THIS PAGE STYLE TEMPLATE:
    You can add your own <script> tags here for template-specific animations or JS enhancements
    that are INDEPENDENT of the core quiz engine below.
    Example of a simple template-specific script:
    <script>
      // document.addEventListener('DOMContentLoaded', () => {
      //   console.log("Quiz Engine Template's own additional JS loaded!");
      // });
    <\/script>
  -->

  <!-- THE CORE QUIZ ENGINE JAVASCRIPT FOR THIS TEMPLATE -->
  <script>
    document.addEventListener('DOMContentLoaded', () => {
      // --- CONFIGURABLE UI TEXT (Defined within this template's script) ---
      const TEXT_CONFIG = {
        CORRECT: "Correct!",
        INCORRECT: "Incorrect!",
        QUIZ_COMPLETE: "Quiz Complete!",
        RESTART_QUIZ: "Restart Quiz",
        MATCHING_SELECT_PROMPT: "Select a match for:",
        DRAG_DROP_HERE_LABEL: "Drop here",
        QUESTION_PROGRESS_PREFIX: "Question", // e.g., "Question 1 of 5"
        OF_PROGRESS_SEPARATOR: "of",
        MATCHING_FEEDBACK_PREFIX: "Matched",
        DRAG_DROP_FEEDBACK_PREFIX: "Correct Drops:",
        LOADING_QUIZ: "Loading Quiz...",
        NO_QUESTIONS_LOADED: "No questions loaded. Please check the test configuration.",
        UNSUPPORTED_QUESTION_TYPE: "Unsupported question type in this template."
      };

      // --- DATA FETCHING (from elements injected by Test Editor) ---
      let questions = [];
      let quizName = TEXT_CONFIG.LOADING_QUIZ;
      let rawQuizEndMessage = "Finished! Your score: {{score}}/{{total}}.";

      try {
        const questionsDataEl = document.getElementById('quiz-data');
        if (questionsDataEl && questionsDataEl.textContent) {
          questions = JSON.parse(questionsDataEl.textContent);
        } else {
          console.warn("QuizSmith Template: Quiz data element not found or empty.");
        }
      } catch (e) { console.error("QuizSmith Template: Error parsing quiz data:", e); }

      const quizNameEl = document.getElementById('quiz-name-data');
      if (quizNameEl && quizNameEl.textContent) quizName = quizNameEl.textContent;
      
      const titleDisplayEl = document.getElementById('template-quiz-title');
      if(titleDisplayEl) titleDisplayEl.textContent = quizName;
      
      const endMessageEl = document.getElementById('quiz-end-message-data');
      if (endMessageEl && endMessageEl.textContent) rawQuizEndMessage = endMessageEl.textContent;

      // --- DOM ELEMENTS (Blueprints) ---
      const contentHost = document.getElementById('template-quiz-content-host');
      const questionBlueprint = document.getElementById('template-question-blueprint');
      const endScreenBlueprint = document.getElementById('template-quiz-end-screen');

      if (!contentHost || !questionBlueprint || !endScreenBlueprint) {
        console.error("QuizSmith Template: Essential elements (content-host, question-blueprint, end-screen-blueprint) not found.");
        if(contentHost) contentHost.innerHTML = "<p>Error: Template structure is incomplete.</p>";
        return;
      }

      // --- QUIZ STATE ---
      let currentQuestionIndex = 0;
      let score = 0;
      let activeQuestionElement = null;
      let selectedMatchPromptData = null; // For matching questions state

      // --- RENDER FUNCTIONS ---
      function displayCurrentQuestion() {
        if (activeQuestionElement) {
          activeQuestionElement.classList.remove('animate-slide-in-right', 'animate-fade-in');
          activeQuestionElement.classList.add('animate-slide-out-left');
          setTimeout(() => { 
            if (activeQuestionElement && activeQuestionElement.parentElement) {
              activeQuestionElement.remove();
            }
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
        activeQuestionElement.id = 'q-' + question.id; 
        activeQuestionElement.style.display = 'block';

        const questionTextEl = activeQuestionElement.querySelector('[data-element="question-text"]');
        questionTextEl.textContent = \`\${TEXT_CONFIG.QUESTION_PROGRESS_PREFIX} \${currentQuestionIndex + 1} \${TEXT_CONFIG.OF_PROGRESS_SEPARATOR} \${questions.length}: \${question.text}\`;
        
        const optionsContainer = activeQuestionElement.querySelector('[data-element="options-container"]');
        optionsContainer.innerHTML = ''; // Clear previous options

        switch (question.type) {
          case 'multiple-choice-text':
          case 'multiple-choice-image':
            renderMCQ(question, optionsContainer, activeQuestionElement);
            break;
          case 'matching-text-text':
            renderMatching(question, optionsContainer, activeQuestionElement);
            break;
          case 'drag-and-drop-text-text':
            renderDragAndDrop(question, optionsContainer, activeQuestionElement);
            break;
          default:
            optionsContainer.innerHTML = \`<p>\${TEXT_CONFIG.UNSUPPORTED_QUESTION_TYPE}</p>\`;
        }
        
        contentHost.innerHTML = ''; // Clear previous question
        contentHost.appendChild(activeQuestionElement);
        activeQuestionElement.classList.remove('animate-slide-out-left'); // Ensure it's clean
        activeQuestionElement.classList.add('animate-slide-in-right');
      }

      function renderMCQ(question, container, questionEl) {
        (question.options || []).forEach(option => {
          const button = document.createElement('button');
          button.className = 'template-option-button w-full text-left p-3.5 border border-input rounded-md text-foreground hover:bg-secondary hover:border-primary focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1 focus:ring-offset-background transition-all duration-150 ease-in-out transform hover:-translate-y-0.5';
          if (question.type === 'multiple-choice-image' && option.imageUrl) {
            button.classList.add('image-option'); // Add class for specific styling
            const img = document.createElement('img');
            img.src = option.imageUrl;
            img.alt = option.text || 'Option image';
            img.className = 'max-h-40 mx-auto mb-2 rounded-sm object-contain border'; // Adjusted max-h
            button.appendChild(img);
            if (option.text) {
              const p = document.createElement('p');
              p.className = 'text-center text-sm mt-1';
              p.textContent = option.text;
              button.appendChild(p);
            }
          } else {
            button.textContent = option.text;
          }
          button.onclick = () => handleMCQAnswer(button, option, question, questionEl);
          container.appendChild(button);
        });
      }
      
      function renderMatching(question, container, questionEl) {
        selectedMatchPromptData = null; 
        const allPairsForThisQuestion = (question.matchPairs || []).map(p => ({...p, answered: false, matchedCorrectly: null}));

        const promptsDiv = document.createElement('div');
        promptsDiv.className = 'matching-prompts grid grid-cols-1 md:grid-cols-2 gap-3 mb-4';
        
        const targetsDiv = document.createElement('div');
        targetsDiv.className = 'matching-targets grid grid-cols-1 md:grid-cols-2 gap-3';

        const shuffledTargets = [...allPairsForThisQuestion].sort(() => 0.5 - Math.random());

        allPairsForThisQuestion.forEach(pair => {
          const promptEl = document.createElement('div');
          promptEl.className = 'prompt-item p-3 border rounded-md bg-muted cursor-pointer hover:bg-accent/20 transition-colors';
          promptEl.textContent = pair.prompt;
          promptEl.dataset.pairId = pair.id;
          promptEl.onclick = () => handleMatchPromptSelect(promptEl, pair, questionEl, allPairsForThisQuestion);
          promptsDiv.appendChild(promptEl);
        });

        shuffledTargets.forEach(targetPairData => {
          const targetEl = document.createElement('div');
          targetEl.className = 'target-item p-3 border-2 border-dashed border-border rounded-md cursor-pointer hover:border-primary hover:bg-secondary/50 transition-colors min-h-[40px] flex items-center justify-center';
          targetEl.textContent = targetPairData.target;
          targetEl.dataset.targetForPairId = targetPairData.id;
          targetEl.onclick = () => handleMatchTargetSelect(targetEl, targetPairData.id, allPairsForThisQuestion, questionEl);
          targetsDiv.appendChild(targetEl);
        });

        container.innerHTML = \`
          <p class="text-sm text-muted-foreground mb-2">\${TEXT_CONFIG.MATCHING_SELECT_PROMPT}</p>
        \`;
        container.appendChild(promptsDiv);
        container.appendChild(document.createElement('hr'));
        container.appendChild(targetsDiv);
      }

      function renderDragAndDrop(question, container, questionEl) {
        const dragItemsPool = document.createElement('div');
        dragItemsPool.className = 'drag-items-pool mb-4 p-3 border rounded-md bg-muted/50 flex flex-wrap gap-2 justify-center min-h-[50px]';
        
        (question.dragItems || []).forEach(item => {
          const el = document.createElement('div');
          el.id = \`drag-\${question.id}-\${item.id}\`; 
          el.className = 'drag-item p-2 border rounded bg-primary text-primary-foreground cursor-grab shadow-md';
          el.textContent = item.text;
          el.draggable = true;
          el.ondragstart = (event) => {
            event.dataTransfer.setData('text/plain', item.id); 
            event.dataTransfer.setData('questionId', question.id); // Pass question ID
            event.target.classList.add('dragging');
          };
          el.ondragend = (event) => {
             event.target.classList.remove('dragging');
          };
          dragItemsPool.appendChild(el);
        });
        container.appendChild(dragItemsPool);

        const dropTargetsContainer = document.createElement('div');
        const numDropTargets = (question.dropTargets || []).length || 1;
        dropTargetsContainer.className = \`drop-targets-area grid grid-cols-1 md:grid-cols-\${Math.min(3, numDropTargets)} gap-4\`;

        (question.dropTargets || []).forEach(target => {
          const el = document.createElement('div');
          el.id = \`drop-\${question.id}-\${target.id}\`; 
          el.className = 'drop-target p-4 border-2 border-dashed border-border rounded-md min-h-[60px] flex items-center justify-center text-muted-foreground transition-colors';
          el.textContent = target.text || TEXT_CONFIG.DRAG_DROP_HERE_LABEL; 
          el.dataset.expectedDragItemId = target.expectedDragItemId || ""; // Ensure it's a string
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
            const eventQuestionId = event.dataTransfer.getData('questionId');
            
            if (eventQuestionId !== question.id) return; // Item from another question

            const draggedEl = document.getElementById(\`drag-\${question.id}-\${droppedItemId}\`);
            if (draggedEl) {
              // If target already has an item, move it back to pool
              if(el.firstChild && el.firstChild.classList && el.firstChild.classList.contains('drag-item')) {
                 dragItemsPool.appendChild(el.firstChild); // existing item back to pool
              }
              el.innerHTML = ''; // Clear placeholder text or previous item
              el.appendChild(draggedEl); 
              draggedEl.classList.remove('dragging');
              el.dataset.droppedItemId = droppedItemId; // Store what was dropped
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
          feedbackEl.textContent = TEXT_CONFIG.CORRECT;
          feedbackEl.className = 'feedback-text mt-4 text-center font-medium text-lg correct-feedback';
        } else {
          button.classList.add('incorrect-answer-selected');
          const correctOptData = (questionData.options || []).find(opt => opt.isCorrect);
          if (correctOptData) {
            const allButtons = Array.from(questionEl.querySelectorAll('.template-option-button'));
            const correctBtn = allButtons.find(btn => {
                if (questionData.type === 'multiple-choice-image') {
                    // For image options, compare based on a unique identifier if text isn't reliable (e.g., option.id)
                    // Assuming option.text is unique enough for this demo or that option.id can be stored on button
                    const imgElement = btn.querySelector('img');
                    return imgElement && imgElement.alt === correctOptData.text; // Or match based on src if unique
                }
                return btn.textContent === correctOptData.text;
            });
            if (correctBtn) correctBtn.classList.add('always-correct-answer');
          }
          feedbackEl.textContent = TEXT_CONFIG.INCORRECT;
          feedbackEl.className = 'feedback-text mt-4 text-center font-medium text-lg incorrect-feedback';
        }
        feedbackEl.classList.add('show-feedback');

        setTimeout(() => {
          currentQuestionIndex++;
          displayCurrentQuestion();
        }, 2000);
      }

      function handleMatchPromptSelect(promptElement, pairData, questionEl, allPairsData) {
        const currentPair = allPairsData.find(p => p.id === pairData.id);
        if (currentPair.answered) return;

        if (selectedMatchPromptData && selectedMatchPromptData.element) {
          selectedMatchPromptData.element.classList.remove('selected-prompt');
        }
        selectedMatchPromptData = { element: promptElement, pairId: pairData.id };
        promptElement.classList.add('selected-prompt');
      }

      function handleMatchTargetSelect(targetElement, targetRepresentsPairId, allPairsData, questionEl) {
        if (!selectedMatchPromptData) return; // No prompt selected

        const selectedPromptPairId = selectedMatchPromptData.pairId;
        const selectedPromptElement = selectedMatchPromptData.element;
        const actualPairForSelectedPrompt = allPairsData.find(p => p.id === selectedPromptPairId);
        
        if (!actualPairForSelectedPrompt || actualPairForSelectedPrompt.answered) return; 

        actualPairForSelectedPrompt.answered = true;
        targetElement.onclick = null; 
        selectedPromptElement.onclick = null; 
        selectedPromptElement.classList.remove('selected-prompt');

        if (selectedPromptPairId === targetRepresentsPairId) { 
          actualPairForSelectedPrompt.matchedCorrectly = true;
          selectedPromptElement.classList.add('correct-match');
          targetElement.classList.add('correct-match');
        } else {
          actualPairForSelectedPrompt.matchedCorrectly = false;
          selectedPromptElement.classList.add('incorrect-match');
          targetElement.classList.add('incorrect-match');
          
          // Highlight the correct target for the wrongly matched prompt
          const correctTargetEl = Array.from(questionEl.querySelectorAll('.target-item'))
                                     .find(el => el.dataset.targetForPairId === selectedPromptPairId);
          if (correctTargetEl) {
            correctTargetEl.classList.add('always-correct-target-highlight');
          }
        }
        
        selectedMatchPromptData = null; // Reset selected prompt

        const allAnswered = allPairsData.every(p => p.answered);
        if (allAnswered) {
          const correctCount = allPairsData.filter(p => p.matchedCorrectly).length;
          score += correctCount; 
          const feedbackEl = questionEl.querySelector('[data-element="feedback-message"]');
          feedbackEl.textContent = \`\${TEXT_CONFIG.MATCHING_FEEDBACK_PREFIX} \${correctCount} / \${allPairsData.length}\`;
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
            target.ondragover = null; // Disable further drops
            target.ondrop = null;
            if (droppedItemEl) droppedItemEl.draggable = false;

            if (target.dataset.droppedItemId === target.dataset.expectedDragItemId) {
              correctDrops++;
              target.classList.add('correct-drop');
              if(droppedItemEl) droppedItemEl.classList.add('correct-drop-item');
            } else {
              target.classList.add('incorrect-drop');
              if(droppedItemEl) droppedItemEl.classList.add('incorrect-drop-item');
            }
          });
          
          (dragItemsPool.querySelectorAll('.drag-item') || []).forEach(item => item.draggable = false); // Disable remaining items in pool

          score += correctDrops;
          const feedbackEl = questionEl.querySelector('[data-element="feedback-message"]');
          feedbackEl.textContent = \`\${TEXT_CONFIG.DRAG_DROP_FEEDBACK_PREFIX} \${correctDrops} / \${(question.dropTargets || []).length}\`;
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
        
        endScreen.querySelector('[data-element="end-screen-title"]').textContent = TEXT_CONFIG.QUIZ_COMPLETE;
        const finalMessage = rawQuizEndMessage
                                .replace(/{{score}}/g, score.toString()) 
                                .replace(/{{total}}/g, questions.length.toString());
        endScreen.querySelector('[data-element="end-screen-message"]').textContent = finalMessage;
        
        const restartBtn = endScreen.querySelector('[data-element="restart-button"]');
        restartBtn.textContent = TEXT_CONFIG.RESTART_QUIZ;
        restartBtn.onclick = () => {
          currentQuestionIndex = 0;
          score = 0;
          // Reset matching/dragdrop states if needed by iterating through questions data
          // For this demo, simple reset of index and score is enough.
          activeQuestionElement = null; 
          displayCurrentQuestion();
        };
        
        contentHost.appendChild(endScreen);
        endScreen.classList.remove('animate-slide-out-left'); 
        endScreen.classList.add('animate-fade-in');
      }

      // --- INITIALIZATION ---
      if (questions && questions.length > 0) {
        displayCurrentQuestion();
      } else {
        if(contentHost) contentHost.innerHTML = \`<p>\${TEXT_CONFIG.NO_QUESTIONS_LOADED}</p>\`;
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
  This CSS uses variables from globals.css for theming (e.g. hsl(var(--primary))).
*/
body { 
  background-color: hsl(var(--background)); 
  color: hsl(var(--foreground));
  font-family: var(--font-geist-sans, sans-serif);
  margin:0; 
}
.quiz-engine-container { 
  font-family: var(--font-geist-sans), sans-serif;
}

/* MCQ Option Button Styling */
.template-option-button {
  /* Base style for options generated by template script */
}
.template-option-button.image-option {
  padding: 0.75rem;
  background-color: hsl(var(--card) / 0.8);
}
.template-option-button.image-option img {
  max-height: 150px; /* Adjusted */
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
.drag-item.correct-drop-item { /* Corrected selector */
  background-color: hsl(var(--success-bg)) !important;
  color: hsl(var(--success-fg)) !important;
  border-color: hsl(var(--success-border)) !important;
  box-shadow: 0 0 0 2px hsl(var(--success-border) / 0.7);
}
.drop-target.correct-drop { 
   border-color: hsl(var(--success-border)) !important;
   background-color: hsl(var(--success-bg) / 0.3) !important;
}

.template-option-button.incorrect-answer-selected,
.prompt-item.incorrect-match, 
.target-item.incorrect-match,
.drag-item.incorrect-drop-item { /* Corrected selector */
  background-color: hsl(var(--destructive)) !important;
  color: hsl(var(--destructive-foreground)) !important;
  border-color: hsl(var(--destructive) / 0.8) !important;
  box-shadow: 0 0 0 2px hsl(var(--destructive) / 0.5);
  opacity: 0.9;
}
.drop-target.incorrect-drop { 
   border-color: hsl(var(--destructive) / 0.7) !important;
   background-color: hsl(var(--destructive) / 0.2) !important;
}
.target-item.incorrect-match, .prompt-item.incorrect-match {
  text-decoration: line-through;
  opacity: 0.7;
}


.template-option-button.always-correct-answer, /* Applied to the actual correct option if user was wrong */
.target-item.always-correct-target-highlight { /* Applied to the actual correct target if user was wrong */
  background-color: hsl(var(--success-bg) / 0.7) !important;
  color: hsl(var(--success-fg)) !important;
  border: 2px solid hsl(var(--success-border)) !important;
}


.feedback-text { 
  opacity: 0; 
  transform: translateY(10px); 
  transition: opacity 0.3s ease-out, transform 0.3s ease-out; 
  font-size: 1.1rem; 
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
  opacity: 1;
  transform: translateX(0);
}
.animate-slide-out-left { 
  animation: templateSlideOutLeft 0.5s cubic-bezier(0.25, 1, 0.5, 1) forwards;
}
.animate-slide-in-right { 
  animation: templateSlideInRight 0.5s cubic-bezier(0.25, 1, 0.5, 1) forwards; 
}
.animate-fade-in {
  animation: templateFadeIn 0.6s ease-out forwards;
}

@keyframes templateSlideOutLeft {
  from { opacity: 1; transform: translateX(0); }
  to { opacity: 0; transform: translateX(-60px); } 
}
@keyframes templateSlideInRight { 
  from { opacity: 0; transform: translateX(60px); } 
  to { opacity: 1; transform: translateX(0); } 
}
@keyframes templateFadeIn { 
  from { opacity: 0; transform: translateY(20px); } 
  to { opacity: 1; transform: translateY(0); } 
}
@keyframes templatePopFeedback { 
  0% { transform: scale(0.9) translateY(5px); opacity: 0.7; } 
  70% { transform: scale(1.05) translateY(0px); opacity: 1; } 
  100% { transform: scale(1) translateY(0px); opacity: 1; } 
}

/* Matching Question Specific Styles */
.prompt-item.selected-prompt { 
  background-color: hsl(var(--accent) / 0.3) !important; /* More prominent selection */
  border-color: hsl(var(--accent)) !important;
  font-weight: 600;
  box-shadow: 0 0 8px hsl(var(--accent) / 0.5);
}

/* Drag & Drop Specific Styles */
.drag-item {
  transition: transform 0.15s ease-out, box-shadow 0.15s ease-out;
}
.drag-item.dragging {
  opacity: 0.5; /* More visible when dragging */
  transform: scale(0.95) rotate(-2deg); 
  box-shadow: 0 8px 16px rgba(0,0,0,0.3); /* Stronger shadow */
}
.drop-target.drag-over {
  background-color: hsl(var(--primary) / 0.15); /* Slightly darker on hover */
  border-color: hsl(var(--primary));
  border-style: solid;
  box-shadow: inset 0 0 12px hsl(var(--primary) / 0.4); /* More prominent inset shadow */
}
`;

export const pageTemplates: PageTemplate[] = [
  {
    id: DEFAULT_TEMPLATE_ID,
    name: 'Blank Canvas (Full Quiz Engine)',
    description: 'A foundational, well-commented starting point. Includes a built-in JavaScript quiz engine supporting multiple question types (MCQ text/image, Text Matching, Text Drag & Drop) and user-customizable HTML/CSS/JS. This template is a complete quiz experience out-of-the-box, demonstrating full customization capabilities. All quiz text (Correct, Incorrect, etc.) is defined within this template\'s JavaScript for full control.',
    htmlContent: defaultHtmlContent,
    cssContent: defaultCssContent,
    previewImageUrl: 'https://placehold.co/600x400.png',
    aiHint: 'quiz interface app',
    tags: ['Standard', 'Engine', 'Customizable', 'All Types', 'Base'],
  },
  {
    id: 'tpl-sleek-mcq',
    name: 'Sleek Text MCQ (Uses Standard Engine)',
    description: 'A clean and modern CSS style focused on text-based Multiple Choice Questions. This template uses the Standard Quiz Engine but provides a different visual appearance through its CSS.',
    // HTML is minimal, relying on the standard engine's structure generation.
    // Data injection points are still needed if the standard engine is to be used directly or adapted.
    htmlContent: `
<div class="sleek-mcq-container p-6 md:p-10 rounded-lg shadow-xl bg-gradient-to-br from-secondary via-background to-background max-w-2xl mx-auto my-8 text-foreground">
  <!-- Data injection elements (populated by Test Editor) -->
  <script id="quiz-data" type="application/json"></script>
  <div id="quiz-name-data" style="display:none;"></div>
  <div id="quiz-end-message-data" style="display:none;"></div>

  <h1 id="template-quiz-title" class="text-4xl font-extrabold mb-8 text-primary text-center title-pop-in"></h1>
  
  <div id="template-quiz-content-host" class="space-y-6">
    <!-- Questions will be rendered here by the standard engine -->
  </div>

  <!-- Blueprint for a single question (standard engine will look for this) -->
  <div id="template-question-blueprint" style="display: none;" class="question-block p-6 bg-card/80 backdrop-blur-sm border border-border/30 rounded-xl shadow-lg">
    <h2 data-element="question-text" class="text-2xl font-semibold mb-6 text-primary-foreground/90"></h2>
    <div data-element="options-container" class="options-area grid grid-cols-1 sm:grid-cols-2 gap-4">
      <!-- Option buttons will be styled by .sleek-option-button -->
    </div>
    <div data-element="feedback-message" class="feedback-text mt-5 text-center font-semibold text-lg" style="min-height: 30px;"></div>
  </div>

  <!-- Blueprint for an end screen (standard engine will look for this) -->
  <div id="template-quiz-end-screen" style="display: none;" class="text-center p-8 bg-card/90 backdrop-blur-sm rounded-xl shadow-2xl">
    <h2 data-element="end-screen-title" class="text-3xl font-bold mb-5 text-primary"></h2>
    <p data-element="end-screen-message" class="text-xl text-foreground/90 mb-8"></p>
    <button data-element="restart-button" class="mt-4 bg-accent text-accent-foreground px-8 py-3 rounded-lg hover:bg-accent/80 transition-colors text-lg font-medium shadow-lg"></button>
  </div>
  
  <!-- Re-uses the CORE QUIZ ENGINE SCRIPT from the 'tpl-blank-canvas-engine' template by convention -->
  <!-- If this template had its OWN distinct engine, its script would go here. -->
  <!-- For this example, we assume it uses the default engine's JS logic, and only provides CSS overrides and minor HTML structure tweaks. -->
  <script>
    // Template-specific JS for Sleek Text MCQ (e.g., custom animations NOT handled by core engine)
    document.addEventListener('DOMContentLoaded', () => {
      // console.log("Sleek Text MCQ template JS enhancements can go here.");
      const title = document.getElementById('template-quiz-title');
      // if(title) { /* Example: Add custom animation to title if desired, if not handled by core CSS */ }
    });
  <\/script>
  ${defaultHtmlContent.substring(defaultHtmlContent.indexOf('<script>'), defaultHtmlContent.lastIndexOf('<\/script>') + 9)}
</div>`,
    cssContent: `
/* Sleek Text MCQ CSS - Overrides and additions to default engine styles */
body { background-color: hsl(var(--background)); color: hsl(var(--foreground));}
.sleek-mcq-container { /* Custom container styles */ }

.title-pop-in { 
  animation: titlePopInSleek 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94) .2s forwards; /* Added delay */
  opacity: 0;
  transform: translateY(-20px);
}
@keyframes titlePopInSleek { /* Renamed to avoid conflict if other template has same name */
  to { opacity: 1; transform: translateY(0); }
}

/* Override .template-option-button for this specific template (if using standard engine's class names) */
/* Or, define new classes and ensure the standard engine (if adapted) or this template's own engine uses them */
.template-option-button { 
  display: block;
  width: 100%;
  text-align: left;
  padding: 1rem 1.5rem;
  margin-bottom: 0.75rem;
  border: 1px solid hsl(var(--border) / 0.5);
  border-radius: var(--radius);
  background-color: hsl(var(--card));
  color: hsl(var(--card-foreground));
  transition: all 0.2s ease-in-out;
  font-size: 1rem;
  font-weight: 500;
}
.template-option-button:hover {
  background-color: hsl(var(--primary) / 0.1);
  border-color: hsl(var(--primary));
  color: hsl(var(--primary));
  transform: translateY(-2px);
  box-shadow: 0 4px 15px hsl(var(--primary) / 0.1);
}
.template-option-button:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}
.template-option-button.correct-answer {
  background-color: hsl(var(--success-bg)) !important;
  color: hsl(var(--success-fg)) !important;
  border-color: hsl(var(--success-border)) !important;
}
.template-option-button.incorrect-answer-selected {
  background-color: hsl(var(--destructive)) !important;
  color: hsl(var(--destructive-foreground)) !important;
  border-color: hsl(var(--destructive) / 0.8) !important;
}
.template-option-button.always-correct-answer {
   border: 2px solid hsl(var(--success-border)) !important;
}
.feedback-text.correct-feedback { color: hsl(var(--success-fg)); }
.feedback-text.incorrect-feedback { color: hsl(var(--destructive)); }

/* Ensure question transition animations from default template are available or overridden */
.animate-slide-out-left { animation: templateSlideOutLeft 0.5s cubic-bezier(0.25, 1, 0.5, 1) forwards; }
.animate-slide-in-right { animation: templateSlideInRight 0.5s cubic-bezier(0.25, 1, 0.5, 1) forwards; }
.animate-fade-in { animation: templateFadeIn 0.6s ease-out forwards; }
@keyframes templateSlideOutLeft { from { opacity: 1; transform: translateX(0); } to { opacity: 0; transform: translateX(-60px); } }
@keyframes templateSlideInRight { from { opacity: 0; transform: translateX(60px); } to { opacity: 1; transform: translateX(0); } }
@keyframes templateFadeIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
@keyframes templatePopFeedback { 0% { transform: scale(0.9) translateY(5px); opacity: 0.7; } 70% { transform: scale(1.05) translateY(0px); opacity: 1; } 100% { transform: scale(1) translateY(0px); opacity: 1; } }
`,
    previewImageUrl: 'https://placehold.co/600x400.png',
    aiHint: 'modern quiz sleek',
    tags: ['MCQ', 'Text', 'Sleek', 'Modern', 'Uses Standard Engine'],
  },
  // Add more diverse templates here, each potentially with its own JS engine or reusing/extending the standard one.
];
