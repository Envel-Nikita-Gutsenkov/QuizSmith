
import type { PageTemplate } from './types';

export const DEFAULT_TEMPLATE_ID = 'tpl-blank-canvas-engine';

// =====================================================================================
// "BLANK CANVAS (FULL QUIZ ENGINE)" TEMPLATE
// This HTML includes all necessary JavaScript for a multi-type quiz.
// The Test Editor injects data into placeholder elements that this template's script reads.
// All UI text (Correct, Incorrect, etc.) is defined within this template's JavaScript.
// =====================================================================================
const defaultHtmlContent = `
<!-- 
  QuizSmith ADVANCED Page Template: Blank Canvas (Full Quiz Engine)
  This HTML is a self-contained quiz engine. It includes structure, placeholders for data injection,
  and a comprehensive <script> block to handle quiz logic, rendering, and interactions for various question types.

  DATA INJECTION (from Test Editor into iframe body, AFTER this template's direct HTML):
  - <script id="quiz-data" type="application/json">[QUESTIONS_ARRAY_JSON_STRING_ESCAPED_FOR_HTML]</script>
  - <div id="quiz-name-data" style="display:none;">[QUIZ_NAME_STRING]</div>
  - <div id="quiz-end-message-data" style="display:none;">[QUIZ_END_MESSAGE_STRING_WITH_PLACEHOLDERS]</div>

  THE JAVASCRIPT WITHIN THIS TEMPLATE (BELOW) IS RESPONSIBLE FOR:
  1. Reading the injected data from the elements above.
  2. Rendering the quiz title.
  3. Iterating through questions and rendering them based on their 'type'.
     - Multiple Choice (Text & Image), single or multiple correct answers.
     - Matching (Text-to-Text)
     - Drag & Drop (Text-on-Text for specific matches)
     - Categorization (Drag items into category bins)
     - Connect Points (Matching left items to right items)
  4. Handling user interactions for each question type.
  5. Providing visual feedback (using CSS classes defined in this template's CSS).
  6. Calculating the score and managing question progression.
  7. Displaying the end screen with the score.
  8. DEFINING UI TEXT (e.g., "Correct!", "Incorrect!", "Submit Answer", "Restart Quiz") DIRECTLY IN THIS SCRIPT.
  9. Handling all animations and operational logic for the quiz flow.

  CUSTOMIZATION:
  - Modify the HTML structure below.
  - Modify the CSS in this template's CSS definition.
  - Modify or extend the JavaScript engine in the <script> block at the end of this HTML.
  
  ACCESSIBILITY NOTE: This template engine uses basic HTML elements. 
  For production, ensure proper ARIA attributes are added for accessibility.

  HOW TO ADD CUSTOM TEMPLATE-SPECIFIC JAVASCRIPT:
  You can add more <script> tags here if you need JavaScript for animations or functionalities
  that are unique to this specific template and separate from the core quiz engine logic below.
  Example:
  <!--
  <script>
    document.addEventListener('DOMContentLoaded', () => {
      // console.log("Custom template JS loaded!");
      // Add your specific animation triggers or UI enhancements here.
    });
  <\/script>
  -->
-->
<div class="quiz-engine-container p-4 md:p-8 rounded-xl shadow-2xl bg-card text-card-foreground max-w-3xl mx-auto my-6">
  
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
    <div data-element="action-buttons-container" class="action-buttons-area mt-4 text-center">
      <!-- Submit/Check Answer buttons populated here by script -->
    </div>
    <div data-element="feedback-message" class="feedback-text mt-4 text-center font-medium text-lg" style="min-height: 28px;"></div>
  </div>

  <!-- Blueprint for an end screen (populated by script) -->
  <div id="template-quiz-end-screen" style="display: none;" class="text-center p-6 bg-card rounded-lg shadow-xl">
    <h2 data-element="end-screen-title" class="text-2xl font-bold mb-4 text-primary"></h2>
    <p data-element="end-screen-message" class="text-lg text-foreground mb-6"></p>
    <button data-element="restart-button" class="mt-4 bg-primary text-primary-foreground px-6 py-3 rounded-md hover:bg-primary/90 transition-colors text-base font-medium shadow-md"></button>
  </div>
  
  <!-- THE CORE QUIZ ENGINE JAVASCRIPT FOR THIS TEMPLATE -->
  <script>
    (function() { // IIFE to encapsulate scope
      // --- CONFIGURABLE UI TEXT (Defined within this template's script) ---
      var TEXT_CONFIG = {
        SUBMIT_ANSWER: "Submit Answer",
        CHECK_ANSWERS: "Check Answers",
        CORRECT: "Correct!",
        PARTIALLY_CORRECT: "Partially Correct!", // For future use with complex scoring
        INCORRECT: "Incorrect!",
        QUIZ_COMPLETE: "Quiz Complete!",
        RESTART_QUIZ: "Restart Quiz",
        MATCHING_SELECT_PROMPT: "Select a match for:",
        DRAG_DROP_HERE_LABEL: "Drop here",
        QUESTION_PROGRESS_PREFIX: "Question", 
        OF_PROGRESS_SEPARATOR: "of",
        MATCHING_FEEDBACK_PREFIX: "Matched",
        DRAG_DROP_FEEDBACK_PREFIX: "Correct Drops:",
        CATEGORIZATION_FEEDBACK_PREFIX: "Correctly Categorized:",
        CONNECT_POINTS_FEEDBACK_PREFIX: "Correct Connections:",
        LOADING_QUIZ: "Loading Quiz...",
        NO_QUESTIONS_LOADED: "No questions loaded. Please check the test configuration or add questions.",
        UNSUPPORTED_QUESTION_TYPE: "Unsupported question type in this template."
      };

      var contentHost, questionBlueprint, endScreenBlueprint, titleDisplayEl;
      var questions = [];
      var quizName = TEXT_CONFIG.LOADING_QUIZ;
      var rawQuizEndMessage = "Finished! Your score: {{score}}/{{total}}.";
      var currentQuestionIndex = 0;
      var score = 0;
      var activeQuestionElement = null;
      
      var dataLoadAttempts = 0;
      var MAX_DATA_LOAD_ATTEMPTS = 15; // Increased attempts
      var DATA_LOAD_RETRY_DELAY = 150; 

      // --- D&D State ---
      var draggedItemData = null; // To store { itemId, questionId, element }

      // --- Connect Points State ---
      var connectPointsState = {
          selectedLeftItem: null, // { element, id }
          connections: [] // { leftId, rightId }
      };

      function tryLoadDataAndInitialize() {
        var questionsDataEl = document.getElementById('quiz-data');
        var quizNameEl = document.getElementById('quiz-name-data');
        var endMessageEl = document.getElementById('quiz-end-message-data');

        if (!questionsDataEl || !questionsDataEl.textContent || !quizNameEl || !endMessageEl) {
          dataLoadAttempts++;
          if (dataLoadAttempts < MAX_DATA_LOAD_ATTEMPTS) {
            setTimeout(tryLoadDataAndInitialize, DATA_LOAD_RETRY_DELAY);
            return;
          } else {
            console.warn("QuizSmith Engine: Data injection elements not found after attempts.");
            titleDisplayEl.textContent = TEXT_CONFIG.NO_QUESTIONS_LOADED;
            contentHost.innerHTML = '<p class="text-center text-destructive">' + TEXT_CONFIG.NO_QUESTIONS_LOADED + '</p>';
            return;
          }
        }
        
        try {
          questions = JSON.parse(questionsDataEl.textContent || "[]");
        } catch (e) { 
          console.error("QuizSmith Engine: Error parsing quiz data JSON:", e);
          questions = [];
        }

        if (quizNameEl.textContent) quizName = quizNameEl.textContent;
        if (titleDisplayEl) titleDisplayEl.textContent = quizName;
        if (endMessageEl.textContent) rawQuizEndMessage = endMessageEl.textContent;

        if (questions && questions.length > 0) {
          currentQuestionIndex = 0;
          score = 0;
          displayCurrentQuestion();
        } else {
          titleDisplayEl.textContent = quizName;
          contentHost.innerHTML = '<p class="text-center text-muted-foreground">' + TEXT_CONFIG.NO_QUESTIONS_LOADED + '</p>';
        }
      }

      function initializeQuizEngine() {
        titleDisplayEl = document.getElementById('template-quiz-title');
        contentHost = document.getElementById('template-quiz-content-host');
        questionBlueprint = document.getElementById('template-question-blueprint');
        endScreenBlueprint = document.getElementById('template-quiz-end-screen');

        if (!titleDisplayEl || !contentHost || !questionBlueprint || !endScreenBlueprint) {
          console.error("QuizSmith Engine: Essential HTML structure not found.");
          if (titleDisplayEl) titleDisplayEl.textContent = "Template Structure Error";
          return;
        }
        
        titleDisplayEl.textContent = TEXT_CONFIG.LOADING_QUIZ;
        tryLoadDataAndInitialize();
      }


      function displayCurrentQuestion() {
        if (activeQuestionElement) {
          activeQuestionElement.classList.remove('animate-slide-in-right', 'animate-fade-in');
          activeQuestionElement.classList.add('animate-slide-out-left');
          setTimeout(function() { 
            if (activeQuestionElement && activeQuestionElement.parentElement) {
              activeQuestionElement.remove();
            }
            activeQuestionElement = null; 
            proceedToNextStep();
          }, 300); 
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

        var questionTextEl = activeQuestionElement.querySelector('[data-element="question-text"]');
        if (questionTextEl) {
          var qProgressText = TEXT_CONFIG.QUESTION_PROGRESS_PREFIX + " " + (currentQuestionIndex + 1) + " " + TEXT_CONFIG.OF_PROGRESS_SEPARATOR + " " + questions.length + ": ";
          questionTextEl.innerHTML = qProgressText; // Use innerHTML for the static part
          var questionContentSpan = document.createElement('span');
          questionContentSpan.textContent = question.text; // Safely set user-provided text
          questionTextEl.appendChild(questionContentSpan);
        }
        
        var optionsContainer = activeQuestionElement.querySelector('[data-element="options-container"]');
        var actionsContainer = activeQuestionElement.querySelector('[data-element="action-buttons-container"]');
        if (optionsContainer) optionsContainer.innerHTML = '';
        if (actionsContainer) actionsContainer.innerHTML = '';
            
        switch (question.type) {
          case 'multiple-choice-text':
          case 'multiple-choice-image':
            renderMCQ(question, optionsContainer, actionsContainer, activeQuestionElement);
            break;
          case 'matching-text-text':
            renderMatching(question, optionsContainer, actionsContainer, activeQuestionElement);
            break;
          case 'drag-and-drop-text-text': 
            renderDragDropTextOnText(question, optionsContainer, actionsContainer, activeQuestionElement);
            break;
          case 'categorization-drag-and-drop':
            renderCategorizationDragAndDrop(question, optionsContainer, actionsContainer, activeQuestionElement);
            break;
          case 'connect-points-matching':
            renderConnectPointsMatching(question, optionsContainer, actionsContainer, activeQuestionElement);
            break;
          default:
            if(optionsContainer) optionsContainer.innerHTML = '<p>' + TEXT_CONFIG.UNSUPPORTED_QUESTION_TYPE + '</p>';
        }
        
        contentHost.innerHTML = ''; 
        contentHost.appendChild(activeQuestionElement);
        activeQuestionElement.classList.remove('animate-slide-out-left');
        activeQuestionElement.classList.add('animate-slide-in-right');
      }

      // --- MCQ ---
      function renderMCQ(question, container, actionsContainer, questionEl) {
        var selectedOptions = new Set();
        (question.options || []).forEach(function(option) {
          var item = document.createElement('div');
          item.className = 'mcq-option-item p-3.5 border border-input rounded-md text-foreground hover:bg-secondary hover:border-primary focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer transition-all';
          if (question.type === 'multiple-choice-image' && option.imageUrl) {
            item.classList.add('image-option'); 
            var img = document.createElement('img');
            img.src = option.imageUrl;
            img.alt = option.text || 'Option image';
            img.className = 'max-h-40 mx-auto mb-2 rounded-sm object-contain border'; 
            item.appendChild(img);
            if (option.text) {
              var p = document.createElement('p');
              p.className = 'text-center text-sm mt-1';
              p.textContent = option.text;
              item.appendChild(p);
            }
          } else {
            item.textContent = option.text;
          }
          item.dataset.optionId = option.id;
          item.onclick = function() {
            if (question.allowMultipleAnswers) {
              if (selectedOptions.has(option.id)) {
                selectedOptions.delete(option.id);
                item.classList.remove('selected-option');
              } else {
                selectedOptions.add(option.id);
                item.classList.add('selected-option');
              }
            } else { 
              container.querySelectorAll('.mcq-option-item').forEach(function(el) { el.classList.remove('selected-option'); });
              selectedOptions.clear();
              selectedOptions.add(option.id);
              item.classList.add('selected-option');
            }
          };
          container.appendChild(item);
        });

        if (question.options && question.options.length > 0) {
            var submitButton = document.createElement('button');
            submitButton.className = 'submit-answer-btn bg-primary text-primary-foreground px-5 py-2.5 rounded-md hover:bg-primary/90 transition-colors text-sm font-medium';
            submitButton.textContent = TEXT_CONFIG.SUBMIT_ANSWER;
            submitButton.onclick = function() { handleMCQSubmit(selectedOptions, question, questionEl); };
            actionsContainer.appendChild(submitButton);
        }
      }

      function handleMCQSubmit(selectedOptionIds, questionData, questionEl) {
        questionEl.querySelectorAll('.mcq-option-item, .submit-answer-btn').forEach(function(el) { el.style.pointerEvents = 'none';});
        var feedbackEl = questionEl.querySelector('[data-element="feedback-message"]');
        var isFullyCorrect = false;
        var correctOptionIds = new Set((questionData.options || []).filter(function(opt) { return opt.isCorrect; }).map(function(opt) { return opt.id; }));

        if (questionData.allowMultipleAnswers) {
            isFullyCorrect = selectedOptionIds.size === correctOptionIds.size && 
                             Array.from(selectedOptionIds).every(function(id) { return correctOptionIds.has(id); });
        } else {
            isFullyCorrect = selectedOptionIds.size === 1 && correctOptionIds.has(selectedOptionIds.values().next().value);
        }

        if (isFullyCorrect) {
          score++;
          if (feedbackEl) {
            feedbackEl.textContent = TEXT_CONFIG.CORRECT;
            feedbackEl.className = 'feedback-text mt-4 text-center font-medium text-lg correct-feedback show-feedback';
          }
        } else {
          if (feedbackEl) {
            feedbackEl.textContent = TEXT_CONFIG.INCORRECT;
            feedbackEl.className = 'feedback-text mt-4 text-center font-medium text-lg incorrect-feedback show-feedback';
          }
        }
        
        questionEl.querySelectorAll('.mcq-option-item').forEach(function(itemEl) {
            var optionId = itemEl.dataset.optionId;
            if (correctOptionIds.has(optionId)) {
                itemEl.classList.add('correct-answer'); 
            }
            if (selectedOptionIds.has(optionId) && !correctOptionIds.has(optionId)) {
                itemEl.classList.add('incorrect-answer-selected'); 
            }
        });

        setTimeout(function() {
          currentQuestionIndex++;
          displayCurrentQuestion();
        }, 2500);
      }

      // --- Matching (Text-to-Text) ---
      function renderMatching(question, container, actionsContainer, questionEl) {
        var selectedPrompt = null; 
        var pairs = (question.matchPairs || []).map(function(p) { return Object.assign({}, p, { userTargetId: null, visuallyConnected: false }); });

        var promptsDiv = document.createElement('div');
        promptsDiv.className = 'matching-prompts grid grid-cols-1 gap-3 mb-4';
        var targetsDiv = document.createElement('div');
        targetsDiv.className = 'matching-targets grid grid-cols-1 gap-3';
        
        var shuffledTargets = (question.matchPairs || []).map(function(p) { return { id: p.id, target: p.target }; }).sort(function() { return 0.5 - Math.random(); });

        (question.matchPairs || []).forEach(function(pairData) {
            var promptEl = document.createElement('div');
            promptEl.className = 'match-item p-3 border rounded-md cursor-pointer hover:bg-secondary transition-colors';
            promptEl.textContent = pairData.prompt;
            promptEl.dataset.id = pairData.id;
            promptEl.onclick = function() {
                var currentPair = pairs.find(function(p) { return p.id === pairData.id; });
                if (currentPair && currentPair.visuallyConnected) return;
                if (selectedPrompt) selectedPrompt.element.classList.remove('selected-match-item');
                selectedPrompt = { element: promptEl, id: pairData.id };
                promptEl.classList.add('selected-match-item');
            };
            promptsDiv.appendChild(promptEl);
        });

        shuffledTargets.forEach(function(targetData) {
            var targetEl = document.createElement('div');
            targetEl.className = 'match-item p-3 border rounded-md cursor-pointer hover:bg-secondary transition-colors';
            targetEl.textContent = targetData.target;
            targetEl.dataset.id = targetData.id; // This is the ID of the pair this target BELONGS to
            targetEl.onclick = function() {
                var currentTargetPair = pairs.find(function(p) { return p.id === targetData.id && p.userTargetId; }); // Check if target is already connected
                if (!selectedPrompt || currentTargetPair) return;
                
                var promptPair = pairs.find(function(p) { return p.id === selectedPrompt.id; });
                if (promptPair && !promptPair.visuallyConnected) { 
                    promptPair.visuallyConnected = true;
                    promptPair.userTargetId = targetData.id; 
                    
                    selectedPrompt.element.classList.add('connected-match-item');
                    selectedPrompt.element.style.pointerEvents = 'none';
                    targetEl.classList.add('connected-match-item');
                    targetEl.style.pointerEvents = 'none';

                    selectedPrompt.element.classList.remove('selected-match-item');
                    selectedPrompt = null;
                }
            };
            targetsDiv.appendChild(targetEl);
        });
        
        container.appendChild(promptsDiv);
        var hr = document.createElement('hr');
        hr.className = 'my-4 border-border';
        container.appendChild(hr);
        container.appendChild(targetsDiv);

        var checkButton = document.createElement('button');
        checkButton.className = 'submit-answer-btn bg-primary text-primary-foreground px-5 py-2.5 rounded-md hover:bg-primary/90 transition-colors text-sm font-medium mt-4';
        checkButton.textContent = TEXT_CONFIG.CHECK_ANSWERS;
        checkButton.onclick = function() { handleMatchingSubmit(pairs, questionEl); };
        actionsContainer.appendChild(checkButton);
      }

      function handleMatchingSubmit(pairs, questionEl) {
        questionEl.querySelectorAll('.match-item, .submit-answer-btn').forEach(function(el) { el.style.pointerEvents = 'none';});
        var correctMatches = 0;
        pairs.forEach(function(pair) {
            var promptEl = questionEl.querySelector('.matching-prompts .match-item[data-id="' + pair.id + '"]');
            var connectedTargetEl = questionEl.querySelector('.matching-targets .match-item[data-id="' + pair.userTargetId + '"]');

            if (pair.userTargetId === pair.id) { 
                correctMatches++;
                if(promptEl) promptEl.classList.add('correct-answer');
                if(connectedTargetEl) connectedTargetEl.classList.add('correct-answer');
            } else {
                if(promptEl) promptEl.classList.add('incorrect-answer-selected');
                if(connectedTargetEl) connectedTargetEl.classList.add('incorrect-answer-selected');
                var actualCorrectTargetEl = questionEl.querySelector('.matching-targets .match-item[data-id="' + pair.id + '"]');
                if (actualCorrectTargetEl && !actualCorrectTargetEl.classList.contains('correct-answer')) {
                  actualCorrectTargetEl.classList.add('always-correct-answer');
                }
            }
        });
        score += correctMatches;
        var feedbackEl = questionEl.querySelector('[data-element="feedback-message"]');
        if (feedbackEl) {
            feedbackEl.textContent = TEXT_CONFIG.MATCHING_FEEDBACK_PREFIX + " " + correctMatches + " / " + pairs.length;
            feedbackEl.className = 'feedback-text mt-4 text-center font-medium text-lg show-feedback';
        }
        setTimeout(function() {
            currentQuestionIndex++;
            displayCurrentQuestion();
        }, 3000);
      }
      
      // --- Drag & Drop Text-on-Text (Specific Matches) ---
      function renderDragDropTextOnText(question, container, actionsContainer, questionEl) {
        var dragItems = question.dragItems || [];
        var dropTargets = question.dropTargets || [];

        var itemPool = document.createElement('div');
        itemPool.className = 'dnd-item-pool flex flex-wrap gap-2 p-3 border rounded-md bg-muted/50 mb-4';
        dragItems.forEach(function(item) {
            var el = document.createElement('div');
            el.id = 'q' + question.id + '-drag' + item.id;
            el.className = 'dnd-item p-2 border rounded bg-primary text-primary-foreground cursor-grab shadow';
            el.textContent = item.text;
            el.draggable = true;
            el.dataset.itemId = item.id;
            el.ondragstart = function(e) {
                e.dataTransfer.setData('text/plain', item.id);
                e.dataTransfer.setData('sourceQuestionId', question.id);
                e.target.classList.add('dragging');
                draggedItemData = { itemId: item.id, questionId: question.id, element: e.target };
            };
            el.ondragend = function(e) { 
                if(e.target.classList) e.target.classList.remove('dragging'); 
                draggedItemData = null;
            };
            itemPool.appendChild(el);
        });
        container.appendChild(itemPool);

        var targetsArea = document.createElement('div');
        targetsArea.className = 'dnd-targets-area grid grid-cols-1 md:grid-cols-2 gap-4';
        dropTargets.forEach(function(target) {
            var el = document.createElement('div');
            el.id = 'q' + question.id + '-drop' + target.id;
            el.className = 'dnd-drop-target p-4 border-2 border-dashed border-border rounded-md min-h-[50px] flex items-center justify-center text-muted-foreground transition-colors';
            el.textContent = target.text || TEXT_CONFIG.DRAG_DROP_HERE_LABEL;
            el.dataset.targetId = target.id;
            el.dataset.expectedDragItemId = target.expectedDragItemId || "";
            el.ondragover = function(e) { e.preventDefault(); el.classList.add('drag-over'); };
            el.ondragleave = function() { el.classList.remove('drag-over'); };
            el.ondrop = function(e) {
                e.preventDefault();
                el.classList.remove('drag-over');
                if (!draggedItemData || draggedItemData.questionId !== question.id) return;
                
                var currentItemInTarget = el.querySelector('.dnd-item');
                if (currentItemInTarget) {
                    itemPool.appendChild(currentItemInTarget); // Move existing item back to pool
                }
                el.innerHTML = ''; 
                el.appendChild(draggedItemData.element);
                target.droppedItemId = draggedItemData.itemId; 
                draggedItemData = null;
            };
            targetsArea.appendChild(el);
        });
        container.appendChild(targetsArea);

        var checkButton = document.createElement('button');
        checkButton.className = 'submit-answer-btn bg-primary text-primary-foreground px-5 py-2.5 rounded-md hover:bg-primary/90 transition-colors text-sm font-medium mt-4';
        checkButton.textContent = TEXT_CONFIG.CHECK_ANSWERS;
        checkButton.onclick = function() { handleDragDropTextOnTextSubmit(question, questionEl, itemPool); };
        actionsContainer.appendChild(checkButton);
      }

      function handleDragDropTextOnTextSubmit(question, questionEl, itemPool) {
        questionEl.querySelectorAll('.dnd-item, .dnd-drop-target, .submit-answer-btn').forEach(function(el) {el.style.pointerEvents = 'none';});
        var correctDrops = 0;
        var dropTargetsData = question.dropTargets || [];

        dropTargetsData.forEach(function(targetData) {
            var targetEl = questionEl.querySelector('#q' + question.id + '-drop' + targetData.id);
            var droppedItemEl = targetEl ? targetEl.querySelector('.dnd-item') : null;
            
            if (droppedItemEl) { 
                var droppedItemId = droppedItemEl.dataset.itemId;
                if (droppedItemId === targetData.expectedDragItemId) {
                    correctDrops++;
                    if(targetEl) targetEl.classList.add('correct-answer');
                } else {
                    if(targetEl) targetEl.classList.add('incorrect-answer-selected');
                }
            } else if (targetData.expectedDragItemId && targetData.expectedDragItemId !== "") { 
                if(targetEl) targetEl.classList.add('incorrect-answer-selected'); 
            }
        });
        
        (itemPool.querySelectorAll('.dnd-item') || []).forEach(function(item) { item.draggable = false;});

        score += correctDrops;
        var feedbackEl = questionEl.querySelector('[data-element="feedback-message"]');
        var totalExpectedDrops = dropTargetsData.filter(function(t) { return t.expectedDragItemId && t.expectedDragItemId !== ""; }).length;
        if (feedbackEl) {
            feedbackEl.textContent = TEXT_CONFIG.DRAG_DROP_FEEDBACK_PREFIX + " " + correctDrops + " / " + totalExpectedDrops;
            feedbackEl.className = 'feedback-text mt-4 text-center font-medium text-lg show-feedback';
        }
        setTimeout(function() {
            currentQuestionIndex++;
            displayCurrentQuestion();
        }, 3000);
      }


      // --- Categorization Drag & Drop ---
      function renderCategorizationDragAndDrop(question, container, actionsContainer, questionEl) {
        var dragItems = question.dragItems || [];
        var categories = question.categories || [];

        var itemPool = document.createElement('div');
        itemPool.className = 'cat-item-pool flex flex-wrap gap-2 p-3 border rounded-md bg-muted/50 mb-4 min-h-[50px]';
        dragItems.forEach(function(item) {
            var el = document.createElement('div');
            el.id = 'q' + question.id + '-catdrag' + item.id;
            el.className = 'cat-item p-2 border rounded bg-accent text-accent-foreground cursor-grab shadow';
            el.textContent = item.text;
            el.draggable = true;
            el.dataset.itemId = item.id; 
            el.ondragstart = function(e) {
                e.dataTransfer.setData('text/plain', item.id); 
                e.dataTransfer.setData('sourceQuestionId', question.id);
                e.target.classList.add('dragging');
                draggedItemData = { itemId: item.id, questionId: question.id, element: e.target };
            };
            el.ondragend = function(e) { 
                if(e.target.classList) e.target.classList.remove('dragging');
                draggedItemData = null;
            };
            itemPool.appendChild(el);
        });
        container.appendChild(itemPool);

        var categoriesArea = document.createElement('div');
        categoriesArea.className = 'cat-categories-area grid grid-cols-1 md:grid-cols-2 lg:grid-cols-' + Math.min(3, categories.length || 1) + ' gap-4';
        categories.forEach(function(category) {
            var catBin = document.createElement('div');
            catBin.id = 'q' + question.id + '-catbin' + category.id;
            catBin.className = 'cat-bin p-4 border-2 border-dashed border-border rounded-lg min-h-[100px] transition-colors flex flex-col'; // Added flex
            catBin.dataset.categoryId = category.id;
            
            var catTitle = document.createElement('h3');
            catTitle.className = 'cat-bin-title text-center font-semibold mb-2 text-muted-foreground';
            catTitle.textContent = category.name;
            catBin.appendChild(catTitle);
            
            var catDropZone = document.createElement('div'); // Actual drop zone
            catDropZone.className = 'cat-drop-zone flex-grow flex flex-col gap-1 items-center p-2 border-t border-border/50 mt-2'; 
            catBin.appendChild(catDropZone);

            catBin.ondragover = function(e) { e.preventDefault(); catBin.classList.add('drag-over'); };
            catBin.ondragleave = function() { catBin.classList.remove('drag-over'); };
            catBin.ondrop = function(e) {
                e.preventDefault();
                catBin.classList.remove('drag-over');
                if (!draggedItemData || draggedItemData.questionId !== question.id) return;
                
                catDropZone.appendChild(draggedItemData.element); 
                var originalItemData = dragItems.find(function(di) { return di.id === draggedItemData.itemId; });
                if(originalItemData) originalItemData.userCategoryId = category.id;

                draggedItemData = null;
            };
            categoriesArea.appendChild(catBin);
        });
        container.appendChild(categoriesArea);

        var checkButton = document.createElement('button');
        checkButton.className = 'submit-answer-btn bg-primary text-primary-foreground px-5 py-2.5 rounded-md hover:bg-primary/90 transition-colors text-sm font-medium mt-4';
        checkButton.textContent = TEXT_CONFIG.CHECK_ANSWERS;
        checkButton.onclick = function() { handleCategorizationSubmit(question, questionEl, itemPool); };
        actionsContainer.appendChild(checkButton);
      }

      function handleCategorizationSubmit(question, questionEl, itemPool) {
        questionEl.querySelectorAll('.cat-item, .cat-bin, .submit-answer-btn').forEach(function(el) { el.style.pointerEvents = 'none';});
        var correctCategorizations = 0;
        var dragItemsData = question.dragItems || [];

        dragItemsData.forEach(function(itemData) {
            var itemEl = questionEl.querySelector('#q' + question.id + '-catdrag' + itemData.id);
            var parentBin = itemEl ? itemEl.closest('.cat-bin') : null;
            var droppedIntoCategoryId = parentBin ? parentBin.dataset.categoryId : null;

            if (droppedIntoCategoryId === itemData.correctCategoryId) {
                correctCategorizations++;
                if(itemEl) itemEl.classList.add('correct-answer');
                if(parentBin) parentBin.classList.add('correct-drop-zone');
            } else {
                if(itemEl) itemEl.classList.add('incorrect-answer-selected');
                if(parentBin) parentBin.classList.add('incorrect-drop-zone');
            }
        });
        
        (itemPool.querySelectorAll('.cat-item') || []).forEach(function(item) { item.draggable = false;});

        score += correctCategorizations;
        var feedbackEl = questionEl.querySelector('[data-element="feedback-message"]');
        if (feedbackEl) {
            feedbackEl.textContent = TEXT_CONFIG.CATEGORIZATION_FEEDBACK_PREFIX + " " + correctCategorizations + " / " + dragItemsData.length;
            feedbackEl.className = 'feedback-text mt-4 text-center font-medium text-lg show-feedback';
        }
        setTimeout(function() {
            currentQuestionIndex++;
            displayCurrentQuestion();
        }, 3000);
      }


      // --- Connect Points Matching ---
      function renderConnectPointsMatching(question, container, actionsContainer, questionEl) {
        connectPointsState = { selectedLeftItem: null, connections: [] }; 
        var pairs = question.connectPairs || [];
        
        var wrapper = document.createElement('div');
        wrapper.className = 'connect-points-wrapper grid grid-cols-2 gap-8 items-start';

        var leftColumn = document.createElement('div');
        leftColumn.className = 'connect-column space-y-3';
        var rightColumn = document.createElement('div');
        rightColumn.className = 'connect-column space-y-3';

        var rightItemsShuffled = pairs.map(function(p) { return ({id: p.id, text: p.rightItem}); }).sort(function() { return 0.5 - Math.random(); });

        pairs.forEach(function(pair) {
            var leftEl = document.createElement('div');
            leftEl.className = 'connect-item connect-left-item p-3 border rounded-md cursor-pointer hover:bg-secondary';
            leftEl.textContent = pair.leftItem;
            leftEl.dataset.id = pair.id; 
            leftEl.onclick = function() {
                var isConnected = connectPointsState.connections.some(function(c) { return c.leftId === pair.id; });
                if (isConnected) return;

                if (connectPointsState.selectedLeftItem) {
                    connectPointsState.selectedLeftItem.element.classList.remove('selected-match-item');
                }
                connectPointsState.selectedLeftItem = { element: leftEl, id: pair.id };
                leftEl.classList.add('selected-match-item');
            };
            leftColumn.appendChild(leftEl);
        });

        rightItemsShuffled.forEach(function(rItem) {
            var rightEl = document.createElement('div');
            rightEl.className = 'connect-item connect-right-item p-3 border rounded-md cursor-pointer hover:bg-secondary';
            rightEl.textContent = rItem.text;
            rightEl.dataset.id = rItem.id; 
            rightEl.onclick = function() {
                var isConnected = connectPointsState.connections.some(function(c) { return c.rightId === rItem.id; });
                if (!connectPointsState.selectedLeftItem || isConnected) return;
                
                connectPointsState.connections.push({ leftId: connectPointsState.selectedLeftItem.id, rightId: rItem.id });
                
                connectPointsState.selectedLeftItem.element.classList.add('connected-match-item');
                connectPointsState.selectedLeftItem.element.style.pointerEvents = 'none'; 
                rightEl.classList.add('connected-match-item');
                rightEl.style.pointerEvents = 'none'; 

                connectPointsState.selectedLeftItem.element.classList.remove('selected-match-item');
                connectPointsState.selectedLeftItem = null;
            };
            rightColumn.appendChild(rightEl);
        });
        
        wrapper.appendChild(leftColumn);
        wrapper.appendChild(rightColumn);
        container.appendChild(wrapper);

        var checkButton = document.createElement('button');
        checkButton.className = 'submit-answer-btn bg-primary text-primary-foreground px-5 py-2.5 rounded-md hover:bg-primary/90 transition-colors text-sm font-medium mt-4';
        checkButton.textContent = TEXT_CONFIG.CHECK_ANSWERS;
        checkButton.onclick = function() { handleConnectPointsSubmit(question, questionEl); };
        actionsContainer.appendChild(checkButton);
      }

      function handleConnectPointsSubmit(question, questionEl) {
        questionEl.querySelectorAll('.connect-item, .submit-answer-btn').forEach(function(el) { el.style.pointerEvents = 'none';});
        var correctConnections = 0;
        var actualPairs = question.connectPairs || [];

        connectPointsState.connections.forEach(function(conn) {
            if (conn.leftId === conn.rightId) {
                correctConnections++;
                var leftEl = questionEl.querySelector('.connect-left-item[data-id="' + conn.leftId + '"]');
                var rightEl = questionEl.querySelector('.connect-right-item[data-id="' + conn.rightId + '"]');
                if(leftEl) leftEl.classList.add('correct-answer');
                if(rightEl) rightEl.classList.add('correct-answer');
            } else {
                var leftEl = questionEl.querySelector('.connect-left-item[data-id="' + conn.leftId + '"]');
                var rightEl = questionEl.querySelector('.connect-right-item[data-id="' + conn.rightId + '"]');
                if(leftEl) leftEl.classList.add('incorrect-answer-selected');
                if(rightEl) rightEl.classList.add('incorrect-answer-selected');
                 var actualCorrectLeftForRight = questionEl.querySelector('.connect-left-item[data-id="' + conn.rightId + '"]');
                 var actualCorrectRightForLeft = questionEl.querySelector('.connect-right-item[data-id="' + conn.leftId + '"]');
                 if(actualCorrectLeftForRight && !actualCorrectLeftForRight.classList.contains('correct-answer')) actualCorrectLeftForRight.classList.add('always-correct-answer');
                 if(actualCorrectRightForLeft && !actualCorrectRightForLeft.classList.contains('correct-answer')) actualCorrectRightForLeft.classList.add('always-correct-answer');
            }
        });

        score += correctConnections;
        var feedbackEl = questionEl.querySelector('[data-element="feedback-message"]');
        if (feedbackEl) {
            feedbackEl.textContent = TEXT_CONFIG.CONNECT_POINTS_FEEDBACK_PREFIX + " " + correctConnections + " / " + actualPairs.length;
            feedbackEl.className = 'feedback-text mt-4 text-center font-medium text-lg show-feedback';
        }
        setTimeout(function() {
            currentQuestionIndex++;
            displayCurrentQuestion();
        }, 3000);
      }


      // --- END SCREEN ---
      function displayEndScreen() {
        if (!contentHost || !endScreenBlueprint) return;
        contentHost.innerHTML = ''; 
        var endScreen = endScreenBlueprint.cloneNode(true);
        endScreen.id = 'quiz-final-screen';
        endScreen.style.display = 'block';
        
        var titleEl = endScreen.querySelector('[data-element="end-screen-title"]');
        if (titleEl) titleEl.textContent = TEXT_CONFIG.QUIZ_COMPLETE;

        var messageEl = endScreen.querySelector('[data-element="end-screen-message"]');
        if (messageEl) {
            var finalMessage = rawQuizEndMessage
                                .replace(/{{score}}/g, score.toString()) 
                                .replace(/{{total}}/g, questions.length.toString());
            messageEl.textContent = finalMessage;
        }
        
        var restartBtn = endScreen.querySelector('[data-element="restart-button"]');
        if (restartBtn) {
            restartBtn.textContent = TEXT_CONFIG.RESTART_QUIZ;
            restartBtn.onclick = function() {
              currentQuestionIndex = 0;
              score = 0;
              activeQuestionElement = null; 
              dataLoadAttempts = 0; 
              initializeQuizEngine(); 
            };
        }
        
        contentHost.appendChild(endScreen);
        endScreen.classList.remove('animate-slide-out-left'); 
        endScreen.classList.add('animate-fade-in');
      }

      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initializeQuizEngine);
      } else {
        initializeQuizEngine();
      }

    })(); // End of IIFE
  </script>
</div>
`;

const defaultCssContent = `
body { 
  background-color: hsl(var(--background)); 
  color: hsl(var(--foreground));
  font-family: var(--font-geist-sans, sans-serif);
  margin:0; 
  padding: 1rem; 
}
.quiz-engine-container { 
  font-family: var(--font-geist-sans), sans-serif;
}

/* MCQ Option Styling */
.mcq-option-item {
  /* Base style for options */
}
.mcq-option-item.image-option {
  padding: 0.75rem;
  background-color: hsl(var(--card) / 0.8);
}
.mcq-option-item.image-option img {
  max-height: 150px; 
  display: block;
  margin-left: auto;
  margin-right: auto;
  margin-bottom: 0.75rem;
  border-radius: var(--radius);
  border: 1px solid hsl(var(--border));
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
}
.mcq-option-item.selected-option {
  border-color: hsl(var(--primary));
  background-color: hsl(var(--primary) / 0.1);
  box-shadow: 0 0 0 2px hsl(var(--primary) / 0.5);
}


/* Feedback Styling (General) */
.correct-answer { /* Applied to selected correct items/options/targets */
  background-color: hsl(var(--success-bg)) !important;
  color: hsl(var(--success-fg)) !important;
  border-color: hsl(var(--success-border)) !important;
  box-shadow: 0 0 0 2px hsl(var(--success-border) / 0.7);
}
.incorrect-answer-selected { /* Applied to selected incorrect items/options/targets */
  background-color: hsl(var(--destructive)) !important;
  color: hsl(var(--destructive-foreground)) !important;
  border-color: hsl(var(--destructive) / 0.8) !important;
  box-shadow: 0 0 0 2px hsl(var(--destructive) / 0.5);
  opacity: 0.9;
}
.always-correct-answer { /* Applied to actual correct option/target if user was wrong */
  background-color: hsl(var(--success-bg) / 0.7) !important;
  color: hsl(var(--success-fg) / 0.9) !important;
  border: 2px solid hsl(var(--success-border)) !important;
  box-shadow: 0 0 8px hsl(var(--success-border) / 0.4) !important;
}

.feedback-text { 
  opacity: 0; 
  transform: translateY(10px); 
  transition: opacity 0.3s ease-out, transform 0.3s ease-out; 
  font-size: 1.1rem; 
  min-height: 1.5em; 
}
.feedback-text.show-feedback { 
  opacity: 1; 
  transform: translateY(0); 
  animation: templatePopFeedback 0.4s cubic-bezier(0.68, -0.55, 0.27, 1.55); 
}
.feedback-text.correct-feedback { color: hsl(var(--success-fg)); }
.feedback-text.incorrect-feedback { color: hsl(var(--destructive)); }


/* Question Transition Animations */
.question-block, #quiz-final-screen { opacity: 1; transform: translateX(0); }
.animate-slide-out-left { animation: templateSlideOutLeft 0.3s cubic-bezier(0.25, 1, 0.5, 1) forwards; }
.animate-slide-in-right { animation: templateSlideInRight 0.3s cubic-bezier(0.25, 1, 0.5, 1) forwards; }
.animate-fade-in { animation: templateFadeIn 0.4s ease-out forwards; }

@keyframes templateSlideOutLeft { from { opacity: 1; transform: translateX(0); } to { opacity: 0; transform: translateX(-50px); } }
@keyframes templateSlideInRight { from { opacity: 0; transform: translateX(50px); } to { opacity: 1; transform: translateX(0); } }
@keyframes templateFadeIn { from { opacity: 0; transform: translateY(15px); } to { opacity: 1; transform: translateY(0); } }
@keyframes templatePopFeedback { 0% { transform: scale(0.9) translateY(5px); opacity: 0.7; } 70% { transform: scale(1.05) translateY(0px); opacity: 1; } 100% { transform: scale(1) translateY(0px); opacity: 1; } }

/* Matching Question Specific Styles */
.match-item.selected-match-item { 
  background-color: hsl(var(--accent) / 0.3) !important; 
  border-color: hsl(var(--accent)) !important;
  font-weight: 600;
}
.match-item.connected-match-item {
  background-color: hsl(var(--muted));
  opacity: 0.7;
  cursor: default;
}

/* Drag & Drop Specific Styles (General & Categorization) */
.dnd-item, .cat-item { transition: transform 0.15s ease-out, box-shadow 0.15s ease-out; }
.dnd-item.dragging, .cat-item.dragging { opacity: 0.5; transform: scale(0.95) rotate(-2deg); box-shadow: 0 8px 16px rgba(0,0,0,0.3); }

.dnd-drop-target.drag-over, .cat-bin.drag-over {
  background-color: hsl(var(--primary) / 0.15); 
  border-color: hsl(var(--primary));
  border-style: solid;
}
.dnd-drop-target.correct-answer, .cat-bin.correct-drop-zone { /* For targets/bins that correctly received items */
   border-color: hsl(var(--success-border)) !important;
   background-color: hsl(var(--success-bg) / 0.3) !important;
}
.dnd-drop-target.incorrect-answer-selected, .cat-bin.incorrect-drop-zone { /* For targets/bins that received incorrect items */
   border-color: hsl(var(--destructive)) !important;
   background-color: hsl(var(--destructive) / 0.2) !important;
}
.cat-drop-zone {
  /* Styles for the actual droppable area inside a category bin */
  min-height: 60px; /* Ensure it has some height even when empty */
}


/* Connect Points Specific Styles */
.connect-item.selected-match-item {
  background-color: hsl(var(--accent) / 0.3) !important;
  border-color: hsl(var(--accent)) !important;
}
.connect-item.connected-match-item {
  background-color: hsl(var(--muted));
  opacity: 0.7;
  cursor: default;
}
/* Placeholder for line drawing - typically requires SVG or Canvas which is complex for simple HTML template */
/* For actual lines, you would need a JS library or custom SVG manipulation in the template's script */
`;


export const pageTemplates: PageTemplate[] = [
  {
    id: DEFAULT_TEMPLATE_ID, 
    name: 'Blank Canvas (Full Quiz Engine)',
    description: 'A foundational, well-commented starting point. Includes a built-in JavaScript quiz engine supporting multiple question types (MCQ text/image with single/multiple answers, Text Matching, Text-on-Text Drag & Drop, Categorization D&D, Connect Points). This template is a complete quiz experience out-of-the-box, demonstrating full customization capabilities. All quiz text (Correct, Incorrect, etc.) is defined within this template\'s JavaScript for full control.',
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
    description: 'A clean and modern CSS style focused on text-based Multiple Choice Questions. This template uses the Standard Quiz Engine (copied from Blank Canvas) but provides a different visual appearance through its CSS. Template-specific JS can be added for unique animations.',
    htmlContent: `
<div class="sleek-mcq-container p-6 md:p-10 rounded-lg shadow-xl bg-gradient-to-br from-secondary via-background to-background max-w-2xl mx-auto my-8 text-foreground">
  <h1 id="template-quiz-title" class="text-4xl font-extrabold mb-8 text-primary text-center title-pop-in"></h1>
  <div id="template-quiz-content-host" class="space-y-6">
  </div>
  <div id="template-question-blueprint" style="display: none;" class="question-block p-6 bg-card/80 backdrop-blur-sm border border-border/30 rounded-xl shadow-lg">
    <h2 data-element="question-text" class="text-2xl font-semibold mb-6 text-foreground"></h2>
    <div data-element="options-container" class="options-area grid grid-cols-1 sm:grid-cols-2 gap-4">
    </div>
    <div data-element="action-buttons-container" class="action-buttons-area mt-4 text-center"></div>
    <div data-element="feedback-message" class="feedback-text mt-5 text-center font-semibold text-lg" style="min-height: 30px;"></div>
  </div>
  <div id="template-quiz-end-screen" style="display: none;" class="text-center p-8 bg-card/90 backdrop-blur-sm rounded-xl shadow-2xl">
    <h2 data-element="end-screen-title" class="text-3xl font-bold mb-5 text-primary"></h2>
    <p data-element="end-screen-message" class="text-xl text-foreground/90 mb-8"></p>
    <button data-element="restart-button" class="mt-4 bg-accent text-accent-foreground px-8 py-3 rounded-lg hover:bg-accent/80 transition-colors text-lg font-medium shadow-lg"></button>
  </div>
  <script>
    document.addEventListener('DOMContentLoaded', function() {
      // Example of template-specific JS for animation for this "Sleek" template
      var title = document.getElementById('template-quiz-title');
      // The animation 'sleekTitlePopIn' is defined in this template's CSS.
      // This script just ensures the class is there or could add it dynamically.
      if(title && !title.classList.contains('title-pop-in')) {
         // title.classList.add('title-pop-in'); // Could add dynamically if needed
      }
    });
  </script>
  <!-- IMPORTANT: The core quiz engine from defaultHtmlContent needs to be included for full functionality -->
  ${defaultHtmlContent.substring(defaultHtmlContent.indexOf('<script>'), defaultHtmlContent.lastIndexOf('</script>') + 9)}
</div>`,
    cssContent: `
body { background-color: hsl(var(--background)); color: hsl(var(--foreground)); font-family: var(--font-geist-sans), sans-serif; margin:0; padding: 1rem;}
.sleek-mcq-container { /* Custom container styles */ }
.title-pop-in { animation: sleekTitlePopIn 0.7s cubic-bezier(0.68, -0.55, 0.265, 1.55) .2s forwards; opacity: 0; transform: translateY(-15px) scale(0.95); }
@keyframes sleekTitlePopIn { to { opacity: 1; transform: translateY(0) scale(1); } }

/* MCQ options styled specifically for this template */
.mcq-option-item { 
  display: block; width: 100%; text-align: left; padding: 1rem 1.5rem; margin-bottom: 0.75rem; 
  border: 1px solid hsl(var(--border) / 0.5); border-radius: var(--radius);
  background-color: hsl(var(--card)); color: hsl(var(--card-foreground));
  transition: all 0.2s ease-in-out; font-size: 1rem; font-weight: 500;
  box-shadow: 0 2px 5px rgba(0,0,0,0.05);
}
.mcq-option-item:hover {
  background-color: hsl(var(--primary) / 0.08); border-color: hsl(var(--primary));
  color: hsl(var(--primary)); transform: translateY(-2px); box-shadow: 0 4px 15px hsl(var(--primary) / 0.1);
}
.mcq-option-item.selected-option { border-color: hsl(var(--primary)); background-color: hsl(var(--primary) / 0.15); }
.mcq-option-item.correct-answer { background-color: hsl(var(--success-bg)) !important; color: hsl(var(--success-fg)) !important; border-color: hsl(var(--success-border)) !important; }
.mcq-option-item.incorrect-answer-selected { background-color: hsl(var(--destructive)) !important; color: hsl(var(--destructive-foreground)) !important; border-color: hsl(var(--destructive) / 0.8) !important; }
.mcq-option-item.always-correct-answer { border: 2px solid hsl(var(--success-border)) !important; box-shadow: 0 0 10px hsl(var(--success-border) / 0.5); }

.feedback-text.correct-feedback { color: hsl(var(--success-fg)); font-weight: bold; }
.feedback-text.incorrect-feedback { color: hsl(var(--destructive)); font-weight: bold; }
.animate-slide-out-left { animation: sleekSlideOutLeft 0.4s cubic-bezier(0.755, 0.05, 0.855, 0.06) forwards; }
.animate-slide-in-right { animation: sleekSlideInRight 0.4s cubic-bezier(0.165, 0.84, 0.44, 1) forwards; }
@keyframes sleekSlideOutLeft { from { opacity: 1; transform: translateX(0) scale(1); } to { opacity: 0; transform: translateX(-50px) scale(0.95); } }
@keyframes sleekSlideInRight { from { opacity: 0; transform: translateX(50px) scale(0.95); } to { opacity: 1; transform: translateX(0) scale(1); } }
.animate-fade-in { animation: templateFadeIn 0.5s ease-out forwards; } /* Using templateFadeIn from default */
@keyframes templateFadeIn { from { opacity: 0; transform: translateY(15px); } to { opacity: 1; transform: translateY(0); } }
.feedback-text.show-feedback { animation: templatePopFeedback 0.4s cubic-bezier(0.68, -0.55, 0.27, 1.55); opacity:1; transform: translateY(0); } /* Using templatePopFeedback */
@keyframes templatePopFeedback { 0% { transform: scale(0.8) translateY(8px); opacity: 0; } 70% { transform: scale(1.05) translateY(0px); opacity: 1; } 100% { transform: scale(1) translateY(0px); opacity: 1; } }

/* Styles for other question types if this template were to support them differently */
.match-item { /* Default matching styles from blank canvas will apply if not overridden */ }
.dnd-item-pool, .dnd-targets-area, .dnd-item, .dnd-drop-target { /* Defaults will apply */ }
.cat-item-pool, .cat-categories-area, .cat-item, .cat-bin { /* Defaults will apply */ }
.connect-points-wrapper, .connect-item { /* Defaults will apply */ }
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
    description: 'A template designed to showcase image-based multiple-choice questions in a grid layout. Uses the Standard Quiz Engine (copied from Blank Canvas).',
    htmlContent: `
<div class="image-grid-quiz-container p-4 md:p-8 bg-muted/30 rounded-xl shadow-lg max-w-4xl mx-auto my-8">
  <h1 id="template-quiz-title" class="text-3xl font-bold mb-8 text-center text-primary"></h1>
  <div id="template-quiz-content-host"></div>
  <div id="template-question-blueprint" style="display: none;" class="image-grid-question p-6 bg-card border border-border rounded-lg shadow-md">
    <h2 data-element="question-text" class="text-xl font-semibold mb-6 text-center text-foreground"></h2>
    <div data-element="options-container" class="options-area grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-4 justify-items-center">
    </div>
    <div data-element="action-buttons-container" class="action-buttons-area mt-4 text-center"></div>
    <div data-element="feedback-message" class="feedback-text mt-6 text-center font-medium text-lg" style="min-height: 28px;"></div>
  </div>
  <div id="template-quiz-end-screen" style="display: none;" class="text-center p-8 bg-card rounded-lg shadow-xl">
    <h2 data-element="end-screen-title" class="text-2xl font-bold mb-4 text-primary"></h2>
    <p data-element="end-screen-message" class="text-lg text-foreground mb-6"></p>
    <button data-element="restart-button" class="mt-4 bg-primary text-primary-foreground px-6 py-3 rounded-md hover:bg-primary/90 text-base font-medium"></button>
  </div>
  <!-- Re-uses the CORE QUIZ ENGINE SCRIPT from the 'tpl-blank-canvas-engine' -->
  ${defaultHtmlContent.substring(defaultHtmlContent.indexOf('<script>'), defaultHtmlContent.lastIndexOf('</script>') + 9)}
</div>`,
    cssContent: `
body { background-color: hsl(var(--background)); color: hsl(var(--foreground)); font-family: var(--font-geist-sans), sans-serif; margin:0; padding: 1rem;}
.image-grid-quiz-container {}
.mcq-option-item.image-option { /* Specific for image options in this template */
  background-color: hsl(var(--card)); border: 2px solid transparent; border-radius: var(--radius);
  padding: 0.5rem; transition: transform 0.2s ease-out, border-color 0.2s, box-shadow 0.2s;
  display: flex; flex-direction: column; align-items: center; width: 100%; max-width: 220px; 
}
.mcq-option-item.image-option:hover { transform: translateY(-4px) scale(1.03); border-color: hsl(var(--primary)); box-shadow: 0 6px 20px hsl(var(--primary) / 0.2); }
.mcq-option-item.image-option img { width: 100%; height: 160px; object-fit: cover; border-radius: calc(var(--radius) - 4px); margin-bottom: 0.5rem; }
.mcq-option-item.image-option p { font-size: 0.875rem; text-align: center; color: hsl(var(--muted-foreground)); }
.mcq-option-item.selected-option { border-color: hsl(var(--primary)); box-shadow: 0 0 0 3px hsl(var(--primary) / 0.7); }
.mcq-option-item.correct-answer { border-color: hsl(var(--success-border)) !important; background-color: hsl(var(--success-bg) / 0.5) !important; }
.mcq-option-item.incorrect-answer-selected { border-color: hsl(var(--destructive)) !important; background-color: hsl(var(--destructive) / 0.3) !important; }
.mcq-option-item.always-correct-answer { box-shadow: 0 0 0 3px hsl(var(--success-border)) !important; }

/* Feedback and animation styles are inherited from the default engine's CSS if not overridden here */
.feedback-text.correct-feedback { color: hsl(var(--success-fg)); }
.feedback-text.incorrect-feedback { color: hsl(var(--destructive)); }
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
