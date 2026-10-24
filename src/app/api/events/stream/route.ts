import { registerSSEListener } from '@/lib/event-bus';

export async function GET() {
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    start(controller) {
      // Send initial handshake
      controller.enqueue(encoder.encode(`event: connected\ndata: {"status":"connected","timestamp":"${new Date().toISOString()}"}\n\n`));

      const unregister = registerSSEListener((message) => {
        try {
          controller.enqueue(encoder.encode(message));
        } catch {
          unregister();
        }
      });

      // Keepalive heartbeat ping every 25 seconds
      const interval = setInterval(() => {
        try {
          controller.enqueue(encoder.encode(`: ping\n\n`));
        } catch {
          clearInterval(interval);
          unregister();
        }
      }, 25000);

      // Clean up on close
      return () => {
        clearInterval(interval);
        unregister();
      };
    }
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive',
      'X-Accel-Buffering': 'no'
    }
  });
}
