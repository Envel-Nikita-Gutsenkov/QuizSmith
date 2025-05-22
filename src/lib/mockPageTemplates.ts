
import type { PageTemplate } from './types';

export const DEFAULT_TEMPLATE_ID = 'tpl-blank-canvas';

// Well-commented default HTML content to guide template creators
const defaultHtmlContent = `
<!-- 
  QuizSmith Page Template HTML Structure (Blank Canvas - Standard)
  This HTML will be the shell for your quiz page. 
  The quizLogicScript (from the test editor) will inject question content and handle interactions.

  Key elements for the quizLogicScript to function correctly:
  - A main container for the quiz (e.g., a div with class "quiz-container").
  - An element with id="quiz-content-host": This is WHERE questions will be dynamically inserted by the script.
  - An element with id="quiz-data" and type="application/json": This hidden script tag is used by the Test Editor
    to pass question data (defined in the Test Editor) to the quizLogicScript in the preview.
  - An element with id="quiz-end-message-text": This hidden div is used by the Test Editor to pass the
    customizable quiz end message to the quizLogicScript in the preview.

  Inside #quiz-content-host, you MUST have a question template element:
  - <div data-quiz-question-id="q_template_id" style="display: none;"> ... </div>
    This element acts as a blueprint. The quizLogicScript will CLONE this div for EACH question.
    The content and structure inside this blueprint determine how individual questions look.
    It should contain:
    - An element with data-quiz-question-text="q_template_id": For the question text itself.
    - An element with data-quiz-options-for-question="q_template_id": This is where answer options
      (for MCQ) or other interactive elements (for Matching, D&D) will be placed by the script.
      - Inside this, for MCQ, you'll typically have an example button/element like:
        <button data-quiz-answer-option="q_template_id.opt_template_id" class="option-button">Sample Option</button>
        This button will be CLONED for each actual answer option of an MCQ question.
        Its classes will be used as the base style for generated option buttons.
    - An element with data-quiz-feedback="q_template_id": For displaying "Correct!"/"Incorrect!" feedback messages.

  CUSTOM JAVASCRIPT FOR THIS PAGE STYLE TEMPLATE:
  You can add your own <script> tags here for template-specific animations or JS enhancements.
  This script runs in the context of THIS TEMPLATE when it's previewed or used.
  Be careful not to interfere with the quizLogicScript's control over #quiz-content-host.
  Example of a simple template-specific script:
  <script>
    document.addEventListener('DOMContentLoaded', () => {
      // Example: Add a class to the body if this template is active
      // document.body.classList.add('blank-canvas-template-active');
      // console.log("Blank Canvas Page Style Template JS loaded!");

      // You could initialize simple animations for elements unique to this template.
      // const specialHeader = document.querySelector('.my-template-special-header');
      // if (specialHeader) {
      //   specialHeader.addEventListener('click', () => {
      //     alert('Template-specific header clicked!');
      //   });
      // }
    });
  <\/script>

  Use Tailwind CSS classes directly in your HTML, or define custom CSS in the CSS content block below.
-->
<div class="quiz-container p-8 rounded-xl shadow-2xl bg-card text-card-foreground max-w-2xl mx-auto my-10">
  <!-- This h1 will be updated by the quizLogicScript if data-quiz-title is present -->
  <h1 data-quiz-title class="text-3xl font-bold mb-8 text-primary text-center">Your Quiz Title</h1>
  
  <!-- This is where the quizLogicScript will render questions -->
  <div id="quiz-content-host">
    <!-- 
      Question Template: This entire div is cloned for each question.
      It MUST have data-quiz-question-id="q_template_id".
      It should be hidden by default (e.g., style="display: none;").
    -->
    <div data-quiz-question-id="q_template_id" class="question-block mb-10 p-6 bg-background/70 border border-border rounded-lg shadow-md transition-all duration-300 hover:shadow-lg" style="display: none;">
      <!-- Question text placeholder -->
      <h2 data-quiz-question-text="q_template_id" class="text-xl font-semibold mb-6 text-foreground">Sample Question: What is 2 + 2?</h2>
      
      <!-- Options container: MCQs, Matching, D&D items will be rendered here by quizLogicScript -->
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
  QuizSmith Page Template CSS (Blank Canvas - Standard)
  This CSS styles the HTML structure defined in the HTML content block.
  It will be combined with Tailwind CSS (loaded via CDN in the preview iframe).
  You can use CSS variables defined in src/app/globals.css (e.g., hsl(var(--primary))).

  DEFINE YOUR ANIMATIONS AND CUSTOM STYLES HERE.
  Example:
  @keyframes myTemplateAnimation {
    from { opacity: 0; }
    to { opacity: 1; }
  }
  .my-animated-element {
    animation: myTemplateAnimation 1s ease forwards;
  }
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

/* MCQ Option Button Styling (used by quizLogicScript) */
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

/* Feedback Styling (applied by quizLogicScript based on question data from Test Editor) */
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

/* End Screen Animation (applied by quizLogicScript) */
.animate-fade-in { 
  opacity: 0; 
  animation: fadeIn 0.5s ease-out forwards; 
}
@keyframes fadeIn { 
  from { opacity: 0; transform: translateY(10px); } 
  to { opacity: 1; transform: translateY(0); } 
}

/* General Reusable Animations */
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

/* Styles for Matching and Drag&Drop (basic placeholders, quizLogicScript generates these elements) */
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
.drop-targets-container .p-6.drag-over { /* Example class if you implement JS drag-over styling in quizLogicScript */
  background-color: hsl(var(--secondary));
  border-color: hsl(var(--primary));
}
`;


export const pageTemplates: PageTemplate[] = [
  {
    id: DEFAULT_TEMPLATE_ID,
    name: 'Blank Canvas (Standard)',
    description: 'The essential, well-commented starting point. Includes placeholders for quiz elements and guidance for adding custom HTML, CSS, and template-specific JavaScript. Ideal for full customization.',
    htmlContent: defaultHtmlContent,
    cssContent: defaultCssContent,
    previewImageUrl: 'https://placehold.co/600x400.png',
    aiHint: 'blank canvas',
    tags: ['Minimal', 'Customizable', 'Developer', 'Standard', 'Base'],
  },
  {
    id: 'tpl-text-mcq-sleek',
    name: 'Sleek Text MCQ',
    description: 'A modern, minimalist design optimized for text-based multiple-choice questions. Focus on readability and clean interactions. Includes a subtle fade-in animation for the title via template-specific JS.',
    htmlContent: `
<div class="quiz-container sleek-text-mcq p-6 md:p-10 rounded-lg shadow-xl bg-card text-card-foreground max-w-xl mx-auto my-8 border border-border">
  <h1 data-quiz-title class="text-2xl md:text-3xl font-bold mb-8 text-primary text-center sleek-title-animation">Sleek Quiz Title</h1>
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
      const title = document.querySelector('.sleek-text-mcq .sleek-title-animation');
      if (title) {
        // Check if animation hasn't already run (e.g. by checking for a class or attribute)
        if (!title.classList.contains('animated')) {
          title.classList.add('animated'); // Mark as animated
          // The actual animation is now defined in CSS for this template
        }
      }
    });
  <\/script>
</div>
    `,
    cssContent: `
    ${defaultCssContent.replace('/* Add template-specific JS animations here if needed, or link to external JS files */', `
    /* Sleek Text MCQ Specific Styles */
    .sleek-text-mcq .option-button { 
        letter-spacing: 0.5px; 
        box-shadow: 0 1px 3px rgba(0,0,0,0.03);
    }
    .sleek-text-mcq .option-button:hover {
        box-shadow: 0 3px 8px rgba(0,0,0,0.07);
    }
    .sleek-text-mcq .question-block {
      /* You can add specific animations for question blocks in this template */
      /* animation: sleekQuestionFadeIn 0.4s ease-out forwards; */
    }
    
    /* Example of a template-specific CSS animation for the title */
    .sleek-title-animation {
      opacity: 0;
      transform: translateY(-10px);
      animation: sleekTitleFadeIn 0.5s ease-out 0.1s forwards; /* Added delay */
    }
    @keyframes sleekTitleFadeIn {
      from { opacity: 0; transform: translateY(-10px); }
      to { opacity: 1; transform: translateY(0); }
    }
    `)} 
    `,
    previewImageUrl: 'https://placehold.co/600x400.png',
    aiHint: 'minimalist modern',
    tags: ['Text MCQ', 'Minimalist', 'Modern', 'Animated'],
  },
  {
    id: 'tpl-image-grid-mcq',
    name: 'Visual Image Grid MCQ',
    description: 'Showcases image options in a responsive grid. Ideal for visual quizzes, brand recognition, or product selection tests. Options animate on hover.',
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
    /* Visual Image Grid MCQ Specific Styles */
    .image-grid-mcq .option-button.image-option { 
        min-height: 150px; /* Ensure space for image + text */
        background-color: hsl(var(--background));
        overflow: hidden; /* Ensure image corners are rounded with button */
        transition: transform 0.3s ease-out, box-shadow 0.3s ease-out; /* Added for hover animation */
    }
    .image-grid-mcq .option-button.image-option:hover {
        transform: translateY(-5px) scale(1.02);
        box-shadow: 0 8px 16px hsl(var(--primary) / 0.2);
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
    tags: ['Image MCQ', 'Grid', 'Visual', 'Animated'],
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
    /* Interactive Matching Zone Specific Styles */
    .matching-zone .matching-area { 
        /* Styles for the overall matching area, if needed. */
    }
    .matching-zone .matching-prompts .p-3 { /* Default style from quizLogicScript */
       background-color: hsl(var(--secondary)); 
       border: 1px solid hsl(var(--border));
       border-radius: var(--radius);
       margin-bottom: 0.75rem; /* Increased margin */
       padding: 0.85rem 1.1rem; /* Slightly larger padding */
       box-shadow: 0 2px 4px rgba(0,0,0,0.05);
    }
    .matching-zone .matching-targets .option-button { /* Default from quizLogicScript for targets */
       border-style: dashed;
       border-width: 2px; /* Thicker dashed border */
       transition: background-color 0.2s, border-color 0.2s, transform 0.2s;
    }
    .matching-zone .matching-targets .option-button:hover {
       border-style: solid;
       background-color: hsl(var(--secondary) / 0.5);
       transform: scale(1.03);
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
    /* Dynamic Drag & Drop Arena Specific Styles */
    .drag-drop-arena .drag-items-container .p-3 { 
        /* (Using default styles from defaultCssContent) */
        /* Example: add a hover effect specific to this template's draggable items */
        transition: transform 0.2s ease-out, box-shadow 0.2s ease-out;
    }
    .drag-drop-arena .drag-items-container .p-3:hover {
        transform: translateY(-3px) scale(1.03);
        box-shadow: 0 4px 8px hsl(var(--primary) / 0.2);
    }
    .drag-drop-arena .drop-targets-container .p-6 { 
        /* (Using default styles from defaultCssContent) */
        /* Example: add a hover effect or different border for drop targets */
        transition: background-color 0.2s ease-out, border-color 0.2s ease-out, transform 0.2s ease-out;
    }
    .drag-drop-arena .drop-targets-container .p-6:hover {
        background-color: hsl(var(--secondary) / 0.6);
        border-color: hsl(var(--primary));
        transform: scale(1.02);
    }
    .drag-drop-arena .drop-targets-container .p-6.drag-over { 
        /* Example for when an item is being dragged over a target */
        background-color: hsl(var(--primary) / 0.1);
        border-style: solid;
        border-color: hsl(var(--primary));
    }
    `)}
    `,
    previewImageUrl: 'https://placehold.co/600x400.png',
    aiHint: 'drag drop ui',
    tags: ['Drag & Drop', 'Interactive', 'Dynamic'],
  },
];
