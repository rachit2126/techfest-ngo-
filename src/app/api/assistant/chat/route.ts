import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { processAssistantMessage } from '@/lib/ai-agent';

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    const { message } = await req.json();

    if (!message || message.trim() === '') {
      return NextResponse.json({ error: 'Message cannot be empty.' }, { status: 400 });
    }

    const result = await processAssistantMessage(message, {
      role: user.role,
      currentUserId: user.id
    });

    return NextResponse.json({
      success: true,
      user: { id: user.id, role: user.role },
      ...result
    });
  } catch (error) {
    console.error('Assistant chat error:', error);
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
