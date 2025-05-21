
export interface QuestionOption {
  id: string;
  text: string;
  isCorrect: boolean; 
}

export type QuestionType = 'multiple-choice' | 'drag-and-drop' | 'text-input';

export interface Question {
  id: string;
  type: QuestionType;
  text: string;
  options: QuestionOption[];
  // For drag-and-drop, might need `targets` or similar
  // For text-input, `correctAnswer` might be a string or regex
}

export interface Test {
  id: string;
  name: string;
  htmlContent: string;
  cssContent: string;
  questions: Question[];
  quizEndMessage: string; // Added for customizable end message
  templateId?: string; 
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
  // Potentially add 'status' (Draft, Published), 'imageUrl', 'aiHint' if these were part of mock data consistently
}

export interface Template {
  id:string;
  name: string;
  description?: string;
  htmlContent: string;
  cssContent: string;
  previewImageUrl?: string; // For display on template selection pages
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
  // Potentially add 'tags', 'aiHint' if these were part of mock data consistently
}
