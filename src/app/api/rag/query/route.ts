import { NextResponse } from 'next/server';
import { queryRAGKnowledge } from '@/lib/rag';

export async function POST(req: Request) {
  try {
    const { query, category, state, limit } = await req.json();

    if (!query || query.trim() === '') {
      return NextResponse.json({ error: 'Query is required' }, { status: 400 });
    }

    const { results, insufficientEvidence } = await queryRAGKnowledge(query, {
      category,
      state,
      limit: limit ? Number(limit) : 3
    });

    return NextResponse.json({
      success: true,
      query,
      results,
      insufficientEvidence,
      notice: insufficientEvidence
        ? 'No authorized evidence found matching this query in the statutory knowledge base.'
        : undefined
    });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
