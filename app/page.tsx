"use client"

import PageLayout from "@/src/components/page-layout"
import MainContentLayout from "@/src/components/main-content-layout"
import PageHeader from "@/src/components/page-header"
import ArticleGrid from "@/src/components/article-grid"
import Link from "next/link"
import Image from "next/image"
import { articles } from "@/src/lib/data"
import { siteConfig } from "@/src/lib/config"
import { formatDateShort } from "@/src/lib/utils"
import { useEffect, useState } from "react"
import { getPersonalizedFeaturedArticle } from "@/src/lib/recommendations"
import { Article } from "@/src/lib/config"

// Convert articles object to array and get the first 4 articles
const featuredArticles = Object.values(articles).slice(0, 4)

export default function HomePage() {
  const [showThankYou, setShowThankYou] = useState(false)
  const [featuredArticle, setFeaturedArticle] = useState<Article | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (typeof window !== 'undefined' && localStorage.getItem('showSubscriptionThankYou') === 'true') {
      setShowThankYou(true)
      localStorage.removeItem('showSubscriptionThankYou')
      setTimeout(() => setShowThankYou(false), 4000)
    }
  }, [])

  // Load personalized featured article
  useEffect(() => {
    const loadFeaturedArticle = async () => {
      setIsLoading(true)
      const article = await getPersonalizedFeaturedArticle()
      setFeaturedArticle(article)
      setIsLoading(false)
    }

    loadFeaturedArticle()

    // Listen for Signals preference changes
    const handleSignalsChange = () => {
      loadFeaturedArticle()
    }

    window.addEventListener('signalsPreferenceChanged', handleSignalsChange)

    return () => {
      window.removeEventListener('signalsPreferenceChanged', handleSignalsChange)
    }
  }, [])

  return (
    <PageLayout>
      {showThankYou && (
        <div className="fixed top-6 left-1/2 transform -translate-x-1/2 z-50 bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg animate-fade-in">
          Thank you for your purchase! Your subscription is now active.
        </div>
      )}
      <MainContentLayout advertising={{ banner: true }}>
        <PageHeader 
          title="Latest News" 
          description={siteConfig.brand.tagline} 
        />

        {/* Featured Article */}
        <div className="mb-8">
          {isLoading || !featuredArticle ? (
            <div className="relative bg-white rounded-lg shadow-md overflow-hidden h-64 animate-pulse">
              <div className="absolute inset-0 bg-gradient-to-t from-gray-300 to-gray-200" />
              <div className="absolute bottom-0 left-0 right-0 p-6">
                <div className="mb-2 flex gap-2">
                  <div className="bg-gray-400 h-5 w-20 rounded"></div>
                  <div className="bg-gray-400 h-5 w-24 rounded"></div>
                </div>
                <div className="bg-gray-400 h-8 w-3/4 rounded mb-2"></div>
                <div className="bg-gray-400 h-4 w-full rounded mb-2"></div>
                <div className="flex items-center gap-2">
                  <div className="bg-gray-400 h-4 w-24 rounded"></div>
                  <div className="bg-gray-400 h-4 w-20 rounded"></div>
                  <div className="bg-gray-400 h-4 w-16 rounded"></div>
                </div>
              </div>
            </div>
          ) : (
            <Link href={`/articles/${featuredArticle.slug}`}>
              <div className="relative bg-white rounded-lg shadow-md overflow-hidden cursor-pointer hover:shadow-lg transition-shadow">
                <Image
                  src={featuredArticle.image}
                  alt={featuredArticle.title}
                  className="w-full h-64 object-cover"
                  width={1200}
                  height={256}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                  <div className="mb-2 flex gap-2">
                    <span className="inline-block bg-red-600 text-xs font-semibold px-2 py-1 rounded">
                      FEATURED
                    </span>
                    <span className="inline-block bg-gray-800/80 text-xs font-semibold px-2 py-1 rounded">
                      {featuredArticle.category}
                    </span>
                  </div>
                  <h2 className="text-2xl font-bold mb-2 hover:text-gray-200 transition-colors">
                    {featuredArticle.title}
                  </h2>
                  <p className="text-gray-200 mb-2">
                    {featuredArticle.excerpt}
                  </p>
                  <div className="flex items-center text-sm">
                    <span>{featuredArticle.author}</span>
                    <span className="mx-2">•</span>
                    <span>{formatDateShort(featuredArticle.date)}</span>
                    <span className="mx-2">•</span>
                    <span>{featuredArticle.readTime} min read</span>
                  </div>
                </div>
              </div>
            </Link>
          )}
        </div>

        {/* New Articles Section */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">New Articles</h2>
          <ArticleGrid articles={featuredArticles} />
        </div>
      </MainContentLayout>
    </PageLayout>
  )
}