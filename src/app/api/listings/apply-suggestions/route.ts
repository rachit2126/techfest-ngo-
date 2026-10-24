import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { StructuredListingDraft, DonationLot, AuditLogEntry } from '@/lib/types';

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    const body = await req.json().catch(() => ({}));
    const { draft, listingId } = body as { draft: StructuredListingDraft; listingId?: string };

    if (!draft || !draft.title) {
      return NextResponse.json(
        { error: 'Valid listing draft with title is required.' },
        { status: 400 }
      );
    }

    const db = await getDb();
    const id = listingId || `draft_ai_${Date.now()}`;

    const donationDoc: Partial<DonationLot> = {
      id,
      donorId: user?.id || 'guest_donor',
      donorType: draft.listingType === 'business_surplus' ? 'business' : 'individual',
      donorName: user?.name || 'Anonymous Donor',
      category: (draft.category as any) || 'clothing_blankets',
      itemName: draft.title,
      quantity: Number(draft.quantity) || 1,
      remainingQuantity: Number(draft.quantity) || 1,
      unit: (draft.unit as 'units' | 'kg' | 'boxes' | 'meals' | 'kits' | 'liters') || 'units',
      condition: draft.condition === 'Brand New' ? 'new' : 'good',
      description: draft.description,
      status: 'draft',
      location: {
        city: draft.city || 'Delhi',
        state: draft.state || 'Delhi',
        coordinates: [28.6139, 77.2090],
        approximateText: draft.approximateLocationText || `${draft.city || 'Delhi'} Central Hub`
      },
      photos: draft.images || [],
      price: draft.listingType === 'affordable_sale' ? {
        amount: Number(draft.totalPrice) || (Number(draft.pricePerUnit || 850) * Number(draft.quantity || 1)),
        unitPrice: Number(draft.pricePerUnit) || 850,
        currency: draft.currency || 'INR',
        negotiable: true
      } : undefined,
      aiDraftMetadata: {
        usedAi: true,
        detectedCategory: draft.category,
        confidenceScore: draft.confidenceScore || 0.95
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    await db.collection('donations').updateOne(
      { id },
      { $set: donationDoc },
      { upsert: true }
    );

    const auditLog: AuditLogEntry = {
      id: `audit_${Date.now()}`,
      actor: {
        id: user?.id || 'guest_donor',
        name: user?.name || 'Anonymous Donor',
        role: user?.role || 'donor'
      },
      action: 'ai_draft_applied',
      entityType: 'donation',
      entityId: id,
      afterSummary: `Applied AI draft for ${draft.title} (${draft.quantity} ${draft.unit})`,
      timestamp: new Date().toISOString()
    };
    await db.collection('audit_logs').insertOne(auditLog);

    return NextResponse.json({
      success: true,
      message: 'AI suggestions successfully applied to listing form and saved to draft ledger.',
      listingId: id,
      draft: donationDoc
    });
  } catch (error) {
    console.error('Apply Suggestions Error:', error);
    return NextResponse.json(
      { error: (error as Error).message || 'Failed to apply AI suggestions to listing' },
      { status: 500 }
    );
  }
}
