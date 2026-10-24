import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { generateSimpleEmbedding, RAGDocument } from '@/lib/rag';

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized: Admin privileges required for RAG ingestion.' }, { status: 403 });
    }

    const { title, category, content, authorAgency, state, city, tags } = await req.json();

    if (!title || !content || !authorAgency) {
      return NextResponse.json({ error: 'Title, content, and author agency are required.' }, { status: 400 });
    }

    const docId = `rag_doc_${Date.now()}`;
    const embedding = generateSimpleEmbedding(title + ' ' + content);

    const newDoc: RAGDocument = {
      id: docId,
      title,
      category: category || 'statutory_compliance',
      content,
      authorAgency,
      lastUpdated: new Date().toISOString(),
      metadata: {
        state,
        city,
        tags: Array.isArray(tags) ? tags : [tags || 'relief']
      },
      embedding
    };

    const db = await getDb();
    await db.collection('rag_documents').insertOne(newDoc);

    return NextResponse.json({
      success: true,
      document: {
        id: docId,
        title,
        vectorDimensions: embedding.length
      }
    });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
