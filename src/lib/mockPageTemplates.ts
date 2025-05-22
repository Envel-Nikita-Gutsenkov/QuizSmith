
import type { PageTemplate } from './types';

export const DEFAULT_TEMPLATE_ID = 'tpl-blank-canvas';

// Well-commented default HTML content to guide template creators
const defaultHtmlContent = `
<!-- 
  QuizSmith Page Template HTML Structure
  This HTML will be the shell for your quiz.
  The quizLogicScript (from the test editor) will inject questions and handle interactions.

  Key elements for the quizLogicScript:
  - A main container for the quiz (e.g., a div with class "quiz-container").
  - An element with id="quiz-content-host": This is WHERE questions will be dynamically inserted.
  - An element with id="quiz-data" and type="application/json": Used to pass question data to the script.
  - An element with id="quiz-end-message-text": Used to pass the quiz end message to the script.
  - Inside #quiz-content-host, you MUST have a question template element with data-quiz-question-id="q_template_id".
    This element will be CLONED for each question. It should contain:
    - An element with data-quiz-question-text="q_template_id": For the question text.
    - An element with data-quiz-options-for-question="q_template_id": Where answer options will be placed.
      - Inside this, an example button/element with data-quiz-answer-option="q_template_id.opt_template_id"
        This button will be CLONED for each answer option in Multiple Choice questions.
        Its classes will be used as the base for option buttons.
    - An element with data-quiz-feedback="q_template_id": For displaying "Correct!"/"Incorrect!" feedback.

  You can add your own <script> tags here for template-specific animations or JS enhancements.
  Example:
  <script>
    // This script runs in the context of THIS TEMPLATE in the preview iframe.
    // You can use it for template-specific animations or DOM manipulations.
    // Be careful not to interfere with the quizLogicScript's control over #quiz-content-host.
    // console.log("Custom template script loaded!");
    // Example: Animate the quiz title if it exists
    // document.addEventListener('DOMContentLoaded', () => {
    //   const title = document.querySelector('.quiz-container [data-quiz-title]');
    //   if (title) {
    //     title.style.opacity = '0';
    //     title.style.transform = 'translateY(-20px)';
    //     setTimeout(() => {
    //       title.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
    //       title.style.opacity = '1';
    //       title.style.transform = 'translateY(0)';
    //     }, 100);
    //   }
    // });
  <\/script>

  Use Tailwind CSS classes or your custom CSS in the <style> block below.
-->
<div class="quiz-container p-8 rounded-xl shadow-2xl bg-card text-card-foreground max-w-2xl mx-auto my-10">
  <!-- This h1 will be updated by the quizLogicScript if data-quiz-title is present -->
  <h1 data-quiz-title class="text-3xl font-bold mb-8 text-primary text-center">Your Quiz Title</h1>
  
  <!-- This is where the quizLogicScript will render questions -->
  <div id="quiz-content-host">
    <!-- 
      Question Template: This entire div is cloned for each question.
      It MUST have data-quiz-question-id="q_template_id".
      It should be hidden by default (style="display: none;").
    -->
    <div data-quiz-question-id="q_template_id" class="question-block mb-10 p-6 bg-background/70 border border-border rounded-lg shadow-md transition-all duration-300 hover:shadow-lg" style="display: none;">
      <!-- Question text placeholder -->
      <h2 data-quiz-question-text="q_template_id" class="text-xl font-semibold mb-6 text-foreground">Sample Question: What is 2 + 2?</h2>
      
      <!-- Options container: MCQs, Matching, D&D items will be rendered here -->
      <div data-quiz-options-for-question="q_template_id" class="options-grid grid grid-cols-1 md:grid-cols-2 gap-4">
        <!-- 
          MCQ Option Button Template: This button is cloned for each MCQ option.
          It MUST have data-quiz-answer-option="q_template_id.opt_template_id".
          Its classes define the base style for MCQ options.
        -->
        <button data-quiz-answer-option="q_template_id.opt_template_id" 
                class="option-button w-full text-left p-4 border border-border rounded-md text-foreground
                       hover:bg-secondary hover:border-primary hover:shadow-md 
                       focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background
                       transition-all duration-200 ease-in-out transform hover:scale-105">
          Sample Option Text
        </button>
        <!-- For Matching and D&D, the quizLogicScript will inject different structures into data-quiz-options-for-question -->
      </div>
      
      <!-- Feedback message placeholder -->
      <div data-quiz-feedback="q_template_id" class="feedback-message mt-6 text-center font-medium text-lg" style="display: none; min-height: 28px;"></div>
    </div>
  </div>

  <!-- Hidden script tag for passing question data from editor to preview script -->
  <script id="quiz-data" type="application/json"></script>
  <!-- Hidden div for passing quiz end message from editor to preview script -->
  <div id="quiz-end-message-text" style="display:none;"></div>
</div>
`;

const defaultCssContent = `
/* 
  QuizSmith Page Template CSS
  This CSS styles the HTML structure defined above.
  It will be combined with Tailwind CSS (loaded via CDN in the preview).
  You can use CSS variables defined in src/app/globals.css (e.g., hsl(var(--primary))).
  Define your animations and custom styles here.
*/
body {
  background-color: hsl(var(--background)); 
  color: hsl(var(--foreground));
  font-family: var(--font-geist-sans, sans-serif);
}
.quiz-container { 
  font-family: var(--font-geist-sans), sans-serif; 
  /* Add any container-specific styles here */
}

/* MCQ Option Button Styling */
.option-button.selected { /* Applied by script when an option is clicked before feedback */
  background-color: hsl(var(--accent));
  color: hsl(var(--accent-foreground));
  border-color: hsl(var(--accent) / 0.8);
  box-shadow: 0 0 0 2px hsl(var(--accent) / 0.5);
  transform: scale(1.02); 
  animation: pop 0.3s ease-out; /* Example animation */
}
.option-button.image-option { /* Specific for image options if you customize */
  padding: 0.5rem; 
}
.option-button.image-option img {
  max-height: 120px; /* Control image size in button */
  display: block;
  margin-left: auto;
  margin-right: auto;
  margin-bottom: 0.5rem;
  border-radius: var(--radius);
  border: 1px solid hsl(var(--border));
}

/* Feedback Styling (applied by quizLogicScript) */
.option-button.correct-answer { /* User selected the correct answer */
  background-color: hsl(var(--success-bg)) !important;
  color: hsl(var(--success-fg)) !important;
  border-color: hsl(var(--success-border)) !important;
  box-shadow: 0 0 0 3px hsl(var(--success-border) / 0.7);
  animation: pop 0.3s ease-out;
}
.option-button.incorrect-answer-selected { /* User selected an incorrect answer */
  background-color: hsl(var(--destructive)) !important;
  color: hsl(var(--destructive-foreground)) !important;
  border-color: hsl(var(--destructive)) !important;
  box-shadow: 0 0 0 3px hsl(var(--destructive) / 0.7);
  opacity: 0.9;
  animation: pop 0.3s ease-out;
}
.option-button.always-correct-answer { /* Highlights the actual correct answer if user was wrong */
  background-color: hsl(var(--success-bg)) !important;
  color: hsl(var(--success-fg)) !important;
  border: 2px solid hsl(var(--success-border)) !important;
}

.feedback-message { 
  opacity: 0; 
  transform: translateY(10px); 
  transition: opacity 0.3s ease-out, transform 0.3s ease-out; 
  min-height: 28px; /* Ensure space even when empty */
}
.feedback-message.show { 
  opacity: 1; 
  transform: translateY(0); 
  animation: fadeInFeedback 0.3s ease-out, popFeedback 0.4s cubic-bezier(0.68, -0.55, 0.27, 1.55); 
}
.feedback-message.correct { color: hsl(var(--success-fg)); }
.feedback-message.incorrect { color: hsl(var(--destructive)); }

/* Question Transition Animations (applied by quizLogicScript) */
.animate-slide-out-left { 
  opacity: 0 !important; 
  transform: translateX(-50px) !important; 
  transition: opacity 0.5s ease-out, transform 0.5s ease-out; 
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

/* End Screen Animation */
.animate-fade-in { 
  opacity: 0; 
  animation: fadeIn 0.5s ease-out forwards; 
}
@keyframes fadeIn { 
  from { opacity: 0; transform: translateY(10px); } 
  to { opacity: 1; transform: translateY(0); } 
}

/* General Animations */
@keyframes pop { 
  0% { transform: scale(1); } 
  50% { transform: scale(1.05); } 
  100% { transform: scale(1); } 
}
@keyframes fadeInFeedback { 
  from { opacity: 0; transform: translateY(10px); } 
  to { opacity: 1; transform: translateY(0px); } 
}
@keyframes popFeedback { 
  0% { transform: scale(0.9) translateY(5px); } 
  70% { transform: scale(1.05) translateY(0px); } 
  100% { transform: scale(1) translateY(0px); } 
}

/* Styles for Matching and Drag&Drop (basic placeholders, enhance as needed) */
.matching-prompts .p-3 { 
  margin-bottom: 0.5rem; 
  background-color: hsl(var(--secondary) / 0.7);
  border: 1px solid hsl(var(--border));
  border-radius: var(--radius);
}
.matching-targets .option-button { 
  margin-bottom: 0.5rem; 
  background-color: hsl(var(--card));
  border: 1px dashed hsl(var(--border)); /* Differentiate targets */
}
.matching-targets .option-button:hover {
  border-style: solid;
  border-color: hsl(var(--primary));
}

.drag-items-container { 
  display: flex; 
  flex-wrap: wrap; 
  gap: 0.75rem; 
  justify-content: center; 
  padding: 1rem; 
  margin-bottom: 1.5rem; 
  border: 1px dashed hsl(var(--border)); 
  border-radius: var(--radius); 
  background-color: hsl(var(--muted)/30);
  min-height: 60px;
}
.drag-items-container .p-3 { /* Style for individual draggable items */
  background-color: hsl(var(--primary)); 
  color: hsl(var(--primary-foreground));
  border-radius: var(--radius);
  padding: 0.5rem 1rem;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1); 
  cursor: grab;
  transition: transform 0.2s ease-out;
}
.drag-items-container .p-3:active {
  cursor: grabbing;
  transform: scale(0.95);
}

.drop-targets-container { 
  display: grid; 
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); 
  gap: 1rem;
}
.drop-targets-container .p-6 { /* Style for individual drop targets */
  border: 2px dashed hsl(var(--primary) / 0.5); 
  min-height: 80px;
  border-radius: var(--radius);
  background-color: hsl(var(--background));
  display: flex; 
  align-items: center; 
  justify-content: center;
  transition: background-color 0.2s ease-out;
}
.drop-targets-container .p-6.drag-over { /* Example class if you implement JS drag-over styling */
  background-color: hsl(var(--secondary));
  border-color: hsl(var(--primary));
}

/* Add template-specific JS animations here if needed, or link to external JS files */
/* Example:
  .my-custom-animation { animation: customSlideIn 1s ease forwards; }
  @keyframes customSlideIn { ... }
*/
`;


export const pageTemplates: PageTemplate[] = [
  {
    id: DEFAULT_TEMPLATE_ID,
    name: 'Blank Canvas (Standard)',
    description: 'A clean slate with essential quiz structure. Highly customizable for any question type. Ideal for developers or those wanting full control. This is your starting point for custom designs.',
    htmlContent: defaultHtmlContent,
    cssContent: defaultCssContent,
    previewImageUrl: 'https://placehold.co/600x400.png',
    aiHint: 'blank canvas',
    tags: ['Minimal', 'Customizable', 'Developer', 'Standard'],
  },
  {
    id: 'tpl-text-mcq-sleek',
    name: 'Sleek Text MCQ',
    description: 'A modern, minimalist design optimized for text-based multiple-choice questions. Focus on readability and clean interactions.',
    htmlContent: `
<div class="quiz-container sleek-text-mcq p-6 md:p-10 rounded-lg shadow-xl bg-card text-card-foreground max-w-xl mx-auto my-8 border border-border">
  <h1 data-quiz-title class="text-2xl md:text-3xl font-bold mb-8 text-primary text-center">Sleek Quiz Title</h1>
  <div id="quiz-content-host">
    <!-- Question Template -->
    <div data-quiz-question-id="q_template_id" class="question-block mb-8 p-5 bg-background/50 border border-border rounded-md transition-shadow duration-300 hover:shadow-lg" style="display: none;">
      <h2 data-quiz-question-text="q_template_id" class="text-lg md:text-xl font-semibold mb-5 text-foreground"></h2>
      <div data-quiz-options-for-question="q_template_id" class="options-grid grid grid-cols-1 gap-3">
        <!-- MCQ Option Button Template -->
        <button data-quiz-answer-option="q_template_id.opt_template_id" 
                class="option-button w-full text-left p-3.5 border border-input rounded-md text-foreground
                       hover:bg-secondary hover:border-primary 
                       focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1 focus:ring-offset-background
                       transition-all duration-150 ease-in-out transform hover:-translate-y-0.5">
        </button>
      </div>
      <div data-quiz-feedback="q_template_id" class="feedback-message mt-5 text-center font-medium" style="display: none; min-height: 24px;"></div>
    </div>
  </div>
  <script id="quiz-data" type="application/json"></script>
  <div id="quiz-end-message-text" style="display:none;"></div>
  <!-- Template-specific script example: -->
  <script>
    // This script is part of the 'Sleek Text MCQ' PAGE STYLE TEMPLATE.
    // It runs when this template is used in the quiz preview.
    document.addEventListener('DOMContentLoaded', () => {
      const title = document.querySelector('.sleek-text-mcq [data-quiz-title]');
      if (title) {
        // Example: A simple fade-in animation for the quiz title
        title.style.opacity = '0';
        title.style.transform = 'translateY(-10px)';
        // Ensure this doesn't run if already animated or hidden by quizLogicScript
        if (getComputedStyle(title).display !== 'none') {
          setTimeout(() => {
            title.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
            title.style.opacity = '1';
            title.style.transform = 'translateY(0)';
          }, 100);
        }
      }
    });
  <\/script>
</div>
    `,
    cssContent: `
    ${defaultCssContent.replace('/* Add template-specific JS animations here if needed, or link to external JS files */', `
    .sleek-text-mcq .option-button { 
        letter-spacing: 0.5px; 
        box-shadow: 0 1px 3px rgba(0,0,0,0.03);
    }
    .sleek-text-mcq .option-button:hover {
        box-shadow: 0 3px 8px rgba(0,0,0,0.07);
    }
    /* Example of a template-specific CSS animation for question blocks */
    .sleek-text-mcq .question-block {
      animation: sleekFadeIn 0.5s ease-out forwards;
    }
    @keyframes sleekFadeIn {
      from { opacity: 0.5; transform: scale(0.98); }
      to { opacity: 1; transform: scale(1); }
    }
    `)} 
    `,
    previewImageUrl: 'https://placehold.co/600x400.png',
    aiHint: 'minimalist modern',
    tags: ['Text MCQ', 'Minimalist', 'Modern'],
  },
  {
    id: 'tpl-image-grid-mcq',
    name: 'Visual Image Grid MCQ',
    description: 'Showcases image options in a responsive grid. Ideal for visual quizzes, brand recognition, or product selection tests.',
    htmlContent: `
<div class="quiz-container image-grid-mcq p-5 md:p-8 rounded-lg shadow-2xl bg-gradient-to-br from-primary/5 via-background to-background text-card-foreground max-w-3xl mx-auto my-8">
  <h1 data-quiz-title class="text-3xl font-bold mb-8 text-primary text-center">Image Quiz</h1>
  <div id="quiz-content-host">
    <!-- Question Template -->
    <div data-quiz-question-id="q_template_id" class="question-block mb-10 p-6 bg-card/80 border border-border rounded-lg shadow-lg" style="display: none;">
      <h2 data-quiz-question-text="q_template_id" class="text-xl font-semibold mb-6 text-center text-foreground"></h2>
      <div data-quiz-options-for-question="q_template_id" class="options-grid grid grid-cols-2 md:grid-cols-2 gap-4">
        <!-- MCQ Option Button Template (script will fill img src and text) -->
        <button data-quiz-answer-option="q_template_id.opt_template_id" 
                class="option-button image-option w-full p-2 border border-input rounded-md text-foreground
                       hover:border-primary hover:shadow-lg 
                       focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background
                       transition-all duration-200 ease-in-out flex flex-col items-center justify-center aspect-square">
           <!-- Image and text will be injected here by quizLogicScript -->
        </button>
      </div>
      <div data-quiz-feedback="q_template_id" class="feedback-message mt-6 text-center font-medium" style="display: none; min-height: 28px;"></div>
    </div>
  </div>
  <script id="quiz-data" type="application/json"></script>
  <div id="quiz-end-message-text" style="display:none;"></div>
</div>
    `,
    cssContent: `
    ${defaultCssContent.replace('/* Add template-specific JS animations here if needed, or link to external JS files */', `
    .image-grid-mcq .option-button.image-option { 
        min-height: 150px; /* Ensure space for image + text */
        background-color: hsl(var(--background));
        overflow: hidden; /* Ensure image corners are rounded with button */
    }
    .image-grid-mcq .option-button.image-option img { 
        width: 100%;
        height: 70%; /* Adjust based on desired image vs text space */
        object-fit: cover; /* Or 'contain' if you don't want cropping */
        margin-bottom: 0.5rem; 
        border-radius: calc(var(--radius) - 4px); /* Slightly less than button for inset look */
        transition: transform 0.3s ease-out;
    }
    .image-grid-mcq .option-button.image-option:hover img {
        transform: scale(1.05);
    }
    .image-grid-mcq .option-button.image-option p { 
        font-size: 0.875rem; 
        color: hsl(var(--muted-foreground));
        text-align: center;
        padding: 0 0.25rem;
        line-height: 1.2;
        max-height: 2.4em; /* Approx 2 lines of text */
        overflow: hidden;
        text-overflow: ellipsis;
    }
    .image-grid-mcq .option-button.selected { border-width: 2px; }
    `)}
    `,
    previewImageUrl: 'https://placehold.co/600x400.png',
    aiHint: 'image gallery quiz',
    tags: ['Image MCQ', 'Grid', 'Visual'],
  },
  {
    id: 'tpl-matching-interactive',
    name: 'Interactive Matching Zone',
    description: 'A clear and engaging layout specifically for text-to-text matching questions. Promotes focus and easy interaction.',
     htmlContent: `
<div class="quiz-container matching-zone p-8 rounded-xl shadow-lg bg-card text-card-foreground max-w-2xl mx-auto my-10">
  <h1 data-quiz-title class="text-3xl font-bold mb-8 text-primary text-center">Matching Challenge</h1>
  <div id="quiz-content-host">
    <!-- Question Template -->
    <div data-quiz-question-id="q_template_id" class="question-block mb-10 p-6 bg-background/70 border border-border rounded-lg" style="display: none;">
      <h2 data-quiz-question-text="q_template_id" class="text-xl font-semibold mb-6 text-foreground"></h2>
      <!-- The quizLogicScript will populate this area based on 'matching-text-text' type -->
      <div data-quiz-options-for-question="q_template_id" class="matching-area">
        <!-- Matching prompts and targets will be injected by script here. 
             The 'option-button' class from the default template might be reused by the script for targets. -->
      </div>
      <div data-quiz-feedback="q_template_id" class="feedback-message mt-6 text-center font-medium" style="display: none; min-height: 28px;"></div>
    </div>
  </div>
  <script id="quiz-data" type="application/json"></script>
  <div id="quiz-end-message-text" style="display:none;"></div>
</div>
    `,
    cssContent: `
    ${defaultCssContent.replace('/* Add template-specific JS animations here if needed, or link to external JS files */', `
    /* Styles for Matching questions will primarily use default .option-button and feedback styles.
       This template mostly provides a clean shell. Specific styling for how prompts/targets
       are laid out will be handled by the quizLogicScript's generated HTML and the base CSS.
       You can add specific container styles here if needed. */
    .matching-zone .matching-area { 
        /* The quizLogicScript will likely create .matching-prompts and .matching-targets divs here */
        /* You can style those classes if you wish to customize further than default button styles */
    }
    .matching-zone .matching-prompts .p-3 { /* Default style from quizLogicScript */
       background-color: hsl(var(--secondary)); 
       border: 1px solid hsl(var(--border));
       border-radius: var(--radius);
       margin-bottom: 0.5rem;
       padding: 0.75rem 1rem;
    }
    .matching-zone .matching-targets .option-button { /* Default from quizLogicScript for targets */
       border-style: dashed;
       transition: background-color 0.2s, border-color 0.2s;
    }
    .matching-zone .matching-targets .option-button:hover {
       border-style: solid;
       background-color: hsl(var(--secondary) / 0.5);
    }
    `)}
    `,
    previewImageUrl: 'https://placehold.co/600x400.png',
    aiHint: 'matching pairs',
    tags: ['Matching', 'Interactive', 'Text'],
  },
   {
    id: 'tpl-drag-drop-dynamic',
    name: 'Dynamic Drag & Drop Arena',
    description: 'An engaging and visually distinct arena for drag-and-drop interactions. Clear separation of draggable items and drop targets.',
    htmlContent: `
<div class="quiz-container drag-drop-arena p-8 rounded-lg shadow-xl bg-gradient-to-b from-background to-secondary/30 text-card-foreground max-w-3xl mx-auto my-10">
  <h1 data-quiz-title class="text-3xl font-bold mb-10 text-primary text-center">Drag & Drop Challenge</h1>
  <div id="quiz-content-host">
    <!-- Question Template -->
    <div data-quiz-question-id="q_template_id" class="question-block mb-12 p-6 bg-card border-2 border-primary/20 rounded-lg shadow-inner" style="display: none;">
      <h2 data-quiz-question-text="q_template_id" class="text-xl font-semibold mb-8 text-center text-foreground"></h2>
      <!-- The quizLogicScript will populate this area for 'drag-and-drop-text-text' type -->
      <div data-quiz-options-for-question="q_template_id" class="drag-drop-area">
        <!-- Draggable items container and drop targets container will be injected by script. -->
      </div>
      <div data-quiz-feedback="q_template_id" class="feedback-message mt-8 text-center font-medium text-lg" style="display: none; min-height: 32px;"></div>
    </div>
  </div>
  <script id="quiz-data" type="application/json"></script>
  <div id="quiz-end-message-text" style="display:none;"></div>
</div>
    `,
    cssContent: `
    ${defaultCssContent.replace('/* Add template-specific JS animations here if needed, or link to external JS files */', `
    /* Styles for Drag & Drop questions. The quizLogicScript generates .drag-items-container
       and .drop-targets-container, which are styled by defaultCssContent.
       This template mainly provides a thematic shell. */
    .drag-drop-arena .drag-items-container .p-3 { /* Style for individual draggable items (from defaultCssContent) */
        /* Example: add a hover effect specific to this template */
        transition: transform 0.2s ease-out, box-shadow 0.2s ease-out;
    }
    .drag-drop-arena .drag-items-container .p-3:hover {
        transform: translateY(-3px) scale(1.03);
        box-shadow: 0 4px 8px rgba(0,0,0,0.15);
    }
    .drag-drop-arena .drop-targets-container .p-6 { /* Style for individual drop targets (from defaultCssContent) */
        /* Example: add a hover effect or different border */
        transition: background-color 0.2s ease-out, border-color 0.2s ease-out;
    }
    .drag-drop-arena .drop-targets-container .p-6:hover {
        background-color: hsl(var(--secondary) / 0.5);
        border-color: hsl(var(--primary));
    }
    `)}
    `,
    previewImageUrl: 'https://placehold.co/600x400.png',
    aiHint: 'drag drop ui',
    tags: ['Drag & Drop', 'Interactive', 'Dynamic'],
  },
];

