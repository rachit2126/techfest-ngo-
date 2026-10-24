import { getDb } from './db';
import {
  SEED_USERS,
  SEED_ORGANISATIONS,
  SEED_NEEDS,
  SEED_EMERGENCIES,
  SEED_DONATIONS,
  SEED_TIMELINE_EVENTS,
  SEED_DLQ_EVENTS,
  SEED_AUDIT_LOGS,
  INITIAL_SCORING_WEIGHTS
} from './seed-data';

// Database seeder with full NGO profiles and geographic coordinates
export async function seedDatabase(forceReset = false) {
  const db = await getDb();

  const orgCount = await db.collection('organisations').countDocuments();
  if (orgCount > 0 && !forceReset) {
    return { success: true, message: 'Database already populated' };
  }

  // Clear existing collections if forceReset or initializing
  await Promise.all([
    db.collection('users').deleteMany({}),
    db.collection('organisations').deleteMany({}),
    db.collection('ngo_needs').deleteMany({}),
    db.collection('donations').deleteMany({}),
    db.collection('matches').deleteMany({}),
    db.collection('allocations').deleteMany({}),
    db.collection('emergency_events').deleteMany({}),
    db.collection('timeline_events').deleteMany({}),
    db.collection('dlq_events').deleteMany({}),
    db.collection('audit_logs').deleteMany({}),
    db.collection('ai_runs').deleteMany({}),
    db.collection('scoring_config').deleteMany({})
  ]);

  // Insert seed data
  await db.collection('users').insertMany(SEED_USERS);
  await db.collection('organisations').insertMany(SEED_ORGANISATIONS);
  await db.collection('ngo_needs').insertMany(SEED_NEEDS);
  await db.collection('emergency_events').insertMany(SEED_EMERGENCIES);
  await db.collection('donations').insertMany(SEED_DONATIONS);
  await db.collection('timeline_events').insertMany(SEED_TIMELINE_EVENTS);
  await db.collection('dlq_events').insertMany(SEED_DLQ_EVENTS);
  await db.collection('audit_logs').insertMany(SEED_AUDIT_LOGS);
  await db.collection('scoring_config').insertOne(INITIAL_SCORING_WEIGHTS);

  // Create indexes for performance and geospatial queries
  try {
    await db.collection('organisations').createIndex({ 'serviceArea.coordinates': '2dsphere' });
    await db.collection('donations').createIndex({ 'location.coordinates': '2dsphere' });
    await db.collection('donations').createIndex({ status: 1 });
    await db.collection('ngo_needs').createIndex({ status: 1, category: 1 });
    await db.collection('matches').createIndex({ donationId: 1, requestId: 1 }, { unique: true });
    await db.collection('audit_logs').createIndex({ timestamp: -1 });
  } catch (err) {
    console.warn('Index creation notice:', err);
  }

  return {
    success: true,
    message: 'Database successfully seeded with realistic, sourced demo records',
    counts: {
      users: SEED_USERS.length,
      organisations: SEED_ORGANISATIONS.length,
      needs: SEED_NEEDS.length,
      emergencies: SEED_EMERGENCIES.length,
      donations: SEED_DONATIONS.length,
      dlq: SEED_DLQ_EVENTS.length,
      auditLogs: SEED_AUDIT_LOGS.length
    }
  };
}
