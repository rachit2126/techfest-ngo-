import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { SEED_USERS } from '@/lib/seed-data';

export async function GET() {
  const user = await getCurrentUser();
  return NextResponse.json({
    user,
    availableRoles: [
      { role: 'admin', label: 'Super Admin (Operations Lead)' },
      { role: 'ngo_reviewer', label: 'NGO Verification Officer' },
      { role: 'emergency_coordinator', label: 'Emergency Relief Coordinator' },
      { role: 'donor', label: 'Individual Donor (Riya Sharma)' },
      { role: 'business_donor', label: 'Business Donor (Grand Horizon Hotels)' },
      { role: 'ngo_staff', label: 'NGO Staff (Goonj Trust Depot)' },
      { role: 'analytics_viewer', label: 'Audit & Analytics Viewer' }
    ]
  });
}
