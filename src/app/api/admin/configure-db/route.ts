import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
// import { auth as firebaseAdminAuth } from 'firebase-admin'; // If using Firebase Admin SDK for verification
// import { getAuth } from 'firebase/auth/web-auth-cached'; // Or client SDK if route is simple & trusts client claims
// For a real app, initialize Firebase Admin SDK in a central place.
// import admin from '@/lib/firebaseAdminConfig'; // Assuming you have this

const prisma = new PrismaClient();

// Placeholder for actual Firebase Admin SDK initialization and use
const verifyAdmin = async (req: NextRequest): Promise<boolean> => {
  // In a real app:
  // 1. Get the Firebase ID token from the Authorization header.
  // 2. Verify the token using Firebase Admin SDK (admin.auth().verifyIdToken(token)).
  // 3. Check if the decoded token has an 'admin' custom claim or if UID matches a known admin UID.
  // For this placeholder, we'll return true but log a warning.
  console.warn("SECURITY WARNING: Admin check in /api/admin/configure-db is a placeholder. Implement proper admin verification.");
  // const session = await getAuth(req.cookies as any); // Example if using next-firebase-auth like package
  // if (!session || session.claims.role !== 'admin') return false;
  return true; 
};

export async function POST(req: NextRequest) {
  const isAdmin = await verifyAdmin(req);
  if (!isAdmin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  try {
    const body = await req.json();
    const { dbType, sqlitePath, mysqlConfig } = body;

    // Validate input (basic example)
    if (!dbType || (dbType === 'sqlite' && !sqlitePath) || (dbType === 'mysql' && !mysqlConfig)) {
      return NextResponse.json({ error: 'Missing required configuration fields.' }, { status: 400 });
    }

    // Save to AdminSetting table
    await prisma.adminSetting.upsert({
      where: { key: 'active_database_type' },
      update: { value: dbType },
      create: { key: 'active_database_type', value: dbType },
    });

    if (dbType === 'sqlite') {
      await prisma.adminSetting.upsert({
        where: { key: 'sqlite_path' },
        update: { value: sqlitePath },
        create: { key: 'sqlite_path', value: sqlitePath },
      });
      // Remove MySQL settings if switching to SQLite
      await prisma.adminSetting.deleteMany({ where: { key: { startsWith: 'mysql_' } } });
    } else if (dbType === 'mysql') {
      const { host, port, user, dbName, password } = mysqlConfig; // Password received but not directly stored as is
      if (!host || !port || !user || !dbName ) {
         return NextResponse.json({ error: 'Missing MySQL configuration fields.' }, { status: 400 });
      }
      await prisma.adminSetting.upsert({ where: { key: 'mysql_host' }, update: { value: host }, create: { key: 'mysql_host', value: host }});
      await prisma.adminSetting.upsert({ where: { key: 'mysql_port' }, update: { value: String(port) }, create: { key: 'mysql_port', value: String(port) }});
      await prisma.adminSetting.upsert({ where: { key: 'mysql_user' }, update: { value: user }, create: { key: 'mysql_user', value: user }});
      await prisma.adminSetting.upsert({ where: { key: 'mysql_dbname' }, update: { value: dbName }, create: { key: 'mysql_dbname', value: dbName }});
      // For password:
       await prisma.adminSetting.upsert({ 
        where: { key: 'mysql_password_status' }, 
        update: { value: password ? 'Password provided by admin; ensure DATABASE_URL env var is set securely.' : 'Password not provided; ensure DATABASE_URL env var is set securely.' }, 
        create: { key: 'mysql_password_status', value: password ? 'Password provided by admin; ensure DATABASE_URL env var is set securely.' : 'Password not provided; ensure DATABASE_URL env var is set securely.' }
      });
      // Remove SQLite settings if switching to MySQL
      await prisma.adminSetting.deleteMany({ where: { key: 'sqlite_path' } });
    }

    return NextResponse.json({ 
      message: 'Configuration saved. Restart application with updated DATABASE_URL environment variable if changed.',
      details: 'Database configuration preference has been recorded. For these settings to take effect, ensure your DATABASE_URL environment variable is correctly set up and restart the application server. Direct modification of .env file is not performed by this action for security reasons.'
    }, { status: 200 });

  } catch (error: any) {
    console.error('Error saving DB configuration:', error);
    return NextResponse.json({ error: 'Failed to save configuration: ' + error.message }, { status: 500 });
  }
}
