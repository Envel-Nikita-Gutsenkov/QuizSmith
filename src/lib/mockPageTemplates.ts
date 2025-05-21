
import type { PageTemplate } from './types';

export const DEFAULT_TEMPLATE_ID = 'tpl-blank-canvas';

const defaultHtmlContent = \`
<div class="quiz-container p-8 rounded-xl shadow-2xl bg-card text-card-foreground max-w-2xl mx-auto my-10">
  <h1 data-quiz-title class="text-3xl font-bold mb-8 text-primary text-center">Your Quiz Title</h1>
  
  <div id="quiz-content-host">
    <!-- Question Template (to be cloned by script) -->
    <div data-quiz-question-id="q_template_id" class="question-block mb-10 p-6 bg-background/70 border border-border rounded-lg shadow-md transition-all duration-300 hover:shadow-lg" style="display: none;">
      <h2 data-quiz-question-text="q_template_id" class="text-xl font-semibold mb-6 text-foreground">Sample Question: What is 2 + 2?</h2>
      <div data-quiz-options-for-question="q_template_id" class="options-grid grid grid-cols-1 md:grid-cols-2 gap-4">
        <!-- Option Button Template (to be cloned by script for MCQ) -->
        <button data-quiz-answer-option="q_template_id.opt_template_id" 
                class="option-button w-full text-left p-4 border border-border rounded-md text-foreground
                       hover:bg-secondary hover:border-primary hover:shadow-md 
                       focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background
                       transition-all duration-200 ease-in-out transform hover:scale-105">
          Sample Option Text
        </button>
        <!-- Matching and D&D options will be injected here by script if question type requires -->
      </div>
      <div data-quiz-feedback="q_template_id" class="feedback-message mt-6 text-center font-medium text-lg" style="display: none; min-height: 28px;"></div>
    </div>
  </div>

  <script id="quiz-data" type="application/json"></script>
  <div id="quiz-end-message-text" style="display:none;"></div>
</div>
\`;

const defaultCssContent = \`
body {
  background-color: hsl(var(--background)); 
  color: hsl(var(--foreground));
  font-family: var(--font-geist-sans, sans-serif);
}
.quiz-container { font-family: var(--font-geist-sans), sans-serif; }
.option-button.selected {
  background-color: hsl(var(--accent));
  color: hsl(var(--accent-foreground));
  border-color: hsl(var(--accent) / 0.8);
  box-shadow: 0 0 0 2px hsl(var(--accent) / 0.5);
  transform: scale(1.02); 
  animation: pop 0.3s ease-out;
}
.option-button.image-option { /* Specific for image options */
  padding: 0.5rem; /* Less padding if image is main content */
}
.option-button.image-option img {
  max-height: 100px; /* Control image size in button */
  display: block;
  margin-left: auto;
  margin-right: auto;
  margin-bottom: 0.5rem;
}
.option-button.correct-answer {
  background-color: hsl(var(--success-bg)) !important;
  color: hsl(var(--success-fg)) !important;
  border-color: hsl(var(--success-border)) !important;
  box-shadow: 0 0 0 3px hsl(var(--success-border) / 0.7);
  animation: pop 0.3s ease-out;
}
.option-button.incorrect-answer-selected {
  background-color: hsl(var(--destructive)) !important;
  color: hsl(var(--destructive-foreground)) !important;
  border-color: hsl(var(--destructive)) !important;
  box-shadow: 0 0 0 3px hsl(var(--destructive) / 0.7);
  opacity: 0.9;
  animation: pop 0.3s ease-out;
}
.option-button.always-correct-answer {
  background-color: hsl(var(--success-bg)) !important;
  color: hsl(var(--success-fg)) !important;
  border: 2px solid hsl(var(--success-border)) !important;
}
.feedback-message { opacity: 0; transform: translateY(10px); transition: opacity 0.3s ease-out, transform 0.3s ease-out; }
.feedback-message.show { opacity: 1; transform: translateY(0); animation: fadeInFeedback 0.3s ease-out, popFeedback 0.4s cubic-bezier(0.68, -0.55, 0.27, 1.55); }
.feedback-message.correct { color: hsl(var(--success-fg)); }
.feedback-message.incorrect { color: hsl(var(--destructive)); }

.animate-slide-out-left { opacity: 0 !important; transform: translateX(-50px) !important; transition: opacity 0.5s ease-out, transform 0.5s ease-out; }
.animate-slide-in-right { opacity: 0; transform: translateX(50px); animation: slideInFromRight 0.5s ease-out forwards; }
@keyframes slideInFromRight { from { opacity: 0; transform: translateX(50px); } to { opacity: 1; transform: translateX(0); } }

.animate-fade-in { opacity: 0; animation: fadeIn 0.5s ease-out forwards; }
@keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }

@keyframes pop { 0% { transform: scale(1); } 50% { transform: scale(1.05); } 100% { transform: scale(1); } }
@keyframes fadeInFeedback { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0px); } }
@keyframes popFeedback { 0% { transform: scale(0.9) translateY(5px); } 70% { transform: scale(1.05) translateY(0px); } 100% { transform: scale(1) translateY(0px); } }

/* Styles for Matching and Drag&Drop (basic placeholders) */
.matching-prompts .p-3 { margin-bottom: 0.5rem; }
.matching-targets .option-button { margin-bottom: 0.5rem; }
.drag-items-container .p-3 { background-color: hsl(var(--muted)); }
.drop-targets-container .p-6 { background-color: hsl(var(--background)); }
\`;


export const pageTemplates: PageTemplate[] = [
  {
    id: DEFAULT_TEMPLATE_ID,
    name: 'Blank Canvas',
    description: 'A clean slate with basic structure. Highly customizable for any question type.',
    htmlContent: defaultHtmlContent,
    cssContent: defaultCssContent,
    previewImageUrl: 'https://placehold.co/600x400.png',
    aiHint: 'blank canvas',
    tags: ['Minimal', 'Customizable'],
  },
  {
    id: 'tpl-text-mcq-sleek',
    name: 'Sleek Text MCQ',
    description: 'A modern, minimalist design for text-based multiple-choice questions.',
    htmlContent: \`
<div class="quiz-container sleek-text-mcq p-6 md:p-10 rounded-lg shadow-xl bg-card text-card-foreground max-w-xl mx-auto my-8 border border-border">
  <h1 data-quiz-title class="text-2xl md:text-3xl font-bold mb-8 text-primary text-center">Sleek Quiz Title</h1>
  <div id="quiz-content-host">
    <div data-quiz-question-id="q_template_id" class="question-block mb-8 p-5 bg-background/50 border border-border rounded-md" style="display: none;">
      <h2 data-quiz-question-text="q_template_id" class="text-lg md:text-xl font-semibold mb-5 text-foreground"></h2>
      <div data-quiz-options-for-question="q_template_id" class="options-grid grid grid-cols-1 gap-3">
        <button data-quiz-answer-option="q_template_id.opt_template_id" 
                class="option-button w-full text-left p-3.5 border border-input rounded-md text-foreground
                       hover:bg-secondary hover:border-primary 
                       focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1 focus:ring-offset-background
                       transition-colors duration-150 ease-in-out">
        </button>
      </div>
      <div data-quiz-feedback="q_template_id" class="feedback-message mt-5 text-center font-medium" style="display: none; min-height: 24px;"></div>
    </div>
  </div>
  <script id="quiz-data" type="application/json"></script>
  <div id="quiz-end-message-text" style="display:none;"></div>
</div>
    \`,
    cssContent: \`
    \${defaultCssContent}
    .sleek-text-mcq .option-button { letter-spacing: 0.5px; }
    .sleek-text-mcq .question-block { box-shadow: 0 2px 8px rgba(0,0,0,0.05); }
    \`,
    previewImageUrl: 'https://placehold.co/600x400.png',
    aiHint: 'minimalist modern',
    tags: ['Text MCQ', 'Minimalist'],
  },
  {
    id: 'tpl-image-grid-mcq',
    name: 'Visual Image Grid MCQ',
    description: 'Showcases image options in a responsive grid. Ideal for visual quizzes.',
    htmlContent: \`
<div class="quiz-container image-grid-mcq p-5 md:p-8 rounded-lg shadow-2xl bg-gradient-to-br from-primary/5 via-background to-background text-card-foreground max-w-3xl mx-auto my-8">
  <h1 data-quiz-title class="text-3xl font-bold mb-8 text-primary text-center">Image Quiz</h1>
  <div id="quiz-content-host">
    <div data-quiz-question-id="q_template_id" class="question-block mb-10 p-6 bg-card/80 border border-border rounded-lg shadow-lg" style="display: none;">
      <h2 data-quiz-question-text="q_template_id" class="text-xl font-semibold mb-6 text-center text-foreground"></h2>
      <div data-quiz-options-for-question="q_template_id" class="options-grid grid grid-cols-2 md:grid-cols-2 gap-4">
        <button data-quiz-answer-option="q_template_id.opt_template_id" 
                class="option-button image-option w-full p-2 border border-input rounded-md text-foreground
                       hover:border-primary hover:shadow-lg 
                       focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background
                       transition-all duration-200 ease-in-out flex flex-col items-center justify-center">
           <!-- Image and text will be injected here -->
        </button>
      </div>
      <div data-quiz-feedback="q_template_id" class="feedback-message mt-6 text-center font-medium" style="display: none; min-height: 28px;"></div>
    </div>
  </div>
  <script id="quiz-data" type="application/json"></script>
  <div id="quiz-end-message-text" style="display:none;"></div>
</div>
    \`,
    cssContent: \`
    \${defaultCssContent}
    .image-grid-mcq .option-button.image-option { 
        min-height: 150px; /* Ensure space for image + text */
        background-color: hsl(var(--background));
    }
    .image-grid-mcq .option-button.image-option img { max-height: 120px; object-fit: contain; margin-bottom: 0.5rem; border-radius: 0.25rem; }
    .image-grid-mcq .option-button.image-option p { font-size: 0.875rem; color: hsl(var(--muted-foreground)); }
    .image-grid-mcq .option-button.selected { border-width: 2px; }
    \`,
    previewImageUrl: 'https://placehold.co/600x400.png',
    aiHint: 'image gallery quiz',
    tags: ['Image MCQ', 'Grid', 'Visual'],
  },
  {
    id: 'tpl-matching-interactive',
    name: 'Interactive Matching Zone',
    description: 'A clear layout for text-to-text matching questions.',
     htmlContent: \`
<div class="quiz-container matching-zone p-8 rounded-xl shadow-lg bg-card text-card-foreground max-w-2xl mx-auto my-10">
  <h1 data-quiz-title class="text-3xl font-bold mb-8 text-primary text-center">Matching Challenge</h1>
  <div id="quiz-content-host">
    <div data-quiz-question-id="q_template_id" class="question-block mb-10 p-6 bg-background/70 border border-border rounded-lg" style="display: none;">
      <h2 data-quiz-question-text="q_template_id" class="text-xl font-semibold mb-6 text-foreground"></h2>
      <div data-quiz-options-for-question="q_template_id" class="matching-area">
        <!-- Matching prompts and targets will be injected by script -->
      </div>
      <div data-quiz-feedback="q_template_id" class="feedback-message mt-6 text-center font-medium" style="display: none; min-height: 28px;"></div>
    </div>
  </div>
  <script id="quiz-data" type="application/json"></script>
  <div id="quiz-end-message-text" style="display:none;"></div>
</div>
    \`,
    cssContent: \`
    \${defaultCssContent}
    .matching-zone .matching-area { display: flex; flex-direction: column; gap: 1rem; }
    .matching-zone .matching-prompts .p-3 { background-color: hsl(var(--secondary)); }
    .matching-zone .matching-targets .option-button { border-style: dashed; }
    .matching-zone .option-button:hover { border-style: solid; }
    \`,
    previewImageUrl: 'https://placehold.co/600x400.png',
    aiHint: 'matching pairs',
    tags: ['Matching', 'Interactive'],
  },
   {
    id: 'tpl-drag-drop-dynamic',
    name: 'Dynamic Drag & Drop Arena',
    description: 'Designed for engaging drag and drop interactions.',
    htmlContent: \`
<div class="quiz-container drag-drop-arena p-8 rounded-lg shadow-xl bg-gradient-to-b from-background to-secondary/30 text-card-foreground max-w-3xl mx-auto my-10">
  <h1 data-quiz-title class="text-3xl font-bold mb-10 text-primary text-center">Drag & Drop Challenge</h1>
  <div id="quiz-content-host">
    <div data-quiz-question-id="q_template_id" class="question-block mb-12 p-6 bg-card border-2 border-primary/20 rounded-lg shadow-inner" style="display: none;">
      <h2 data-quiz-question-text="q_template_id" class="text-xl font-semibold mb-8 text-center text-foreground"></h2>
      <div data-quiz-options-for-question="q_template_id" class="drag-drop-area">
        <!-- Draggable items and drop targets will be injected by script -->
      </div>
      <div data-quiz-feedback="q_template_id" class="feedback-message mt-8 text-center font-medium text-lg" style="display: none; min-height: 32px;"></div>
    </div>
  </div>
  <script id="quiz-data" type="application/json"></script>
  <div id="quiz-end-message-text" style="display:none;"></div>
</div>
    \`,
    cssContent: \`
    \${defaultCssContent}
    .drag-drop-arena .drag-items-container { 
        display: flex; flex-wrap: wrap; gap: 0.75rem; justify-content: center; 
        padding: 1rem; margin-bottom: 1.5rem; border: 1px solid hsl(var(--border)); border-radius: var(--radius); 
        background-color: hsl(var(--muted)/50);
    }
    .drag-drop-arena .drag-items-container .p-3 { 
        background-color: hsl(var(--primary)); color: hsl(var(--primary-foreground));
        box-shadow: 0 2px 4px rgba(0,0,0,0.1); cursor: grab;
    }
    .drag-drop-arena .drop-targets-container { 
        display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 1rem;
    }
    .drag-drop-arena .drop-targets-container .p-6 { 
        border-color: hsl(var(--primary)); min-height: 80px;
        display: flex; align-items: center; justify-content: center;
    }
    \`,
    previewImageUrl: 'https://placehold.co/600x400.png',
    aiHint: 'drag drop ui',
    tags: ['Drag & Drop', 'Interactive', 'Dynamic'],
  },
];
