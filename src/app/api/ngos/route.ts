import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { Organisation } from '@/lib/types';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');
    const category = searchParams.get('category');
    const state = searchParams.get('state');

    const db = await getDb();
    const query: Record<string, unknown> = {};

    if (status && status !== 'all') query.verificationStatus = status;
    if (category && category !== 'all') query.supportedCategories = category;
    if (state && state !== 'all') query['serviceArea.state'] = state;

    const ngos = await db.collection<Organisation>('organisations')
      .find(query)
      .sort({ createdAt: -1 })
      .toArray();

    return NextResponse.json({ ngos });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
