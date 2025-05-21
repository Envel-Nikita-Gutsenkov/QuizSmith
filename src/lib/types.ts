
export interface QuestionOption {
  id: string;
  text: string;
  isCorrect: boolean; // Changed from optional to required
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
  templateId?: string; // Optional: if created from a template
  createdAt: string;
  updatedAt: string;
}

export interface Template {
  id:string;
  name: string;
  description?: string;
  htmlContent: string;
  cssContent: string;
  // Placeholders might be defined here or inferred from HTML
  // e.g., placeholderCount: number;
  previewImageUrl?: string;
  createdAt: string;
  updatedAt: string;
}
