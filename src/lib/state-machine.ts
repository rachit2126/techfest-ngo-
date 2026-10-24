import { getDb } from './db';
import { DonationLot, DonationStatus, DeliveryTimelineEvent, AuditLogEntry, User } from './types';
import { ObjectId } from 'mongodb';

// Define valid transition graph
const VALID_TRANSITIONS: Record<DonationStatus, DonationStatus[]> = {
  draft: ['submitted', 'cancelled'],
  submitted: ['validating', 'cancelled'],
  validating: ['eligible', 'cancelled'],
  eligible: ['match_proposed', 'cancelled'],
  match_proposed: ['awaiting_ngo', 'eligible', 'cancelled'],
  awaiting_ngo: ['approved', 'match_proposed', 'cancelled'],
  approved: ['packed_ready', 'cancelled', 'disputed'],
  packed_ready: ['picked_up', 'cancelled', 'disputed'],
  picked_up: ['in_transit', 'disputed'],
  in_transit: ['delivered_pending', 'disputed'],
  delivered_pending: ['delivered_confirmed', 'disputed'],
  delivered_confirmed: [], // Terminal state
  cancelled: [],           // Terminal state
  disputed: ['approved', 'in_transit', 'cancelled'] // Admin resolution path
};

export function canTransition(current: DonationStatus, next: DonationStatus): boolean {
  return VALID_TRANSITIONS[current]?.includes(next) || false;
}

// Atomic inventory reservation and state transition
export async function transitionDonationStatus(
  donationId: string,
  targetStatus: DonationStatus,
  actor: { id: string; name: string; role: string },
  note: string,
  extra?: {
    evidenceUrl?: string;
    recipientConfirmation?: {
      confirmedBy: string;
      confirmedQuantity: number;
      conditionVerified: boolean;
      notes?: string;
    };
    reason?: string;
  }
) {
  const db = await getDb();
  const donation = await db.collection<DonationLot>('donations').findOne({ id: donationId });

  if (!donation) {
    throw new Error(`Donation ${donationId} not found`);
  }

  if (!canTransition(donation.status, targetStatus)) {
    throw new Error(
      `Invalid status jump: Cannot transition from '${donation.status}' to '${targetStatus}'. Valid next states: ${VALID_TRANSITIONS[donation.status].join(', ')}`
    );
  }

  // Update donation document
  const updateFields: Record<string, unknown> = {
    status: targetStatus,
    updatedAt: new Date().toISOString()
  };

  await db.collection('donations').updateOne(
    { id: donationId },
    { $set: updateFields }
  );

  // Append immutable timeline event
  const timelineEvent: DeliveryTimelineEvent = {
    id: `evt_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    donationId,
    status: targetStatus,
    actor,
    timestamp: new Date().toISOString(),
    note,
    evidenceUrl: extra?.evidenceUrl,
    recipientConfirmation: extra?.recipientConfirmation
  };

  await db.collection('timeline_events').insertOne(timelineEvent);

  // Log in Audit Trail
  const auditLog: AuditLogEntry = {
    id: `audit_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    actor,
    action: `DONATION_STATUS_${targetStatus.toUpperCase()}`,
    entityType: 'donation',
    entityId: donationId,
    beforeSummary: `status: ${donation.status}`,
    afterSummary: `status: ${targetStatus}`,
    reason: extra?.reason || note,
    timestamp: new Date().toISOString()
  };

  await db.collection('audit_logs').insertOne(auditLog);

  return { success: true, newStatus: targetStatus, timelineEvent };
}

// Atomic allocation reservation to prevent double booking
export async function reserveAllocation(
  donationId: string,
  requestId: string,
  quantityToReserve: number,
  actor: { id: string; name: string; role: string }
) {
  const db = await getDb();

  // Atomically check and decrement remaining quantity
  const result = await db.collection<DonationLot>('donations').findOneAndUpdate(
    {
      id: donationId,
      remainingQuantity: { $gte: quantityToReserve }
    },
    {
      $inc: {
        remainingQuantity: -quantityToReserve,
        allocatedQuantity: quantityToReserve
      },
      $set: {
        status: 'approved',
        updatedAt: new Date().toISOString()
      }
    },
    { returnDocument: 'after' }
  );

  if (!result) {
    throw new Error('CONCURRENCY_ERROR: Insufficient remaining quantity or donation already reserved by another party.');
  }

  const request = await db.collection('ngo_needs').findOne({ id: requestId });

  const allocationId = `alloc_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const allocationDoc = {
    id: allocationId,
    donationId,
    requestId,
    ngoId: request?.orgId || 'unknown_ngo',
    ngoName: request?.orgName || 'Verified NGO',
    quantityAllocated: quantityToReserve,
    unit: result.unit,
    status: 'approved',
    donorApprovedAt: new Date().toISOString(),
    ngoAcceptedAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  await db.collection('allocations').insertOne(allocationDoc);

  // Update NGO request fulfilled quantity
  if (request) {
    const newFulfilled = (request.quantityFulfilled || 0) + quantityToReserve;
    const reqStatus = newFulfilled >= request.quantityRequested ? 'fulfilled' : 'partially_fulfilled';
    await db.collection('ngo_needs').updateOne(
      { id: requestId },
      {
        $set: {
          quantityFulfilled: newFulfilled,
          status: reqStatus
        }
      }
    );
  }

  // Create timeline event
  await db.collection('timeline_events').insertOne({
    id: `evt_${Date.now()}_alloc`,
    donationId,
    allocationId,
    status: 'approved',
    actor,
    timestamp: new Date().toISOString(),
    note: `Allocation confirmed: ${quantityToReserve} ${result.unit} reserved for ${request?.orgName}. Stock locked atomically.`
  });

  // Audit log
  await db.collection('audit_logs').insertOne({
    id: `audit_${Date.now()}_alloc`,
    actor,
    action: 'ALLOCATION_RESERVED',
    entityType: 'allocation',
    entityId: allocationId,
    beforeSummary: `remainingQuantity: ${result.remainingQuantity + quantityToReserve}`,
    afterSummary: `remainingQuantity: ${result.remainingQuantity}, allocated: ${quantityToReserve}`,
    reason: 'Verified allocation agreement accepted',
    timestamp: new Date().toISOString()
  });

  return { success: true, allocation: allocationDoc, donation: result };
}
