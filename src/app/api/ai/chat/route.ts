import { NextResponse } from 'next/server';
import { runAIAgent } from '@/lib/openai-agent';
import { getCurrentUser } from '@/lib/auth';

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    const body = await req.json().catch(() => ({}));
    const { message, conversationId, currentDraft, images, history } = body;

    if (!message || typeof message !== 'string' || message.trim() === '') {
      return NextResponse.json(
        { error: 'Message cannot be empty.' },
        { status: 400 }
      );
    }

    const result = await runAIAgent(message, {
      conversationId,
      currentDraft,
      images,
      history,
      userId: user?.id
    });

    return NextResponse.json({
      success: true,
      user: { id: user?.id, name: user?.name, role: user?.role },
      ...result
    });
  } catch (error) {
    console.error('AI Chat Error:', error);
    return NextResponse.json(
      { error: (error as Error).message || 'Internal AI service error' },
      { status: 500 }
    );
  }
}
