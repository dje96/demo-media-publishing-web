"use client"

import type { Metadata } from "next";
import PageLayout from "./components/page-layout"
import MainContentLayout from "./components/main-content-layout"
import PageHeader from "./components/page-header"
import ArticleGrid from "./components/article-grid"
import Link from "next/link"
import Image from "next/image"
import { articles } from "@/lib/data"
import { siteConfig } from "@/lib/config"
import { formatDateShort } from "@/lib/utils"
import { useEffect, useState } from "react"

// Convert articles object to array and get the first 4 articles
const featuredArticles = Object.values(articles).slice(0, 4)

export default function HomePage() {
  const [showThankYou, setShowThankYou] = useState(false)

  useEffect(() => {
    if (typeof window !== 'undefined' && localStorage.getItem('showSubscriptionThankYou') === 'true') {
      setShowThankYou(true)
      localStorage.removeItem('showSubscriptionThankYou')
      setTimeout(() => setShowThankYou(false), 4000)
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
          <Link href={`/articles/${featuredArticles[0].slug}`}>
            <div className="relative bg-white rounded-lg shadow-md overflow-hidden cursor-pointer hover:shadow-lg transition-shadow">
              <Image
                src={featuredArticles[0].image}
                alt={featuredArticles[0].title}
                className="w-full h-64 object-cover"
                width={1200}
                height={256}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                <span className="inline-block bg-red-600 text-xs font-semibold px-2 py-1 rounded mb-2">
                  FEATURED
                </span>
                <h2 className="text-2xl font-bold mb-2 hover:text-gray-200 transition-colors">
                  {featuredArticles[0].title}
                </h2>
                <p className="text-gray-200 mb-2">
                  {featuredArticles[0].excerpt}
                </p>
                <div className="flex items-center text-sm">
                  <span>{featuredArticles[0].author}</span>
                  <span className="mx-2">•</span>
                  <span>{formatDateShort(featuredArticles[0].date)}</span>
                  <span className="mx-2">•</span>
                  <span>{featuredArticles[0].readTime} min read</span>
                </div>
              </div>
            </div>
          </Link>
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