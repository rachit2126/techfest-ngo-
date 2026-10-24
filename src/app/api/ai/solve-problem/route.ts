import { NextRequest, NextResponse } from 'next/server';
import { SAHAY_BRAND } from '@/config/brand';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { problemDescription, category, context } = body;

    if (!problemDescription || typeof problemDescription !== 'string' || !problemDescription.trim()) {
      return NextResponse.json(
        { error: 'Problem description is required to diagnose and provide solutions.' },
        { status: 400 }
      );
    }

    const desc = problemDescription.toLowerCase();

    // Contextual Diagnostic Engine
    let diagnosis: {
      problemSummary: string;
      likelyCause: string;
      isConfirmed: boolean;
      supportingEvidence: string[];
      riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
      recommendedSolution: string;
      stepByStepInstructions: string[];
      availableCorrectiveActions: Array<{ id: string; label: string; actionType: string; isAutomated: boolean }>;
      escalationOption: { available: boolean; contact: string; message: string };
    };

    if (desc.includes('csv') || desc.includes('import') || desc.includes('row') || desc.includes('upload')) {
      diagnosis = {
        problemSummary: 'Inventory Spreadsheet Validation Discrepancy',
        likelyCause: 'Header column mismatch, invalid date formats, or short shelf-life (<48 hours) violation.',
        isConfirmed: true,
        supportingEvidence: [
          'Rows lacking mandatory fields (item_name, quantity, category)',
          'Safety policy AC-04 prohibits perishable foods with < 48h shelf life',
          'Date format should follow YYYY-MM-DD standard'
        ],
        riskLevel: 'MEDIUM',
        recommendedSolution: 'Download the certified Sahay CSV template, correct shelf-life dates, and re-import.',
        stepByStepInstructions: [
          '1. Open the Sahay Corporate Inventory Portal at /donate/organisation.',
          '2. Download the official CSV Template with pre-configured header mappings.',
          '3. Ensure all food items have an expiration date at least 48 hours after intended dispatch.',
          '4. Re-upload your file and inspect the row-level validation preview before final submission.'
        ],
        availableCorrectiveActions: [
          { id: 'download_template', label: 'Download Sahay CSV Template', actionType: 'DOWNLOAD_TEMPLATE', isAutomated: true },
          { id: 'retry_import', label: 'Retry Import With Auto-Sanitization', actionType: 'RETRY_IMPORT', isAutomated: true }
        ],
        escalationOption: {
          available: true,
          contact: SAHAY_BRAND.supportEmail,
          message: 'Contact Sahay Technical Support for enterprise inventory catalog onboarding.'
        }
      };
    } else if (desc.includes('ngo') || desc.includes('match') || desc.includes('allocation') || desc.includes('not found')) {
      diagnosis = {
        problemSummary: 'NGO Requirement Alignment Constraint',
        likelyCause: 'Distance threshold exceeded, quantity mismatch, or item category not currently requested by nearby shelters.',
        isConfirmed: true,
        supportingEvidence: [
          'Deterministic matching requires an active, verified NGO need within reasonable transit radius',
          'Only statutory verified (80G/12A) organizations are eligible for allocation'
        ],
        riskLevel: 'LOW',
        recommendedSolution: 'Broaden service area radius or adjust lot packaging size to match open shelter quotas.',
        stepByStepInstructions: [
          '1. Inspect open shelter needs on the Interactive Globe at /explore.',
          '2. Split larger bulk lots into pallet or carton sizes (e.g., 50-100 units).',
          '3. Check if an active emergency zone at /emergency has expedited logistics for your category.',
          '4. Publish an open surplus listing so eligible NGOs can claim it upon review.'
        ],
        availableCorrectiveActions: [
          { id: 'expand_radius', label: 'Expand Search Radius to 50km', actionType: 'EXPAND_RADIUS', isAutomated: true },
          { id: 'view_open_needs', label: 'Browse Open Needs Directory', actionType: 'BROWSE_NEEDS', isAutomated: true }
        ],
        escalationOption: {
          available: true,
          contact: 'dispatch@sahay.org',
          message: 'Escalate to Sahay Logistics Desk for cross-state humanitarian corridor routing.'
        }
      };
    } else if (desc.includes('safety') || desc.includes('hazardous') || desc.includes('expired') || desc.includes('medicine')) {
      diagnosis = {
        problemSummary: 'Humanitarian Safety & Statutory Policy Flag',
        likelyCause: 'Item contains restricted substances, expired perishables, open medicine packs, or hazardous materials.',
        isConfirmed: true,
        supportingEvidence: [
          'Sahay Safety Protocol Section 8 strictly prohibits prescription narcotics, open medical waste, and toxic chemicals',
          'Strict dignity rule: All wearable goods must be clean, hygienic, and dignified for recipient communities'
        ],
        riskLevel: 'HIGH',
        recommendedSolution: 'Review statutory eligibility rules. Prohibited items cannot be distributed through humanitarian channels.',
        stepByStepInstructions: [
          '1. Verify item against the Sahay Safety Guidelines at /assistant?tab=safety.',
          '2. If the item was mislabeled, update the title and category description.',
          '3. Note that open prescription medications must be disposed of via certified bio-waste channels.'
        ],
        availableCorrectiveActions: [
          { id: 'request_review', label: 'Request Human Safety Officer Review', actionType: 'SAFETY_REVIEW', isAutomated: false }
        ],
        escalationOption: {
          available: true,
          contact: 'compliance@sahay.org',
          message: 'Contact Sahay Statutory Compliance Team for item qualification appeals.'
        }
      };
    } else {
      diagnosis = {
        problemSummary: 'General System Coordination or Workflow Inquiry',
        likelyCause: 'Workflow step waiting for user confirmation or form parameter clarification.',
        isConfirmed: false,
        supportingEvidence: [
          'Action requires authorized user login or explicit field verification',
          'System integrity prevents unconfirmed database mutations'
        ],
        riskLevel: 'LOW',
        recommendedSolution: 'Review the step-by-step instructions below or use the AI Assistant to refine your request.',
        stepByStepInstructions: [
          '1. Ensure you are signed in with the correct account role (Individual or Organization).',
          '2. Check active alerts on the Operations Dashboard at /admin or /ngo/dashboard.',
          '3. If coordinating a delivery, confirm the bill of lading with your dispatch driver.',
          '4. Clear conversation cache or reload page if encountering a network timeout.'
        ],
        availableCorrectiveActions: [
          { id: 'retry_operation', label: 'Retry Previous Action', actionType: 'RETRY', isAutomated: true },
          { id: 'open_assistant', label: 'Ask Sahay AI Assistant', actionType: 'AI_ASSIST', isAutomated: true }
        ],
        escalationOption: {
          available: true,
          contact: SAHAY_BRAND.supportEmail,
          message: 'Reach out to Sahay Support for personalized humanitarian coordination help.'
        }
      };
    }

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      diagnosis
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || 'Failed to process problem diagnostic inquiry.' },
      { status: 500 }
    );
  }
}
