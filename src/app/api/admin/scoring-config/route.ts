import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { ScoringWeights } from '@/lib/types';
import { INITIAL_SCORING_WEIGHTS } from '@/lib/seed-data';

export async function GET() {
  try {
    const db = await getDb();
    const config = await db.collection<ScoringWeights>('scoring_config').findOne({});
    return NextResponse.json({ config: config || INITIAL_SCORING_WEIGHTS });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized: Only Super Admin can modify scoring weights.' }, { status: 403 });
    }

    const { needFit, urgency, deliveryFit, timeFit, quantityFit, freshnessConfidence, reason } = await req.json();

    const sum = Number(needFit) + Number(urgency) + Number(deliveryFit) + Number(timeFit) + Number(quantityFit) + Number(freshnessConfidence);
    if (Math.abs(sum - 1.0) > 0.01) {
      return NextResponse.json(
        { error: `Weights must sum to 1.0 (100%). Current sum: ${(sum * 100).toFixed(1)}%` },
        { status: 400 }
      );
    }

    const db = await getDb();
    const current = await db.collection<ScoringWeights>('scoring_config').findOne({});
    const prevVersion = current?.version || 'v1.0';
    const versionNum = parseFloat(prevVersion.replace('v', '')) || 1.0;
    const nextVersion = `v${(versionNum + 0.1).toFixed(1)}`;

    const newConfig: ScoringWeights = {
      needFit: Number(needFit),
      urgency: Number(urgency),
      deliveryFit: Number(deliveryFit),
      timeFit: Number(timeFit),
      quantityFit: Number(quantityFit),
      freshnessConfidence: Number(freshnessConfidence),
      version: nextVersion,
      updatedAt: new Date().toISOString(),
      updatedBy: `${user.name} (${user.role})`
    };

    await db.collection('scoring_config').updateOne(
      {},
      { $set: newConfig },
      { upsert: true }
    );

    // Audit record
    await db.collection('audit_logs').insertOne({
      id: `audit_weights_${Date.now()}`,
      actor: { id: user.id, name: user.name, role: user.role },
      action: 'SCORING_WEIGHTS_UPDATED',
      entityType: 'scoring_weights',
      entityId: nextVersion,
      beforeSummary: JSON.stringify(current || {}),
      afterSummary: JSON.stringify(newConfig),
      reason: reason || 'Calibrated scoring weights update via Admin Console',
      timestamp: new Date().toISOString()
    });

    return NextResponse.json({
      success: true,
      config: newConfig
    });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
