"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { X, Lock } from "lucide-react"
import { hasPaywallInterventionTriggered } from "@/src/lib/snowplow-config"
import { getSessionId, getUserAttributesFromSignals, isEligibleForPaywall } from "@/src/lib/recommendations"
import { isSignalsEnabled } from "@/src/lib/consent"
import { useUser } from "@/src/contexts/user-context"

// How often the PULL path re-derives eligibility from polled Signals attributes.
const POLL_MS = 5000

// Once the visitor dismisses the paywall we must not auto-show it again for the
// rest of the session — the eligibility attributes stay over threshold, so the
// poll would otherwise re-trigger every few seconds. We persist the dismissal in
// sessionStorage so it survives the popup remounting on each article navigation.
const DISMISS_KEY = 'paywall-dismissed'

function wasPaywallDismissed(): boolean {
  if (typeof window === 'undefined') return false
  return sessionStorage.getItem(DISMISS_KEY) === 'true'
}

interface PaywallPopupProps {
  onClose?: () => void
}

export default function PaywallPopup({ onClose }: PaywallPopupProps) {
  const router = useRouter()
  const { user } = useUser()
  const [isVisible, setIsVisible] = useState(false)
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    // Sync the dismissal flag from sessionStorage on mount (e.g. after navigating
    // to another article where this popup remounts).
    setDismissed(wasPaywallDismissed())

    // Check if intervention has been triggered and user is not logged in. Respect
    // a prior dismissal so navigating between articles doesn't re-show the popup.
    const checkIntervention = () => {
      if (user?.isLoggedIn) {
        setIsVisible(false)
      } else if (hasPaywallInterventionTriggered() && !wasPaywallDismissed()) {
        setIsVisible(true)
      }
    }

    checkIntervention()

    // A discrete trigger event (a real push intervention or the presenter
    // "Trigger now" button) is an explicit, one-off signal — unlike the
    // continuous poll — so it resets any prior dismissal and shows the popup.
    const handleInterventionTriggered = () => {
      if (user?.isLoggedIn) return
      if (typeof window !== 'undefined') sessionStorage.removeItem(DISMISS_KEY)
      setDismissed(false)
      setIsVisible(true)
    }

    // Clearing the intervention (presenter Clear / Signals disabled) also resets
    // the dismissal so a fresh trigger can show it again.
    const handleInterventionCleared = () => {
      if (typeof window !== 'undefined') sessionStorage.removeItem(DISMISS_KEY)
      setDismissed(false)
      setIsVisible(false)
      onClose?.()
    }

    window.addEventListener('paywallInterventionTriggered', handleInterventionTriggered)
    window.addEventListener('paywallInterventionCleared', handleInterventionCleared)

    return () => {
      window.removeEventListener('paywallInterventionTriggered', handleInterventionTriggered)
      window.removeEventListener('paywallInterventionCleared', handleInterventionCleared)
    }
  }, [onClose, user?.isLoggedIn])

  // PULL path (dual-path, guide §5.3): the push handler above is the "real"
  // trigger, but live interventions can lag on stage. So we also poll the
  // Signals attributes and re-derive eligibility locally via isEligibleForPaywall
  // (which mirrors the remote recipe). Whichever path fires first shows the popup.
  // Suppressed entirely once dismissed so it can't re-trigger every few seconds.
  useEffect(() => {
    if (user?.isLoggedIn || dismissed || !isSignalsEnabled()) return

    let cancelled = false

    const maybeShow = async () => {
      if (cancelled || wasPaywallDismissed()) return
      // PUSH path already satisfied — nothing to recompute.
      if (hasPaywallInterventionTriggered()) {
        setIsVisible(true)
        return
      }
      const sessionId = getSessionId()
      if (!sessionId) return
      const attrs = await getUserAttributesFromSignals(sessionId)
      if (!cancelled && !wasPaywallDismissed() && isEligibleForPaywall(attrs)) {
        setIsVisible(true)
      }
    }

    maybeShow()
    const id = setInterval(maybeShow, POLL_MS)
    return () => {
      cancelled = true
      clearInterval(id)
    }
  }, [user?.isLoggedIn, dismissed])

  // Mark the paywall dismissed for the rest of the session and hide it.
  const dismissPaywall = () => {
    if (typeof window !== 'undefined') sessionStorage.setItem(DISMISS_KEY, 'true')
    setDismissed(true)
    setIsVisible(false)
  }

  const handleSubscribe = () => {
    // Treat heading to the subscribe page as a dismissal so it doesn't re-pop.
    dismissPaywall()
    router.push('/subscribe')
  }

  const handleClose = () => {
    dismissPaywall()
    onClose?.()
  }

  if (!isVisible) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

      {/* Popup */}
      <div className="relative bg-paper border-t-4 border-breaking shadow-2xl max-w-md w-full mx-4 p-8 animate-fade-in">
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 text-muted-foreground hover:text-ink transition-colors cursor-pointer"
          aria-label="Close"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="text-center">
          <div className="flex justify-center mb-4">
            <Lock className="h-7 w-7 text-ink" />
          </div>
          <div className="kicker kicker--breaking mb-3">Subscribers Only</div>
          <h2
            className="headline text-3xl mb-4"
            style={{ fontFamily: 'var(--font-newsreader), Georgia, serif' }}
          >
            Read without limits.
          </h2>
          <p
            className="text-base leading-snug text-muted-foreground mb-6"
            style={{ fontFamily: 'var(--font-newsreader), Georgia, serif' }}
          >
            You&apos;ve been reading some of our best work. Subscribe for unlimited access, exclusive analysis and an ad-free experience.
          </p>

          <div className="border-t border-b border-rule py-5 mb-6 text-left">
            <ul className="space-y-2.5 text-sm text-ink" style={{ fontFamily: 'var(--font-newsreader), Georgia, serif' }}>
              <li className="flex items-start"><span className="text-ink font-bold mr-2">—</span><span>Unlimited articles</span></li>
              <li className="flex items-start"><span className="text-ink font-bold mr-2">—</span><span>Subscriber-only reporting</span></li>
              <li className="flex items-start"><span className="text-ink font-bold mr-2">—</span><span>Ad-free reading</span></li>
              <li className="flex items-start"><span className="text-ink font-bold mr-2">—</span><span>Support independent journalism</span></li>
            </ul>
          </div>

          <div className="space-y-3">
            <button
              onClick={handleSubscribe}
              className="w-full bg-ink hover:bg-breaking text-paper font-semibold uppercase tracking-[0.12em] text-xs py-3 px-6 transition-colors cursor-pointer"
            >
              Subscribe now
            </button>
            <button
              onClick={handleClose}
              className="w-full text-muted-foreground hover:text-ink text-xs uppercase tracking-[0.12em] py-1 transition-colors cursor-pointer"
            >
              Maybe later
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
