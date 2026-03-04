"use client"

import { useEffect, useRef, useState } from "react"
import PageLayout from "@/src/components/page-layout"
import MainContentLayout from "@/src/components/main-content-layout"
import Sidebar from "@/src/components/sidebar"
import { Clock, User, Calendar, Lock } from "lucide-react"
import { formatDate } from "@/src/lib/utils"
import Image from "next/image"
import { trackArticleView } from "@/src/lib/business-events"
import PaywallPopup from "@/src/components/paywall-popup"
import { hasPaywallInterventionTriggered } from "@/src/lib/snowplow-config"
import { useRouter } from "next/navigation"
import { useUser } from "@/src/contexts/user-context"

interface Article {
  id: string
  title: string
  excerpt: string
  content?: string
  author: string
  date: string
  readTime: number
  category: string
  image?: string
  slug?: string
}

interface ArticlePageClientProps {
  article: Article
}

// Global tracking registry to prevent duplicates across component instances
const trackedArticles = new Set<string>();

export default function ArticlePageClient({ article }: ArticlePageClientProps) {
  const router = useRouter();
  const { user } = useUser();
  const hasTrackedRef = useRef(false);
  const [paywallActive, setPaywallActive] = useState(false);

  // Track article view when component mounts
  useEffect(() => {
    console.log('Article client effect triggered for:', article.title, '(ID:', article.id, ')', 'hasTracked:', hasTrackedRef.current, 'global tracked:', trackedArticles.has(article.id));

    // Track article view only once per article globally and only on client side
    if (article.id && !hasTrackedRef.current && !trackedArticles.has(article.id) && typeof window !== 'undefined') {
      console.log('Tracking article view for:', article.title, '(ID:', article.id, ')');

      // Mark as tracked immediately to prevent race conditions
      hasTrackedRef.current = true;
      trackedArticles.add(article.id);

      // Add a small delay to ensure Snowplow is fully initialized
      setTimeout(() => {
        trackArticleView({
          id: article.id,
          title: article.title,
          author: article.author,
          category: article.category,
          article_id: article.id
        });
      }, 100);
    }
  }, [article.id]);

  // Check for paywall intervention on mount and listen for events
  useEffect(() => {
    // Check if paywall has been triggered
    const checkPaywall = () => {
      setPaywallActive(hasPaywallInterventionTriggered());
    };

    checkPaywall();

    // Listen for intervention triggered event
    const handleInterventionTriggered = () => {
      setPaywallActive(true);
    };

    // Listen for intervention cleared event
    const handleInterventionCleared = () => {
      setPaywallActive(false);
    };

    window.addEventListener('paywallInterventionTriggered', handleInterventionTriggered);
    window.addEventListener('paywallInterventionCleared', handleInterventionCleared);

    return () => {
      window.removeEventListener('paywallInterventionTriggered', handleInterventionTriggered);
      window.removeEventListener('paywallInterventionCleared', handleInterventionCleared);
    };
  }, []);

  return (
    <PageLayout>
      <MainContentLayout sidebar={<Sidebar category={article.category} />} advertising={{ inArticle: true }}>
        <article className="bg-white rounded-lg shadow-md overflow-hidden relative">
          {/* Article Header - Never blurred */}
          <Image src={article.image || "/placeholder.svg"} alt={article.title} className="w-full h-64 object-cover" width={1200} height={256} />

          <div className="p-8">
            {/* Category and Meta Info - Never blurred */}
            <div className="flex items-center justify-between mb-4">
              <span
                className={`inline-block px-3 py-1 text-sm font-semibold rounded ${
                  article.category === "Technology"
                    ? "bg-green-100 text-green-800"
                    : article.category === "Business"
                      ? "bg-blue-100 text-blue-800"
                      : "bg-purple-100 text-purple-800"
                }`}
              >
                {article.category}
              </span>
              <div className="flex items-center text-gray-500 text-sm">
                <Clock className="h-4 w-4 mr-1" />
                {article.readTime} min read
              </div>
            </div>

            {/* Title - Never blurred */}
            <h1 className="text-3xl font-bold text-gray-900 mb-4">{article.title}</h1>

            {/* Author and Date - Never blurred */}
            <div className="flex items-center text-gray-600 mb-6">
              <User className="h-4 w-4 mr-2" />
              <span className="mr-4">{article.author}</span>
              <Calendar className="h-4 w-4 mr-2" />
              <span>{formatDate(article.date)}</span>
            </div>

            {/* Article Content - Apply gradient blur overlay when paywall is active */}
            <div
              className="article-content relative"
              style={paywallActive && !user?.isLoggedIn ? {
                maxHeight: '500px',
                overflow: 'hidden'
              } : undefined}
            >
              {article.content ? (
                <div
                  className="article-content"
                  dangerouslySetInnerHTML={{ __html: article.content }}
                />
              ) : (
                <div>
                  <p className="text-gray-700 leading-relaxed">{article.excerpt}</p>
                  <div className="mt-8 p-4 bg-gray-50 rounded-lg">
                    <p className="text-gray-500 italic">Full article content coming soon...</p>
                  </div>
                </div>
              )}

              {/* Gradient fade overlay - only over content - Only show if not logged in */}
              {paywallActive && !user?.isLoggedIn && (
                <>
                  <div
                    className="absolute inset-0 pointer-events-none"
                    style={{
                      background: 'linear-gradient(to bottom, transparent 0%, transparent 5%, rgba(255,255,255,0.5) 8%, rgba(255,255,255,0.85) 10%, rgba(255,255,255,0.95) 12%, rgb(255,255,255) 15%)',
                    }}
                  />

                  {/* Login Button - Centered in faded area */}
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-auto" style={{ top: '30%' }}>
                    <button
                      onClick={() => router.push('/subscribe')}
                      className="bg-brand-primary hover:bg-brand-primary-dark text-white font-semibold py-3 px-8 rounded-lg shadow-lg transition-all hover:scale-105 flex items-center gap-2"
                    >
                      <Lock className="h-5 w-5" />
                      <span>Subscribe to Continue Reading</span>
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </article>

        {/* Paywall Popup */}
        <PaywallPopup />
      </MainContentLayout>
    </PageLayout>
  )
} 