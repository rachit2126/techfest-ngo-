import { NextResponse } from 'next/server';
import { findMatchingNGOsFromDb } from '@/lib/ai-assistant-service';

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const { category, city, quantity, condition, onlyVerified } = body;

    const matches = await findMatchingNGOsFromDb({
      category: category || 'clothing_blankets',
      city: city || 'Delhi',
      quantity: quantity || 50,
      condition: condition || 'Brand New',
      onlyVerified: onlyVerified !== false
    });

    return NextResponse.json({
      success: true,
      count: matches.length,
      matchingNgos: matches
    });
  } catch (error) {
    console.error('Find NGOs Error:', error);
    return NextResponse.json(
      { error: (error as Error).message || 'Failed to query matching NGOs' },
      { status: 500 }
    );
  }
}
