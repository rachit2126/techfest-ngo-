import {
  DonationLot,
  NGORequest,
  Organisation,
  MatchRecommendation,
  ScoringWeights,
  MatchFactorBreakdown
} from './types';

// Haversine formula to compute distance in KM
export function calculateDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Radius of the Earth in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c);
}

// 1. Deterministic Hard Gate Checks
export function checkHardGates(
  donation: DonationLot,
  request: NGORequest,
  ngo: Organisation
): { passed: boolean; reasons: string[] } {
  const reasons: string[] = [];

  // NGO verification gate
  if (ngo.verificationStatus !== 'verified') {
    reasons.push(`NGO ${ngo.legalName} is not yet fully verified (current status: ${ngo.verificationStatus})`);
  }

  // Category fit
  if (donation.category !== request.category) {
    reasons.push(`Category mismatch: donation is '${donation.category}' but request needs '${request.category}'`);
  }

  // Expiry date safety gate for food
  if (donation.category === 'packaged_food' && donation.expiryDate) {
    const expiry = new Date(donation.expiryDate).getTime();
    const now = Date.now();
    const diffHours = (expiry - now) / (1000 * 60 * 60);

    if (diffHours <= 0) {
      reasons.push('Food item is past its best-before/expiry date');
    } else if (diffHours < 48) {
      reasons.push('Food item expiry buffer is less than 48 hours; unsafe for logistics window');
    }
  }

  // Condition gate
  if (donation.condition === 'fair') {
    // Condition fair flagged for relief supplies
    reasons.push('Condition marked fair: disaster and hygiene relief standards require good or new condition');
  }

  // Stock availability
  if (donation.remainingQuantity <= 0) {
    reasons.push('Donation lot has no remaining unallocated inventory');
  }

  if (request.status === 'fulfilled' || request.status === 'expired') {
    reasons.push(`NGO request is already ${request.status}`);
  }

  return {
    passed: reasons.length === 0,
    reasons
  };
}

// 2. Deterministic 6-Factor Weighted Scoring
export function computeMatchScore(
  donation: DonationLot,
  request: NGORequest,
  ngo: Organisation,
  weights: ScoringWeights
): { totalScore: number; factorBreakdown: MatchFactorBreakdown; distanceKm: number } {
  const distanceKm = calculateDistanceKm(
    donation.location.coordinates[0],
    donation.location.coordinates[1],
    request.serviceArea.coordinates[0],
    request.serviceArea.coordinates[1]
  );

  // NeedFit (0 - 100)
  let needFit = 90;
  const itemKeywords = donation.itemName.toLowerCase().split(/\s+/);
  const specKeywords = request.itemSpecification.toLowerCase();
  const matchedWords = itemKeywords.filter(w => w.length > 3 && specKeywords.includes(w));
  if (matchedWords.length > 0) needFit = 100;
  else if (donation.category === request.category) needFit = 85;

  // Urgency (0 - 100)
  let urgencyScore = 50;
  switch (request.urgency) {
    case 'critical':
      urgencyScore = 100;
      break;
    case 'high':
      urgencyScore = 80;
      break;
    case 'medium':
      urgencyScore = 55;
      break;
    case 'routine':
      urgencyScore = 30;
      break;
  }

  // DeliveryFit / Distance (0 - 100)
  let deliveryFit = 100;
  if (distanceKm <= 25) deliveryFit = 100;
  else if (distanceKm <= 75) deliveryFit = 85;
  else if (distanceKm <= 150) deliveryFit = 70;
  else if (distanceKm <= 300) deliveryFit = 50;
  else if (distanceKm <= 600) deliveryFit = 30;
  else deliveryFit = 15;

  // TimeFit (0 - 100)
  let timeFit = 80;
  const neededByTime = new Date(request.neededBy).getTime();
  const now = Date.now();
  const daysLeft = (neededByTime - now) / (1000 * 60 * 60 * 24);
  if (daysLeft < 3 && daysLeft >= 0) timeFit = 100;
  else if (daysLeft < 7) timeFit = 90;
  else if (daysLeft < 14) timeFit = 75;
  else if (daysLeft < 30) timeFit = 60;
  else timeFit = 40;

  // QuantityFit (0 - 100)
  const remainingNeeded = request.quantityRequested - request.quantityFulfilled;
  const ratio = Math.min(donation.remainingQuantity / Math.max(remainingNeeded, 1), 1.0);
  const quantityFit = Math.round(ratio * 100);

  // Freshness & Verification Confidence (0 - 100)
  let freshnessConfidence = 90;
  const lastConfirmed = new Date(request.lastConfirmedAt).getTime();
  const daysSinceConfirmed = (now - lastConfirmed) / (1000 * 60 * 60 * 24);
  if (daysSinceConfirmed > 14) freshnessConfidence = 50;
  else if (daysSinceConfirmed > 7) freshnessConfidence = 70;
  else freshnessConfidence = 100;

  // Compute final weighted sum
  const weightedTotal =
    needFit * weights.needFit +
    urgencyScore * weights.urgency +
    deliveryFit * weights.deliveryFit +
    timeFit * weights.timeFit +
    quantityFit * weights.quantityFit +
    freshnessConfidence * weights.freshnessConfidence;

  return {
    totalScore: Math.min(100, Math.max(0, Math.round(weightedTotal))),
    factorBreakdown: {
      needFit,
      urgency: urgencyScore,
      deliveryFit,
      timeFit,
      quantityFit,
      freshnessConfidence
    },
    distanceKm
  };
}

// 3. Grounded Explanation tied only to factual feature values
export function generatePlainExplanation(
  donation: DonationLot,
  request: NGORequest,
  ngo: Organisation,
  score: number,
  factors: MatchFactorBreakdown,
  distanceKm: number
): string {
  const points: string[] = [];

  points.push(
    `Verified NGO: ${ngo.legalName} has an active, confirmed need for ${request.quantityRequested} ${request.unit} of ${request.category.replace('_', ' ')}.`
  );

  if (distanceKm < 50) {
    points.push(`Proximity: Located within ~${distanceKm} km in ${request.serviceArea.city}, enabling rapid same-day logistics.`);
  } else {
    points.push(`Logistics: Distance is ~${distanceKm} km (${request.serviceArea.city}), within authorized inter-city corridor.`);
  }

  if (request.urgency === 'critical' || request.urgency === 'high') {
    points.push(`Priority: Request urgency is flagged as '${request.urgency.toUpperCase()}' with deadline ${new Date(request.neededBy).toLocaleDateString()}.`);
  }

  points.push(
    `Capacity: Verified depot storage '${ngo.capacitySummary}' accommodates ${donation.remainingQuantity} ${donation.unit} without backlog.`
  );

  return points.join(' ');
}
