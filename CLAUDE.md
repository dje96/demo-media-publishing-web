# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What This Is

A media publishing demo site ("The Daily Query") built to showcase Snowplow browser tracking implementation for media & publishing use cases. It's a Next.js 15 app with comprehensive Snowplow instrumentation including page views, link clicks, form tracking, consent management, media/video tracking, and Snowplow Signals for real-time personalization.

## Commands

- `npm run dev` — Start dev server with Turbopack (port 3000)
- `npm run build` — Production build
- `npm run lint` — ESLint
- `npx @snowplow/snowtype generate` — Regenerate Snowtype tracking code from Snowplow Console data products (requires `SNOWPLOW_CONSOLE_API_KEY` and `SNOWPLOW_CONSOLE_API_KEY_ID` in `.env`)

## Architecture

### Tracking Layer (the core purpose of this repo)

The tracking architecture has three layers:

1. **`src/lib/snowplow-config.ts`** — Tracker initialization and out-of-the-box plugin setup (link clicks, forms, consent, media, Signals). Also handles anonymous tracking mode based on consent state and cross-domain linking to snowplow.io.

2. **`src/lib/business-events.ts`** — Custom business event tracking functions (article views, search, newsletter signups, ad clicks/impressions, subscription flow steps). All custom events use Snowtype-generated types/functions from `snowtype/snowplow.ts`.

3. **`snowtype/snowplow.ts`** — Auto-generated file from Snowplow Console data products via Snowtype. **Do not edit manually** — regenerate with `npx @snowplow/snowtype generate`. Config is in `snowtype.config.ts`.

### Tracking Initialization Flow

`app/layout.tsx` → `SnowplowProvider` (client component) → calls `initializeSnowplowOnly()` on mount → `useSnowplowTracking()` hook tracks page views on route changes via `usePathname()`. Signals subscription connects after the first page view so domain_userid/domain_sessionid are available.

### Consent & Anonymous Tracking

`src/lib/consent.ts` manages consent state in localStorage. When analytics consent is not given, anonymous tracking with server anonymization is enabled. The `consent-manager` component handles the UI and fires Enhanced Consent Plugin events.

### Signals Integration

- **Browser**: `@snowplow/signals-browser-plugin` subscribes to interventions (paywall handler) via `addInterventionHandlers` / `subscribeToInterventions`
- **Server**: `app/api/signals/route.ts` — API route that queries Signals service attributes using `@snowplow/signals-node` for server-side personalization (homepage recommendations)
- **Personalization**: `src/lib/recommendations.ts` handles fetching and applying Signals data

### Site Configuration

`src/lib/config.ts` is the central config for all site content and behavior: brand settings, navigation, categories, article data structure, advertising inventory, and UTM parameter definitions. Article data lives in `src/lib/data.ts`.

### Page Structure

Uses Next.js App Router. Pages that need client interactivity use a `page.tsx` (server) + `*-client.tsx` (client component) pattern (e.g., `app/articles/[slug]/page.tsx` + `article-page-client.tsx`).

### Styling

Tailwind CSS v4 with a custom design system defined in `src/lib/design-system.ts` and documented in `DESIGN_SYSTEM.md`. Uses `class-variance-authority` for component variants.

## Collector Endpoints

The tracker points to the Snowplow Sales prod collector. Comments in `snowplow-config.ts` list alternatives (localhost:9090 for local, Mini endpoint for staging). Change the collector URL in `newTracker()` call.
