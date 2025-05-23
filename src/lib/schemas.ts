// src/lib/schemas.ts
import { z } from 'zod';

// Schema for PageTemplate Creation
export const pageTemplateCreateSchema = z.object({
  name: z.string().min(1, "Template name is required.").max(100),
  description: z.string().max(500).optional(),
  htmlContent: z.string().min(1, "HTML content is required."),
  cssContent: z.string().optional(),
  previewImageUrl: z.string().url("Invalid URL format for preview image.").optional().or(z.literal('')),
  tags: z.string().optional(), // Assuming comma-separated string, further validation if array needed
  aiHint: z.string().max(500).optional(),
  userId: z.string().min(1, "User ID is required."), // Assuming Firebase UID
});
export type PageTemplateCreateSchemaType = z.infer<typeof pageTemplateCreateSchema>;

// Schema for PageTemplate Update (all fields optional, but ID comes from URL param)
export const pageTemplateUpdateSchema = pageTemplateCreateSchema.partial().omit({ userId: true }); // userId typically not updatable
export type PageTemplateUpdateSchemaType = z.infer<typeof pageTemplateUpdateSchema>;


// Schema for Test Creation
// For questions (JSON), defining a precise Zod schema can be complex if structure is highly variable.
// z.any() or z.record(z.any()) or z.array(z.record(z.any())) can be used for basic JSON validation.
// For more type safety, define schemas for your specific question types if possible.
const questionOptionSchema = z.object({
  id: z.string(),
  text: z.string(),
  isCorrect: z.boolean().optional(),
  imageUrl: z.string().url().optional().or(z.literal('')),
});

const matchPairSchema = z.object({
  id: z.string(),
  prompt: z.string(),
  target: z.string(),
});

const draggableItemSchema = z.object({
  id: z.string(),
  text: z.string(),
  correctCategoryId: z.string().optional(),
});

const dropTargetSchema = z.object({
  id: z.string(),
  text: z.string(),
  expectedDragItemId: z.string().optional().nullable(),
});

const categoryBinSchema = z.object({
  id: z.string(),
  name: z.string(),
});

const connectPairSchema = z.object({
  id: z.string(),
  leftItem: z.string(),
  rightItem: z.string(),
});

export const questionSchema = z.object({ 
  id: z.string(),
  type: z.enum(['multiple-choice-text', 'multiple-choice-image', 'matching-text-text', 'drag-and-drop-text-text', 'categorization-drag-and-drop', 'connect-points-matching']),
  text: z.string().min(1, "Question text cannot be empty."),
  allowMultipleAnswers: z.boolean().optional(),
  options: z.array(questionOptionSchema).optional(),
  matchPairs: z.array(matchPairSchema).optional(),
  dragItems: z.array(draggableItemSchema).optional(),
  dropTargets: z.array(dropTargetSchema).optional(),
  categories: z.array(categoryBinSchema).optional(),
  connectPairs: z.array(connectPairSchema).optional(),
});
export type QuestionSchemaType = z.infer<typeof questionSchema>;


export const testCreateSchema = z.object({
  name: z.string().min(1, "Test name is required.").max(150),
  questions: z.array(questionSchema), 
  quizEndMessage: z.string().max(1000).optional().or(z.literal('')),
  userId: z.string().min(1, "User ID is required."),
  templateId: z.string().min(1, "Template ID is required."),
});
export type TestCreateSchemaType = z.infer<typeof testCreateSchema>;

// Schema for Test Update
export const testUpdateSchema = testCreateSchema.partial().omit({ userId: true, templateId: true }); // userId and templateId not updatable
export type TestUpdateSchemaType = z.infer<typeof testUpdateSchema>;
