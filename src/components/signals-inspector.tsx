"use client"

import { useCallback, useEffect, useState } from "react"
import { Activity, Check, Play, Wifi, X } from "lucide-react"
import {
  getSessionId,
  PAYWALL_CRITERIA,
  type UserAttributes,
} from "@/src/lib/recommendations"
import {
  hasPaywallInterventionTriggered,
  clearPaywallIntervention,
} from "@/src/lib/snowplow-config"

/* ---------------------------------------------------------------------------
 * Presenter-only panel that shows live Signals state for the demo: the polled
 * attributes for this session and the status of the `subscription_nudge`
 * intervention (Waiting → Eligible → Fired) with per-criterion progress.
 *
 * Criteria thresholds come from PAYWALL_CRITERIA so this panel and the dual-path
 * paywall fallback always agree with the remote Signals recipe.
 * ------------------------------------------------------------------------- */

const POLL_MS = 4000

function fmtList(v?: unknown[]): string {
  if (!v || v.length === 0) return "—"
  return v.length <= 3 ? v.join(", ") : `${v.length} items`
}

// Long opaque IDs would otherwise push the attribute name off-screen, so show a
// shortened head…tail form (e.g. "a1b2c3…7f8e").
function fmtId(v?: unknown): string {
  if (v == null || v === "") return "—"
  const s = String(v)
  return s.length <= 12 ? s : `${s.slice(0, 6)}…${s.slice(-4)}`
}

function fmtDict(v?: Record<string, number>): string {
  if (!v) return "—"
  const entries = Object.entries(v)
  if (entries.length === 0) return "—"
  return entries.map(([k, n]) => `${k}: ${n}`).join(", ")
}

// Map raw Signals attributes → labelled rows shown in the panel.
// One row per attribute in the `media_publishing_demo` service.
function attributeRows(a: UserAttributes) {
  return [
    { label: "article_heartbeats", value: String(a.article_heartbeats ?? 0) },
    { label: "article_view_count", value: String(a.article_view_count ?? 0) },
    { label: "unique_article_view_count", value: String(a.unique_article_view_count ?? 0) },
    { label: "categories_viewed", value: fmtList(a.categories_viewed) },
    { label: "category_heartbeats", value: fmtDict(a.category_heartbeats) },
    { label: "last_category_viewed", value: String(a.last_category_viewed ?? "—") },
    { label: "last_author_viewed", value: String(a.last_author_viewed ?? "—") },
    { label: "unique_article_ids", value: fmtList(a.unique_article_ids) },
    { label: "last_snowplow_id", value: fmtId(a.last_snowplow_id) },
  ]
}

// Per-criterion progress for the paywall intervention, mirroring the remote recipe.
function paywallCriteria(a: UserAttributes) {
  const uniqueViews =
    a.unique_article_view_count ?? a.unique_article_ids?.length ?? 0
  return [
    {
      label: `unique_article_view_count ≥ ${PAYWALL_CRITERIA.uniqueArticleViewCount}`,
      value: uniqueViews,
      target: PAYWALL_CRITERIA.uniqueArticleViewCount,
    },
    {
      label: `article_heartbeats ≥ ${PAYWALL_CRITERIA.articleHeartbeats}`,
      value: Number(a.article_heartbeats ?? 0),
      target: PAYWALL_CRITERIA.articleHeartbeats,
    },
  ]
}

export default function SignalsInspector() {
  const [open, setOpen] = useState(false)
  const [attrs, setAttrs] = useState<UserAttributes | null>(null)
  const [loading, setLoading] = useState(false)
  const [syncedAt, setSyncedAt] = useState<number | null>(null)
  const [now, setNow] = useState<number>(() => Date.now())
  const [configured, setConfigured] = useState<boolean>(true)
  const [pulse, setPulse] = useState(false)
  const [fired, setFired] = useState(false)

  const fetchAttributes = useCallback(async () => {
    const sessionId = getSessionId()
    if (!sessionId) return
    try {
      setLoading(true)
      const res = await fetch("/api/signals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId }),
      })
      const data = await res.json()
      if (typeof data?.meta?.signals_configured === "boolean") {
        setConfigured(data.meta.signals_configured)
      }
      if (data.success && data.attributes) {
        setAttrs(data.attributes)
        setSyncedAt(Date.now())
      }
    } catch (e) {
      console.error("Signals inspector fetch failed", e)
    } finally {
      setLoading(false)
    }
  }, [])

  // Poll only while open (matches the media reference in the guide).
  useEffect(() => {
    if (!open) return
    fetchAttributes()
    const id = setInterval(fetchAttributes, POLL_MS)
    return () => clearInterval(id)
  }, [open, fetchAttributes])

  // Keep the "synced Ns ago" badge ticking while open.
  useEffect(() => {
    if (!open) return
    const id = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(id)
  }, [open])

  // Reflect the intervention firing instantly via the CustomEvent contract.
  useEffect(() => {
    setFired(hasPaywallInterventionTriggered())

    const onTriggered = () => {
      setFired(true)
      setPulse(true)
      setTimeout(() => setPulse(false), 1800)
    }
    const onCleared = () => setFired(false)

    window.addEventListener("paywallInterventionTriggered", onTriggered)
    window.addEventListener("paywallInterventionCleared", onCleared)
    return () => {
      window.removeEventListener("paywallInterventionTriggered", onTriggered)
      window.removeEventListener("paywallInterventionCleared", onCleared)
    }
  }, [])

  const hasData = attrs && Object.keys(attrs).length > 0
  const rows = hasData ? attributeRows(attrs!) : []
  const criteria = hasData ? paywallCriteria(attrs!) : []
  const eligible = criteria.length > 0 && criteria.every((c) => c.value >= c.target)
  const tone = fired ? "fired" : eligible ? "eligible" : "waiting"

  // Presenter override: dispatch the same event the real handler uses so the
  // paywall popup shows on demand even if the live intervention hasn't fired.
  const triggerNow = () => {
    sessionStorage.setItem(
      "paywall-intervention",
      JSON.stringify({
        triggered: true,
        timestamp: Date.now(),
        intervention: { name: "subscription_nudge", source: "presenter-trigger" },
      }),
    )
    window.dispatchEvent(
      new CustomEvent("paywallInterventionTriggered", {
        detail: { intervention: { name: "subscription_nudge", source: "presenter-trigger" } },
      }),
    )
    setFired(true)
  }

  return (
    <>
      {open && (
        <div className="fixed bottom-24 left-6 z-[60] flex max-h-[80vh] w-[calc(100vw-3rem)] flex-col overflow-hidden border border-rule bg-paper shadow-2xl sm:w-96">
          {/* Header */}
          <div className="flex shrink-0 items-center justify-between bg-ink px-4 py-3 text-paper">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold uppercase tracking-[0.12em]">Signals Live</h3>
              <span className="relative flex h-2.5 w-2.5">
                {configured && (
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-breaking opacity-75" />
                )}
                <span
                  className="relative inline-flex h-2.5 w-2.5 rounded-full"
                  style={{ backgroundColor: configured ? "var(--breaking)" : "#9ca3af" }}
                />
              </span>
            </div>
            <div className="flex items-center gap-2 text-[10px] text-paper/70">
              <Wifi size={12} />
              {syncedAt ? `synced ${Math.max(0, Math.round((now - syncedAt) / 1000))}s ago` : "syncing…"}
              <button
                onClick={() => setOpen(false)}
                className="ml-2 cursor-pointer p-0.5 text-paper/80 hover:text-paper"
                aria-label="Close Signals panel"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Body */}
          <div className="flex-1 space-y-5 overflow-y-auto p-4 text-sm">
            {!configured ? (
              <div className="flex flex-col items-center py-8 text-muted-foreground">
                <Activity className="mb-3 h-10 w-10 opacity-50" />
                <p className="font-medium">Signals not configured</p>
                <p className="mt-1 text-center text-xs">
                  Set SIGNALS_API_URL and SNOWPLOW_CONSOLE_API_KEY* in your environment.
                </p>
              </div>
            ) : loading && !hasData ? (
              <div className="animate-pulse space-y-3">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="h-4 rounded bg-accent" />
                ))}
              </div>
            ) : !hasData ? (
              <div className="flex flex-col items-center py-8 text-muted-foreground">
                <Activity className="mb-3 h-10 w-10 opacity-50" />
                <p className="font-medium">No data yet</p>
                <p className="mt-1 text-center text-xs">
                  Read a few articles and Signals attributes will appear here.
                </p>
              </div>
            ) : (
              <>
                <section>
                  <h4 className="mb-3 text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                    Live attributes
                  </h4>
                  <div className="space-y-2.5">
                    {rows.map((r) => (
                      <div key={r.label} className="flex items-center justify-between gap-3">
                        <code className="truncate font-mono text-xs text-muted-foreground">{r.label}</code>
                        <span className="truncate font-semibold text-ink">{r.value}</span>
                      </div>
                    ))}
                  </div>
                </section>

                <hr className="border-rule" />

                <section>
              <h4 className="mb-3 text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                Interventions
              </h4>
              <div className="border border-rule bg-accent/50 p-3">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-ink">Paywall nudge</p>
                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em] ${
                      tone === "fired"
                        ? "bg-breaking text-paper"
                        : tone === "eligible"
                          ? "bg-emerald-100 text-emerald-800"
                          : "bg-accent text-muted-foreground"
                    }`}
                  >
                    {tone === "fired" ? "Fired" : tone === "eligible" ? "Eligible" : "Waiting"}
                  </span>
                </div>
                <p className="mt-1 text-[11px] leading-5 text-muted-foreground">
                  subscription_nudge — shows the subscribe popup to engaged readers.
                </p>
                <ul className="mt-2 space-y-1.5">
                  {criteria.map((c) => {
                    const met = c.value >= c.target
                    return (
                      <li key={c.label} className="flex items-center justify-between gap-3 text-xs">
                        <span
                          className={`flex items-center gap-1.5 ${met ? "text-emerald-700" : "text-muted-foreground"}`}
                        >
                          <Check size={12} className={met ? "text-emerald-600" : "text-rule"} />
                          <code className="font-mono">{c.label}</code>
                        </span>
                        <span className={`font-mono ${met ? "text-emerald-700" : "text-muted-foreground"}`}>
                          {c.value} / {c.target}
                        </span>
                      </li>
                    )
                  })}
                </ul>
                <div className="mt-3 flex items-center gap-2">
                  <button
                    onClick={triggerNow}
                    className="inline-flex h-7 cursor-pointer items-center gap-1.5 border border-rule bg-paper px-2.5 text-xs font-semibold text-ink hover:bg-accent"
                  >
                    <Play size={11} /> Trigger now (demo)
                  </button>
                  {fired && (
                    <button
                      onClick={() => {
                        clearPaywallIntervention()
                        setFired(false)
                      }}
                      className="inline-flex h-7 cursor-pointer items-center gap-1.5 px-2 text-xs font-semibold text-muted-foreground hover:text-ink"
                    >
                      Clear
                    </button>
                  )}
                </div>
              </div>
                </section>
              </>
            )}
            <p className="pt-2 text-center text-[10px] text-muted-foreground/70">
              This panel is visible to demo presenters only
            </p>
          </div>
        </div>
      )}

      {/* Floating button */}
      <button
        onClick={() => setOpen((o) => !o)}
        className={`fixed bottom-6 left-6 z-[60] flex h-14 w-14 cursor-pointer items-center justify-center rounded-full bg-ink text-paper shadow-lg transition-all hover:scale-105 ${
          pulse ? "ring-4 ring-breaking/60" : ""
        }`}
        aria-label={open ? "Close Signals panel" : "Open Signals panel"}
      >
        {open ? <X className="h-5 w-5" /> : <Activity className="h-5 w-5" />}
      </button>
    </>
  )
}
