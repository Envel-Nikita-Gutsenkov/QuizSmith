
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
  | 'drag-and-drop-text-text'
  | 'categorization-drag-and-drop' // New type
  | 'connect-points-matching';   // New type

export interface MatchPair {
  id: string;
  prompt: string; 
  target: string; 
  answered?: boolean; 
  matchedCorrectly?: boolean;
  originalPromptElement?: HTMLElement | null;
  originalTargetElement?: HTMLElement | null;
}

export interface DraggableItem {
  id: string;
  text: string; 
  correctCategoryId?: string; // Used for categorization type
}

export interface DropTarget { // Used for drag-and-drop-text-text
  id: string;
  text: string; 
  expectedDragItemId?: string | null; 
  droppedItemId?: string | null; 
}

export interface CategoryBin { // Used for categorization-drag-and-drop
  id: string;
  name: string;
}

export interface ConnectPair { // Used for connect-points-matching
  id: string;
  leftItem: string;
  rightItem: string;
}

export interface Question {
  id: string;
  type: QuestionType;
  text: string; 
  allowMultipleAnswers?: boolean; // For MCQs
  options: QuestionOption[]; 
  matchPairs?: MatchPair[]; 
  dragItems?: DraggableItem[]; 
  dropTargets?: DropTarget[]; // For 'drag-and-drop-text-text'
  categories?: CategoryBin[]; // For 'categorization-drag-and-drop'
  connectPairs?: ConnectPair[]; // For 'connect-points-matching'
}

export interface PageTemplate { // Renamed from Template to PageTemplate for clarity
  id: string;
  name: string;
  description?: string;
  htmlContent: string; 
  cssContent: string;
  previewImageUrl?: string; 
  aiHint?: string;
  tags?: string[];
  createdAt?: string; 
  updatedAt?: string; 
  userId?: string; // Optional: associate with a user/creator
}

export interface Test {
  id: string;
  name: string;
  questions: Question[]; 
  templateId: string; 
  quizEndMessage: string; 
  createdAt: string; 
  updatedAt: string; 
}
