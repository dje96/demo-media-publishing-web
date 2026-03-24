import { NextRequest } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { Signals } from '@snowplow/signals-node';
import { buildSystemPrompt } from '@/src/lib/chat';
import type { UserAttributes } from '@/src/lib/recommendations';

const anthropic = new Anthropic();

async function fetchSignalsAttributes(sessionId: string): Promise<UserAttributes | null> {
  try {
    const signals = new Signals({
      baseUrl: "https://7f9742b834d7.signals.snowplowanalytics.com",
      apiKey: "082ca381-b837-4f05-b0f2-dfee2facce37",
      apiKeyId: "ea95fd6e-a906-4f4c-9560-3d4eb86d9ed0",
      organizationId: "b12539df-a711-42bd-bdfa-175308c55fd5",
    });

    const attributes = await signals.getServiceAttributes({
      name: "media_publishing_demo",
      attribute_key: "domain_sessionid",
      identifier: sessionId,
    });

    return attributes as UserAttributes;
  } catch (error) {
    console.error('Failed to fetch Signals attributes:', error);
    return null;
  }
}

export async function POST(request: NextRequest) {
  try {
    const { messages, sessionId, currentPage, signalsEnabled } = await request.json();

    if (!messages || !Array.isArray(messages)) {
      return Response.json({ error: 'messages array is required' }, { status: 400 });
    }

    // Fetch Signals attributes only if Signals is enabled
    const attributes = signalsEnabled !== false && sessionId
      ? await fetchSignalsAttributes(sessionId)
      : null;

    const systemPrompt = buildSystemPrompt(attributes, currentPage || '');

    // Stream the response from Claude
    const stream = anthropic.messages.stream({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 1024,
      system: systemPrompt,
      messages: messages.map((m: { role: string; content: string }) => ({
        role: m.role as 'user' | 'assistant',
        content: m.content,
      })),
    });

    const encoder = new TextEncoder();

    const readableStream = new ReadableStream({
      async start(controller) {
        try {
          for await (const event of stream) {
            if (
              event.type === 'content_block_delta' &&
              event.delta.type === 'text_delta'
            ) {
              const data = JSON.stringify({ type: 'text_delta', text: event.delta.text });
              controller.enqueue(encoder.encode(`data: ${data}\n\n`));
            }
          }
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'done' })}\n\n`));
          controller.close();
        } catch (error) {
          console.error('Streaming error:', error);
          const errorData = JSON.stringify({ type: 'error', message: 'Stream interrupted' });
          controller.enqueue(encoder.encode(`data: ${errorData}\n\n`));
          controller.close();
        }
      },
    });

    return new Response(readableStream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
      },
    });
  } catch (error) {
    console.error('Chat API error:', error);
    return Response.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
