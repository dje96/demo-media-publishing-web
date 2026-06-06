"use client"

import { useState } from "react"
import { X, Mail } from "lucide-react"
import { trackSelfDescribingEvent } from "@snowplow/browser-tracker"

interface LoginModalProps {
  isOpen: boolean
  onClose: () => void
  onLogin: (email: string) => void
}

export default function LoginModal({ isOpen, onClose, onLogin }: LoginModalProps) {
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim()) return

    setIsLoading(true)
    await new Promise(resolve => setTimeout(resolve, 1000))

    trackSelfDescribingEvent({
      event: {
        schema: 'iglu:com.demo/login/jsonschema/1-0-0',
        data: {
          login_method: 'email',
          login_status: 'error'
        }
      }
    });

    onLogin(email.trim())
    setIsLoading(false)
    setEmail("")
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-custom flex items-center justify-center z-50">
      <div className="bg-paper border border-ink shadow-xl max-w-md w-full mx-4">
        <div className="flex items-center justify-between px-6 py-5 border-b border-rule">
          <div>
            <div className="kicker mb-1">Account</div>
            <h2
              className="headline text-2xl"
              style={{ fontFamily: 'var(--font-newsreader), Georgia, serif' }}
            >
              Sign in
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-ink transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="mb-4">
            <label htmlFor="email" className="block text-[11px] uppercase tracking-[0.12em] font-semibold text-ink mb-2">
              Email address
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail className="h-4 w-4 text-muted-foreground" />
              </div>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="block w-full pl-10 pr-3 py-2.5 border border-rule bg-paper text-ink placeholder-muted-foreground focus:outline-none focus:border-ink"
                style={{ fontFamily: 'var(--font-newsreader), Georgia, serif' }}
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading || !email.trim()}
            className="w-full flex justify-center py-3 px-4 text-xs font-semibold uppercase tracking-[0.12em] text-paper bg-ink hover:bg-breaking transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            {isLoading ? (
              <div className="flex items-center">
                <div className="animate-spin h-3 w-3 border-2 border-paper border-t-transparent mr-2" />
                Signing in…
              </div>
            ) : (
              "Sign in"
            )}
          </button>

          <p
            className="mt-4 text-xs text-muted-foreground text-center italic"
            style={{ fontFamily: 'var(--font-newsreader), Georgia, serif' }}
          >
            Demo site — any email will sign you in.
          </p>
        </form>
      </div>
    </div>
  )
}
