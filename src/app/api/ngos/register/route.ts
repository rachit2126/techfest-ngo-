import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { Organisation } from '@/lib/types';
import { logPlatformEvent } from '@/lib/event-bus';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      legalName,
      registrationNumber,
      categoryList,
      description,
      contactEmail,
      contactPhone,
      city,
      state,
      coordinates,
      capacitySummary,
      documentNames
    } = body;

    if (!legalName || !contactEmail || !city || !state) {
      return NextResponse.json(
        { error: 'Legal name, contact email, city and state are required.' },
        { status: 400 }
      );
    }

    const orgId = `ngo_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;

    const newNGO: Organisation = {
      id: orgId,
      type: 'ngo',
      legalName,
      registrationNumber: registrationNumber || 'APPLIED/PENDING',
      publicProfile: {
        description: description || 'Humanitarian community organization',
        contactEmail,
        contactPhone
      },
      serviceArea: {
        city,
        state,
        radiusKm: 75,
        coordinates: coordinates || [28.6139, 77.2090],
        approximateLocationText: `${city} Central Operations Hub`
      },
      supportedCategories: categoryList && categoryList.length > 0 ? categoryList : ['clothing_blankets'],
      capacitySummary: capacitySummary || 'Dedicated sorting facility and transport vehicles',
      verificationStatus: 'in_review',
      sourceProvenance: {
        directoryName: 'Self-Registered Verification Intake',
        recordId: registrationNumber || orgId,
        lastCheckedDate: new Date().toISOString(),
        verifiedMethod: 'Awaiting Document & 80G Inspection'
      },
      documents: (documentNames || ['Registration_Certificate.pdf']).map((name: string, i: number) => ({
        id: `doc_${orgId}_${i}`,
        name,
        type: 'Statutory Registration Certificate',
        uploadedAt: new Date().toISOString(),
        status: 'pending' as const
      })),
      activeNeedsCount: 0,
      createdAt: new Date().toISOString()
    };

    const db = await getDb();
    await db.collection('organisations').insertOne(newNGO);

    // Audit log
    await db.collection('audit_logs').insertOne({
      id: `audit_reg_${orgId}`,
      actor: { id: orgId, name: legalName, role: 'ngo_staff' },
      action: 'NGO_REGISTRATION_SUBMITTED',
      entityType: 'ngo',
      entityId: orgId,
      beforeSummary: 'Unregistered',
      afterSummary: 'status: in_review, documents uploaded: ' + newNGO.documents?.length,
      reason: 'New NGO verification application submitted',
      timestamp: new Date().toISOString()
    });

    await logPlatformEvent('ngo.registered', orgId, { id: orgId, name: legalName, role: 'ngo_staff' }, {
      legalName,
      city,
      status: 'in_review'
    });

    return NextResponse.json({
      success: true,
      ngo: newNGO
    });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
