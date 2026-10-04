import Groq from 'groq-sdk';
import { clientIp, crossOrigin, rateLimited } from '@/lib/guard';
import { ASK_SYSTEM_PROMPT } from '@/lib/assistant';

let groq;

const MAX_TURNS = 10;
const MAX_CHARS = 1200;

const json = (body, status) => Response.json(body, { status, headers: { 'Cache-Control': 'no-store' } });

function cleanHistory(raw) {
  if (!Array.isArray(raw)) return null;
  const turns = raw
    .filter((m) => m && (m.role === 'user' || m.role === 'assistant') && typeof m.content === 'string' && m.content.trim())
    .slice(-MAX_TURNS)
    .map((m) => ({ role: m.role, content: m.content.replace(/\[\[[\s\S]*?\]\]/g, '').trim().slice(0, MAX_CHARS) }));
  if (!turns.length || turns[turns.length - 1].role !== 'user') return null;
  return turns;
}

export async function POST(req) {
  if (!process.env.GROQ_API_KEY) {
    console.error('Ask API: GROQ_API_KEY is not set');
    return json({ error: 'My AI brain isn’t configured on this server yet — but I can still point you around the page.' }, 503);
  }
  if (crossOrigin(req)) return json({ error: 'Forbidden' }, 403);
  if (rateLimited(`chat:${clientIp(req)}`, 20, 10 * 60 * 1000)) {
    return json({ error: 'You’re asking faster than I can think — give me a minute and try again.' }, 429);
  }

  let history;
  try {
    history = cleanHistory((await req.json()).messages);
  } catch {
    history = null;
  }
  if (!history) return json({ error: 'Ask me something about Anshveer!' }, 400);

  groq ??= new Groq({ apiKey: process.env.GROQ_API_KEY });

  let completion;
  try {
    completion = await groq.chat.completions.create(
      {
        model: 'openai/gpt-oss-120b',
        messages: [{ role: 'system', content: ASK_SYSTEM_PROMPT }, ...history],
        temperature: 0.3,
        max_completion_tokens: 700,
        reasoning_effort: 'low',
        stream: true,
      },
      { signal: req.signal }
    );
  } catch (error) {
    console.error('Ask API error:', error?.message ?? error);
    return json({ error: 'I’m having trouble thinking right now — please try again in a moment.' }, 502);
  }

  const encoder = new TextEncoder();
  const body = new ReadableStream({
    async start(controller) {
      try {
        for await (const chunk of completion) {
          const text = chunk.choices?.[0]?.delta?.content;
          if (text) controller.enqueue(encoder.encode(text));
        }
      } catch (error) {
        if (!req.signal.aborted) {
          console.error('Ask API stream error:', error?.message ?? error);
          controller.enqueue(encoder.encode('\n[[error]]'));
        }
      } finally {
        controller.close();
      }
    },
    cancel() {
      completion.controller?.abort();
    },
  });

  return new Response(body, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'no-store, no-transform', 'X-Accel-Buffering': 'no' },
  });
}
