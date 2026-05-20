import { NextRequest } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { Signals } from '@snowplow/signals-node';
import { buildSystemPrompt } from '@/src/lib/chat';
import type { UserAttributes } from '@/src/lib/recommendations';

const anthropic = new Anthropic();

async function fetchSignalsAttributes(sessionId: string): Promise<UserAttributes | null> {
  try {
    const baseUrl = process.env.SIGNALS_API_URL;
    const apiKey = process.env.SNOWPLOW_CONSOLE_API_KEY;
    const apiKeyId = process.env.SNOWPLOW_CONSOLE_API_KEY_ID;
    const organizationId = process.env.SNOWPLOW_CONSOLE_ORG_ID;

    if (!baseUrl || !apiKey || !apiKeyId || !organizationId) {
      console.error('[Chat] Signals environment variables are not configured. Required: SIGNALS_API_URL, SNOWPLOW_CONSOLE_API_KEY, SNOWPLOW_CONSOLE_API_KEY_ID, SNOWPLOW_CONSOLE_ORG_ID');
      return null;
    }

    const signals = new Signals({
      baseUrl,
      apiKey,
      apiKeyId,
      organizationId,
    });

    const attributes = await signals.getServiceAttributes({
      name: "media_publishing_demo",
      attribute_key: "domain_sessionid",
      identifier: sessionId,
    });

    console.log('[Chat] Raw Signals response:', JSON.stringify(attributes, null, 2));

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
      model: 'claude-opus-4-6',
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
