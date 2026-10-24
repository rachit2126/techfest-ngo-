import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getCurrentUser, hasPermission } from '@/lib/auth';

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!hasPermission(user.role, 'view_analytics')) {
      return NextResponse.json({ error: 'Unauthorized: Admin or Analytics privilege required.' }, { status: 403 });
    }

    const db = await getDb();

    // Database-backed live counts
    const [
      pendingNGOReviews,
      openDonations,
      unmatchedEligibleDonations,
      activeDeliveries,
      urgentNeeds,
      flaggedCases,
      failedProcessingEvents
    ] = await Promise.all([
      db.collection('organisations').countDocuments({ verificationStatus: { $in: ['in_review', 'reverification_required'] } }),
      db.collection('donations').countDocuments({ status: { $in: ['submitted', 'validating', 'eligible'] } }),
      db.collection('donations').countDocuments({ status: 'eligible', allocatedQuantity: 0 }),
      db.collection('donations').countDocuments({ status: { $in: ['approved', 'packed_ready', 'picked_up', 'in_transit', 'delivered_pending'] } }),
      db.collection('ngo_needs').countDocuments({ status: 'open', urgency: { $in: ['critical', 'high'] } }),
      db.collection('donations').countDocuments({ status: { $in: ['disputed', 'cancelled'] } }),
      db.collection('dlq_events').countDocuments({ status: 'failed' })
    ]);

    // Recent audit events
    const recentActivity = await db.collection('audit_logs')
      .find({})
      .sort({ timestamp: -1 })
      .limit(8)
      .toArray();

    return NextResponse.json({
      success: true,
      kpis: {
        pendingNGOReviews,
        openDonations,
        unmatchedEligibleDonations,
        activeDeliveries,
        urgentNeeds,
        flaggedCases,
        failedProcessingEvents
      },
      recentActivity,
      integrations: {
        database: 'configured',
        geocoding: 'configured',
        objectStorage: 'configured',
        llmProvider: 'configured',
        smsGateway: 'degraded' // as demonstrated in DLQ
      }
    });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
