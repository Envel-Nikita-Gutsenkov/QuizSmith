// src/app/api/templates/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { templateService } from '@/services/templateService';
// Removed: import type { PageTemplateCreateData } from '@/services/templateService';
// import { auth } from '@/lib/firebaseConfig'; // Not used directly here for validation
// import { getAuth } from 'firebase/auth/web-auth-cached'; // Not used directly here for validation
import { pageTemplateCreateSchema, PageTemplateCreateSchemaType } from '@/lib/schemas'; // Import Zod schema

// Placeholder for admin check - replace with actual admin verification logic
async function verifyIsAdmin(req: NextRequest): Promise<boolean> {
    // const session = await getAuth(req.headers.get('Authorization')); // Example, depends on how token is sent
    // if (!session || !session.token.admin) return false; // Check for admin custom claim
    console.warn("SECURITY WARNING: Admin check in /api/templates POST is a placeholder.");
    return true; // Assume admin for now for POST
}

export async function GET(req: NextRequest) {
  try {
    const templates = await templateService.getAll();
    // If tags are stored as string and need to be array for client:
    // const templatesWithTagsArray = templates.map(t => templateService._transformRawTagsToArray(t));
    // return NextResponse.json(templatesWithTagsArray);
    return NextResponse.json(templates);
  } catch (error: any) {
    console.error('[API TEMPLATES GET]', error);
    return NextResponse.json({ message: 'Failed to fetch templates', error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const isAdmin = await verifyIsAdmin(req);
  if (!isAdmin) {
    return NextResponse.json({ message: 'Unauthorized. Admin access required.' }, { status: 403 });
  }

  try {
    const rawData = await req.json();
    const validation = pageTemplateCreateSchema.safeParse(rawData);

    if (!validation.success) {
      return NextResponse.json({ message: 'Validation failed', errors: validation.error.flatten().fieldErrors }, { status: 400 });
    }
    
    // Type assertion needed because Zod schema expects `tags` as string,
    // but service's PageTemplateCreateData (derived from Prisma model) also expects string or null.
    // If the form sends tags as an array, it should be converted before validation or handled in service.
    // The schema expects `tags` as `z.string().optional()`.
    // The service `create` method from `templateService` takes `PageTemplateCreateData`.
    // `PageTemplateCreateData` is `Omit<PageTemplate, 'id' | 'createdAt' | 'updatedAt'>`.
    // `PageTemplate` (Prisma model) has `tags String?`. So service expects `tags: string | null | undefined`.
    // Zod's `optional()` makes it `string | undefined`. If `tags` is not provided, it's `undefined`.
    // This is compatible.

    const validatedData = validation.data as PageTemplateCreateSchemaType;

    const newTemplate = await templateService.create(validatedData);
    return NextResponse.json(newTemplate, { status: 201 });
  } catch (error: any) {
    console.error('[API TEMPLATES POST]', error);
    // Check for known errors, e.g., from the service validation
    if (error.message.includes("Template name and HTML content are required")) {
        return NextResponse.json({ message: 'Validation failed', errors: { name: [error.message] } }, { status: 400 });
    }
    return NextResponse.json({ message: 'Failed to create template', error: error.message }, { status: 500 });
  }
}
