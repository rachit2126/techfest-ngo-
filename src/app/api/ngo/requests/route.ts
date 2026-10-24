import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { NGORequest } from '@/lib/types';
import { logPlatformEvent } from '@/lib/event-bus';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const orgId = searchParams.get('orgId');
    const category = searchParams.get('category');
    const urgency = searchParams.get('urgency');

    const db = await getDb();
    const query: Record<string, unknown> = {};

    if (orgId) query.orgId = orgId;
    if (category && category !== 'all') query.category = category;
    if (urgency && urgency !== 'all') query.urgency = urgency;

    const requests = await db.collection<NGORequest>('ngo_needs')
      .find(query)
      .sort({ createdAt: -1 })
      .toArray();

    return NextResponse.json({ requests });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    const body = await req.json();

    const {
      itemSpecification,
      category,
      quantityRequested,
      unit,
      urgency,
      neededBy,
      serviceArea,
      storageCapabilities,
      emergencyEventId
    } = body;

    if (!itemSpecification || !quantityRequested || !neededBy) {
      return NextResponse.json(
        { error: 'Item specification, quantity, and deadline are required.' },
        { status: 400 }
      );
    }

    const orgId = user.orgId || 'ngo_goonj';
    const db = await getDb();
    const org = await db.collection('organisations').findOne({ id: orgId });

    const requestId = `need_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const newRequest: NGORequest = {
      id: requestId,
      orgId,
      orgName: org?.legalName || 'Verified NGO Hub',
      category: category || 'clothing_blankets',
      itemSpecification,
      quantityRequested: Number(quantityRequested),
      quantityFulfilled: 0,
      unit: unit || 'units',
      urgency: urgency || 'high',
      neededBy,
      serviceArea: {
        city: serviceArea?.city || org?.serviceArea?.city || 'New Delhi',
        state: serviceArea?.state || org?.serviceArea?.state || 'Delhi',
        coordinates: serviceArea?.coordinates || org?.serviceArea?.coordinates || [28.5355, 77.2610]
      },
      storageCapabilities: storageCapabilities || ['dry', 'sheltered'],
      status: 'open',
      lastConfirmedAt: new Date().toISOString(),
      emergencyEventId,
      createdAt: new Date().toISOString()
    };

    await db.collection('ngo_needs').insertOne(newRequest);

    // Update activeNeedsCount in organization
    await db.collection('organisations').updateOne(
      { id: orgId },
      { $inc: { activeNeedsCount: 1 } }
    );

    await logPlatformEvent('ngo.request_created', requestId, { id: user.id, name: user.name, role: user.role }, {
      itemSpecification,
      quantityRequested,
      urgency
    });

    return NextResponse.json({
      success: true,
      request: newRequest
    });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
