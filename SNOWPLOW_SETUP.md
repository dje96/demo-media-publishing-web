# Snowplow Tracking Implementation

This application uses Snowplow Browser Tracker for analytics tracking, following the [official Snowplow documentation](https://docs.snowplow.io/docs/sources/trackers/javascript-trackers/web-tracker/quick-start-guide/?platform=browser).

## Implementation Overview

The Snowplow tracking is centralized in the following files:

- `lib/snowplow.ts` - Core Snowplow configuration and initialization
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

## Current Tracking

- **Page Views**: Automatically tracked on initial load and route changes
- **Activity Tracking**: Enabled with 20-second minimum visit length and 10-second heartbeat
- **Web Page Context**: Automatically attached to all events
- **Request Callbacks**: Success and failure logging for debugging

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

## Usage

### Manual Page View Tracking

If you need to manually track a page view:

```tsx
import { trackPageViewEvent } from '@/lib/snowplow';

// Track a page view
trackPageViewEvent();
```

### Initializing Tracker Manually

If you need to initialize the tracker manually:

```tsx
import { initializeSnowplow } from '@/lib/snowplow';

// Initialize tracker
initializeSnowplow();
```

## Adding Custom Tracking

To add custom event tracking, import the necessary functions from `@snowplow/browser-tracker` and use them in your components:

```tsx
import { trackSelfDescribingEvent } from '@snowplow/browser-tracker';

// Track a custom event
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

### Testing with Public Collector

For testing without a local collector, change the URL in `lib/snowplow.ts`:

```typescript
newTracker('sp1', 'https://com-snplow-sales-aws-prod1.mini.snplow.net', {
  // ... rest of config
});
```

## Dependencies

- `@snowplow/browser-tracker` - Core Snowplow tracking library

## Notes

- The implementation follows Next.js best practices with client-side components
- Route changes are automatically tracked using Next.js navigation hooks
- Activity tracking is enabled by default for better user engagement insights
- All tracking is centralized for easy maintenance and updates
- Duplicate page view prevention is built into the architecture 