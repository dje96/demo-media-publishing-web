"use client"

import { useEffect, useRef, useState } from "react"
import PageLayout from "@/src/components/page-layout"
import MainContentLayout from "@/src/components/main-content-layout"
import Sidebar from "@/src/components/sidebar"
import { Lock } from "lucide-react"
import { formatDate } from "@/src/lib/utils"
import Image from "next/image"
import { trackArticleView } from "@/src/lib/business-events"
import PaywallPopup from "@/src/components/paywall-popup"
import VideoPlayer from "@/src/components/video-player"
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
  video?: {
    id: string
    src: string
    title: string
    kicker?: string
    poster?: string
  }
}

interface ArticlePageClientProps {
  article: Article
}

const trackedArticles = new Set<string>();

export default function ArticlePageClient({ article }: ArticlePageClientProps) {
  const router = useRouter();
  const { user } = useUser();
  const hasTrackedRef = useRef(false);
  const [paywallActive, setPaywallActive] = useState(false);

  useEffect(() => {
    if (article.id && !hasTrackedRef.current && !trackedArticles.has(article.id) && typeof window !== 'undefined') {
      hasTrackedRef.current = true;
      trackedArticles.add(article.id);
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
  }, [article.id, article.title, article.author, article.category]);

  useEffect(() => {
    const checkPaywall = () => setPaywallActive(hasPaywallInterventionTriggered());
    checkPaywall();
    const handleTriggered = () => setPaywallActive(true);
    const handleCleared = () => setPaywallActive(false);
    window.addEventListener('paywallInterventionTriggered', handleTriggered);
    window.addEventListener('paywallInterventionCleared', handleCleared);
    return () => {
      window.removeEventListener('paywallInterventionTriggered', handleTriggered);
      window.removeEventListener('paywallInterventionCleared', handleCleared);
    };
  }, []);

  return (
    <PageLayout>
      <MainContentLayout sidebar={<Sidebar category={article.category} />} advertising={{ inArticle: true }}>
        <article className="bg-paper relative">
          {/* Header block */}
          <header className="mb-8 pb-6 border-b border-rule max-w-3xl">
            <div className="kicker mb-4">{article.category}</div>
            <h1
              className="headline text-3xl sm:text-4xl lg:text-5xl mb-4"
              style={{ fontFamily: 'var(--font-newsreader), Georgia, serif' }}
            >
              {article.title}
            </h1>
            <p
              className="text-xl leading-snug text-muted-foreground mb-6"
              style={{ fontFamily: 'var(--font-newsreader), Georgia, serif' }}
            >
              {article.excerpt}
            </p>
            <div className="text-[11px] uppercase tracking-[0.12em] text-muted-foreground">
              By <span className="text-ink font-semibold">{article.author}</span>
              <span className="mx-2">·</span>
              <span>{formatDate(article.date)}</span>
              <span className="mx-2">·</span>
              <span>{article.readTime} min read</span>
            </div>
          </header>

          {/* Lead image */}
          {article.image && (
            <figure className="mb-8 -mx-2 md:mx-0">
              <Image
                src={article.image}
                alt={article.title}
                className="w-full aspect-[16/9] object-cover grayscale-[0.05]"
                width={1600}
                height={900}
                priority
              />
              <figcaption className="text-[11px] uppercase tracking-[0.12em] text-muted-foreground mt-2 px-2 md:px-0">
                The Daily Query
              </figcaption>
            </figure>
          )}

          {/* Body — narrow column */}
          <div className="relative">
            <div
              className="article-content"
              style={paywallActive && !user?.isLoggedIn ? {
                maxHeight: '500px',
                overflow: 'hidden'
              } : undefined}
            >
              {article.content ? (
                article.video ? (
                  (() => {
                    const [before, after] = article.content.split("{{VIDEO}}")
                    return (
                      <>
                        <div dangerouslySetInnerHTML={{ __html: before }} />
                        <VideoPlayer
                          videoId={article.video.id}
                          src={article.video.src}
                          title={article.video.title}
                          kicker={article.video.kicker}
                          poster={article.video.poster}
                        />
                        {after !== undefined && (
                          <div dangerouslySetInnerHTML={{ __html: after }} />
                        )}
                      </>
                    )
                  })()
                ) : (
                  <div dangerouslySetInnerHTML={{ __html: article.content }} />
                )
              ) : (
                <div>
                  <p>{article.excerpt}</p>
                  <div className="mt-8 p-4 bg-muted border-l-2 border-ink">
                    <p className="italic text-muted-foreground" style={{ fontFamily: 'var(--font-newsreader), Georgia, serif' }}>
                      Full article content coming soon.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Paywall fade + CTA */}
            {paywallActive && !user?.isLoggedIn && (
              <>
                <div
                  className="absolute inset-0 pointer-events-none"
                  style={{
                    background: 'linear-gradient(to bottom, transparent 0%, transparent 5%, rgba(255,255,255,0.5) 8%, rgba(255,255,255,0.9) 12%, rgb(255,255,255) 16%)',
                  }}
                />
                <div className="absolute inset-0 flex items-start justify-center pointer-events-auto" style={{ top: '30%' }}>
                  <div className="text-center bg-paper border border-ink p-6 max-w-md">
                    <div className="kicker mb-3">Subscribers Only</div>
                    <h3
                      className="headline text-2xl mb-3"
                      style={{ fontFamily: 'var(--font-newsreader), Georgia, serif' }}
                    >
                      Continue reading with a subscription.
                    </h3>
                    <button
                      onClick={() => router.push('/subscribe')}
                      className="bg-ink hover:bg-breaking text-paper px-6 py-3 text-xs font-semibold uppercase tracking-[0.12em] transition-colors inline-flex items-center cursor-pointer"
                    >
                      <Lock className="h-3.5 w-3.5 mr-2" />
                      Subscribe to read
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </article>

        <PaywallPopup />
      </MainContentLayout>
    </PageLayout>
  )
}
