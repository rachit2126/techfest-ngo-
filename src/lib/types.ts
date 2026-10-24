export type UserRole =
  | 'donor'
  | 'business_donor'
  | 'ngo_staff'
  | 'admin'
  | 'ngo_reviewer'
  | 'emergency_coordinator'
  | 'analytics_viewer';

export interface User {
  _id?: any;
  id: string;
  name: string;
  email: string;
  role: UserRole;
  orgId?: string;
  phone?: string;
  status: 'active' | 'suspended';
  createdAt: string;
}

export type VerificationStatus =
  | 'unverified'
  | 'in_review'
  | 'verified'
  | 'rejected'
  | 'suspended'
  | 'reverification_required';

export interface Organisation {
  _id?: any;
  id: string;
  type: 'ngo' | 'business';
  legalName: string;
  registrationNumber?: string;
  publicProfile: {
    description: string;
    website?: string;
    contactEmail: string;
    contactPhone?: string;
    imageUrl?: string;
  };
  serviceArea: {
    country?: string;
    state: string;
    city: string;
    district?: string;
    radiusKm: number;
    coordinates: [number, number]; // [lat, lng]
    approximateLocationText: string;
  };
  supportedCategories: string[];
  capacitySummary: string;
  verificationStatus: VerificationStatus;
  verificationDate?: string;
  verificationExpiry?: string;
  verifiedBy?: string;
  sourceProvenance: {
    directoryName: string;
    recordId?: string;
    lastCheckedDate: string;
    verifiedMethod: string;
  };
  documents?: {
    id: string;
    name: string;
    type: string;
    uploadedAt: string;
    status: 'pending' | 'verified' | 'rejected';
  }[];
  activeNeedsCount?: number;
  createdAt: string;
}

export type DonationStatus =
  | 'draft'
  | 'submitted'
  | 'validating'
  | 'eligible'
  | 'match_proposed'
  | 'awaiting_ngo'
  | 'approved'
  | 'packed_ready'
  | 'picked_up'
  | 'in_transit'
  | 'delivered_pending'
  | 'delivered_confirmed'
  | 'cancelled'
  | 'disputed';

export interface DonationLot {
  _id?: any;
  id: string;
  donorId: string;
  donorType: 'individual' | 'business';
  donorName: string;
  donorOrgName?: string;
  category: 'packaged_food' | 'clothing_blankets' | 'hygiene_kits' | 'medical_first_aid' | 'other';
  itemName: string;
  quantity: number;
  unit: 'units' | 'kg' | 'boxes' | 'meals' | 'kits' | 'liters';
  condition: 'new' | 'like_new' | 'good' | 'fair';
  expiryDate?: string; // required for food
  storageRequirements?: 'dry' | 'refrigerated' | 'frozen' | 'ambient';
  batchLotCode?: string;
  availabilityWindow?: string;
  pickupWindowStart?: string;
  pickupWindowEnd?: string;
  location: {
    city: string;
    state: string;
    coordinates: [number, number]; // [lat, lng]
    approximateText: string;
    privateAddress?: string;
  };
  photos?: string[];
  status: DonationStatus;
  allocatedQuantity: number;
  remainingQuantity: number;
  // Marketplace & AI extensions
  marketplaceType?: 'free_donation' | 'affordable_sale' | 'business_surplus';
  price?: {
    amount: number;
    currency: string;
    unitPrice?: number;
    negotiable?: boolean;
  };
  description?: string;
  subcategory?: string;
  brand?: string;
  dimensions?: string;
  weight?: string;
  evidenceFiles?: {
    id: string;
    name: string;
    type: 'photo' | 'invoice' | 'declaration' | 'certificate';
    url: string;
    verified: boolean;
  }[];
  aiDraftMetadata?: {
    usedAi: boolean;
    detectedCategory?: string;
    confidenceScore?: number;
    suggestedTags?: string[];
    safetyFlags?: string[];
  };
  eligibilityChecks: {
    passed: boolean;
    reasons: string[];
    expiryBufferSafe: boolean;
    categorySupported: boolean;
    foodSafetyAcknowledged: boolean;
  };
  activeAllocationId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ClaimRequest {
  _id?: any;
  id: string;
  listingId: string;
  ngoId: string;
  ngoName: string;
  requestedQuantity: number;
  unit: string;
  status: 'pending' | 'accepted' | 'declined' | 'fulfilled' | 'cancelled';
  purposeDescription: string;
  proposedPickupDate?: string;
  handoverCode?: string;
  handoverConfirmedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface NGORequest {
  _id?: any;
  id: string;
  orgId: string;
  orgName: string;
  category: 'packaged_food' | 'clothing_blankets' | 'hygiene_kits' | 'medical_first_aid' | 'other';
  itemSpecification: string;
  quantityRequested: number;
  quantityFulfilled: number;
  unit: 'units' | 'kg' | 'boxes' | 'meals' | 'kits' | 'liters';
  urgency: 'critical' | 'high' | 'medium' | 'routine';
  neededBy: string;
  serviceArea: {
    city: string;
    state: string;
    coordinates: [number, number];
  };
  storageCapabilities: string[];
  status: 'open' | 'partially_fulfilled' | 'fulfilled' | 'expired';
  lastConfirmedAt: string;
  emergencyEventId?: string;
  createdAt: string;
}

export interface MatchFactorBreakdown {
  needFit: number;          // 0 - 100 (weight ~30%)
  urgency: number;          // 0 - 100 (weight ~20%)
  deliveryFit: number;      // 0 - 100 (weight ~15%)
  timeFit: number;          // 0 - 100 (weight ~15%)
  quantityFit: number;      // 0 - 100 (weight ~10%)
  freshnessConfidence: number; // 0 - 100 (weight ~10%)
}

export interface MatchRecommendation {
  _id?: any;
  id: string;
  donationId: string;
  requestId: string;
  ngoId: string;
  ngoName: string;
  totalScore: number; // 0 - 100
  featureScores: MatchFactorBreakdown;
  hardGateResults: {
    eligible: boolean;
    reasons: string[];
  };
  distanceKm: number;
  explanation: string;
  ruleVersion: string;
  status: 'proposed' | 'accepted' | 'declined' | 'expired';
  declineReason?: string;
  createdAt: string;
}

export interface Allocation {
  _id?: any;
  id: string;
  donationId: string;
  requestId: string;
  ngoId: string;
  ngoName: string;
  quantityAllocated: number;
  unit: string;
  status: DonationStatus;
  donorApprovedAt?: string;
  ngoAcceptedAt?: string;
  deliveryId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface DeliveryTimelineEvent {
  _id?: any;
  id: string;
  donationId: string;
  allocationId?: string;
  status: DonationStatus;
  actor: {
    id: string;
    name: string;
    role: string;
  };
  timestamp: string;
  note: string;
  evidenceUrl?: string;
  recipientConfirmation?: {
    confirmedBy: string;
    confirmedQuantity: number;
    conditionVerified: boolean;
    notes?: string;
  };
}

export interface EmergencyTopSupply {
  name: string;
  category: string;
  quantity: string;
  unitsNeeded: number;
  percentNeeded: number;
  iconType?: string;
}

export interface EmergencyRespondingNgo {
  id: string;
  name: string;
  category: string;
  verified: boolean;
  avatar?: string;
}

export interface EmergencyEvent {
  _id?: any;
  id: string;
  name: string;
  type: 'flood' | 'earthquake' | 'cyclone' | 'heatwave' | 'coldwave' | 'civil_unrest' | 'drought' | 'medical_crisis' | string;
  severity: 'code_red' | 'code_orange' | 'code_yellow' | 'critical' | 'high' | 'moderate' | 'medium' | string;
  officialSource: string;
  sourceUrl?: string;
  sourceAgency?: string;
  geography: {
    affectedStates: string[];
    affectedDistricts: string[];
    epicenter?: [number, number];
    radiusKm: number;
  };
  region?: string;
  country?: string;
  description?: string;
  topSupplies?: EmergencyTopSupply[];
  activeNgosCount?: number;
  respondingNgos?: EmergencyRespondingNgo[];
  verificationStatus?: 'verified' | 'provisional' | 'unverified';
  lastUpdated?: string;
  lastUpdatedFormatted?: string;
  image?: string;
  validFrom?: string;
  validUntil: string;
  requiredSupplies: string[];
  status: 'active' | 'resolved' | 'expired';
  priorityMultiplier: number;
  createdBy?: string;
  createdAt: string;
}

export interface DLQEvent {
  _id?: any;
  id: string;
  eventType: string;
  payload: Record<string, unknown>;
  error: string;
  retryCount: number;
  maxRetries: number;
  status: 'failed' | 'retried_success' | 'abandoned';
  firstFailedAt: string;
  lastAttemptAt: string;
}

export interface AuditLogEntry {
  _id?: any;
  id: string;
  actor: {
    id: string;
    name: string;
    role: string;
  };
  action: string;
  entityType: 'ngo' | 'donation' | 'allocation' | 'emergency' | 'scoring_weights' | 'user' | 'dlq';
  entityId: string;
  beforeSummary?: string;
  afterSummary?: string;
  reason?: string;
  ipAddress?: string;
  timestamp: string;
}

export interface AIRunLog {
  _id?: any;
  id: string;
  task: 'explain_match' | 'validate_donation' | 'assistant_chat' | 'extract_need';
  provider: string;
  model: string;
  toolsUsed: string[];
  latencyMs: number;
  status: 'success' | 'rejected_by_guardrails' | 'error';
  validationResult: string;
  timestamp: string;
}

export interface ScoringWeights {
  needFit: number;          // 0.30
  urgency: number;          // 0.20
  deliveryFit: number;      // 0.15
  timeFit: number;          // 0.15
  quantityFit: number;      // 0.10
  freshnessConfidence: number; // 0.10
  version: string;
  updatedAt: string;
  updatedBy: string;
}

export interface StructuredListingDraft {
  title: string;
  listingType: 'free_donation' | 'affordable_sale' | 'business_surplus';
  category: string;
  subcategory: string;
  description: string;
  quantity: number;
  unit: string;
  condition: 'Brand New' | 'Gently Used' | 'Good' | 'Fair';
  brand?: string;
  dimensions?: string;
  weight?: string;
  expiryDate?: string;
  pricePerUnit?: number;
  totalPrice?: number;
  currency?: string;
  city: string;
  state: string;
  approximateLocationText?: string;
  images?: string[];
  missingFields?: string[];
  confidenceScore?: number;
  safetyGuidelines?: string[];
}

export interface AIConversation {
  _id?: any;
  id: string;
  userId?: string;
  listingId?: string;
  language: 'en' | 'hi' | 'hinglish';
  status: 'active' | 'archived';
  currentDraft?: StructuredListingDraft;
  createdAt: string;
  updatedAt: string;
}

export interface AIMessage {
  _id?: any;
  id: string;
  conversationId: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  images?: string[];
  structuredData?: {
    type?: 'draft_listing' | 'ngo_matches' | 'safety_report' | 'price_estimate' | 'category_recommendation';
    draft?: StructuredListingDraft;
    ngos?: any[];
    safety?: any;
    price?: any;
  };
  toolsUsed?: string[];
  timestamp: string;
}
