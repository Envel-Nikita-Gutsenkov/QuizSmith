
export interface QuestionOption {
  id: string;
  text: string;
  isCorrect: boolean;
  imageUrl?: string; // For image-based options
}

export type QuestionType = 
  | 'multiple-choice-text' 
  | 'multiple-choice-image' 
  | 'matching-text-text' 
  | 'drag-and-drop-text-text';
  // Add more as needed, e.g., 'matching-image-text', 'drag-image-on-image'

export interface MatchPair {
  id: string;
  prompt: string; 
  target: string; 
  userAnsweredCorrectly?: boolean; // Optional: for UI feedback in template script
}

export interface DraggableItem {
  id: string;
  text: string; 
}

export interface DropTarget {
  id: string;
  text: string; // Label for the drop target
  expectedDragItemId?: string; // Which dragItem.id is correct for this target
  droppedItemId?: string | null; // Optional: for UI feedback / state in template script
}

export interface Question {
  id: string;
  type: QuestionType;
  text: string; // The main question prompt
  options: QuestionOption[]; // Used for MCQ types
  matchPairs?: MatchPair[]; // Used for 'matching-*' types
  dragItems?: DraggableItem[]; // Used for 'drag-and-drop-*' types
  dropTargets?: DropTarget[]; // Used for 'drag-and-drop-*' types
}

export interface Test {
  id: string;
  name: string;
  // htmlContent and cssContent are now part of the chosen PageTemplate
  questions: Question[];
  quizEndMessage: string; 
  templateId?: string; // ID of the PageTemplate used for this test
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
}

export interface PageTemplate {
  id: string;
  name: string;
  description?: string;
  htmlContent: string; // This HTML now includes the <script> tag with all quiz logic
  cssContent: string;
  previewImageUrl?: string; 
  aiHint?: string;
  tags?: string[];
  createdAt?: string; // ISO date string
  updatedAt?: string; // ISO date string
}
