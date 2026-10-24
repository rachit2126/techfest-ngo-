import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { Organisation } from '@/lib/types';

function calculateDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const q = searchParams.get('q')?.trim() || '';
    const category = searchParams.get('category')?.trim();
    const country = searchParams.get('country')?.trim();
    const state = searchParams.get('state')?.trim();
    const city = searchParams.get('city')?.trim();
    const verificationStatus = searchParams.get('status')?.trim();
    const verifiedOnly = searchParams.get('verifiedOnly') === 'true';
    const emergencyOnly = searchParams.get('emergencyOnly') === 'true';
    const donationOpportunities = searchParams.get('donationOpportunities') === 'true';
    const sort = searchParams.get('sort') || 'relevance';

    // Optional user coordinates & search radius for distance calculation
    const userLat = searchParams.get('lat') ? parseFloat(searchParams.get('lat')!) : null;
    const userLng = searchParams.get('lng') ? parseFloat(searchParams.get('lng')!) : null;
    const radiusKm = searchParams.get('radius') ? parseFloat(searchParams.get('radius')!) : null;

    const db = await getDb();
    const query: Record<string, unknown> = {};

    if (verifiedOnly) {
      query.verificationStatus = 'verified';
    } else if (verificationStatus && verificationStatus !== 'all') {
      query.verificationStatus = verificationStatus;
    }

    if (country && country !== 'all') {
      query.$or = [
        { 'serviceArea.country': new RegExp(country, 'i') },
        // Fallback matching if country isn't explicitly set (defaulting to India for national registry)
        ...(country.toLowerCase() === 'india' ? [{ 'serviceArea.country': { $exists: false } }] : [])
      ];
    }

    if (state && state !== 'all') {
      query['serviceArea.state'] = new RegExp(state, 'i');
    }

    if (city && city !== 'all') {
      query['serviceArea.city'] = new RegExp(city, 'i');
    }

    if (donationOpportunities) {
      query.activeNeedsCount = { $gt: 0 };
    }

    if (emergencyOnly) {
      query.$or = [
        { supportedCategories: { $in: ['disaster_relief', 'medical_first_aid'] } },
        { 'capacitySummary': new RegExp('disaster|emergency|flood|rescue', 'i') }
      ];
    }

    if (category && category !== 'all') {
      // Map category labels to DB schema values
      const catMap: Record<string, string[]> = {
        food: ['packaged_food'],
        packaged_food: ['packaged_food'],
        clothing: ['clothing_blankets'],
        clothing_blankets: ['clothing_blankets'],
        hygiene: ['hygiene_kits'],
        hygiene_kits: ['hygiene_kits'],
        medical: ['medical_first_aid'],
        medical_first_aid: ['medical_first_aid'],
        healthcare: ['medical_first_aid'],
        disaster_relief: ['disaster_relief', 'clothing_blankets', 'medical_first_aid'],
        clean_water: ['hygiene_kits', 'clean_water'],
        shelter_housing: ['clothing_blankets', 'shelter_housing'],
        child_welfare: ['clothing_blankets', 'packaged_food'],
        environment: ['clean_water', 'environment']
      };

      const mapped = catMap[category] || [category];
      query.supportedCategories = { $in: mapped };
    }

    if (q) {
      const regex = new RegExp(q, 'i');
      query.$or = [
        { legalName: regex },
        { 'serviceArea.city': regex },
        { 'serviceArea.state': regex },
        { 'serviceArea.country': regex },
        { 'serviceArea.approximateLocationText': regex },
        { 'publicProfile.description': regex },
        { supportedCategories: regex }
      ];
    }

    const orgs = await db.collection<Organisation>('organisations').find(query).toArray();

    // Map to public-safe profiles & compute distance if user coordinates provided
    let safeProfiles = orgs.map(org => {
      let distanceKm: number | null = null;
      if (
        userLat !== null &&
        userLng !== null &&
        !isNaN(userLat) &&
        !isNaN(userLng) &&
        org.serviceArea.coordinates &&
        org.serviceArea.coordinates.length === 2
      ) {
        distanceKm = calculateDistanceKm(
          userLat,
          userLng,
          org.serviceArea.coordinates[0],
          org.serviceArea.coordinates[1]
        );
      }

      return {
        id: org.id,
        legalName: org.legalName,
        type: org.type,
        serviceArea: {
          country: org.serviceArea.country || 'India',
          state: org.serviceArea.state,
          city: org.serviceArea.city,
          district: org.serviceArea.district,
          coordinates: org.serviceArea.coordinates,
          approximateLocationText: org.serviceArea.approximateLocationText,
          radiusKm: org.serviceArea.radiusKm
        },
        publicProfile: org.publicProfile,
        supportedCategories: org.supportedCategories,
        capacitySummary: org.capacitySummary,
        verificationStatus: org.verificationStatus,
        verificationDate: org.verificationDate,
        verificationExpiry: org.verificationExpiry,
        verifiedBy: org.verifiedBy,
        sourceProvenance: org.sourceProvenance,
        activeNeedsCount: org.activeNeedsCount || 0,
        distanceKm
      };
    });

    // Filter by radius if user requested a radius and provided coordinates
    if (radiusKm && userLat !== null && userLng !== null) {
      safeProfiles = safeProfiles.filter(
        org => org.distanceKm !== null && org.distanceKm <= radiusKm
      );
    }

    // Sort results
    if (sort === 'distance' && userLat !== null) {
      safeProfiles.sort((a, b) => {
        if (a.distanceKm === null) return 1;
        if (b.distanceKm === null) return -1;
        return a.distanceKm - b.distanceKm;
      });
    } else if (sort === 'needs') {
      safeProfiles.sort((a, b) => (b.activeNeedsCount || 0) - (a.activeNeedsCount || 0));
    } else if (sort === 'verified') {
      safeProfiles.sort((a, b) => {
        if (a.verificationStatus === 'verified' && b.verificationStatus !== 'verified') return -1;
        if (a.verificationStatus !== 'verified' && b.verificationStatus === 'verified') return 1;
        return 0;
      });
    }

    return NextResponse.json({
      total: safeProfiles.length,
      organisations: safeProfiles
    });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
