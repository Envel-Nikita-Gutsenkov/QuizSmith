// src/services/testService.ts
import { prisma } from '@/lib/prisma';
import type { Test, Prisma as PrismaTypes } from '@prisma/client'; // Prisma.JsonObject might be useful for 'questions'

// Define types for create and update operations.
// 'questions' is expected as Prisma.JsonValue (which can be string, number, boolean, null, array, or object)
export type TestCreateData = Omit<Test, 'id' | 'createdAt' | 'updatedAt'>;
export type TestUpdateData = Partial<Omit<Test, 'id' | 'createdAt' | 'updatedAt' | 'userId'>>; // userId should not be updatable directly

export const testService = {
  async create(data: TestCreateData): Promise<Test> {
    if (!data.name || !data.userId || !data.templateId) {
      throw new Error('Test name, userId, and templateId are required.');
    }
    // Ensure 'questions' is a valid JSON type for Prisma (object or array usually)
    if (typeof data.questions !== 'object' && !Array.isArray(data.questions) && data.questions !== null) {
        // Or if you expect a string that is valid JSON: JSON.parse(data.questions)
        // For now, assume data.questions is already a Prisma.JsonValue (e.g. an object from the form)
        throw new Error('Questions must be a valid JSON object or array.');
    }

    return prisma.test.create({ 
      data,
      include: { template: true } // Include related template info
    });
  },

  async getAll(userId?: string): Promise<Test[]> {
    return prisma.test.findMany({
      where: userId ? { userId } : undefined,
      orderBy: { createdAt: 'desc' },
      include: { template: true }, // Include related template for context
    });
  },
  
  async getByUserId(userId: string): Promise<Test[]> {
    if(!userId) return [];
    return prisma.test.findMany({
        where: { userId },
        orderBy: { updatedAt: 'desc' },
        include: { template: { select: { id: true, name: true, previewImageUrl: true } } } // Select specific template fields
    });
  },

  async getById(id: string, userId?: string): Promise<Test | null> {
    if (!id) return null;
    const test = await prisma.test.findUnique({
      where: { id },
      include: { template: true },
    });

    // Optional: Check if the test belongs to the user if userId is provided
    if (userId && test && test.userId !== userId) {
      // Or throw an error, or return null based on desired behavior
      console.warn(`User ${userId} attempted to access test ${id} owned by ${test.userId}`);
      return null; 
    }
    return test;
  },

  async update(id: string, data: TestUpdateData, userId: string): Promise<Test | null> {
    // First, verify the test belongs to the user trying to update it
    const existingTest = await prisma.test.findUnique({ where: { id } });
    if (!existingTest || existingTest.userId !== userId) {
      throw new Error('Test not found or user not authorized to update this test.');
    }
    if (data.questions && (typeof data.questions !== 'object' && !Array.isArray(data.questions) && data.questions !== null)) {
         throw new Error('Questions must be a valid JSON object or array if provided.');
    }


    return prisma.test.update({
      where: { id },
      data,
      include: { template: true },
    });
  },

  async delete(id: string, userId: string): Promise<Test | null> {
    // Verify the test belongs to the user trying to delete it
    const existingTest = await prisma.test.findUnique({ where: { id } });
    if (!existingTest || existingTest.userId !== userId) {
      throw new Error('Test not found or user not authorized to delete this test.');
    }

    return prisma.test.delete({
      where: { id },
    });
  },
};
