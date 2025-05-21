
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
  prompt: string; // Text or imageU RL
  target: string; // Text or image URL
}

export interface DraggableItem {
  id: string;
  text: string; // Or imageUrl
}

export interface DropTarget {
  id: string;
  text: string; // Or imageUrl, or could be an area
  correctDragItemId?: string; // For validation if needed
}

export interface Question {
  id: string;
  type: QuestionType;
  text: string; // The main question prompt
  options: QuestionOption[]; // Used for MCQ types
  matchPairs?: MatchPair[]; // Used for 'matching-*' types
  dragItems?: DraggableItem[]; // Used for 'drag-and-drop-*' types
  dropTargets?: DropTarget[]; // Used for 'drag-and-drop-*' types
  // For drag-and-drop, might need `targets` or similar
  // For text-input, `correctAnswer` might be a string or regex
}

export interface Test {
  id: string;
  name: string;
  htmlContent: string; // This is the Page Template HTML
  cssContent: string;  // This is the Page Template CSS
  questions: Question[];
  quizEndMessage: string; 
  templateId?: string; 
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
}

export interface PageTemplate {
  id: string;
  name: string;
  description?: string;
  htmlContent: string;
  cssContent: string;
  previewImageUrl?: string; 
  aiHint?: string;
  tags?: string[];
  createdAt?: string; // ISO date string
  updatedAt?: string; // ISO date string
}
