import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { DonationLot } from '@/lib/types';
import { logPlatformEvent } from '@/lib/event-bus';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category');
    const status = searchParams.get('status');
    const donorType = searchParams.get('donorType');

    const db = await getDb();
    const query: Record<string, unknown> = {};

    if (category && category !== 'all') query.category = category;
    if (status && status !== 'all') query.status = status;
    if (donorType && donorType !== 'all') query.donorType = donorType;

    const donations = await db.collection<DonationLot>('donations')
      .find(query)
      .sort({ createdAt: -1 })
      .toArray();

    return NextResponse.json({ donations });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    const body = await req.json();

    const {
      itemName,
      category,
      quantity,
      unit,
      condition,
      location,
      expiryDate,
      storageRequirements,
      availabilityWindow,
      foodSafetyAcknowledged
    } = body;

    // Hard eligibility checks
    const reasons: string[] = [];
    const supportedCategories = ['packaged_food', 'clothing_blankets', 'hygiene_kits', 'medical_first_aid'];

    if (!supportedCategories.includes(category)) {
      reasons.push(`Category '${category}' requires manual administrator review.`);
    }

    if (!itemName || !quantity || quantity <= 0) {
      reasons.push('A valid item name and positive quantity are required.');
    }

    let expiryBufferSafe = true;
    if (category === 'packaged_food') {
      if (!expiryDate) {
        reasons.push('Expiry or best-before date is mandatory for food safety.');
        expiryBufferSafe = false;
      } else {
        const exp = new Date(expiryDate).getTime();
        const diffHours = (exp - Date.now()) / (1000 * 60 * 60);
        if (diffHours < 48) {
          reasons.push('Food item expiry buffer is less than 48 hours; unsafe for relief logistics.');
          expiryBufferSafe = false;
        }
      }
    }

    if (condition === 'fair') {
      reasons.push('Relief items must be in good or new condition.');
    }

    const passed = reasons.length === 0;

    const donationId = `don_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const newDonation: DonationLot = {
      id: donationId,
      donorId: user.id,
      donorType: user.role === 'business_donor' ? 'business' : 'individual',
      donorName: user.name,
      donorOrgName: user.orgId ? 'Grand Horizon Hospitality' : undefined,
      category,
      itemName,
      quantity: Number(quantity),
      unit: unit || 'units',
      condition: condition || 'new',
      expiryDate,
      storageRequirements,
      availabilityWindow: availabilityWindow || 'Standard Business Hours',
      marketplaceType: body.marketplaceType || 'free_donation',
      price: body.price || undefined,
      subcategory: body.subcategory || undefined,
      brand: body.brand || undefined,
      dimensions: body.dimensions || undefined,
      weight: body.weight || undefined,
      photos: body.photos || (body.imageUrl ? [body.imageUrl] : []),
      evidenceFiles: body.evidenceFiles || [],
      aiDraftMetadata: body.aiDraftMetadata || undefined,
      location: {
        city: location?.city || 'New Delhi',
        state: location?.state || 'Delhi',
        coordinates: location?.coordinates || [28.6139, 77.2090],
        approximateText: location?.approximateText || `${location?.city || 'Delhi'} Central Area`,
        privateAddress: location?.privateAddress || 'Private address retained for authorized pickup only'
      },
      status: passed ? 'eligible' : 'submitted',
      allocatedQuantity: 0,
      remainingQuantity: Number(quantity),
      eligibilityChecks: {
        passed,
        reasons: passed ? ['All category, condition and expiry safety criteria satisfied'] : reasons,
        expiryBufferSafe,
        categorySupported: supportedCategories.includes(category),
        foodSafetyAcknowledged: Boolean(foodSafetyAcknowledged)
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const db = await getDb();
    await db.collection('donations').insertOne(newDonation);

    // Initial timeline event
    await db.collection('timeline_events').insertOne({
      id: `evt_create_${donationId}`,
      donationId,
      status: newDonation.status,
      actor: { id: user.id, name: user.name, role: user.role },
      timestamp: new Date().toISOString(),
      note: passed
        ? `Donation validated: ${newDonation.quantity} ${newDonation.unit} of ${newDonation.itemName} eligible for smart matching.`
        : `Donation submitted: Requires review due to: ${reasons.join('; ')}`
    });

    await logPlatformEvent('donation.created', donationId, { id: user.id, name: user.name, role: user.role }, {
      category,
      quantity,
      status: newDonation.status
    });

    return NextResponse.json({
      success: true,
      donation: newDonation
    });
  } catch (error) {
    console.error('Create donation error:', error);
    return NextResponse.json({ error: (error as Error).message }, { status: 400 });
  }
}
