// src/app/api/tests/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { testService } from '@/services/testService';
// Removed: import type { TestCreateData } from '@/services/testService';
import { getUidFromRequest } from '@/lib/authUtils'; // Placeholder for a utility to get UID
import { testCreateSchema, TestCreateSchemaType } from '@/lib/schemas'; // Import Zod schema

export async function GET(req: NextRequest) {
  // This route should ideally get the logged-in user's ID securely
  const userId = await getUidFromRequest(req); // This needs to be secure
  if (!userId) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }
  try {
    // Assuming testService.getByUserId can handle fetching tests for this user
    const tests = await testService.getByUserId(userId);
    return NextResponse.json(tests);
  } catch (error: any) {
    console.error('[API TESTS GET]', error);
    return NextResponse.json({ message: 'Failed to fetch tests', error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const rawData = await req.json();
    const validation = testCreateSchema.safeParse(rawData);

    if (!validation.success) {
      return NextResponse.json({ message: 'Validation failed', errors: validation.error.flatten().fieldErrors }, { status: 400 });
    }
    
    const validatedData = validation.data as TestCreateSchemaType;

    // Authorization: Ensure userId in validatedData matches the authenticated user.
    const authenticatedUserId = await getUidFromRequest(req);
    if (!authenticatedUserId || validatedData.userId !== authenticatedUserId) {
      // Log the discrepancy for security auditing if desired
      console.warn(`[API TESTS POST] Authorization failed: Auth User ID '${authenticatedUserId}' does not match User ID in request '${validatedData.userId}'.`);
      return NextResponse.json({ message: 'Unauthorized: User ID mismatch or authentication failed.' }, { status: 403 });
    }
    
    // The service's `create` method expects `TestCreateData` which is `Omit<Test, 'id' | 'createdAt' | 'updatedAt'>`.
    // `TestCreateSchemaType` (from Zod) should align with this if schemas are correctly defined.
    // Prisma's `JsonValue` for `questions` is compatible with Zod's `z.array(questionSchema)`.
    const newTest = await testService.create(validatedData);
    return NextResponse.json(newTest, { status: 201 });
  } catch (error: any) {
    console.error('[API TESTS POST]', error);
    // Handle specific errors from the service if they are thrown, e.g., validation within service
    if (error.message.includes("Test name, userId, and templateId are required")) {
        return NextResponse.json({ message: 'Validation failed', errors: { name: [error.message] } }, { status: 400 });
    }
    if (error.message.includes("Questions must be a valid JSON object or array")) {
        return NextResponse.json({ message: 'Validation failed', errors: { questions: [error.message] } }, { status: 400 });
    }
    return NextResponse.json({ message: 'Failed to create test', error: error.message }, { status: 500 });
  }
}
