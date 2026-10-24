import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { DonationLot, DeliveryTimelineEvent } from '@/lib/types';

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const db = await getDb();

    const donation = await db.collection<DonationLot>('donations').findOne({ id });
    if (!donation) {
      return NextResponse.json({ error: 'Donation not found' }, { status: 404 });
    }

    const timeline = await db.collection<DeliveryTimelineEvent>('timeline_events')
      .find({ donationId: id })
      .sort({ timestamp: 1 })
      .toArray();

    return NextResponse.json({ donation, timeline });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
