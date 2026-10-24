import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getCurrentUser, hasPermission } from '@/lib/auth';
import { EmergencyEvent } from '@/lib/types';
import { logPlatformEvent } from '@/lib/event-bus';

export async function GET() {
  try {
    const db = await getDb();
    const emergencies = await db.collection<EmergencyEvent>('emergency_events')
      .find({})
      .sort({ createdAt: -1 })
      .toArray();

    return NextResponse.json({ emergencies });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();

    if (!hasPermission(user.role, 'emergency_manage')) {
      return NextResponse.json(
        { error: 'Unauthorized: Emergency Coordinator or Admin privilege required.' },
        { status: 403 }
      );
    }

    const body = await req.json();
    const {
      name,
      type,
      severity,
      officialSource,
      sourceUrl,
      affectedStates,
      affectedDistricts,
      epicenter,
      radiusKm,
      validUntil,
      requiredSupplies
    } = body;

    if (!name || !officialSource || !affectedStates) {
      return NextResponse.json(
        { error: 'Event name, official source agency and affected regions are required.' },
        { status: 400 }
      );
    }

    const emergencyId = `emerg_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const newEmergency: EmergencyEvent = {
      id: emergencyId,
      name,
      type: type || 'flood',
      severity: severity || 'code_red',
      officialSource,
      sourceUrl: sourceUrl || 'https://ndma.gov.in/bulletins',
      geography: {
        affectedStates: Array.isArray(affectedStates) ? affectedStates : [affectedStates],
        affectedDistricts: Array.isArray(affectedDistricts) ? affectedDistricts : [affectedDistricts],
        epicenter: epicenter || [26.1445, 91.7362],
        radiusKm: Number(radiusKm) || 200
      },
      validFrom: new Date().toISOString(),
      validUntil: validUntil || new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
      requiredSupplies: requiredSupplies || ['Clean water packets', 'Thermal blankets', 'Sanitation kits'],
      status: 'active',
      priorityMultiplier: severity === 'code_red' ? 1.45 : severity === 'code_orange' ? 1.25 : 1.1,
      createdBy: `${user.name} (${user.role})`,
      createdAt: new Date().toISOString()
    };

    const db = await getDb();
    await db.collection('emergency_events').insertOne(newEmergency);

    // Audit log
    await db.collection('audit_logs').insertOne({
      id: `audit_emerg_${emergencyId}`,
      actor: { id: user.id, name: user.name, role: user.role },
      action: 'EMERGENCY_EVENT_PUBLISHED',
      entityType: 'emergency',
      entityId: emergencyId,
      beforeSummary: 'None',
      afterSummary: `Declared ${newEmergency.severity} event: ${newEmergency.name}`,
      reason: `Authorized advisory from ${officialSource}`,
      timestamp: new Date().toISOString()
    });

    await logPlatformEvent('emergency.published', emergencyId, { id: user.id, name: user.name, role: user.role }, {
      name,
      severity,
      multiplier: newEmergency.priorityMultiplier
    });

    return NextResponse.json({
      success: true,
      emergency: newEmergency
    });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
