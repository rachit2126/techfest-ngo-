import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { reserveAllocation } from '@/lib/state-machine';
import { logPlatformEvent } from '@/lib/event-bus';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const donationId = searchParams.get('donationId');
    const ngoId = searchParams.get('ngoId');

    const db = await getDb();
    const query: Record<string, unknown> = {};
    if (donationId) query.donationId = donationId;
    if (ngoId) query.ngoId = ngoId;

    const allocations = await db.collection('allocations').find(query).sort({ createdAt: -1 }).toArray();
    return NextResponse.json({ allocations });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    const { donationId, requestId, quantity } = await req.json();

    if (!donationId || !requestId || !quantity) {
      return NextResponse.json(
        { error: 'donationId, requestId, and quantity are required.' },
        { status: 400 }
      );
    }

    // Reserve stock atomically
    const result = await reserveAllocation(
      donationId,
      requestId,
      Number(quantity),
      { id: user.id, name: user.name, role: user.role }
    );

    await logPlatformEvent('allocation.created', result.allocation.id, { id: user.id, name: user.name, role: user.role }, {
      donationId,
      requestId,
      quantity
    });

    return NextResponse.json({
      success: true,
      allocation: result.allocation,
      donation: result.donation
    });
  } catch (error) {
    console.error('Allocation error:', error);
    return NextResponse.json({ error: (error as Error).message }, { status: 400 });
  }
}
