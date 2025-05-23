// src/services/templateService.ts
import { prisma } from '@/lib/prisma';
import type { PageTemplate, Prisma } from '@prisma/client';

export type PageTemplateCreateData = Omit<PageTemplate, 'id' | 'createdAt' | 'updatedAt'>;
// For update, all fields are optional except 'id' which is passed separately.
export type PageTemplateUpdateData = Partial<Omit<PageTemplate, 'id' | 'createdAt' | 'updatedAt'>>;

export const templateService = {
  async create(data: PageTemplateCreateData): Promise<PageTemplate> {
    // Basic validation example
    if (!data.name || !data.htmlContent) {
      throw new Error('Template name and HTML content are required.');
    }
    // Handle tags: If tags are stored as a string, ensure it's formatted correctly.
    // If schema was changed for 'tags String?' from 'String[]' for SQLite:
    // data.tags = data.tagsArray?.join(',') || ''; // Example if input data has tagsArray
    // The current schema has 'tags String?' which Prisma expects as a simple string.
    // If PageTemplateCreateData provides 'tags' as string[], it needs conversion before Prisma call.
    // For now, assume 'tags' in PageTemplateCreateData is already a string or null.
    // If it's meant to be an array from the form, it should be converted to string for Prisma.
    // Let's adjust PageTemplateCreateData to expect a string for tags for now, matching schema.
    
    // Assuming PageTemplateCreateData provides 'tags' as a string (e.g., "tag1,tag2")
    // matching the schema change for SQLite (tags String?)
    return prisma.pageTemplate.create({ data });
  },

  async getAll(): Promise<PageTemplate[]> {
    return prisma.pageTemplate.findMany({
      orderBy: { createdAt: 'desc' },
    });
  },

  async getById(id: string): Promise<PageTemplate | null> {
    if (!id) return null;
    return prisma.pageTemplate.findUnique({
      where: { id },
    });
  },

  async update(id: string, data: PageTemplateUpdateData): Promise<PageTemplate | null> {
    // Similar to create, handle 'tags' if it's an array in data and needs string conversion
    return prisma.pageTemplate.update({
      where: { id },
      data,
    });
  },

  async delete(id: string): Promise<PageTemplate | null> {
    // Add authorization checks here in a real app (e.g., only admin or owner)
    // Consider implications of onDelete: Restrict for related Tests.
    // Prisma will throw an error if trying to delete a template used by a Test.
    try {
        return prisma.pageTemplate.delete({
            where: { id },
        });
    } catch (error: any) {
        if (error instanceof Prisma.PrismaClientKnownRequestError) {
            // P2003 is foreign key constraint failure (e.g., template in use)
            if (error.code === 'P2003') { 
                throw new Error('Cannot delete this template because it is currently used by one or more tests.');
            }
        }
        throw error; // Re-throw other errors
    }
  },

  // Example: If tags are stored as comma-separated string and need to be an array in the app
  // This is just a helper if needed, Prisma itself won't do this conversion automatically for String field.
  _transformRawTagsToArray(template: PageTemplate): PageTemplate & { tagsArray?: string[] } {
    if (template.tags && typeof template.tags === 'string') {
      return { ...template, tagsArray: template.tags.split(',').map(t => t.trim()).filter(t => t) };
    }
    return template;
  }
};

// Adjusting PageTemplateCreateData and UpdateData based on schema (tags: String?)
// If the application logic/forms provide tags as an array, they must convert it to a string
// before calling create/update, or these service functions should handle it.
// For clarity, let's assume the service expects the data to match Prisma's expectations.
// So, if tags is String in schema, data.tags should be a string.
