import { NextResponse } from 'next/server';
import { estimateFairPrice } from '@/lib/ai-assistant-service';

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const { category, subcategory, title, condition, quantity } = body;

    const estimation = estimateFairPrice({
      category,
      subcategory,
      title,
      condition,
      quantity
    });

    return NextResponse.json({
      success: true,
      priceEstimate: estimation
    });
  } catch (error) {
    console.error('Estimate Price Error:', error);
    return NextResponse.json(
      { error: (error as Error).message || 'Failed to estimate fair price' },
      { status: 500 }
    );
  }
}
