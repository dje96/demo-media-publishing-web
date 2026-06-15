'use client';

import RecommendationCard from "./recommendation-card"
import NewsletterSignup from "./newsletter-signup"
import Advertisement from "./advertisement"
import { getRecommendations, getSignalsRecommendedReading } from "@/src/lib/recommendations"
import { isSignalsEnabled } from "@/src/lib/consent"
import { siteConfig } from "@/src/lib/config"
import { Activity } from "lucide-react"
import { useState, useEffect } from "react"

interface SidebarProps {
  className?: string
  recommendationCount?: number
  showNewsletter?: boolean
  category?: string
}

interface Recommendation {
  id: string
  title: string
  author: string
  readTime: number
  category: string
  slug?: string
}

export default function Sidebar({
  className = "",
  recommendationCount = 2,
  showNewsletter = true,
  category
}: SidebarProps) {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([])
  const [loading, setLoading] = useState(true)
  const [signalsOn, setSignalsOn] = useState(false)

  useEffect(() => {
    let cancelled = false

    async function loadRecommendations() {
      try {
        setLoading(true)
        const enabled = isSignalsEnabled()
        setSignalsOn(enabled)

        if (enabled) {
          const { articles } = await getSignalsRecommendedReading(recommendationCount)
          if (!cancelled) setRecommendations(articles)
        } else {
          if (!cancelled) setRecommendations(getRecommendations(recommendationCount))
        }
      } catch (error) {
        console.error('Error loading recommendations:', error)
        if (!cancelled) setRecommendations(getRecommendations(recommendationCount))
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    loadRecommendations()

    // Re-load when the presenter toggles Signals on/off.
    const onSignalsChange = () => loadRecommendations()
    window.addEventListener('signalsPreferenceChanged', onSignalsChange)
    return () => {
      cancelled = true
      window.removeEventListener('signalsPreferenceChanged', onSignalsChange)
    }
  }, [recommendationCount])

  return (
    <div className={`lg:col-span-1 ${className}`}>
      <div className="sticky top-8 space-y-8">
        {/* Recommendations */}
        <section>
          <div className="border-t-2 border-ink pt-3 mb-2 flex items-center justify-between gap-2">
            <h3 className="kicker">Recommended Reading</h3>
            {signalsOn && (
              <span
                className="inline-flex items-center justify-center rounded-full bg-emerald-500 p-1 text-white"
                title="Personalized by Snowplow Signals"
              >
                <Activity className="h-3 w-3" />
              </span>
            )}
          </div>
          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: recommendationCount }).map((_, index) => (
                <div key={index} className="animate-pulse py-3 border-b border-rule">
                  <div className="bg-muted h-2.5 w-16 mb-2" />
                  <div className="bg-muted h-4 w-full mb-1.5" />
                  <div className="bg-muted h-4 w-3/4 mb-2" />
                  <div className="bg-muted h-2 w-1/2" />
                </div>
              ))}
            </div>
          ) : (
            <div>
              {recommendations.map((item) => (
                <RecommendationCard key={item.id} recommendation={item} />
              ))}
            </div>
          )}
        </section>

        {/* Sidebar Advertisement */}
        {siteConfig.features.advertising && (
          <Advertisement type="sidebar" category={category} />
        )}

        {/* Newsletter Signup */}
        {showNewsletter && siteConfig.features.newsletter && (
          <NewsletterSignup />
        )}
      </div>
    </div>
  )
}
