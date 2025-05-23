// src/app/api/tests/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { testService } from '@/services/testService';
// Removed: import type { TestUpdateData } from '@/services/testService';
import { getUidFromRequest } from '@/lib/authUtils'; // Placeholder
import { testUpdateSchema, TestUpdateSchemaType } from '@/lib/schemas'; // Import Zod schema

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const userId = await getUidFromRequest(req); 
  if (!userId) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }
  try {
    const test = await testService.getById(params.id, userId); 
    if (!test) {
      return NextResponse.json({ message: 'Test not found or access denied' }, { status: 404 });
    }
    return NextResponse.json(test);
  } catch (error: any) {
    console.error(`[API TESTS ID GET ${params.id}]`, error);
    return NextResponse.json({ message: 'Failed to fetch test', error: error.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const userId = await getUidFromRequest(req); 
  if (!userId) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }
  try {
    const rawData = await req.json();
    const validation = testUpdateSchema.safeParse(rawData);

    if (!validation.success) {
      return NextResponse.json({ message: 'Validation failed', errors: validation.error.flatten().fieldErrors }, { status: 400 });
    }

    const validatedData = validation.data as TestUpdateSchemaType;
    
    // Note: testService.update expects userId for authorization, not as part of validatedData payload
    const updatedTest = await testService.update(params.id, validatedData, userId); 
    
    // testService.update already throws if test not found or user not authorized.
    // So, if it returns, it's successful.
    return NextResponse.json(updatedTest);
  } catch (error: any) {
    console.error(`[API TESTS ID PUT ${params.id}]`, error);
    if (error.message.includes("not found or user not authorized")) {
        return NextResponse.json({ message: error.message }, { status: 403 }); 
    }
    if (error.message.includes("Questions must be a valid JSON object or array")) {
        return NextResponse.json({ message: 'Validation failed', errors: { questions: [error.message] } }, { status: 400 });
    }
    return NextResponse.json({ message: 'Failed to update test', error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const userId = await getUidFromRequest(req); 
  if (!userId) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }
  try {
    await testService.delete(params.id, userId); // Service delete now throws specific errors
    return NextResponse.json({ message: 'Test deleted successfully' });
  } catch (error: any) {
    console.error(`[API TESTS ID DELETE ${params.id}]`, error);
    // Handle specific error messages from service
    if (error.message.includes("not found or user not authorized")) {
        return NextResponse.json({ message: error.message }, { status: 403 }); // Or 404
    }
    return NextResponse.json({ message: 'Failed to delete test', error: error.message }, { status: 500 });
  }
}
