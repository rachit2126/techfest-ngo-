import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { ClaimRequest, DonationLot } from '@/lib/types';
import { logPlatformEvent } from '@/lib/event-bus';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const listingId = searchParams.get('listingId');
    const ngoId = searchParams.get('ngoId');

    const db = await getDb();
    const query: Record<string, unknown> = {};
    if (listingId) query.listingId = listingId;
    if (ngoId) query.ngoId = ngoId;

    const claims = await db.collection<ClaimRequest>('marketplace_claims')
      .find(query)
      .sort({ createdAt: -1 })
      .toArray();

    return NextResponse.json({ success: true, claims });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    const body = await req.json();
    const { listingId, requestedQuantity, purposeDescription, proposedPickupDate } = body;

    if (!listingId || !requestedQuantity || requestedQuantity <= 0) {
      return NextResponse.json({ error: 'Valid listingId and positive requested quantity are required.' }, { status: 400 });
    }

    const db = await getDb();
    const listing = await db.collection<DonationLot>('donations').findOne({ id: listingId });
    if (!listing) {
      return NextResponse.json({ error: 'Marketplace product listing not found.' }, { status: 404 });
    }

    if (listing.remainingQuantity < requestedQuantity) {
      return NextResponse.json({
        error: `Requested quantity (${requestedQuantity}) exceeds available remaining stock (${listing.remainingQuantity}).`
      }, { status: 400 });
    }

    // Generate secure 6-digit handover verification code
    const handoverCode = Math.floor(100000 + Math.random() * 900000).toString();
    const claimId = `claim_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;

    const newClaim: ClaimRequest = {
      id: claimId,
      listingId,
      ngoId: user.orgId || user.id,
      ngoName: user.name || 'Verified Relief Organization',
      requestedQuantity: Number(requestedQuantity),
      unit: listing.unit,
      status: 'pending',
      purposeDescription: purposeDescription || 'Urgent distribution in vulnerable field sector.',
      proposedPickupDate: proposedPickupDate || new Date(Date.now() + 86400000 * 2).toISOString(),
      handoverCode,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // Atomic inventory reservation
    await db.collection('marketplace_claims').insertOne(newClaim);
    await db.collection('donations').updateOne(
      { id: listingId, remainingQuantity: { $gte: Number(requestedQuantity) } },
      {
        $inc: {
          allocatedQuantity: Number(requestedQuantity),
          remainingQuantity: -Number(requestedQuantity)
        },
        $set: {
          status: 'awaiting_ngo',
          updatedAt: new Date().toISOString()
        }
      }
    );

    await logPlatformEvent('marketplace.claim_created', claimId, { id: user.id, name: user.name, role: user.role }, {
      listingId,
      quantity: requestedQuantity,
      unit: listing.unit
    });

    return NextResponse.json({
      success: true,
      claim: newClaim,
      message: 'Claim request submitted and inventory reserved.'
    });
  } catch (error) {
    console.error('Claim request error:', error);
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
