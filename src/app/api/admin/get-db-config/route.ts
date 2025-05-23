import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
// Placeholder for admin verification, similar to the POST route
const prisma = new PrismaClient();

const verifyAdmin = async (req: NextRequest): Promise<boolean> => {
  console.warn("SECURITY WARNING: Admin check in /api/admin/get-db-config is a placeholder.");
  // In a real app:
  // 1. Get the Firebase ID token from the Authorization header.
  // 2. Verify the token using Firebase Admin SDK.
  // 3. Check if the decoded token has an 'admin' custom claim or if UID matches a known admin UID.
  return true; 
};

export async function GET(req: NextRequest) {
  const isAdmin = await verifyAdmin(req);
  if (!isAdmin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  try {
    const settings = await prisma.adminSetting.findMany();
    const config = settings.reduce((acc, setting) => {
      acc[setting.key] = setting.value;
      return acc;
    }, {} as Record<string, string>);
    
    // Ensure default values are provided if not in DB,
    // especially for a fresh setup.
    if (!config.active_database_type) {
        config.active_database_type = 'sqlite'; // Default to sqlite
    }
    if (config.active_database_type === 'sqlite' && !config.sqlite_path) {
        config.sqlite_path = 'file:./dev.db'; // Default SQLite path
    }
    
    return NextResponse.json(config, { status: 200 });
  } catch (error: any) {
    console.error('Error fetching DB configuration:', error);
    return NextResponse.json({ error: 'Failed to fetch configuration: ' + error.message }, { status: 500 });
  }
}
