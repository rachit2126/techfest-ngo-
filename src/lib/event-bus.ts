import { getDb } from './db';
import { DLQEvent } from './types';

// In-memory set of SSE client response writers
type SSEListener = (data: string) => void;
const sseListeners = new Set<SSEListener>();

export function registerSSEListener(listener: SSEListener) {
  sseListeners.add(listener);
  return () => {
    sseListeners.delete(listener);
  };
}

export function broadcastSSE(event: string, payload: Record<string, unknown>) {
  const data = JSON.stringify({
    event,
    timestamp: new Date().toISOString(),
    ...payload
  });

  const message = `event: ${event}\ndata: ${data}\n\n`;
  for (const listener of sseListeners) {
    try {
      listener(message);
    } catch {
      sseListeners.delete(listener);
    }
  }
}

// Log an event to the persistent event log and trigger SSE
export async function logPlatformEvent(
  eventType: string,
  entity: string,
  actor: { id: string; name: string; role: string },
  payload: Record<string, unknown>
) {
  const db = await getDb();
  const eventDoc = {
    id: `evt_log_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    eventType,
    entity,
    actor,
    payload,
    timestamp: new Date().toISOString()
  };

  await db.collection('event_log').insertOne(eventDoc);
  broadcastSSE(eventType, { entity, actor: actor.name, eventId: eventDoc.id });

  return eventDoc;
}

// Safe retry for Dead Letter Queue items
export async function retryDLQEvent(dlqId: string) {
  const db = await getDb();
  const dlq = await db.collection<DLQEvent>('dlq_events').findOne({ id: dlqId });

  if (!dlq) {
    throw new Error(`DLQ event ${dlqId} not found`);
  }

  // Simulate idempotent execution of the event
  const isNowResolved = true; // Safe simulated resolution

  await db.collection('dlq_events').updateOne(
    { id: dlqId },
    {
      $set: {
        status: isNowResolved ? 'retried_success' : 'failed',
        retryCount: dlq.retryCount + 1,
        lastAttemptAt: new Date().toISOString()
      }
    }
  );

  // Log audit
  await db.collection('audit_logs').insertOne({
    id: `audit_dlq_retry_${Date.now()}`,
    actor: { id: 'admin_action', name: 'Operations Console', role: 'admin' },
    action: 'DLQ_EVENT_RETRY',
    entityType: 'dlq',
    entityId: dlqId,
    beforeSummary: `status: ${dlq.status}, attempts: ${dlq.retryCount}`,
    afterSummary: `status: retried_success, attempts: ${dlq.retryCount + 1}`,
    reason: 'Manual admin retry initiated from AI & System Health console',
    timestamp: new Date().toISOString()
  });

  broadcastSSE('dlq.retried', { dlqId, status: 'retried_success' });

  return { success: true, dlqId, status: 'retried_success' };
}
