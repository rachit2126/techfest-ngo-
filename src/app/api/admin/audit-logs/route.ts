import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { AuditLogEntry } from '@/lib/types';

export async function GET(req: Request) {
  try {
    const user = await getCurrentUser();
    if (user.role !== 'admin' && user.role !== 'analytics_viewer' && user.role !== 'ngo_reviewer') {
      return NextResponse.json({ error: 'Unauthorized: Privileged role required.' }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const entityType = searchParams.get('entityType');
    const q = searchParams.get('q');

    const db = await getDb();
    const query: Record<string, unknown> = {};

    if (entityType && entityType !== 'all') query.entityType = entityType;
    if (q) {
      query.$or = [
        { action: new RegExp(q, 'i') },
        { entityId: new RegExp(q, 'i') },
        { reason: new RegExp(q, 'i') },
        { 'actor.name': new RegExp(q, 'i') }
      ];
    }

    const logs = await db.collection<AuditLogEntry>('audit_logs')
      .find(query)
      .sort({ timestamp: -1 })
      .limit(50)
      .toArray();

    return NextResponse.json({ logs });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
