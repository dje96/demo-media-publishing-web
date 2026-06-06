# Snowplow Signals — Implementation Guide

A reference for wiring Snowplow Signals into a demo app, distilled from the
six apps in `apps/` (`media`, `gaming`, `ecommerce`, `fintech`, `jobs`, `saas`).
Use it to keep new apps aligned with the existing pattern, and as the blueprint
for building your own **Signals Inspector** panel.

---

## 1. The mental model

Signals does two things. Every app uses one or both:

| Capability | Direction | How it works | SDK |
|---|---|---|---|
| **Attributes** | Pull | You ask Signals for the computed attributes of a profile (keyed by session or user). | `@snowplow/signals-node` (server) |
| **Interventions** | Push | Signals decides a rule fired and pushes an event to the browser; you subscribe and react. | `@snowplow/signals-browser-plugin` (browser) |

Both are backed by the same thing: an **attribute group** (rolling counts/lists
computed from the event stream) exposed through a **service**, with
**interventions** layered on top as threshold rules.

```
Browser events ──▶ Collector ──▶ Signals attribute engine
                                      │
                  ┌───────────────────┼────────────────────┐
                  ▼                                          ▼
       Attributes (PULL)                          Interventions (PUSH)
   server: getServiceAttributes()          browser: subscribeToInterventions()
   ↳ your /api/signals route               ↳ addInterventionHandlers({...})
   ↳ panel polls it every 4–5s             ↳ writes sessionStorage + CustomEvent
                                           ↳ UI component renders the popup
```

A core idea worth copying: **interventions are dual-path**. The push path
(Signals → browser plugin) is the "real" one, but every demo also re-derives
eligibility from the polled attributes so the demo still works reliably on
stage even if a live intervention is slow. See §5.3.

---

## 2. Naming conventions (must match across Console + code)

From the monorepo `CLAUDE.md`. Handler keys in `addInterventionHandlers` **must
exactly equal** the intervention name configured in Signals.

| Resource | Pattern | Example |
|---|---|---|
| App ID | `demo_{industry}_web` | `demo_media_web` |
| Signals service | `demo_{industry}` | `demo_media` |
| Attribute group | `demo_{industry}_session` | `demo_media_session` |
| Intervention | `demo_{industry}_{recipe}` | `demo_media_paywall` |

Attribute keys in use: `domain_sessionid` (anonymous, session-scoped — the
default) and `user_id` (identity-scoped, used by `saas` once a user signs in).

---

## 3. Environment & credentials

Signals reuses the **Console API** credentials. The apps read them with legacy
aliases as fallback:

```ts
const apiKey   = process.env.SNOWPLOW_CONSOLE_API_KEY    || process.env.SIGNALS_API_KEY    || "";
const apiKeyId = process.env.SNOWPLOW_CONSOLE_API_KEY_ID || process.env.SIGNALS_API_KEY_ID || "";
const orgId    = process.env.SIGNALS_ORG_ID || "";
```

| Variable | Scope | Used by |
|---|---|---|
| `SNOWPLOW_CONSOLE_API_KEY` / `_ID` | **server only** | API route → `getServiceAttributes` |
| `SIGNALS_ORG_ID` | server only | API route |
| `SIGNALS_API_URL` | server | `Signals({ baseUrl })` — defaults to the Sales Signals host |
| `NEXT_PUBLIC_SIGNALS_API_URL` | **browser** | `subscribeToInterventions({ endpoint })` |

> The Signals host across all demos defaults to
> `https://7f9742b834d7.signals.snowplowanalytics.com`. Never put API keys in a
> `NEXT_PUBLIC_*` variable — the browser side only needs the endpoint URL.

---

## 4. Attribute retrieval (the PULL side)

### 4.1 Server route — `app/api/signals/route.ts`

Keys stay server-side; the browser only ever sends a `sessionId`/`userId`.
This is the canonical single-key version (media/gaming/ecommerce/jobs):

```ts
import { NextRequest, NextResponse } from "next/server";
import { Signals } from "@snowplow/signals-node";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const { sessionId } = await request.json();
    if (!sessionId) {
      return NextResponse.json({ error: "Session ID is required" }, { status: 400 });
    }

    const signals = new Signals({
      baseUrl: process.env.SIGNALS_API_URL || "https://7f9742b834d7.signals.snowplowanalytics.com",
      apiKey: process.env.SNOWPLOW_CONSOLE_API_KEY || process.env.SIGNALS_API_KEY || "",
      apiKeyId: process.env.SNOWPLOW_CONSOLE_API_KEY_ID || process.env.SIGNALS_API_KEY_ID || "",
      organizationId: process.env.SIGNALS_ORG_ID || "",
    });

    const attributes = await signals.getServiceAttributes({
      name: "demo_{industry}",          // the SERVICE name
      attribute_key: "domain_sessionid",
      identifier: sessionId,
    });

    return NextResponse.json({ success: true, attributes });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Unknown error", attributes: null },
      { status: 500 },
    );
  }
}
```

**Rules to copy:**
- Always return `{ success, attributes }` and **never throw to the client** — on
  error return `success: false` so the UI degrades to defaults.
- Guard on missing credentials rather than constructing `Signals` blindly (the
  `saas` route wraps the whole thing in `if (apiKey && apiKeyId && orgId)`).

### 4.2 Identity + session + batch (the `saas` extension)

When you have a logged-in user and want "warehouse-style" enrichment, fetch
**two keys** and merge, then attach simulated batch attributes:

```ts
// identity first (richer), session as fallback
if (userId)    identityAttributes = await signals.getServiceAttributes({ name: "demo_saas", attribute_key: "user_id",          identifier: userId });
if (sessionId) sessionAttributes  = await signals.getServiceAttributes({ name: "demo_saas", attribute_key: "domain_sessionid", identifier: sessionId });

const liveAttributes = identityAttributes || sessionAttributes;

return NextResponse.json({
  success: true,
  attributes: liveAttributes,
  session_attributes: sessionAttributes,
  identity_attributes: identityAttributes,
  batch_attributes: account ? toBatch(account) : null,  // from a local "warehouse" lookup
  meta: {
    signals_configured: Boolean(apiKey && apiKeyId && orgId),
    recognized: Boolean(account),
    attribute_key: identityAttributes ? "user_id" : "domain_sessionid",
    synced_at: new Date().toISOString(),   // ← powers the "synced Ns ago" badge
  },
});
```

The `meta` block is what makes a good inspector — surface `attribute_key`,
`signals_configured`, and `synced_at` so the presenter can see the state at a glance.

### 4.3 Getting the session id in the browser — `recommendations.ts`

The client helper reads the live Snowplow session id, with a cookie fallback:

```ts
export function getSessionId(): string {
  if (typeof window === "undefined") return "default-session";
  try {
    if (window.snowplow) {
      const sid = window.snowplow("getSessionId") as string | undefined;
      if (sid) return sid;
    }
  } catch { /* fall through to cookie */ }

  // Fallback: parse the _sp_id cookie (session id is part index 5)
  for (const cookie of document.cookie.split(";")) {
    const [name, value] = cookie.trim().split("=");
    if (name.startsWith("_sp_id") || name === "sp") {
      const parts = value.split(".");
      if (parts.length >= 6) return parts[5];
    }
  }
  return "";
}

export async function getUserAttributesFromSignals(sessionId: string) {
  const res = await fetch("/api/signals", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ sessionId }),
  });
  const data = await res.json();
  return data.success ? data.attributes : null;
}
```

### 4.4 Using attributes for personalization

Attributes are just data — score against them client-side. Media's recommender
ranks articles by `last_category_viewed` / `last_author_viewed` affinity +
`category_heartbeats` engagement, and **always falls back** to a default list
(`strategy: 'fallback'`) if Signals is off, the session id is missing, or no
attributes come back. Mirror that fallback discipline in any app.

---

## 5. Interventions (the PUSH side)

### 5.1 Subscribe + handlers — in `snowplow-config.ts` / `snowplow.ts`

```ts
import {
  addInterventionHandlers,
  subscribeToInterventions,
} from "@snowplow/signals-browser-plugin";

function setupSignalsInterventions() {
  // Handler key MUST equal the intervention name in Signals
  addInterventionHandlers({
    demo_{industry}_{recipe}(intervention) {
      if (intervention.name !== "demo_{industry}_{recipe}") return;
      if (!isSignalsEnabled()) return;            // respect the consent / demo toggle
      dispatchIntervention(intervention);
    },
  });

  subscribeToInterventions({
    endpoint: process.env.NEXT_PUBLIC_SIGNALS_API_URL
      || "https://7f9742b834d7.signals.snowplowanalytics.com",
  });
}
```

Call `setupSignalsInterventions()` from your tracker init, **after**
`newTracker()` and after the first page view (so `domain_sessionid` exists).

### 5.2 The sessionStorage + CustomEvent contract

Every handler does the same two things so any component can react without
prop-drilling:

```ts
function dispatchIntervention(intervention: unknown) {
  if (typeof window === "undefined") return;
  sessionStorage.setItem("{industry}-{recipe}", JSON.stringify({
    triggered: true, timestamp: Date.now(), intervention,
  }));
  window.dispatchEvent(new CustomEvent("{recipe}Triggered", { detail: { intervention } }));
}
```

Plus the read/clear helpers used by popups and the inspector:

```ts
export function has{Recipe}Triggered(): boolean {
  if (typeof window === "undefined" || !isSignalsEnabled()) return false;
  const stored = sessionStorage.getItem("{industry}-{recipe}");
  return stored ? JSON.parse(stored).triggered === true : false;
}

export function clear{Recipe}Intervention() {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem("{industry}-{recipe}");
  window.dispatchEvent(new CustomEvent("{recipe}Cleared"));
}
```

| Concern | Mechanism |
|---|---|
| Persist across route changes | `sessionStorage` (survives navigation, resets per tab/session) |
| Notify live components | `window` `CustomEvent` (`*Triggered` / `*Cleared`) |
| "Already shown once" dedupe | check `sessionStorage` key before dispatching (`dispatchOnce` in saas) |

### 5.3 Dual-path triggering (push **or** pull) — the demo-reliability trick

Live interventions can lag on stage, so popups also derive eligibility from the
polled attributes. Fintech's popup checks **both** every 5s:

```ts
const maybeShow = async () => {
  if (hasRiskInterventionTriggered()) { show(); return; }      // PUSH path (real intervention)
  const attrs = await getUserAttributesFromSignals(getSessionId());
  if (isEligibleForRiskIntervention(attrs)) show();            // PULL path (recompute locally)
};
```

…where `isEligibleForRiskIntervention` re-implements the Signals threshold in
client code (e.g. `risk_signals_count >= 1 && application_step_count >= 1`).
**Keep these client thresholds in sync with the remote Signals recipe** — the
per-app `CLAUDE.md` files call this out explicitly.

### 5.4 The intervention UI component

Two shapes are in use:

- **Full-screen modal** (`fintech/risk-intervention-popup.tsx`): listens for the
  `*Triggered` event + polls; renders a `fixed inset-0` overlay; on
  accept/dismiss it tracks an interaction event, calls `clear{Recipe}Intervention()`,
  and sets a local `hasHandled` guard so it won't immediately re-open.
- **Inline banner / nudge** (`saas/intervention-layer.tsx`): a thin layer mounted
  in the app shell that flips `useState` flags on the events and renders banners,
  suppressed on form/app routes.

Always fire a tracking event on `view` / `accept` / `dismiss` so the
intervention's effectiveness is itself measurable.

---

## 6. The Signals Inspector panel

A floating, presenter-only panel pinned bottom-right. Anatomy shared by all apps:

1. **Floating toggle button** — `fixed bottom-6 right-6`, brand colour, pulses
   when an intervention fires (`saas`).
2. **Header** — title + a "live" status dot (animated ping when configured).
   `saas` adds a `synced Ns ago` readout from `meta.synced_at`.
3. **Live attributes section** — key/value rows straight from the Signals response.
4. **Intervention section** — per intervention: a **status badge**
   (`Waiting` → `Eligible` → `Fired`) and a checklist of **criteria with
   `value / target`** progress. `saas` adds a **"Trigger now (demo)"** button per
   intervention for stage control.
5. **Polling** — `setInterval` every **4–5s** while open (media polls only when
   open; saas polls always). Always `clearInterval` on cleanup.
6. **Event listeners** — subscribe to the same `*Triggered` / `*Cleared`
   CustomEvents to flip badges instantly.
7. **Empty / loading states** — skeleton while first fetch is in flight; "No data
   yet — go interact" empty state.
8. Footer: *"This panel is visible to demo presenters only."*

### 6.1 Drop-in reusable component

A generic, config-driven version that captures the best of all six. Customise
the `CONFIG` block and the attribute rows; everything else is reusable.

```tsx
// src/components/signals-inspector.tsx
"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Activity, Check, Play, Sparkles, Wifi, X } from "lucide-react";

/* ----------------------------------------------------------------------------
 * 1. CONFIGURE PER APP
 * ------------------------------------------------------------------------- */
const CONFIG = {
  brandColor: "#1B2A4A",      // floating button + header
  accentColor: "#00b6c9",     // live dot + progress
  pollMs: 4000,
  // How to get the Snowplow session id (reuse your recommendations.ts helper)
  getSessionId: (): string => {
    if (typeof window === "undefined") return "";
    try {
      const sid = window.snowplow?.("getSessionId") as string | undefined;
      if (sid) return sid;
    } catch { /* ignore */ }
    return "";
  },
};

type Attributes = Record<string, unknown>;

// Map raw attributes → labelled rows shown in the panel
function attributeRows(a: Attributes) {
  return [
    { label: "page_view_count",   value: String(a.page_view_count ?? 0) },
    { label: "unique_items",      value: String((a.unique_item_ids as unknown[])?.length ?? 0) },
    { label: "last_category",     value: String(a.last_category_viewed ?? "—") },
    { label: "heartbeats",        value: String(a.page_pings ?? 0) },
  ];
}

// Declare each intervention + its criteria. `value`/`target` drive the progress.
function interventions(a: Attributes, fired: Set<string>) {
  return [
    {
      key: "demo_industry_recipe",
      label: "Example intervention",
      action: "What this intervention does on screen",
      fired: fired.has("demo_industry_recipe"),
      criteria: [
        { label: "unique_items ≥ 2", value: (a.unique_item_ids as unknown[])?.length ?? 0, target: 2 },
        { label: "heartbeats ≥ 3",   value: Number(a.page_pings ?? 0),                      target: 3 },
      ],
    },
  ];
}

/* ----------------------------------------------------------------------------
 * 2. THE PANEL (reusable as-is)
 * ------------------------------------------------------------------------- */
export default function SignalsInspector() {
  const [open, setOpen] = useState(false);
  const [attrs, setAttrs] = useState<Attributes | null>(null);
  const [loading, setLoading] = useState(false);
  const [syncedAt, setSyncedAt] = useState<number | null>(null);
  const [pulse, setPulse] = useState(false);
  const firedRef = useRef<Set<string>>(new Set());

  const fetchAttributes = useCallback(async () => {
    const sessionId = CONFIG.getSessionId();
    if (!sessionId) return;
    try {
      setLoading(true);
      const res = await fetch("/api/signals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId }),
      });
      const data = await res.json();
      if (data.success && data.attributes) {
        setAttrs(data.attributes);
        setSyncedAt(Date.now());
      }
    } catch (e) {
      console.error("Signals fetch failed", e);
    } finally {
      setLoading(false);
    }
  }, []);

  // Poll while open
  useEffect(() => {
    if (!open) return;
    fetchAttributes();
    const id = setInterval(fetchAttributes, CONFIG.pollMs);
    return () => clearInterval(id);
  }, [open, fetchAttributes]);

  // Light up the button + record fired interventions from CustomEvents.
  // Convention: handlers dispatch `${name}Triggered`.
  useEffect(() => {
    const onTriggered = (e: Event) => {
      const name = (e as CustomEvent).detail?.intervention?.name ?? (e.type.replace(/Triggered$/, ""));
      firedRef.current.add(name);
      setPulse(true);
      setTimeout(() => setPulse(false), 1800);
    };
    // Listen broadly — register the specific event names your handlers dispatch:
    const names = ["demo_industry_recipeTriggered"];
    names.forEach((n) => window.addEventListener(n, onTriggered));
    return () => names.forEach((n) => window.removeEventListener(n, onTriggered));
  }, []);

  const hasData = attrs && Object.keys(attrs).length > 0;
  const rows = hasData ? attributeRows(attrs!) : [];
  const ivs = hasData ? interventions(attrs!, firedRef.current) : [];

  return (
    <>
      {open && (
        <div className="fixed bottom-24 right-6 z-40 flex max-h-[80vh] w-[calc(100vw-3rem)] flex-col overflow-hidden rounded-lg bg-white shadow-2xl ring-2 sm:w-96"
             style={{ ["--ring" as string]: `${CONFIG.brandColor}33` }}>
          {/* Header */}
          <div className="flex shrink-0 items-center justify-between px-4 py-3 text-white"
               style={{ backgroundColor: CONFIG.brandColor }}>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold">Signals Live</h3>
              <span className="relative flex h-2.5 w-2.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full opacity-75"
                      style={{ backgroundColor: CONFIG.accentColor }} />
                <span className="relative inline-flex h-2.5 w-2.5 rounded-full"
                      style={{ backgroundColor: CONFIG.accentColor }} />
              </span>
            </div>
            <div className="flex items-center gap-2 text-[10px] text-white/70">
              <Wifi size={12} />
              {syncedAt ? `synced ${Math.round((Date.now() - syncedAt) / 1000)}s ago` : "syncing…"}
              <button onClick={() => setOpen(false)} className="ml-2 p-0.5 text-white/80 hover:text-white" aria-label="Close">
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Body */}
          <div className="flex-1 space-y-5 overflow-y-auto p-4 text-sm">
            {loading && !hasData ? (
              <div className="space-y-3 animate-pulse">
                {Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-4 rounded bg-gray-100" />)}
              </div>
            ) : !hasData ? (
              <div className="flex flex-col items-center py-8 text-gray-400">
                <Activity className="mb-3 h-10 w-10 opacity-50" />
                <p className="font-medium text-gray-500">No data yet</p>
                <p className="mt-1 text-center text-xs">Interact with the site and Signals data will appear.</p>
              </div>
            ) : (
              <>
                <section>
                  <h4 className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-400">Live attributes</h4>
                  <div className="space-y-2.5">
                    {rows.map((r) => (
                      <div key={r.label} className="flex items-center justify-between gap-3">
                        <code className="truncate font-mono text-xs text-gray-600">{r.label}</code>
                        <span className="truncate font-semibold text-gray-900">{r.value}</span>
                      </div>
                    ))}
                  </div>
                </section>

                <hr className="border-gray-100" />

                <section>
                  <h4 className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-400">Interventions</h4>
                  <div className="space-y-4">
                    {ivs.map((iv) => {
                      const eligible = iv.criteria.every((c) => c.value >= c.target);
                      const tone = iv.fired ? "fired" : eligible ? "eligible" : "waiting";
                      return (
                        <div key={iv.key} className="rounded-lg border border-gray-100 bg-gray-50/50 p-3">
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-semibold text-gray-900">{iv.label}</p>
                            <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${
                              tone === "fired" ? "bg-amber-100 text-amber-800"
                              : tone === "eligible" ? "bg-emerald-100 text-emerald-800"
                              : "bg-gray-100 text-gray-600"}`}>
                              {tone === "fired" ? "Fired" : tone === "eligible" ? "Eligible" : "Waiting"}
                            </span>
                          </div>
                          <p className="mt-1 text-[11px] leading-5 text-gray-500">{iv.action}</p>
                          <ul className="mt-2 space-y-1.5">
                            {iv.criteria.map((c) => {
                              const met = c.value >= c.target;
                              return (
                                <li key={c.label} className="flex items-center justify-between gap-3 text-xs">
                                  <span className={`flex items-center gap-1.5 ${met ? "text-emerald-700" : "text-gray-500"}`}>
                                    <Check size={12} className={met ? "text-emerald-600" : "text-gray-300"} />
                                    <code className="font-mono">{c.label}</code>
                                  </span>
                                  <span className={`font-mono ${met ? "text-emerald-700" : "text-gray-500"}`}>
                                    {c.value} / {c.target}
                                  </span>
                                </li>
                              );
                            })}
                          </ul>
                          {/* Optional presenter override — dispatch the same event your handler uses */}
                          <button
                            onClick={() => window.dispatchEvent(new CustomEvent(`${iv.key}Triggered`, {
                              detail: { intervention: { name: iv.key, source: "presenter-trigger" } },
                            }))}
                            className="mt-3 inline-flex h-7 items-center gap-1.5 rounded-md border border-gray-200 bg-white px-2.5 text-xs font-semibold text-gray-700 hover:bg-gray-50"
                          >
                            <Play size={11} /> Trigger now (demo)
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </section>
              </>
            )}
            <p className="pt-2 text-center text-[10px] text-gray-300">This panel is visible to demo presenters only</p>
          </div>
        </div>
      )}

      {/* Floating button */}
      <button
        onClick={() => setOpen((o) => !o)}
        className={`fixed bottom-6 right-6 z-40 inline-flex h-14 items-center gap-2 rounded-full px-5 text-white shadow-lg transition-all hover:scale-105 ${pulse ? "ring-4 ring-emerald-400/60 animate-pulse" : ""}`}
        style={{ backgroundColor: CONFIG.brandColor }}
        aria-label={open ? "Close Signals panel" : "Open Signals panel"}
      >
        {open ? <X className="h-5 w-5" /> : (<><Activity className="h-5 w-5" /><span className="text-sm font-semibold">Signals</span></>)}
      </button>
    </>
  );
}
```

Mount it once in your root layout (client component), alongside any intervention
popups:

```tsx
// app/layout.tsx (inside <body>)
<SignalsInspector />
<RiskInterventionPopup />   {/* your intervention UI, if any */}
```

---

## 7. Checklist for a new app

**Signals setup (Console / API)** — use the `/signals-setup` skill:
- [ ] Attribute group `demo_{industry}_session` with the counts/lists you need.
- [ ] Service `demo_{industry}` referencing that group.
- [ ] Intervention(s) `demo_{industry}_{recipe}` with documented thresholds.

**Server**
- [ ] `app/api/signals/route.ts` returns `{ success, attributes }`; never throws.
- [ ] Reads keys from `SNOWPLOW_CONSOLE_API_KEY*` (+ `SIGNALS_*` fallback) + `SIGNALS_ORG_ID`.
- [ ] (Optional) identity `user_id` key + batch attributes + `meta` block.

**Browser tracker config**
- [ ] `addInterventionHandlers({ demo_{industry}_{recipe}(i){…} })` — keys match Console.
- [ ] `subscribeToInterventions({ endpoint: NEXT_PUBLIC_SIGNALS_API_URL })`.
- [ ] Each handler writes `sessionStorage` + dispatches `{recipe}Triggered`.
- [ ] `has{Recipe}Triggered()` / `clear{Recipe}Intervention()` helpers.

**Client helpers**
- [ ] `getSessionId()` (tracker → cookie fallback) + `getUserAttributesFromSignals()`.
- [ ] `isEligibleFor{Recipe}()` mirroring the remote threshold (dual-path).
- [ ] Personalization functions fall back gracefully when Signals is off/empty.

**UI**
- [ ] `SignalsInspector` mounted in layout; attribute rows + criteria configured.
- [ ] Intervention popup/banner listens for the CustomEvents and tracks view/accept/dismiss.

**Consistency**
- [ ] Client eligibility thresholds == remote Signals recipe thresholds (and noted in the app's `CLAUDE.md`).
- [ ] Respect the consent / `isSignalsEnabled()` toggle everywhere.

---

## 8. Per-app reference

| App | Attribute key(s) | Interventions | Inspector notes |
|---|---|---|---|
| `media` | `domain_sessionid` | `demo_media_paywall` | Cleanest reference. Criteria progress bars; polls only when open. |
| `gaming` | `domain_sessionid` | 1 | Same shape as media. |
| `ecommerce` | `domain_sessionid` | 1 | Same shape as media (largest panel). |
| `jobs` | `domain_sessionid` | 1 | Compact variant. |
| `fintech` | `domain_sessionid` | `demo_fintech_risk_intervention`, `demo_fintech_upsell_nudge` | Full-screen modal popups; explicit dual-path (event **or** poll-eligibility); `clear`/`has` helpers. |
| `saas` | `user_id` + `domain_sessionid` | `demo_saas_abm_hero`, `demo_saas_exit_intent`, `demo_saas_returning_visitor` | Most advanced: identity+session+batch attrs, `meta.synced_at`, per-intervention manual triggers, "Signals fired" toasts, campaign generator. |

Read `apps/media` for the simplest end-to-end version and `apps/saas` for the
full-featured inspector.
```
