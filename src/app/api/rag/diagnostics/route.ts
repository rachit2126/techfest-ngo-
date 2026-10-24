import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { seedRAGKnowledgeBase } from '@/lib/rag';

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (user.role !== 'admin' && user.role !== 'analytics_viewer') {
      return NextResponse.json({ error: 'Unauthorized: Admin or Analytics privilege required.' }, { status: 403 });
    }

    const db = await getDb();
    await seedRAGKnowledgeBase();

    const [totalDocs, categories, lastUpdatedDoc] = await Promise.all([
      db.collection('rag_documents').countDocuments(),
      db.collection('rag_documents').distinct('category'),
      db.collection('rag_documents').find({}).sort({ lastUpdated: -1 }).limit(1).toArray()
    ]);

    return NextResponse.json({
      success: true,
      diagnostics: {
        status: 'operational',
        vectorStore: 'MongoDB Dense Vector Collection (Cosine Similarity Indexed)',
        totalIndexedDocuments: totalDocs,
        categories,
        embeddingDimensions: 32,
        lastIndexedTimestamp: lastUpdatedDoc[0]?.lastUpdated || new Date().toISOString(),
        retrievalModel: 'Hybrid Dense Vector (0.6) + BM25 Keyword (0.4)'
      }
    });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
