import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { DonationLot, NGORequest, Organisation, ScoringWeights } from '@/lib/types';
import { checkHardGates, computeMatchScore, generatePlainExplanation, calculateDistanceKm } from '@/lib/scoring';
import { INITIAL_SCORING_WEIGHTS } from '@/lib/seed-data';

export async function handleMatchPreview(donationId: string) {
  const db = await getDb();
  let donation: DonationLot | null = await db.collection<DonationLot>('donations').findOne({ id: donationId });
  if (!donation) {
    // Check seed donations fallback
    const { SEED_DONATIONS } = await import('@/lib/seed-data');
    donation = (SEED_DONATIONS.find(d => d.id === donationId) as DonationLot) || null;
  }
  if (!donation) {
    return { error: 'Donation lot not found', status: 404 };
  }

  // Fetch scoring weights
  const config = await db.collection<ScoringWeights>('scoring_config').findOne({});
  const weights = config || INITIAL_SCORING_WEIGHTS;

  // Fetch active needs and all verified NGOs
  const requests = await db.collection<NGORequest>('ngo_needs').find({ status: 'open' }).toArray();
  const orgs = await db.collection<Organisation>('organisations').find({}).toArray();
  const orgMap = new Map(orgs.map(o => [o.id, o]));

  const eligibleCandidates = [];
  const excludedCandidates = [];

  for (const request of requests) {
    const ngo = orgMap.get(request.orgId);
    if (!ngo) continue;

    const gateCheck = checkHardGates(donation, request, ngo);

    const distanceKm = calculateDistanceKm(
      donation.location?.coordinates?.[0] || 28.6139,
      donation.location?.coordinates?.[1] || 77.2090,
      request.serviceArea?.coordinates?.[0] || 28.6139,
      request.serviceArea?.coordinates?.[1] || 77.2090
    );

    if (!gateCheck.passed) {
      excludedCandidates.push({
        requestId: request.id,
        ngoId: ngo.id,
        ngoName: ngo.legalName,
        ngoImageUrl: ngo.publicProfile?.imageUrl || 'https://images.unsplash.com/photo-1593113598332-cd288d649433?w=300&auto=format&fit=crop&q=80',
        category: request.category,
        serviceArea: request.serviceArea,
        distanceKm,
        requestedQuantity: request.quantityRequested,
        unit: request.unit,
        urgency: request.urgency,
        reasons: gateCheck.reasons
      });
      continue;
    }

    // Compute deterministic 6-factor score
    const { totalScore, factorBreakdown } = computeMatchScore(
      donation,
      request,
      ngo,
      weights
    );

    const explanation = generatePlainExplanation(
      donation,
      request,
      ngo,
      totalScore,
      factorBreakdown,
      distanceKm
    );

    // Calculate category match percentage (e.g. 98% for direct blanket-blanket match, 78% for general relief)
    const isDirectItemMatch = donation.itemName.toLowerCase().includes('blanket') && 
      (request.itemSpecification.toLowerCase().includes('blanket') || request.category === 'clothing_blankets');
    const categoryMatchPct = isDirectItemMatch ? 98 : (donation.category === request.category ? 85 : 60);

    const isDisasterResponse = Boolean(request.emergencyEventId || request.urgency === 'critical');

    eligibleCandidates.push({
      id: `match_${donation.id}_${request.id}`,
      donationId: donation.id,
      requestId: request.id,
      ngoId: ngo.id,
      ngoName: ngo.legalName,
      ngoVerificationStatus: ngo.verificationStatus,
      ngoImageUrl: ngo.publicProfile?.imageUrl || (ngo.id.includes('seeds') 
        ? 'https://images.unsplash.com/photo-1593113598332-cd288d649433?w=300&auto=format&fit=crop&q=80'
        : 'https://images.unsplash.com/photo-1544816155-12df9643f363?w=300&auto=format&fit=crop&q=80'),
      website: ngo.publicProfile?.website,
      serviceArea: request.serviceArea,
      totalScore,
      categoryMatchPct,
      isDisasterResponse,
      factorBreakdown,
      distanceKm,
      requestedQuantity: request.quantityRequested,
      remainingNeeded: request.quantityRequested - request.quantityFulfilled,
      unit: request.unit,
      urgency: request.urgency,
      neededBy: request.neededBy,
      itemSpecification: request.itemSpecification,
      capacitySummary: ngo.capacitySummary,
      explanation,
      ruleVersion: weights.version
    });
  }

  // Rank candidates by total score descending
  eligibleCandidates.sort((a, b) => b.totalScore - a.totalScore);

  return {
    success: true,
    donation,
    weights,
    eligibleCandidates,
    excludedCandidates
  };
}

export async function POST(req: Request) {
  try {
    const { donationId } = await req.json();
    if (!donationId) {
      return NextResponse.json({ error: 'donationId is required' }, { status: 400 });
    }

    const result = await handleMatchPreview(donationId);
    if ('error' in result) {
      return NextResponse.json({ error: result.error }, { status: result.status || 500 });
    }
    return NextResponse.json(result);
  } catch (error) {
    console.error('Match preview error:', error);
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const donationId = searchParams.get('donationId');
    if (!donationId) {
      return NextResponse.json({ error: 'donationId is required' }, { status: 400 });
    }

    const result = await handleMatchPreview(donationId);
    if ('error' in result) {
      return NextResponse.json({ error: result.error }, { status: result.status || 500 });
    }
    return NextResponse.json(result);
  } catch (error) {
    console.error('Match preview GET error:', error);
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
