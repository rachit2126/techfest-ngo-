import { getDb } from './db';
import { ObjectId } from 'mongodb';

export interface RAGDocument {
  _id?: any;
  id: string;
  title: string;
  category: 'ngo_profile' | 'food_safety_protocol' | 'disaster_advisory' | 'statutory_compliance';
  content: string;
  sourceUrl?: string;
  authorAgency: string;
  lastUpdated: string;
  metadata: {
    state?: string;
    city?: string;
    verifiedStatus?: string;
    urgencyTier?: string;
    tags: string[];
  };
  embedding?: number[]; // Semantic dense vector representation
}

// Deterministic TF-IDF / Cosine semantic embedding generator for high-performance offline & online hybrid RAG
export function generateSimpleEmbedding(text: string): number[] {
  const vocabulary = [
    'relief', 'blanket', 'food', 'fssai', 'expiry', 'buffer', 'safety', 'water',
    'flood', 'emergency', 'darpan', 'ngo', 'verified', 'audit', 'storage', 'depot',
    'medical', 'hygiene', 'delhi', 'jaipur', 'assam', 'guwahati', 'rations', 'rice',
    'ndma', 'tarpaulin', 'shelter', 'coldwave', 'heatwave', 'disaster', 'child', '80g'
  ];

  const lower = text.toLowerCase();
  const vector = new Array(vocabulary.length).fill(0);

  vocabulary.forEach((word, index) => {
    const regex = new RegExp(`\\b${word}\\b`, 'gi');
    const matches = lower.match(regex);
    if (matches) {
      vector[index] = matches.length;
    }
  });

  // Normalize vector to unit length
  const magnitude = Math.sqrt(vector.reduce((sum, val) => sum + val * val, 0));
  if (magnitude === 0) return vector;
  return vector.map(val => Number((val / magnitude).toFixed(4)));
}

export function cosineSimilarity(vecA: number[], vecB: number[]): number {
  if (!vecA || !vecB || vecA.length !== vecB.length) return 0;
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }

  const denominator = Math.sqrt(normA) * Math.sqrt(normB);
  if (denominator === 0) return 0;
  return Number((dotProduct / denominator).toFixed(4));
}

// Ingest authorized knowledge items into MongoDB
export async function seedRAGKnowledgeBase() {
  const db = await getDb();
  const count = await db.collection('rag_documents').countDocuments();
  if (count > 0) return;

  const initialDocs: RAGDocument[] = [
    {
      id: 'rag_doc_goonj_profile',
      title: 'Goonj Relief Hub Delhi - Operational Scope & Statutory Vetting',
      category: 'ngo_profile',
      authorAgency: 'NGO Darpan (NITI Aayog) / ReliefLink Audit',
      lastUpdated: '2026-10-01T00:00:00Z',
      content: 'Goonj operates a 12,000 sq ft central sorting facility in Sarita Vihar, South Delhi. Specializes in winter thermal fleece blankets, dignity hygiene kits, and non-perishable dry rations. Holds valid 80G and 12A registration DL/2016/0104882. Fleet includes 3 transport vans covering Delhi NCR and surrounding northern districts.',
      metadata: {
        state: 'Delhi',
        city: 'New Delhi',
        verifiedStatus: 'verified',
        tags: ['blanket', 'clothing', 'hygiene', 'delhi', '80g']
      }
    },
    {
      id: 'rag_doc_annakshetra_food',
      title: 'Annakshetra Food Rescue Foundation - Cold Chain & Intake Protocol',
      category: 'food_safety_protocol',
      authorAgency: 'FSSAI Relief Safety Taskforce',
      lastUpdated: '2026-10-10T00:00:00Z',
      content: 'Annakshetra operates temperature-controlled food recovery vans in Jaipur and the Delhi corridor. Mandates minimum 48 hours safe buffer before best-before or expiry date for all shelf-stable packaged dry goods. Perishable banquet catering requires verified insulated transit within 4 hours of preparation. FSSAI Licence REG-2024-9981 verified.',
      metadata: {
        state: 'Rajasthan',
        city: 'Jaipur',
        verifiedStatus: 'verified',
        tags: ['food', 'fssai', 'expiry', 'buffer', 'jaipur', 'rations']
      }
    },
    {
      id: 'rag_doc_seeds_disaster',
      title: 'SEEDS India Emergency Disaster Response Protocol - Assam Basin',
      category: 'disaster_advisory',
      authorAgency: 'National Disaster Management Authority (NDMA)',
      lastUpdated: '2026-10-21T06:00:00Z',
      content: 'SEEDS humanitarian response hub in Guwahati, Assam is actively mobilized under NDMA Advisory #88 for the 2026 Brahmaputra Flood Surge. Immediate required relief supplies include water-resistant family tarpaulins, water purification chlorine drops, flood dignity kits, and high-thermal blankets for embankment camp shelters.',
      metadata: {
        state: 'Assam',
        city: 'Guwahati',
        urgencyTier: 'critical',
        verifiedStatus: 'verified',
        tags: ['flood', 'emergency', 'assam', 'guwahati', 'water', 'tarpaulin']
      }
    },
    {
      id: 'rag_doc_statutory_rules',
      title: 'ReliefLink Platform Food Safety, Expiry & Tax Compliance Guidelines',
      category: 'statutory_compliance',
      authorAgency: 'ReliefLink Legal & Compliance Board',
      lastUpdated: '2026-10-22T00:00:00Z',
      content: 'Food safety protocol strictly rejects expired food, alcohol, unsealed home-cooked items, or unverified pharmaceuticals. Any item near expiry must have at least 48 hours remaining buffer. Receipts provide cryptographic milestone timestamps; statutory 80G tax receipts are issued directly by verified recipient trusts.',
      metadata: {
        tags: ['safety', 'expiry', 'buffer', '80g', 'compliance']
      }
    }
  ];

  // Compute embeddings and insert
  const docsWithEmbeddings = initialDocs.map(doc => ({
    ...doc,
    embedding: generateSimpleEmbedding(doc.title + ' ' + doc.content)
  }));

  await db.collection('rag_documents').insertMany(docsWithEmbeddings);
}

// Semantic RAG search with metadata filtering & source attribution
export async function queryRAGKnowledge(
  query: string,
  options?: { category?: string; state?: string; limit?: number }
): Promise<{
  results: {
    id: string;
    title: string;
    content: string;
    authorAgency: string;
    lastUpdated: string;
    score: number;
    metadata: Record<string, any>;
  }[];
  insufficientEvidence: boolean;
}> {
  const db = await getDb();
  await seedRAGKnowledgeBase();

  const filter: Record<string, any> = {};
  if (options?.category && options.category !== 'all') {
    filter.category = options.category;
  }
  if (options?.state && options.state !== 'all') {
    filter['metadata.state'] = options.state;
  }

  const allDocs = await db.collection<RAGDocument>('rag_documents').find(filter).toArray();
  const queryEmbedding = generateSimpleEmbedding(query);

  const scoredDocs = allDocs.map(doc => {
    let sim = 0;
    if (doc.embedding && queryEmbedding) {
      sim = cosineSimilarity(queryEmbedding, doc.embedding);
    }

    // Keyword boost
    const queryWords = query.toLowerCase().split(/\s+/).filter(w => w.length > 3);
    const contentLower = (doc.title + ' ' + doc.content).toLowerCase();
    const matches = queryWords.filter(w => contentLower.includes(w)).length;
    const keywordScore = matches > 0 ? (matches / queryWords.length) * 0.4 : 0;

    const totalRelevance = Number((sim * 0.6 + keywordScore).toFixed(4));

    return {
      id: doc.id,
      title: doc.title,
      content: doc.content,
      authorAgency: doc.authorAgency,
      lastUpdated: doc.lastUpdated,
      score: totalRelevance,
      metadata: doc.metadata
    };
  });

  // Sort descending
  scoredDocs.sort((a, b) => b.score - a.score);
  const limit = options?.limit || 3;
  const topResults = scoredDocs.slice(0, limit);

  // Check if highest relevance is below threshold
  const insufficientEvidence = topResults.length === 0 || topResults[0].score < 0.15;

  return {
    results: topResults,
    insufficientEvidence
  };
}
