import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { Organisation, NGORequest } from '@/lib/types';

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const db = await getDb();

    const org = await db.collection<Organisation>('organisations').findOne({
      $or: [{ id }, { legalName: new RegExp(`^${id}$`, 'i') }]
    });

    if (!org) {
      return NextResponse.json({ error: 'Organisation not found' }, { status: 404 });
    }

    // Fetch active needs for this NGO
    const needs = await db.collection<NGORequest>('ngo_needs')
      .find({ orgId: org.id })
      .toArray();

    // Public safe view
    const publicDoc = {
      id: org.id,
      legalName: org.legalName,
      type: org.type,
      registrationNumber: org.registrationNumber,
      publicProfile: org.publicProfile,
      serviceArea: {
        country: org.serviceArea.country || 'India',
        state: org.serviceArea.state,
        city: org.serviceArea.city,
        district: org.serviceArea.district,
        radiusKm: org.serviceArea.radiusKm,
        coordinates: org.serviceArea.coordinates,
        approximateLocationText: org.serviceArea.approximateLocationText
      },
      supportedCategories: org.supportedCategories,
      capacitySummary: org.capacitySummary,
      verificationStatus: org.verificationStatus,
      verificationDate: org.verificationDate,
      verificationExpiry: org.verificationExpiry,
      verifiedBy: org.verifiedBy,
      sourceProvenance: org.sourceProvenance,
      documents: org.documents?.map(doc => ({
        id: doc.id,
        name: doc.name,
        type: doc.type,
        status: doc.status,
        uploadedAt: doc.uploadedAt
      })) || [],
      needs: needs.map(n => ({
        id: n.id,
        category: n.category,
        itemSpecification: n.itemSpecification,
        quantityRequested: n.quantityRequested,
        quantityFulfilled: n.quantityFulfilled,
        unit: n.unit,
        urgency: n.urgency,
        neededBy: n.neededBy,
        status: n.status
      })),
      createdAt: org.createdAt
    };

    return NextResponse.json({ organisation: publicDoc });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
