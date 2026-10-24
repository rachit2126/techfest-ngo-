import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { getDb } from '@/lib/db';
import { transitionDonationStatus } from '@/lib/state-machine';
import { DonationStatus } from '@/lib/types';
import { logPlatformEvent } from '@/lib/event-bus';

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: allocationOrDonationId } = await params;
    const user = await getCurrentUser();
    const body = await req.json();

    const {
      targetStatus,
      note,
      evidenceUrl,
      recipientConfirmation,
      reason
    } = body;

    if (!targetStatus) {
      return NextResponse.json({ error: 'targetStatus is required.' }, { status: 400 });
    }

    const db = await getDb();

    // Check if passed ID is donationId directly or allocationId
    let donationId = allocationOrDonationId;
    const allocation = await db.collection('allocations').findOne({ id: allocationOrDonationId });
    if (allocation) {
      donationId = allocation.donationId;
    }

    const result = await transitionDonationStatus(
      donationId,
      targetStatus as DonationStatus,
      { id: user.id, name: user.name, role: user.role },
      note || `Status transitioned to ${targetStatus}`,
      {
        evidenceUrl,
        recipientConfirmation,
        reason
      }
    );

    // If allocation exists, update its status too
    if (allocation) {
      await db.collection('allocations').updateOne(
        { id: allocation.id },
        { $set: { status: targetStatus, updatedAt: new Date().toISOString() } }
      );
    }

    await logPlatformEvent(`delivery.${targetStatus}`, donationId, { id: user.id, name: user.name, role: user.role }, {
      targetStatus,
      note,
      recipientConfirmation: recipientConfirmation ? true : false
    });

    return NextResponse.json({
      success: true,
      donationId,
      newStatus: result.newStatus,
      event: result.timelineEvent
    });
  } catch (error) {
    console.error('Delivery event error:', error);
    return NextResponse.json({ error: (error as Error).message }, { status: 400 });
  }
}
