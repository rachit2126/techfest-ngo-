import { NextResponse } from 'next/server';
import { getCurrentUser, hasPermission } from '@/lib/auth';
import { getDb } from '@/lib/db';
import { Organisation, VerificationStatus } from '@/lib/types';
import { logPlatformEvent } from '@/lib/event-bus';

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const user = await getCurrentUser();

    if (!hasPermission(user.role, 'verify_ngo')) {
      return NextResponse.json(
        { error: 'Unauthorized: NGO Verification Officer or Admin privilege required.' },
        { status: 403 }
      );
    }

    const { decision, reason } = await req.json();

    if (!reason || reason.trim().length < 5) {
      return NextResponse.json(
        { error: 'A documented justification reason (min 5 chars) is mandatory for verification audits.' },
        { status: 400 }
      );
    }

    const db = await getDb();
    const ngo = await db.collection<Organisation>('organisations').findOne({ id });

    if (!ngo) {
      return NextResponse.json({ error: 'Organisation record not found' }, { status: 404 });
    }

    let targetStatus: VerificationStatus = ngo.verificationStatus;
    switch (decision) {
      case 'approve':
        targetStatus = 'verified';
        break;
      case 'reject':
        targetStatus = 'rejected';
        break;
      case 'suspend':
        targetStatus = 'suspended';
        break;
      case 'reinstate':
        targetStatus = 'verified';
        break;
      case 'request_info':
        targetStatus = 'reverification_required';
        break;
      default:
        return NextResponse.json({ error: `Unknown verification decision: ${decision}` }, { status: 400 });
    }

    const updateDoc: Record<string, unknown> = {
      verificationStatus: targetStatus,
      verifiedBy: `${user.name} (${user.role})`,
      'sourceProvenance.lastCheckedDate': new Date().toISOString()
    };

    if (decision === 'approve' || decision === 'reinstate') {
      updateDoc.verificationDate = new Date().toISOString();
      // 1-year valid expiry
      const exp = new Date();
      exp.setFullYear(exp.getFullYear() + 1);
      updateDoc.verificationExpiry = exp.toISOString();
      updateDoc['sourceProvenance.verifiedMethod'] = `Document Audit by ${user.name}: ${reason}`;
    }

    await db.collection('organisations').updateOne(
      { id },
      { $set: updateDoc }
    );

    // Audit log
    await db.collection('audit_logs').insertOne({
      id: `audit_ngo_${Date.now()}`,
      actor: { id: user.id, name: user.name, role: user.role },
      action: `NGO_VERIFICATION_${decision.toUpperCase()}`,
      entityType: 'ngo',
      entityId: id,
      beforeSummary: `status: ${ngo.verificationStatus}`,
      afterSummary: `status: ${targetStatus}`,
      reason,
      timestamp: new Date().toISOString()
    });

    await logPlatformEvent('ngo.verification_updated', id, { id: user.id, name: user.name, role: user.role }, {
      decision,
      newStatus: targetStatus,
      reason
    });

    return NextResponse.json({
      success: true,
      ngoId: id,
      newStatus: targetStatus,
      message: `NGO status updated to ${targetStatus}`
    });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
