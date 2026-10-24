import { NextResponse } from 'next/server';
import { analyzeProductImage } from '@/lib/ai-assistant-service';

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const { imageUrl, fileName, hints } = body;

    const result = await analyzeProductImage({
      imageUrl,
      fileName,
      hints
    });

    return NextResponse.json({
      success: true,
      analysis: result
    });
  } catch (error) {
    console.error('Image Analysis Error:', error);
    return NextResponse.json(
      { error: (error as Error).message || 'Failed to analyze product image' },
      { status: 500 }
    );
  }
}
