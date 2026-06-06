'use client';

import RecommendationCard from "./recommendation-card"
import NewsletterSignup from "./newsletter-signup"
import Advertisement from "./advertisement"
import { getRecommendations } from "@/src/lib/recommendations"
import { siteConfig } from "@/src/lib/config"
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

  useEffect(() => {
    function loadRecommendations() {
      try {
        setLoading(true)
        const defaultRecs = getRecommendations(recommendationCount)
        setRecommendations(defaultRecs)
      } catch (error) {
        console.error('Error loading recommendations:', error)
        setRecommendations([])
      } finally {
        setLoading(false)
      }
    }

    loadRecommendations()
  }, [recommendationCount])

  return (
    <div className={`lg:col-span-1 ${className}`}>
      <div className="sticky top-8 space-y-8">
        {/* Recommendations */}
        <section>
          <div className="border-t-2 border-ink pt-3 mb-2">
            <h3 className="kicker">Recommended Reading</h3>
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
