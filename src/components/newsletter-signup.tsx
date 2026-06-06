"use client"

import { useState } from "react"
import { X } from "lucide-react"

export default function NewsletterSignup() {
  const [email, setEmail] = useState("")
  const [showPopup, setShowPopup] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (email.trim()) {
      setShowPopup(true)
      setEmail("")
    }
  }

  const closePopup = () => setShowPopup(false)

  return (
    <>
      <section className="border-t-2 border-ink pt-4">
        <div className="kicker mb-3">Daily Briefing</div>
        <h3
          className="headline text-xl mb-2"
          style={{ fontFamily: 'var(--font-newsreader), Georgia, serif' }}
        >
          Get the news that matters in your inbox each morning.
        </h3>
        <p
          className="text-sm leading-snug text-muted-foreground mb-4"
          style={{ fontFamily: 'var(--font-newsreader), Georgia, serif' }}
        >
          Expert analysis on business, technology and AI. No spam, unsubscribe anytime.
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col w-full space-y-2 no-track">
          <input
            type="email"
            placeholder="Email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-3 py-2.5 border border-ink bg-paper text-ink placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ink"
            required
          />
          <button
            type="submit"
            className="w-full px-4 py-2.5 bg-ink hover:bg-breaking text-paper text-xs font-semibold uppercase tracking-[0.12em] transition-colors cursor-pointer"
          >
            Sign up
          </button>
        </form>
      </section>

      {showPopup && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-custom flex items-center justify-center z-50">
          <div className="bg-paper border border-ink p-8 max-w-md mx-4 relative">
            <button
              onClick={closePopup}
              className="absolute top-4 right-4 text-muted-foreground hover:text-ink transition-colors cursor-pointer"
              aria-label="Close"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="text-center">
              <div className="kicker mb-3">Confirmation</div>
              <h3
                className="headline text-2xl mb-3"
                style={{ fontFamily: 'var(--font-newsreader), Georgia, serif' }}
              >
                You&apos;re subscribed.
              </h3>
              <p
                className="text-muted-foreground mb-6"
                style={{ fontFamily: 'var(--font-newsreader), Georgia, serif' }}
              >
                The Daily Briefing will arrive in your inbox tomorrow morning.
              </p>

              <button
                onClick={closePopup}
                className="px-6 py-2.5 bg-ink hover:bg-breaking text-paper text-xs font-semibold uppercase tracking-[0.12em] transition-colors cursor-pointer"
              >
                Continue reading
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
