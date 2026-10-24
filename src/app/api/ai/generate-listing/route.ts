import { NextResponse } from 'next/server';
import { handleAIChat } from '@/lib/ai-assistant-service';

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const { prompt, images, currentDraft } = body;

    const chatResult = await handleAIChat({
      message: prompt || 'Generate a complete listing draft based on my photos and item specification',
      images,
      currentDraft
    });

    if (!chatResult.structuredDraft) {
      return NextResponse.json(
        { error: 'Could not generate structured draft from the provided information.' },
        { status: 422 }
      );
    }

    return NextResponse.json({
      success: true,
      draft: chatResult.structuredDraft,
      toolsUsed: chatResult.toolsUsed
    });
  } catch (error) {
    console.error('Generate Listing Error:', error);
    return NextResponse.json(
      { error: (error as Error).message || 'Failed to generate listing fields' },
      { status: 500 }
    );
  }
}
