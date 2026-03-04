import { NextRequest, NextResponse } from 'next/server';
import { Signals } from '@snowplow/signals-node';

export async function POST(request: NextRequest) {
  try {
    const { sessionId } = await request.json();

    if (!sessionId) {
      return NextResponse.json(
        { error: 'Session ID is required' },
        { status: 400 }
      );
    }

    // Create Signals client
    const signals = new Signals({
      baseUrl: "https://7f9742b834d7.signals.snowplowanalytics.com",
      apiKey: "082ca381-b837-4f05-b0f2-dfee2facce37",
      apiKeyId: "ea95fd6e-a906-4f4c-9560-3d4eb86d9ed0",
      organizationId: "b12539df-a711-42bd-bdfa-175308c55fd5",
    });

    // Get user attributes from Signals
    const calculatedValues = await signals.getServiceAttributes({
      name: "media_publishing_demo",
      attribute_key: "domain_sessionid",
      identifier: sessionId,
    });

    return NextResponse.json({
      success: true,
      attributes: calculatedValues
    });

  } catch (error) {
    console.error('Error in Signals API route:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error',
        attributes: null
      },
      { status: 500 }
    );
  }
}
