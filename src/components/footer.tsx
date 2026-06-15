"use client"

import { Phone, MapPin, RefreshCw, Shield, Play, Sparkles, ChevronDown, RotateCcw, Mail, Trash2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState, useEffect, useRef } from "react"
import { siteConfig, getRandomUtmParameters } from "@/src/lib/config"
import { buildUrlWithUtm } from "@/src/lib/utils"
import { isSignalsEnabled, setSignalsEnabled } from "@/src/lib/consent"
import { newSession, clearUserData } from "@snowplow/browser-tracker"
import { clearPaywallIntervention } from "@/src/lib/snowplow-config"

export default function Footer() {
  const router = useRouter()
  const [signalsEnabled, setSignalsEnabledState] = useState(true)
  const [showSignalsMenu, setShowSignalsMenu] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setSignalsEnabledState(isSignalsEnabled())

    // Stay in sync when the preference is toggled elsewhere (e.g. the chatbot).
    const handleSignalsChange = (e: Event) => {
      setSignalsEnabledState((e as CustomEvent).detail.enabled)
    }
    window.addEventListener('signalsPreferenceChanged', handleSignalsChange)
    return () => window.removeEventListener('signalsPreferenceChanged', handleSignalsChange)
  }, [])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowSignalsMenu(false)
      }
    }
    if (showSignalsMenu) document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [showSignalsMenu])

  const handleUtmReload = () => {
    newSession()
    // The paywall is keyed to domain_sessionid, which newSession() resets, so
    // clear the stored intervention too — otherwise the hidden text persists
    // into the new session after reload.
    clearPaywallIntervention()
    const currentUrl = window.location.href
    const utmParams = getRandomUtmParameters()
    const urlWithUtm = buildUrlWithUtm(currentUrl, utmParams)
    window.location.href = urlWithUtm
  }

  const handleManageConsent = () => {
    window.dispatchEvent(new CustomEvent('showConsentManager'))
  }

  const handleToggleSignals = () => {
    const newValue = !signalsEnabled
    setSignalsEnabledState(newValue)
    setSignalsEnabled(newValue)
    setShowSignalsMenu(false)
  }

  const handleResetPaywall = () => {
    clearPaywallIntervention()
    setShowSignalsMenu(false)
    alert('Paywall intervention has been reset.')
  }

  const handleClearUserData = () => {
    clearUserData({ preserveSession: false, preserveUser: false })
    setShowSignalsMenu(false)
    alert('Snowplow user and session identifiers have been cleared.')
  }

  const utilityButton = "inline-flex items-center whitespace-nowrap px-2.5 py-1.5 text-[10px] font-semibold uppercase tracking-[0.1em] text-muted-foreground hover:text-ink border border-rule hover:border-ink transition-colors cursor-pointer"

  return (
    <footer className="bg-paper border-t-2 border-ink mt-20">
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10">
          {/* Brand */}
          <div className="md:col-span-5">
            <h3
              className="headline text-3xl mb-3"
              style={{ fontFamily: 'var(--font-newsreader), Georgia, serif' }}
            >
              {siteConfig.brand.name}
            </h3>
            <p
              className="text-base leading-snug text-muted-foreground mb-5 max-w-md"
              style={{ fontFamily: 'var(--font-newsreader), Georgia, serif' }}
            >
              {siteConfig.brand.tagline}
            </p>
            <div className="flex space-x-4">
              {siteConfig.business.social.twitter && (
                <a href={siteConfig.business.social.twitter} className="text-muted-foreground hover:text-ink transition-colors" aria-label="Twitter">
                  <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                  </svg>
                </a>
              )}
              {siteConfig.business.social.linkedin && (
                <a href={siteConfig.business.social.linkedin} className="text-muted-foreground hover:text-ink transition-colors" aria-label="LinkedIn">
                  <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                  </svg>
                </a>
              )}
            </div>
          </div>

          {/* Sections */}
          <div className="md:col-span-3">
            <div className="kicker mb-4">Sections</div>
            <ul className="space-y-2.5">
              {siteConfig.navigation.footerLinks
                .filter(link => link.category === 'company')
                .map((link) => (
                  <li key={link.name}>
                    <a
                      href={link.href}
                      className="text-sm text-ink hover:text-breaking hover:underline decoration-1 underline-offset-4 transition-colors"
                      style={{ fontFamily: 'var(--font-newsreader), Georgia, serif' }}
                    >
                      {link.name}
                    </a>
                  </li>
                ))}
            </ul>
          </div>

          {/* Contact */}
          <div className="md:col-span-4">
            <div className="kicker mb-4">Contact</div>
            <ul className="space-y-3 text-sm text-muted-foreground" style={{ fontFamily: 'var(--font-newsreader), Georgia, serif' }}>
              <li>
                <a href="/contact" className="text-ink hover:text-breaking hover:underline decoration-1 underline-offset-4 transition-colors inline-flex items-center">
                  <Mail className="h-3.5 w-3.5 mr-2" />
                  Contact the newsroom
                </a>
              </li>
              <li className="flex items-center">
                <Phone className="h-3.5 w-3.5 mr-2" />
                {siteConfig.business.contact.phone}
              </li>
              <li className="flex items-center">
                <MapPin className="h-3.5 w-3.5 mr-2" />
                {siteConfig.business.contact.address.split(',')[1]?.trim() || siteConfig.business.contact.address}
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-rule mt-10 pt-6 grid grid-cols-1 lg:grid-cols-[auto_1fr_auto] items-center gap-4">
          <p className="text-[10px] uppercase tracking-[0.1em] text-muted-foreground lg:justify-self-start whitespace-nowrap">
            © 2025 {siteConfig.brand.name}
          </p>
          <div className="flex flex-nowrap items-center justify-center gap-2">
            {siteConfig.features.utmParameters && (
              <button
                onClick={handleUtmReload}
                className={utilityButton}
                title="Reload with UTM parameters for marketing tracking"
              >
                <RefreshCw className="h-3 w-3 mr-1.5" />
                UTM Reload
              </button>
            )}
            {siteConfig.features.consentManager && (
              <button
                onClick={handleManageConsent}
                className={utilityButton}
                title="Manage cookie and privacy preferences"
              >
                <Shield className="h-3 w-3 mr-1.5" />
                Consent
              </button>
            )}

            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setShowSignalsMenu(!showSignalsMenu)}
                className={`${utilityButton} ${signalsEnabled ? 'text-ink border-ink' : ''}`}
                title="Signals configuration"
              >
                <Sparkles className="h-3 w-3 mr-1.5" />
                Signals
                <ChevronDown className={`h-3 w-3 ml-1 transition-transform ${showSignalsMenu ? 'rotate-180' : ''}`} />
              </button>
              {showSignalsMenu && (
                <div className="absolute bottom-full right-0 mb-2 w-60 bg-paper border border-ink shadow-lg z-50">
                  <button
                    onClick={handleToggleSignals}
                    className="w-full px-4 py-3 text-left text-xs uppercase tracking-[0.1em] text-ink hover:bg-muted transition-colors flex items-center justify-between cursor-pointer"
                  >
                    <span className="flex items-center">
                      <Sparkles className="h-3.5 w-3.5 mr-2" />
                      Personalization
                    </span>
                    <span className={`text-[10px] font-semibold px-2 py-0.5 ${signalsEnabled ? 'bg-emerald-600 text-paper' : 'border border-rule text-muted-foreground'}`}>
                      {signalsEnabled ? 'On' : 'Off'}
                    </span>
                  </button>
                  <div className="border-t border-rule" />
                  <button
                    onClick={handleResetPaywall}
                    className="w-full px-4 py-3 text-left text-xs uppercase tracking-[0.1em] text-ink hover:bg-muted transition-colors flex items-center cursor-pointer"
                  >
                    <RotateCcw className="h-3.5 w-3.5 mr-2" />
                    Reset paywall
                  </button>
                  <div className="border-t border-rule" />
                  <button
                    onClick={handleClearUserData}
                    className="w-full px-4 py-3 text-left text-xs uppercase tracking-[0.1em] text-ink hover:bg-muted transition-colors flex items-center cursor-pointer"
                  >
                    <Trash2 className="h-3.5 w-3.5 mr-2" />
                    Clear user data
                  </button>
                </div>
              )}
            </div>

            <button
              onClick={() => router.push('/video')}
              className={utilityButton}
              title="Watch our demo video"
            >
              <Play className="h-3 w-3 mr-1.5" />
              Video
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-4 lg:justify-self-end">
            {siteConfig.navigation.footerLinks
              .filter(link => link.category === 'legal')
              .map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  className="text-[11px] uppercase tracking-[0.12em] text-muted-foreground hover:text-ink transition-colors"
                  title={link.href.includes('snowplow.io') ? 'Cross-domain tracking enabled' : undefined}
                >
                  {link.name}
                  {link.href.includes('snowplow.io') && <span className="ml-0.5">↗</span>}
                </a>
              ))}
          </div>
        </div>
      </div>
    </footer>
  )
}
