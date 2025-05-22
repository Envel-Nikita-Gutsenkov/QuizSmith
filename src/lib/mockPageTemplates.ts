
import type { PageTemplate } from './types';

export const DEFAULT_TEMPLATE_ID = 'tpl-blank-canvas-engine';

// =====================================================================================
// "BLANK CANVAS (FULL QUIZ ENGINE)" TEMPLATE
// This HTML includes all necessary JavaScript for a multi-type quiz.
// The Test Editor injects data into placeholder elements OUTSIDE this HTML,
// but within the iframe body. This template's script reads that data.
// All UI text (Correct, Incorrect, etc.) is defined within this template's script.
// =====================================================================================
const defaultHtmlContent = `
<!-- 
  QuizSmith ADVANCED Page Template: Blank Canvas (Full Quiz Engine)
  This HTML is a self-contained quiz engine. It includes structure, placeholders for data injection,
  and a comprehensive <script> block to handle quiz logic, rendering, and interactions for various question types.

  DATA INJECTION (from Test Editor into iframe body, OUTSIDE this template's direct HTML):
  - <script id="quiz-data" type="application/json">[QUESTIONS_ARRAY_JSON_STRING]</script>
  - <div id="quiz-name-data" style="display:none;">[QUIZ_NAME_STRING]</div>
  - <div id="quiz-end-message-data" style="display:none;">[QUIZ_END_MESSAGE_STRING_WITH_PLACEHOLDERS]</div>

  THE JAVASCRIPT WITHIN THIS TEMPLATE (BELOW) IS RESPONSIBLE FOR:
  1. Reading the injected data from the elements above.
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
  
  <!-- These elements are NOT directly populated by Test Editor anymore.
       The template's OWN SCRIPT below will look for quiz-data, quiz-name-data, quiz-end-message-data
       which are INJECTED by the editor OUTSIDE this template's direct HTML but within the iframe's body. -->

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
      //   // console.log("Blank Canvas Page Style Template JS loaded!");
      // });
    <\/script>
  -->

  <!-- THE CORE QUIZ ENGINE JAVASCRIPT FOR THIS TEMPLATE -->
  <script>
    (function() { // IIFE to encapsulate scope
      // --- CONFIGURABLE UI TEXT (Defined within this template's script) ---
      const TEXT_CONFIG = {
        CORRECT: "Correct!",
        INCORRECT: "Incorrect! Try again.",
        QUIZ_COMPLETE: "Quiz Complete!",
        RESTART_QUIZ: "Restart Quiz",
        MATCHING_SELECT_PROMPT: "Select a match for:",
        DRAG_DROP_HERE_LABEL: "Drop here",
        QUESTION_PROGRESS_PREFIX: "Question", // e.g., "Question 1 of 5"
        OF_PROGRESS_SEPARATOR: "of",
        MATCHING_FEEDBACK_PREFIX: "Matched",
        DRAG_DROP_FEEDBACK_PREFIX: "Correct Drops:",
        LOADING_QUIZ: "Loading Quiz...",
        NO_QUESTIONS_LOADED: "No questions loaded. Please check the test configuration or add questions.",
        UNSUPPORTED_QUESTION_TYPE: "Unsupported question type in this template."
      };

      // --- DOM ELEMENTS (Blueprints & Hosts) ---
      let contentHost, questionBlueprint, endScreenBlueprint, titleDisplayEl;
      
      // --- QUIZ STATE ---
      let questions = [];
      let quizName = TEXT_CONFIG.LOADING_QUIZ;
      let rawQuizEndMessage = "Finished! Your score: {{score}}/{{total}}.";
      let currentQuestionIndex = 0;
      let score = 0;
      let activeQuestionElement = null;
      let selectedMatchPromptData = null; // For matching questions state
      let dataLoadAttempts = 0;
      const MAX_DATA_LOAD_ATTEMPTS = 5;
      const DATA_LOAD_RETRY_DELAY = 200; // ms

      function initializeQuizEngine() {
        // console.log('Template Script: Attempting to initialize quiz engine. Attempt:', dataLoadAttempts + 1);
        
        titleDisplayEl = document.getElementById('template-quiz-title');
        contentHost = document.getElementById('template-quiz-content-host');
        questionBlueprint = document.getElementById('template-question-blueprint');
        endScreenBlueprint = document.getElementById('template-quiz-end-screen');

        if (!titleDisplayEl || !contentHost || !questionBlueprint || !endScreenBlueprint) {
          console.error("QuizSmith Template Engine: Essential HTML structure (title, content-host, question-blueprint, end-screen-blueprint) not found in the template.");
          if (titleDisplayEl) titleDisplayEl.textContent = "Template Structure Error";
          return;
        }
        
        titleDisplayEl.textContent = TEXT_CONFIG.LOADING_QUIZ; // Initial text

        const questionsDataEl = document.getElementById('quiz-data');
        const quizNameEl = document.getElementById('quiz-name-data');
        const endMessageEl = document.getElementById('quiz-end-message-data');

        // console.log('Template Script: questionsDataEl found?', !!questionsDataEl);
        // if (questionsDataEl) console.log('Template Script: questionsDataEl.textContent empty?', !questionsDataEl.textContent);


        if (!questionsDataEl || !questionsDataEl.textContent || !quizNameEl || !endMessageEl) {
          dataLoadAttempts++;
          if (dataLoadAttempts < MAX_DATA_LOAD_ATTEMPTS) {
            // console.log(\`Template Script: Data elements not ready, retrying in \${DATA_LOAD_RETRY_DELAY}ms...\`);
            setTimeout(initializeQuizEngine, DATA_LOAD_RETRY_DELAY);
            return;
          } else {
            console.warn("QuizSmith Template Engine: Could not find necessary data injection elements (quiz-data, quiz-name-data, quiz-end-message-data) after multiple attempts.");
            titleDisplayEl.textContent = TEXT_CONFIG.NO_QUESTIONS_LOADED;
            contentHost.innerHTML = \`<p class="text-center text-destructive">\${TEXT_CONFIG.NO_QUESTIONS_LOADED}</p>\`;
            return;
          }
        }

        try {
          questions = JSON.parse(questionsDataEl.textContent);
          // console.log('Template Script: Successfully parsed questions:', questions);
        } catch (e) { 
          console.error("QuizSmith Template Engine: Error parsing quiz data JSON:", e, "Raw data:", questionsDataEl.textContent);
          questions = []; // Ensure questions is an array even if parsing fails
        }

        if (quizNameEl.textContent) quizName = quizNameEl.textContent;
        if (titleDisplayEl) titleDisplayEl.textContent = quizName;
        
        if (endMessageEl.textContent) rawQuizEndMessage = endMessageEl.textContent;

        if (questions && questions.length > 0) {
          displayCurrentQuestion();
        } else {
          // console.log('Template Script: No questions in data or data parsing failed.');
          titleDisplayEl.textContent = quizName; // Show quiz name even if no questions
          contentHost.innerHTML = \`<p class="text-center text-muted-foreground">\${TEXT_CONFIG.NO_QUESTIONS_LOADED}</p>\`;
        }
      }


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
        if (!questionBlueprint || !contentHost) return;
        activeQuestionElement = questionBlueprint.cloneNode(true);
        activeQuestionElement.id = 'q-' + question.id; 
        activeQuestionElement.style.display = 'block';

        const questionTextEl = activeQuestionElement.querySelector('[data-element="question-text"]');
        if (questionTextEl) {
          questionTextEl.textContent = \`\${TEXT_CONFIG.QUESTION_PROGRESS_PREFIX} \${currentQuestionIndex + 1} \${TEXT_CONFIG.OF_PROGRESS_SEPARATOR} \${questions.length}: \${question.text}\`;
        }
        
        const optionsContainer = activeQuestionElement.querySelector('[data-element="options-container"]');
        if (optionsContainer) {
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
            button.classList.add('image-option'); 
            const img = document.createElement('img');
            img.src = option.imageUrl;
            img.alt = option.text || 'Option image';
            img.className = 'max-h-40 mx-auto mb-2 rounded-sm object-contain border'; 
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
          targetEl.dataset.targetForPairId = targetPairData.id; // Store which pair this target BELONGS to
          targetEl.onclick = () => handleMatchTargetSelect(targetEl, targetPairData.id, allPairsForThisQuestion, questionEl);
          targetsDiv.appendChild(targetEl);
        });

        container.innerHTML = \`<p class="text-sm text-muted-foreground mb-2">\${TEXT_CONFIG.MATCHING_SELECT_PROMPT}</p>\`;
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
            try {
                event.dataTransfer.setData('text/plain', item.id); 
                event.dataTransfer.setData('questionId', question.id); // Pass question ID
                event.target.classList.add('dragging');
            } catch(e) { console.error('Drag start error:', e)}
          };
          el.ondragend = (event) => {
             if(event.target && event.target.classList) event.target.classList.remove('dragging');
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
          el.dataset.targetId = target.id; // For identification

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
              // If target already has an item, move it back to pool if it's not the same item being re-dropped
              if(el.firstChild && el.firstChild.classList && el.firstChild.classList.contains('drag-item') && el.firstChild.id !== draggedEl.id) {
                 dragItemsPool.appendChild(el.firstChild); 
              }
              el.innerHTML = ''; // Clear placeholder text or previous item
              el.appendChild(draggedEl); 
              if(draggedEl.classList) draggedEl.classList.remove('dragging');
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
          if (feedbackEl) {
            feedbackEl.textContent = TEXT_CONFIG.CORRECT;
            feedbackEl.className = 'feedback-text mt-4 text-center font-medium text-lg correct-feedback show-feedback';
          }
        } else {
          button.classList.add('incorrect-answer-selected');
          const correctOptData = (questionData.options || []).find(opt => opt.isCorrect);
          if (correctOptData) {
            const allButtons = Array.from(questionEl.querySelectorAll('.template-option-button'));
            const correctBtn = allButtons.find(btn => {
                if (questionData.type === 'multiple-choice-image' && btn.querySelector('img')) {
                    // Heuristic: Check if image src matches or alt text if available
                    const img = btn.querySelector('img');
                    return (img && correctOptData.imageUrl && img.src === correctOptData.imageUrl) || (img && correctOptData.text && img.alt === correctOptData.text);
                }
                return btn.textContent === correctOptData.text || (btn.querySelector('p') && btn.querySelector('p').textContent === correctOptData.text) ;
            });
            if (correctBtn) correctBtn.classList.add('always-correct-answer');
          }
          if (feedbackEl) {
            feedbackEl.textContent = TEXT_CONFIG.INCORRECT;
            feedbackEl.className = 'feedback-text mt-4 text-center font-medium text-lg incorrect-feedback show-feedback';
          }
        }
        
        setTimeout(() => {
          currentQuestionIndex++;
          displayCurrentQuestion();
        }, 2000);
      }

      function handleMatchPromptSelect(promptElement, pairData, questionEl, allPairsData) {
        const currentPair = allPairsData.find(p => p.id === pairData.id);
        if (!currentPair || currentPair.answered) return;

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
        targetElement.onclick = null; // Disable further clicks on this target
        if(selectedPromptElement) selectedPromptElement.onclick = null; // Disable clicks on matched prompt
        if(selectedPromptElement) selectedPromptElement.classList.remove('selected-prompt');

        if (selectedPromptPairId === targetRepresentsPairId) { 
          actualPairForSelectedPrompt.matchedCorrectly = true;
          if(selectedPromptElement) selectedPromptElement.classList.add('correct-match');
          targetElement.classList.add('correct-match');
        } else {
          actualPairForSelectedPrompt.matchedCorrectly = false;
          if(selectedPromptElement) selectedPromptElement.classList.add('incorrect-match');
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
          if (feedbackEl) {
            feedbackEl.textContent = \`\${TEXT_CONFIG.MATCHING_FEEDBACK_PREFIX} \${correctCount} / \${allPairsData.length}\`;
            feedbackEl.className = 'feedback-text mt-4 text-center font-medium text-lg show-feedback';
          }
           setTimeout(() => {
            currentQuestionIndex++;
            displayCurrentQuestion();
          }, 2500);
        }
      }
      
      function checkAllDragDropAnswers(question, questionEl, dragItemsPool) {
        const targets = questionEl.querySelectorAll('.drop-target');
        let allTargetsHaveAnItem = true;
        targets.forEach(target => {
          if (!target.querySelector('.drag-item')) { // Check if a drag-item is a child
            allTargetsHaveAnItem = false;
          }
        });

        if (allTargetsHaveAnItem) {
          let correctDrops = 0;
          targets.forEach(target => {
            const droppedItemEl = target.querySelector('.drag-item');
            target.ondragover = null; // Disable further drops
            target.ondrop = null;
            if (droppedItemEl) {
                droppedItemEl.draggable = false;
                // The dropped item ID was stored on the target element's dataset during ondrop
                if (target.dataset.droppedItemId === target.dataset.expectedDragItemId) {
                    correctDrops++;
                    target.classList.add('correct-drop');
                    droppedItemEl.classList.add('correct-drop-item');
                } else {
                    target.classList.add('incorrect-drop');
                    droppedItemEl.classList.add('incorrect-drop-item');
                }
            }
          });
          
          if (dragItemsPool) {
            (dragItemsPool.querySelectorAll('.drag-item') || []).forEach(item => item.draggable = false);
          }

          score += correctDrops;
          const feedbackEl = questionEl.querySelector('[data-element="feedback-message"]');
          if (feedbackEl) {
            feedbackEl.textContent = \`\${TEXT_CONFIG.DRAG_DROP_FEEDBACK_PREFIX} \${correctDrops} / \${(question.dropTargets || []).length}\`;
            feedbackEl.className = 'feedback-text mt-4 text-center font-medium text-lg show-feedback';
          }
          setTimeout(() => {
            currentQuestionIndex++;
            displayCurrentQuestion();
          }, 2500);
        }
      }

      // --- END SCREEN ---
      function displayEndScreen() {
        if (!contentHost || !endScreenBlueprint) return;
        contentHost.innerHTML = ''; 
        const endScreen = endScreenBlueprint.cloneNode(true);
        endScreen.id = 'quiz-final-screen';
        endScreen.style.display = 'block';
        
        const titleEl = endScreen.querySelector('[data-element="end-screen-title"]');
        if (titleEl) titleEl.textContent = TEXT_CONFIG.QUIZ_COMPLETE;

        const messageEl = endScreen.querySelector('[data-element="end-screen-message"]');
        if (messageEl) {
            const finalMessage = rawQuizEndMessage
                                .replace(/{{score}}/g, score.toString()) 
                                .replace(/{{total}}/g, questions.length.toString());
            messageEl.textContent = finalMessage;
        }
        
        const restartBtn = endScreen.querySelector('[data-element="restart-button"]');
        if (restartBtn) {
            restartBtn.textContent = TEXT_CONFIG.RESTART_QUIZ;
            restartBtn.onclick = () => {
            currentQuestionIndex = 0;
            score = 0;
            activeQuestionElement = null; 
            // Re-initialize might be better if data fetching needs to happen again,
            // but for simple restart, just starting from question 0 is okay.
            dataLoadAttempts = 0; // Reset attempts for re-initialization if needed for full reset
            initializeQuizEngine(); // Re-fetch and display
            };
        }
        
        contentHost.appendChild(endScreen);
        endScreen.classList.remove('animate-slide-out-left'); 
        endScreen.classList.add('animate-fade-in');
      }

      // --- INITIALIZATION ---
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initializeQuizEngine);
      } else {
        initializeQuizEngine(); // DOMContentLoaded has already fired
      }

    })(); // End of IIFE
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
  padding: 1rem; /* Add some padding to body for better standalone preview */
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
  max-height: 150px; 
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
.target-item.correct-match, /* Target itself if it's the one directly styled */
.drag-item.correct-drop-item { /* Item if it's styled */
  background-color: hsl(var(--success-bg)) !important;
  color: hsl(var(--success-fg)) !important;
  border-color: hsl(var(--success-border)) !important;
  box-shadow: 0 0 0 2px hsl(var(--success-border) / 0.7);
}
.drop-target.correct-drop { /* Drop target area when item is correctly dropped */
   border-color: hsl(var(--success-border)) !important;
   background-color: hsl(var(--success-bg) / 0.3) !important;
}

.template-option-button.incorrect-answer-selected,
.prompt-item.incorrect-match, 
.target-item.incorrect-match, /* Target itself if it's the one directly styled */
.drag-item.incorrect-drop-item { /* Item if it's styled */
  background-color: hsl(var(--destructive)) !important;
  color: hsl(var(--destructive-foreground)) !important;
  border-color: hsl(var(--destructive) / 0.8) !important;
  box-shadow: 0 0 0 2px hsl(var(--destructive) / 0.5);
  opacity: 0.9;
}
.drop-target.incorrect-drop { /* Drop target area when item is incorrectly dropped */
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
  min-height: 1.5em; /* Ensure space for text */
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
  opacity: 0.5; 
  transform: scale(0.95) rotate(-2deg); 
  box-shadow: 0 8px 16px rgba(0,0,0,0.3); 
}
.drop-target.drag-over {
  background-color: hsl(var(--primary) / 0.15); 
  border-color: hsl(var(--primary));
  border-style: solid;
  box-shadow: inset 0 0 12px hsl(var(--primary) / 0.4); 
}
`;

// Other templates can be simpler or also have their own engines.
// For this example, the other templates will be very basic, relying on the
// robust "Blank Canvas (Full Quiz Engine)" if users want advanced features.
const simpleMcqHtml = `
<div class="simple-mcq-quiz-container p-6 bg-secondary/30 rounded-lg shadow-lg max-w-xl mx-auto my-8 text-foreground">
  <h1 id="template-quiz-title" class="text-2xl font-semibold mb-6 text-center text-primary"></h1>
  <div id="template-quiz-content-host" class="space-y-4"></div>
  <div id="template-question-blueprint" style="display: none;" class="simple-question-card p-4 bg-card border border-border rounded-md">
    <h2 data-element="question-text" class="text-lg font-medium mb-3"></h2>
    <div data-element="options-container" class="space-y-2"></div>
    <div data-element="feedback-message" class="mt-3 text-sm" style="min-height:1.5em;"></div>
  </div>
  <div id="template-quiz-end-screen" style="display: none;" class="text-center p-4 bg-card rounded-md">
    <h2 data-element="end-screen-title" class="text-xl font-semibold mb-2 text-primary"></h2>
    <p data-element="end-screen-message" class="mb-4"></p>
    <button data-element="restart-button" class="px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/80"></button>
  </div>
  <!-- This template uses the same JS engine as the Blank Canvas one by convention for demo. -->
  <!-- A real distinct template could have its own <script> engine here. -->
  <script>
    // Minimal script, or could be a copy of the main engine if needed
    // For this example, assume it uses the same engine as defaultHtmlContent for functionality.
    // To make it truly distinct, you'd paste the full engine from defaultHtmlContent here and modify it.
    (function() {
      const TEXT_CONFIG = {
        CORRECT: "Right!",
        INCORRECT: "Oops!",
        QUIZ_COMPLETE: "Done!",
        RESTART_QUIZ: "Try Again",
        LOADING_QUIZ: "Quiz Loading...",
        NO_QUESTIONS_LOADED: "No questions.",
        // ... other texts as needed by the copied engine
      };
      // Simplified or copied engine logic would go here...
      // For brevity in this mock, we'll assume it magically works or refer to the full engine
      // console.log("Simple MCQ Template JS placeholder - would need full engine logic");
      // To make this template fully functional independently, copy the IIFE from defaultHtmlContent here.
    })();
  <\/script>
</div>`;

const simpleMcqCss = `
body { background-color: hsl(var(--background)); color: hsl(var(--foreground)); font-family: var(--font-geist-sans); margin:0; padding:1rem;}
.simple-mcq-quiz-container { /* container specific */ }
.template-option-button {
  display: block; width: 100%; padding: 0.75rem;
  border: 1px solid hsl(var(--input)); border-radius: var(--radius);
  background-color: hsl(var(--background));
  transition: background-color 0.2s, border-color 0.2s;
}
.template-option-button:hover { background-color: hsl(var(--muted)); border-color: hsl(var(--primary)); }
.template-option-button.correct-answer { background-color: hsl(var(--success-bg)) !important; border-color: hsl(var(--success-border)) !important; color: hsl(var(--success-fg)) !important; }
.template-option-button.incorrect-answer-selected { background-color: hsl(var(--destructive)) !important; border-color: hsl(var(--destructive)) !important; color: hsl(var(--destructive-foreground)) !important; }
.template-option-button.always-correct-answer { border: 2px solid hsl(var(--success-border)) !important; }
.feedback-text.correct-feedback { color: hsl(var(--success-fg)); }
.feedback-text.incorrect-feedback { color: hsl(var(--destructive)); }
.animate-slide-out-left { animation: templateSlideOutLeft 0.3s ease-out forwards; }
.animate-slide-in-right { animation: templateSlideInRight 0.3s ease-in forwards; }
@keyframes templateSlideOutLeft { from { opacity: 1; transform: translateX(0); } to { opacity: 0; transform: translateX(-30px); } }
@keyframes templateSlideInRight { from { opacity: 0; transform: translateX(30px); } to { opacity: 1; transform: translateX(0); } }
`;


export const pageTemplates: PageTemplate[] = [
  {
    id: DEFAULT_TEMPLATE_ID, // tpl-blank-canvas-engine
    name: 'Blank Canvas (Full Quiz Engine)',
    description: 'A foundational, well-commented starting point. Includes a built-in JavaScript quiz engine supporting multiple question types (MCQ text/image, Text Matching, Text Drag & Drop) and user-customizable HTML/CSS/JS. This template is a complete quiz experience out-of-the-box, demonstrating full customization capabilities. All quiz text (Correct, Incorrect, etc.) is defined within this template\'s JavaScript for full control.',
    htmlContent: defaultHtmlContent,
    cssContent: defaultCssContent,
    previewImageUrl: 'https://placehold.co/600x400.png',
    aiHint: 'quiz interface app',
    tags: ['Standard', 'Engine', 'Customizable', 'All Types', 'Base'],
    createdAt: '2023-10-01T10:00:00Z',
    updatedAt: '2023-10-25T14:30:00Z',
  },
  {
    id: 'tpl-sleek-mcq-engine',
    name: 'Sleek Text MCQ (Uses Standard Engine)',
    description: 'A clean and modern CSS style focused on text-based Multiple Choice Questions. This template uses the Standard Quiz Engine (copied from Blank Canvas) but provides a different visual appearance through its CSS.',
    htmlContent: `
<div class="sleek-mcq-container p-6 md:p-10 rounded-lg shadow-xl bg-gradient-to-br from-secondary via-background to-background max-w-2xl mx-auto my-8 text-foreground">
  <h1 id="template-quiz-title" class="text-4xl font-extrabold mb-8 text-primary text-center title-pop-in"></h1>
  <div id="template-quiz-content-host" class="space-y-6">
    <!-- Questions will be rendered here by the standard engine -->
  </div>

  <!-- Blueprint for a single question (standard engine will look for this) -->
  <div id="template-question-blueprint" style="display: none;" class="question-block p-6 bg-card/80 backdrop-blur-sm border border-border/30 rounded-xl shadow-lg">
    <h2 data-element="question-text" class="text-2xl font-semibold mb-6 text-foreground"></h2>
    <div data-element="options-container" class="options-area grid grid-cols-1 sm:grid-cols-2 gap-4">
      <!-- Option buttons will be styled by .sleek-option-button -->
    </div>
    <div data-element="feedback-message" class="feedback-text mt-5 text-center font-semibold text-lg" style="min-height: 30px;"></div>
  </div>

  <div id="template-quiz-end-screen" style="display: none;" class="text-center p-8 bg-card/90 backdrop-blur-sm rounded-xl shadow-2xl">
    <h2 data-element="end-screen-title" class="text-3xl font-bold mb-5 text-primary"></h2>
    <p data-element="end-screen-message" class="text-xl text-foreground/90 mb-8"></p>
    <button data-element="restart-button" class="mt-4 bg-accent text-accent-foreground px-8 py-3 rounded-lg hover:bg-accent/80 transition-colors text-lg font-medium shadow-lg"></button>
  </div>
  
  <script>
    // Template-specific JS for Sleek Text MCQ
    document.addEventListener('DOMContentLoaded', () => {
      const title = document.getElementById('template-quiz-title');
      if(title && title.classList.contains('title-pop-in')) {
         // console.log("Sleek MCQ: Title pop-in animation CSS class is present.");
      }
    });
  <\/script>
  ${defaultHtmlContent.substring(defaultHtmlContent.indexOf('<script>'), defaultHtmlContent.lastIndexOf('<\/script>') + 9)}
</div>`,
    cssContent: `
body { background-color: hsl(var(--background)); color: hsl(var(--foreground)); font-family: var(--font-geist-sans), sans-serif; margin:0; padding: 1rem;}

.sleek-mcq-container { /* Custom container styles */ }

.title-pop-in { 
  animation: sleekTitlePopIn 0.7s cubic-bezier(0.68, -0.55, 0.265, 1.55) .2s forwards;
  opacity: 0;
  transform: translateY(-15px) scale(0.95);
}
@keyframes sleekTitlePopIn {
  to { opacity: 1; transform: translateY(0) scale(1); }
}

/* Overrides for template-option-button if needed, or use specific classes */
.template-option-button { 
  display: block;
  width: 100%;
  text-align: left;
  padding: 1rem 1.5rem;
  margin-bottom: 0.75rem; /* Ensure it's not Tailwind class if you want different */
  border: 1px solid hsl(var(--border) / 0.5);
  border-radius: var(--radius);
  background-color: hsl(var(--card));
  color: hsl(var(--card-foreground));
  transition: all 0.2s ease-in-out;
  font-size: 1rem;
  font-weight: 500;
  box-shadow: 0 2px 5px rgba(0,0,0,0.05);
}
.template-option-button:hover {
  background-color: hsl(var(--primary) / 0.08);
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
   box-shadow: 0 0 10px hsl(var(--success-border) / 0.5);
}
.feedback-text.correct-feedback { color: hsl(var(--success-fg)); font-weight: bold; }
.feedback-text.incorrect-feedback { color: hsl(var(--destructive)); font-weight: bold; }

/* Animations from default, ensure they are present or overridden */
.animate-slide-out-left { animation: templateSlideOutLeft 0.4s cubic-bezier(0.755, 0.05, 0.855, 0.06) forwards; }
.animate-slide-in-right { animation: templateSlideInRight 0.4s cubic-bezier(0.165, 0.84, 0.44, 1) forwards; }
@keyframes templateSlideOutLeft { from { opacity: 1; transform: translateX(0) scale(1); } to { opacity: 0; transform: translateX(-50px) scale(0.95); } }
@keyframes templateSlideInRight { from { opacity: 0; transform: translateX(50px) scale(0.95); } to { opacity: 1; transform: translateX(0) scale(1); } }
.animate-fade-in { animation: templateFadeIn 0.5s ease-out forwards; }
@keyframes templateFadeIn { from { opacity: 0; transform: translateY(15px); } to { opacity: 1; transform: translateY(0); } }
.feedback-text.show-feedback { animation: templatePopFeedback 0.4s cubic-bezier(0.68, -0.55, 0.27, 1.55); opacity:1; transform: translateY(0); }
@keyframes templatePopFeedback { 0% { transform: scale(0.8) translateY(8px); opacity: 0; } 70% { transform: scale(1.05) translateY(0px); opacity: 1; } 100% { transform: scale(1) translateY(0px); opacity: 1; } }
`,
    previewImageUrl: 'https://placehold.co/600x400.png',
    aiHint: 'modern quiz sleek',
    tags: ['MCQ', 'Text', 'Sleek', 'Modern', 'Uses Standard Engine'],
    createdAt: '2023-10-05T12:00:00Z',
    updatedAt: '2023-10-26T10:00:00Z',
  },
  {
    id: 'tpl-visual-image-grid-engine',
    name: 'Visual Image Grid (Uses Standard Engine)',
    description: 'A template designed to showcase image-based multiple-choice questions in a grid layout. Uses the Standard Quiz Engine.',
    htmlContent: `
<div class="image-grid-quiz-container p-4 md:p-8 bg-muted/30 rounded-xl shadow-lg max-w-4xl mx-auto my-8">
  <h1 id="template-quiz-title" class="text-3xl font-bold mb-8 text-center text-primary"></h1>
  <div id="template-quiz-content-host"></div>
  <div id="template-question-blueprint" style="display: none;" class="image-grid-question p-6 bg-card border border-border rounded-lg shadow-md">
    <h2 data-element="question-text" class="text-xl font-semibold mb-6 text-center text-foreground"></h2>
    <div data-element="options-container" class="options-area grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-4 justify-items-center">
      <!-- Image options will be styled by .image-grid-option-button -->
    </div>
    <div data-element="feedback-message" class="feedback-text mt-6 text-center font-medium text-lg" style="min-height: 28px;"></div>
  </div>
  <div id="template-quiz-end-screen" style="display: none;" class="text-center p-8 bg-card rounded-lg shadow-xl">
    <h2 data-element="end-screen-title" class="text-2xl font-bold mb-4 text-primary"></h2>
    <p data-element="end-screen-message" class="text-lg text-foreground mb-6"></p>
    <button data-element="restart-button" class="mt-4 bg-primary text-primary-foreground px-6 py-3 rounded-md hover:bg-primary/90 text-base font-medium"></button>
  </div>
  <!-- Re-uses the CORE QUIZ ENGINE SCRIPT from the 'tpl-blank-canvas-engine' -->
  ${defaultHtmlContent.substring(defaultHtmlContent.indexOf('<script>'), defaultHtmlContent.lastIndexOf('<\/script>') + 9)}
</div>`,
    cssContent: `
body { background-color: hsl(var(--background)); color: hsl(var(--foreground)); font-family: var(--font-geist-sans), sans-serif; margin:0; padding: 1rem;}
.image-grid-quiz-container {}
.template-option-button.image-option { /* Specific for image options */
  background-color: hsl(var(--card));
  border: 2px solid transparent;
  border-radius: var(--radius);
  padding: 0.5rem;
  transition: transform 0.2s ease-out, border-color 0.2s, box-shadow 0.2s;
  display: flex; flex-direction: column; align-items: center;
  width: 100%; /* Ensure it takes grid cell width */
  max-width: 200px; /* Max width for an option */
}
.template-option-button.image-option:hover {
  transform: translateY(-4px) scale(1.03);
  border-color: hsl(var(--primary));
  box-shadow: 0 6px 20px hsl(var(--primary) / 0.2);
}
.template-option-button.image-option img {
  width: 100%; height: 150px; /* Fixed height for consistency */
  object-fit: cover; /* Cover to fill, might crop */
  border-radius: calc(var(--radius) - 4px);
  margin-bottom: 0.5rem;
}
.template-option-button.image-option p { font-size: 0.875rem; text-align: center; color: hsl(var(--muted-foreground)); }

.template-option-button.correct-answer { border-color: hsl(var(--success-border)) !important; background-color: hsl(var(--success-bg) / 0.5) !important; }
.template-option-button.incorrect-answer-selected { border-color: hsl(var(--destructive)) !important; background-color: hsl(var(--destructive) / 0.3) !important; }
.template-option-button.always-correct-answer { box-shadow: 0 0 0 3px hsl(var(--success-border)) !important; }
.feedback-text.correct-feedback { color: hsl(var(--success-fg)); }
.feedback-text.incorrect-feedback { color: hsl(var(--destructive)); }

/* Animations from default, ensure they are present or overridden */
.animate-slide-out-left { animation: templateSlideOutLeft 0.4s ease-out forwards; }
.animate-slide-in-right { animation: templateSlideInRight 0.4s ease-in forwards; }
@keyframes templateSlideOutLeft { from { opacity: 1; transform: scale(1); } to { opacity: 0; transform: scale(0.9); } }
@keyframes templateSlideInRight { from { opacity: 0; transform: scale(0.9); } to { opacity: 1; transform: scale(1); } }
.animate-fade-in { animation: templateFadeIn 0.5s ease-out forwards; }
@keyframes templateFadeIn { from { opacity: 0; } to { opacity: 1; } }
.feedback-text.show-feedback { animation: templatePopFeedback 0.4s cubic-bezier(0.68, -0.55, 0.27, 1.55); opacity:1; transform: translateY(0); }
@keyframes templatePopFeedback { 0% { transform: scale(0.8) translateY(8px); opacity: 0; } 70% { transform: scale(1.05) translateY(0px); opacity: 1; } 100% { transform: scale(1) translateY(0px); opacity: 1; } }
`,
    previewImageUrl: 'https://placehold.co/600x400.png',
    aiHint: 'image quiz gallery',
    tags: ['MCQ', 'Image', 'Grid', 'Visual', 'Uses Standard Engine'],
    createdAt: '2023-10-10T09:00:00Z',
    updatedAt: '2023-10-22T18:00:00Z',
  },
];
