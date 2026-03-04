'use client';

import { useEffect } from 'react';
import { initializeSnowplowOnly, enableCrossDomainLinking } from '@/src/lib/snowplow-config';
import { useSnowplowTracking } from '@/src/hooks/use-snowplow-tracking';
import { testSignalsOnPageLoad } from '@/src/lib/recommendations';

interface SnowplowProviderProps {
  children: React.ReactNode;
}

export default function SnowplowProvider({ 
  children 
}: SnowplowProviderProps) {
  // Initialize Snowplow on mount (no page view tracking)
  useEffect(() => {
    initializeSnowplowOnly();
    // Enable cross-domain linking after initialization
    enableCrossDomainLinking();
    
    // Test Signals connection on page load
    testSignalsOnPageLoad();
  }, []);

  // Track page views on route changes (including initial page view)
  useSnowplowTracking();

  return <>{children}</>;
} 