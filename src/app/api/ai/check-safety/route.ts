import { NextResponse } from 'next/server';
import { checkSafetyGuidelines } from '@/lib/ai-assistant-service';

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const { category, description, condition, expiryDate } = body;

    const safetyReport = checkSafetyGuidelines({
      category,
      description,
      condition,
      expiryDate
    });

    return NextResponse.json({
      success: true,
      safety: safetyReport
    });
  } catch (error) {
    console.error('Check Safety Error:', error);
    return NextResponse.json(
      { error: (error as Error).message || 'Failed to check item safety' },
      { status: 500 }
    );
  }
}
