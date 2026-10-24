import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { getDb } from '@/lib/db';
import { DonationLot } from '@/lib/types';
import { logPlatformEvent } from '@/lib/event-bus';

interface RawInventoryRow {
  itemName: string;
  category: string;
  quantity: string | number;
  unit: string;
  condition: string;
  expiryDate?: string;
  storageRequirements?: string;
  batchLotCode?: string;
  city?: string;
}

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    const body = await req.json();
    const rows: RawInventoryRow[] = body.rows || [];

    if (!Array.isArray(rows) || rows.length === 0) {
      return NextResponse.json({ error: 'No inventory rows provided in payload' }, { status: 400 });
    }

    const acceptedRows: DonationLot[] = [];
    const reviewRows: { rowNumber: number; item: string; warnings: string[]; row: any }[] = [];
    const rejectedRows: { rowNumber: number; item: string; errors: string[] }[] = [];

    // Helper to normalize category
    const normalizeCategory = (cat: string) => {
      const lower = (cat || '').toLowerCase().trim();
      if (lower.includes('food') || lower.includes('nutrition') || lower === 'packaged_food') return 'packaged_food';
      if (lower.includes('blanket') || lower.includes('cloth') || lower.includes('winter') || lower === 'clothing_blankets') return 'clothing_blankets';
      if (lower.includes('hygiene') || lower.includes('sanit') || lower === 'hygiene_kits') return 'hygiene_kits';
      if (lower.includes('medic') || lower.includes('first aid') || lower === 'medical_first_aid') return 'medical_first_aid';
      return lower;
    };

    const supportedCategories = ['packaged_food', 'clothing_blankets', 'hygiene_kits', 'medical_first_aid'];

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const errors: string[] = [];
      const warnings: string[] = [];
      const qty = Number(row.quantity);
      const normalizedCat = normalizeCategory(row.category);

      if (!row.itemName || row.itemName.trim() === '') {
        errors.push('Item name is missing');
      }

      if (isNaN(qty) || qty <= 0) {
        errors.push(`Invalid quantity '${row.quantity}'. Must be a positive number`);
      }

      if (!supportedCategories.includes(normalizedCat)) {
        errors.push(`Category '${row.category}' is unsupported in emergency relief intake`);
      }

      if (normalizedCat === 'packaged_food') {
        if (!row.expiryDate) {
          errors.push('Expiry date is mandatory for food safety');
        } else {
          const exp = new Date(row.expiryDate).getTime();
          const diffHours = (exp - Date.now()) / (1000 * 60 * 60);
          if (diffHours <= 0) {
            errors.push(`Product expired on ${row.expiryDate}. Expired foods cannot be donated.`);
          } else if (diffHours < 48) {
            errors.push(`Expiry date ${row.expiryDate} violates the 48-hour safety buffer rule`);
          } else if (diffHours < 96) {
            warnings.push(`Tight delivery window: Expiry is within 4 days (${row.expiryDate})`);
          }
        }
      }

      const cond = (row.condition || '').toLowerCase().trim();
      if (cond === 'fair' || cond === 'poor' || (row.category && row.category.toLowerCase().includes('restrict'))) {
        errors.push(`Item condition '${row.condition}' or restriction does not meet humanitarian standards.`);
      } else if (cond === 'used' || (row.itemName && row.itemName.toLowerCase().includes('unsealed'))) {
        warnings.push(`Condition marked '${row.condition}' or packaging unsealed: Requires physical depot review before dispatch.`);
      }

      if (errors.length > 0) {
        rejectedRows.push({
          rowNumber: i + 1,
          item: row.itemName || `Row #${i + 1}`,
          errors
        });
      } else if (warnings.length > 0) {
        reviewRows.push({
          rowNumber: i + 1,
          item: row.itemName || `Row #${i + 1}`,
          warnings,
          row
        });
      } else {
        const donationId = `don_bulk_${Date.now()}_${i}`;
        const newDonation: DonationLot = {
          id: donationId,
          donorId: user.id,
          donorType: 'business',
          donorName: user.name,
          donorOrgName: 'Grand Horizon Hospitality Group',
          category: normalizedCat as any,
          itemName: row.itemName,
          quantity: qty,
          unit: (row.unit || 'units') as any,
          condition: (row.condition === 'New' || row.condition === 'new' ? 'new' : 'good') as any,
          expiryDate: row.expiryDate,
          storageRequirements: (row.storageRequirements || 'dry') as any,
          batchLotCode: row.batchLotCode || `LOT-GH-${900 + i}`,
          availabilityWindow: 'Dock B, Mon-Sat 09:00 - 18:00',
          location: {
            city: row.city || 'New Delhi',
            state: 'Delhi',
            coordinates: [28.5355, 77.2610],
            approximateText: 'Aerocity Hospitality Logistics Center, Delhi'
          },
          status: 'eligible',
          allocatedQuantity: 0,
          remainingQuantity: qty,
          eligibilityChecks: {
            passed: true,
            reasons: ['Batch safety check passed', 'Food safe buffer verified'],
            expiryBufferSafe: true,
            categorySupported: true,
            foodSafetyAcknowledged: true
          },
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        acceptedRows.push(newDonation);
      }
    }

    if (acceptedRows.length > 0) {
      const db = await getDb();
      await db.collection('donations').insertMany(acceptedRows);

      // Create timeline events
      const events = acceptedRows.map(d => ({
        id: `evt_bulk_${d.id}`,
        donationId: d.id,
        status: d.status,
        actor: { id: user.id, name: user.name, role: user.role },
        timestamp: new Date().toISOString(),
        note: `Bulk inventory batch import verified: ${d.quantity} ${d.unit} lot added.`
      }));
      await db.collection('timeline_events').insertMany(events);

      await logPlatformEvent('donation.bulk_imported', `${acceptedRows.length}_items`, { id: user.id, name: user.name, role: user.role }, {
        count: acceptedRows.length,
        reviewCount: reviewRows.length,
        rejectedCount: rejectedRows.length
      });
    }

    return NextResponse.json({
      success: true,
      summary: {
        totalProcessed: rows.length,
        acceptedCount: acceptedRows.length,
        reviewCount: reviewRows.length,
        rejectedCount: rejectedRows.length
      },
      accepted: acceptedRows,
      review: reviewRows,
      rejected: rejectedRows
    });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
