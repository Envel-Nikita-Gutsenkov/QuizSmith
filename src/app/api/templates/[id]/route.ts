// src/app/api/templates/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { templateService } from '@/services/templateService';
// Removed: import type { PageTemplateUpdateData } from '@/services/templateService';
import { pageTemplateUpdateSchema, PageTemplateUpdateSchemaType } from '@/lib/schemas'; // Import Zod schema

// Placeholder for admin check
async function verifyIsAdmin(req: NextRequest): Promise<boolean> {
    // In a real app:
    // 1. Get the Firebase ID token from the Authorization header.
    // 2. Verify the token using Firebase Admin SDK.
    // 3. Check if the decoded token has an 'admin' custom claim or if UID matches a known admin UID.
    console.warn("SECURITY WARNING: Admin check in /api/templates/[id] PUT/DELETE is a placeholder.");
    return true; // Assume admin for now
}

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const template = await templateService.getById(params.id);
    if (!template) {
      return NextResponse.json({ message: 'Template not found' }, { status: 404 });
    }
    // If tags are stored as string and need to be array for client:
    // const templateWithTagsArray = templateService._transformRawTagsToArray(template);
    // return NextResponse.json(templateWithTagsArray);
    return NextResponse.json(template);
  } catch (error: any) {
    console.error(`[API TEMPLATES ID GET ${params.id}]`, error);
    return NextResponse.json({ message: 'Failed to fetch template', error: error.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const isAdmin = await verifyIsAdmin(req);
  if (!isAdmin) {
    return NextResponse.json({ message: 'Unauthorized. Admin access required.' }, { status: 403 });
  }
  try {
    const rawData = await req.json();
    const validation = pageTemplateUpdateSchema.safeParse(rawData);

    if (!validation.success) {
      return NextResponse.json({ message: 'Validation failed', errors: validation.error.flatten().fieldErrors }, { status: 400 });
    }
    
    // The schema expects `tags` as `z.string().optional()`.
    // The service `update` method from `templateService` takes `PageTemplateUpdateData`.
    // `PageTemplateUpdateData` is `Partial<Omit<PageTemplate, 'id' | 'createdAt' | 'updatedAt'>>`.
    // `PageTemplate` (Prisma model) has `tags String?`. So service expects `tags: string | null | undefined`.
    // Zod's `optional()` makes it `string | undefined`. This is compatible.
    // If the client sends tags as an array, it should be converted to string *before* Zod validation
    // or the Zod schema for `tags` should be `z.array(z.string()).optional().transform(val => val?.join(','))`
    // For simplicity, assuming client sends tags as string or undefined, matching current Zod schema.
    const validatedData = validation.data as PageTemplateUpdateSchemaType;

    const updatedTemplate = await templateService.update(params.id, validatedData);
    if (!updatedTemplate) {
      // This might occur if templateService.update returns null for "not found"
      return NextResponse.json({ message: 'Template not found or update failed' }, { status: 404 });
    }
    return NextResponse.json(updatedTemplate);
  } catch (error: any) {
    console.error(`[API TEMPLATES ID PUT ${params.id}]`, error);
    // Handle specific service errors if necessary
    if (error.message.includes("Cannot delete this template because it is currently used by one or more tests")) { // Example if update had similar constraints
        return NextResponse.json({ message: error.message, error: error.message }, { status: 409 }); // Conflict
    }
    return NextResponse.json({ message: 'Failed to update template', error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const isAdmin = await verifyIsAdmin(req);
  if (!isAdmin) {
    return NextResponse.json({ message: 'Unauthorized. Admin access required.' }, { status: 403 });
  }
  try {
    const deletedTemplate = await templateService.delete(params.id);
    // templateService.delete throws error if not found or if in use, so this check might not be strictly necessary
    // if all error cases are thrown. If it can return null for "not found" (and not throw), then this is fine.
    // The current service.delete throws for "in use" and Prisma default is to throw for "not found" on delete.
    // So, a successful call means it was deleted.
    if (!deletedTemplate) { 
        // This case would only be hit if service.delete returns null on "not found" instead of throwing.
        return NextResponse.json({ message: 'Template not found' }, { status: 404 });
    }
    return NextResponse.json({ message: 'Template deleted successfully' });
  } catch (error: any) {
    console.error(`[API TEMPLATES ID DELETE ${params.id}]`, error);
    // Handle specific error from service for "template in use"
    if (error.message.includes('currently used by one or more tests')) {
         return NextResponse.json({ message: error.message, error: error.message }, { status: 409 }); // Conflict
    }
    return NextResponse.json({ message: 'Failed to delete template', error: error.message }, { status: 500 });
  }
}
