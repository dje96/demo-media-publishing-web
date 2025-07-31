import RecommendationCard from "./recommendation-card"
import NewsletterSignup from "./newsletter-signup"
import Advertisement from "./advertisement"
import { getRecommendations } from "@/lib/recommendations"
import { siteConfig } from "@/lib/config"

interface SidebarProps {
  className?: string
  recommendationCount?: number
  showNewsletter?: boolean
  category?: string
}

export default function Sidebar({ 
  className = "", 
  recommendationCount = 4,
  showNewsletter = true,
  category
}: SidebarProps) {
  const recommendations = getRecommendations(recommendationCount)

  return (
    <div className={`lg:col-span-1 ${className}`}>
      <div className="sticky top-8 space-y-6">
        {/* Recommendations */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Recommended Reading</h3>
          <div className="space-y-4">
            {recommendations.map((item) => (
              <RecommendationCard key={item.id} recommendation={item} />
            ))}
          </div>
        </div>

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