"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { X, Lock } from "lucide-react"
import { hasPaywallInterventionTriggered, clearPaywallIntervention } from "@/src/lib/snowplow-config"
import { useUser } from "@/src/contexts/user-context"

interface PaywallPopupProps {
  onClose?: () => void
}

export default function PaywallPopup({ onClose }: PaywallPopupProps) {
  const router = useRouter()
  const { user } = useUser()
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    // Check if intervention has been triggered and user is not logged in
    const checkIntervention = () => {
      if (hasPaywallInterventionTriggered() && !user?.isLoggedIn) {
        setIsVisible(true)
      } else if (user?.isLoggedIn) {
        // Hide popup if user logs in
        setIsVisible(false)
      }
    }

    checkIntervention()

    // Listen for intervention triggered event
    const handleInterventionTriggered = () => {
      // Only show if user is not logged in
      if (!user?.isLoggedIn) {
        setIsVisible(true)
      }
    }

    // Listen for intervention cleared event
    const handleInterventionCleared = () => {
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

  const handleSubscribe = () => {
    // Redirect to subscription page
    router.push('/subscribe')
  }

  const handleClose = () => {
    setIsVisible(false)
    onClose?.()
  }

  if (!isVisible) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

      {/* Popup */}
      <div className="relative bg-white rounded-lg shadow-2xl max-w-md w-full mx-4 p-8 animate-fade-in">
        {/* Close button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
          aria-label="Close"
        >
          <X className="h-6 w-6" />
        </button>

        {/* Icon */}
        <div className="flex justify-center mb-6">
          <div className="bg-brand-primary/10 rounded-full p-4">
            <Lock className="h-12 w-12 text-brand-primary" />
          </div>
        </div>

        {/* Content */}
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Enjoying Our Content?
          </h2>
          <p className="text-gray-600 mb-6">
            You've been reading some great articles! Subscribe now to get unlimited access to all our premium content, exclusive insights, and more.
          </p>

          {/* Benefits */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
            <ul className="space-y-2 text-sm text-gray-700">
              <li className="flex items-start">
                <span className="text-brand-primary mr-2">✓</span>
                <span>Unlimited access to all articles</span>
              </li>
              <li className="flex items-start">
                <span className="text-brand-primary mr-2">✓</span>
                <span>Exclusive subscriber-only content</span>
              </li>
              <li className="flex items-start">
                <span className="text-brand-primary mr-2">✓</span>
                <span>Ad-free reading experience</span>
              </li>
              <li className="flex items-start">
                <span className="text-brand-primary mr-2">✓</span>
                <span>Support quality journalism</span>
              </li>
            </ul>
          </div>

          {/* CTA Buttons */}
          <div className="space-y-3">
            <button
              onClick={handleSubscribe}
              className="w-full bg-brand-primary hover:bg-brand-primary-dark text-white font-semibold py-3 px-6 rounded-lg transition-colors"
            >
              Subscribe Now
            </button>
            <button
              onClick={handleClose}
              className="w-full text-gray-600 hover:text-gray-800 font-medium py-2 transition-colors"
            >
              Maybe Later
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
