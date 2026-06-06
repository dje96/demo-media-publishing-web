import { NextRequest, NextResponse } from 'next/server';
import { Signals } from '@snowplow/signals-node';

// Service + attribute key the demo reads from. Surfaced in the `meta` block so
// the Signals Inspector can display them and confirm wiring at a glance.
const SIGNALS_SERVICE = 'media_publishing_demo';
const SIGNALS_ATTRIBUTE_KEY = 'domain_sessionid';

export async function POST(request: NextRequest) {
  try {
    const { sessionId } = await request.json();

    if (!sessionId) {
      return NextResponse.json(
        { error: 'Session ID is required' },
        { status: 400 }
      );
    }

    const baseUrl = process.env.SIGNALS_API_URL;
    const apiKey = process.env.SNOWPLOW_CONSOLE_API_KEY;
    const apiKeyId = process.env.SNOWPLOW_CONSOLE_API_KEY_ID;
    const organizationId = process.env.SNOWPLOW_CONSOLE_ORG_ID;

    if (!baseUrl || !apiKey || !apiKeyId || !organizationId) {
      return NextResponse.json(
        {
          success: false,
          error: 'Signals environment variables are not configured. Required: SIGNALS_API_URL, SNOWPLOW_CONSOLE_API_KEY, SNOWPLOW_CONSOLE_API_KEY_ID, SNOWPLOW_CONSOLE_ORG_ID',
          attributes: null,
          meta: {
            signals_configured: false,
            service: SIGNALS_SERVICE,
            attribute_key: SIGNALS_ATTRIBUTE_KEY,
            synced_at: new Date().toISOString(),
          },
        },
        { status: 500 }
      );
    }

    const signals = new Signals({
      baseUrl,
      apiKey,
      apiKeyId,
      organizationId,
    });

    // Get user attributes from Signals
    const calculatedValues = await signals.getServiceAttributes({
      name: SIGNALS_SERVICE,
      attribute_key: SIGNALS_ATTRIBUTE_KEY,
      identifier: sessionId,
    });

    return NextResponse.json({
      success: true,
      attributes: calculatedValues,
      // The meta block lets the Signals Inspector show wiring state + a
      // "synced Ns ago" badge without inferring it from the attributes.
      meta: {
        signals_configured: true,
        service: SIGNALS_SERVICE,
        attribute_key: SIGNALS_ATTRIBUTE_KEY,
        synced_at: new Date().toISOString(),
      },
    });

  } catch (error) {
    console.error('Error in Signals API route:', error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        attributes: null,
        meta: {
          signals_configured: true,
          service: SIGNALS_SERVICE,
          attribute_key: SIGNALS_ATTRIBUTE_KEY,
          synced_at: new Date().toISOString(),
        },
      },
      { status: 500 }
    );
  }
}
