# Snowplow Tracking Implementation

This application uses Snowplow Browser Tracker for analytics tracking, following the [official Snowplow documentation](https://docs.snowplow.io/docs/sources/trackers/javascript-trackers/web-tracker/quick-start-guide/?platform=browser).

## Implementation Overview

The Snowplow tracking is centralized in the following files:

- `lib/snowplow-config.ts` - Core Snowplow configuration and initialization
- `app/components/snowplow-provider.tsx` - Client-side provider component
- `app/hooks/use-snowplow-tracking.ts` - Custom hook for route change tracking
- `app/layout.tsx` - Integration point for the entire application

## Current Configuration

### Activity Tracking

Page ping events are automatically enabled:

```typescript
enableActivityTracking({
  minimumVisitLength: 20,
  heartbeatDelay: 10
});
```

## Current OOTB Tracking

- **Page Views**: Automatically tracked on initial load and route changes
- **Activity Tracking**: Enabled with 20-second minimum visit length and 10-second heartbeat
- **Web Page Context**: Automatically attached to all events

## Architecture

### 1. Initialization (`lib/snowplow.ts`)

- `initializeSnowplow()` - Sets up the tracker with configuration
- `trackPageViewEvent()` - Manually trigger page view tracking
- `initializeSnowplowOnly()` - Initialize tracker without page view (prevents duplicates)

### 2. Provider Component (`app/components/snowplow-provider.tsx`)

- Wraps the entire application
- Initializes Snowplow on mount
- Integrates with route change tracking

### 3. Route Tracking (`app/hooks/use-snowplow-tracking.ts`)

- Uses Next.js `usePathname()` hook
- Automatically tracks page views on route changes
- Handles both initial page view and navigation events

## Consent Management Architecture

### File Structure
- **`lib/consent.ts`**: Consent utilities and state management
- **`lib/snowplow.ts`**: Snowplow tracking and Enhanced Consent Plugin integration
- **`app/components/consent-manager.tsx`**: UI component for consent management
- **`types/global.d.ts`**: Global TypeScript declarations for Snowplow

### Consent Utilities (`lib/consent.ts`)
```typescript
// Core consent interface
interface ConsentPreferences {
  necessary: boolean
  analytics: boolean
  marketing: boolean
  preferences: boolean
}

// Utility functions
hasAnalyticsConsent(): boolean
hasMarketingConsent(): boolean
getConsentPreferences(): ConsentPreferences | null
saveConsentPreferences(preferences: ConsentPreferences): void
hasConsentBeenGiven(): boolean
clearConsentData(): void
```

### Snowplow Enhanced Consent Plugin (`lib/snowplow.ts`)
```typescript
// Consent event tracking functions
trackConsentAllowEvent(consentScopes: string[])
trackConsentDenyEvent(consentScopes: string[])
trackConsentSelectedEvent(consentScopes: string[])
trackConsentWithdrawnEvent(consentScopes: string[])
trackCmpVisibleEvent()
```

### Consent Event Tracking
- **Schema**: Uses Snowplow's official Enhanced Consent Plugin schemas
- **Events**: 
  - `consent_allow` - When user accepts all cookies
  - `consent_deny` - When user rejects non-necessary cookies
  - `consent_selected` - When user saves custom preferences
  - `consent_withdrawn` - When user withdraws consent
  - `cmp_visible` - When consent banner becomes visible
- **Data**: Includes consent scopes, basis for processing, consent URL, version, domains, and GDPR applicability

### Consent-Aware Tracking Pattern
```typescript
// ✅ Good - Checking consent before tracking
import { hasAnalyticsConsent } from '@/lib/consent'

const handleUserAction = () => {
  if (hasAnalyticsConsent()) {
    // Track user action
    trackSelfDescribingEvent({
      event: {
        schema: 'iglu:com.example/event/jsonschema/1-0-0',
        data: { action: 'user_clicked_button' }
      }
    })
  }
}
```

### Consent Management Integration
```tsx
// ✅ Good - Using consent utilities
import { getConsentPreferences, saveConsentPreferences } from '@/lib/consent'
import { trackConsentAllowEvent } from '@/lib/snowplow-config'

const handleAcceptAll = () => {
  const preferences = {
    necessary: true,
    analytics: true,
    marketing: true,
    preferences: true
  }
  
  saveConsentPreferences(preferences)
  trackConsentAllowEvent(['necessary', 'analytics', 'marketing', 'preferences'])
}
```

## Usage

### Manual Page View Tracking

If you need to manually track a page view:

```tsx
import { trackPageViewEvent } from '@/lib/snowplow-config';

// Track a page view
trackPageViewEvent();
```

### Initializing Tracker Manually

If you need to initialize the tracker manually:

```tsx
import { initializeSnowplow } from '@/lib/snowplow-config';

// Initialize tracker
initializeSnowplow();
```

## Adding Custom Tracking

Custom tracking can be added in 2 ways:
1 - Generate tracking specifications using Snowtype, which creates custom tracking calls which can be found in '@/snowtype/snowplow.ts' along with implementation instrustions in '@/snowtype/instrucitons.md':

```tsx
import { trackCustomEventSpec, createCustomEntity } from '@/snowtype/snowplow';

// Example: Track a custom Snowtype Event
trackCustomEventSpec({
  eventproperty1: 123,
  eventproperty2: 'A String', 
  context: [createCustomEntity({
    entityproperty1: true
    entityproperty2: 'Another String'
  })]
});
```
2 - Track custom events manually using trackSelfDescribingEvent, imported from `@snowplow/browser-tracker`:

```tsx
import { trackSelfDescribingEvent } from '@snowplow/browser-tracker';

// Track a custom self-describing event
trackSelfDescribingEvent({
  event: {
    schema: 'iglu:com.example/event/jsonschema/1-0-0',
    data: {
      // Your event data
    }
  }
});
```

## Troubleshooting

### Common Issues

1. **Connection Refused Errors**: Ensure you have a Snowplow collector running on `http://localhost:9090`
2. **Duplicate Page Views**: Fixed by separating initialization from page view tracking
3. **No Events in Inspector**: Check browser console for success/failure messages

### Debug Information

The implementation includes console logging for debugging:
- `"Snowplow tracker initialized"` - Tracker setup complete
- `"Page view tracked"` - Page view event sent
- `"Snowplow request successful"` - Event successfully sent to collector
- `"Snowplow request failed"` - Event failed to send (check collector)

## Dependencies

- `@snowplow/browser-tracker` - Core Snowplow tracking library

## Notes

- The implementation follows Next.js best practices with client-side components
- Route changes are automatically tracked using Next.js navigation hooks
- Activity tracking is enabled by default for better user engagement insights
- All tracking is centralized for easy maintenance and updates
- Duplicate page view prevention is built into the architecture
- Tracker initialization dynamically changes based on consent preferences
- Enhanced Consent Plugin provides granular consent tracking capabilities 