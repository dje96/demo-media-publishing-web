"use client"

import PageLayout from "@/src/components/page-layout"
import MainContentLayout from "@/src/components/main-content-layout"
import ArticleGrid from "@/src/components/article-grid"
import Link from "next/link"
import Image from "next/image"
import { articles } from "@/src/lib/data"
import { formatDateShort } from "@/src/lib/utils"
import { useEffect, useState } from "react"
import { Article } from "@/src/lib/config"
import VideoBadge from "@/src/components/video-badge"

const allArticleList = Object.values(articles)

export default function HomePage() {
  const [showThankYou, setShowThankYou] = useState(false)

  // Always show the default lead story.
  const featuredArticle: Article = allArticleList[0]

  useEffect(() => {
    if (typeof window !== 'undefined' && localStorage.getItem('showSubscriptionThankYou') === 'true') {
      setShowThankYou(true)
      localStorage.removeItem('showSubscriptionThankYou')
      setTimeout(() => setShowThankYou(false), 4000)
    }
  }, [])

  // Pick supporting stories — exclude the lead
  const moreNews = allArticleList.filter((a) => a.id !== featuredArticle.id).slice(0, 6)

  const slugify = (article: Article) => article.slug

  return (
    <PageLayout>
      {showThankYou && (
        <div className="fixed top-6 left-1/2 transform -translate-x-1/2 z-50 bg-ink text-paper px-6 py-3 text-xs font-semibold uppercase tracking-[0.12em] shadow-lg">
          Thank you for your purchase. Your subscription is now active.
        </div>
      )}
      <MainContentLayout advertising={{ banner: true }}>
        {/* Lead story */}
        <section className="mb-12 pb-10 border-b border-rule">
          <Link href={`/articles/${slugify(featuredArticle)}`} className="group block">
              <div className="kicker kicker--breaking mb-4">Lead Story · {featuredArticle.category}</div>
              <div className="relative mb-7">
                {featuredArticle.video && <VideoBadge className="h-9 w-9" />}
                <Image
                  src={featuredArticle.image}
                  alt={featuredArticle.title}
                  className="w-full aspect-[21/9] object-cover grayscale-[0.05] group-hover:grayscale-0 transition-all duration-300"
                  width={2100}
                  height={900}
                  priority
                />
              </div>
              <div className="max-w-4xl">
                <h1
                  className="headline text-4xl sm:text-5xl lg:text-6xl mb-5 group-hover:underline decoration-1 underline-offset-[6px]"
                  style={{ fontFamily: 'var(--font-newsreader), Georgia, serif' }}
                >
                  {featuredArticle.title}
                </h1>
                <p
                  className="text-xl sm:text-2xl leading-snug text-muted-foreground mb-5 max-w-3xl"
                  style={{ fontFamily: 'var(--font-newsreader), Georgia, serif' }}
                >
                  {featuredArticle.excerpt}
                </p>
                <div className="text-[11px] uppercase tracking-[0.12em] text-muted-foreground">
                  By <span className="text-ink font-semibold">{featuredArticle.author}</span>
                  <span className="mx-2">·</span>
                  <span>{formatDateShort(featuredArticle.date)}</span>
                  <span className="mx-2">·</span>
                  <span>{featuredArticle.readTime} min read</span>
                </div>
              </div>
          </Link>
        </section>

        {/* More News */}
        <section>
          <div className="border-t-2 border-ink pt-3 mb-6 flex items-baseline justify-between">
            <h2 className="kicker">More News</h2>
            <span className="text-[11px] uppercase tracking-[0.12em] text-muted-foreground">
              Updated daily
            </span>
          </div>
          <ArticleGrid articles={moreNews} columns={3} />
        </section>
      </MainContentLayout>
    </PageLayout>
  )
}
