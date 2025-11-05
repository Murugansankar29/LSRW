export const config = { runtime: 'edge' } as const;

// Simple utility types
interface ClientMsg {
  type: string;
  [key: string]: any;
}

const QUESTIONS = [
  'Introduce yourself in one minute.',
  'Describe a challenging project you worked on.',
  'Explain a technical concept to a non-technical audience.',
  'Talk about a time you resolved a team conflict.',
  'What motivates you as an engineer?'
];

function evaluate(text: string) {
  const score = +(Math.random() * 10).toFixed(1);
  const feedback =
    score > 8 ? 'Excellent clarity and pacing.'
    : score > 6 ? 'Good pronunciation. Slightly improve pacing.'
    : score > 4 ? 'Understandable, but work on articulation.'
    : 'Try again, speak a bit more clearly and steadily.';
  return { score, feedback };
}

function sendJSON(ws: WebSocket, obj: unknown) {
  try { ws.send(JSON.stringify(obj)); } catch { /* no-op */ }
}

export default async function handler(req: Request): Promise<Response> {
  if (req.headers.get('upgrade') !== 'websocket') {
    return new Response('Expected a WebSocket upgrade', { status: 400 });
  }

  const pair = new (globalThis as any).WebSocketPair();
  const client: WebSocket = pair[0];
  const server: WebSocket = pair[1];

  // @ts-ignore - Edge runtime specific
  server.accept();

  // Initial greetings
  queueMicrotask(() => {
    sendJSON(server, { type: 'welcome', text: 'Connected to Communication Round WS' });
    sendJSON(server, { type: 'question', text: QUESTIONS[0], index: 0 });
  });

  server.addEventListener('message', (event: MessageEvent) => {
    let msg: ClientMsg | null = null;
    try { msg = JSON.parse(String((event as any).data)); } catch { /* ignore */ }
    if (!msg) return;

    if (msg.type === 'asr' && typeof msg.text === 'string') {
      const { mode, text, questionIndex = 0 } = msg;

      if (mode === 'partial') {
        if (String(text).trim().length > 0) {
          sendJSON(server, { type: 'feedback', text: 'Heard you...', score: null, partial: true });
        }
        return;
      }

      if (mode === 'final') {
        const { score, feedback } = evaluate(String(text));
        sendJSON(server, { type: 'feedback', text: feedback, score, partial: false });
        const nextIndex = Number(questionIndex) + 1;
        if (nextIndex < QUESTIONS.length) {
          sendJSON(server, { type: 'question', text: QUESTIONS[nextIndex], index: nextIndex });
        } else {
          sendJSON(server, { type: 'complete', text: 'Communication round finished. Great job!' });
        }
      }
    }
  });

  server.addEventListener('close', () => {
    // no-op: Edge runtime will clean up
  });
  server.addEventListener('error', () => {
    // ignore
  });

  return new Response(null, { status: 101, webSocket: client } as any);
}
