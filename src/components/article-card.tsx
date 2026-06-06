import Link from "next/link"
import { formatDateShort } from "@/src/lib/utils"
import Image from "next/image"
import VideoBadge from "./video-badge"

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

interface ArticleCardProps {
  article: Article
  layout?: "default" | "horizontal" | "compact"
}

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
}

const slugMap: { [key: string]: string } = {
  "The Future of Artificial Intelligence in Journalism": "future-ai-journalism",
  "Breaking: Major Tech Companies Announce Climate Initiative": "tech-companies-climate-initiative",
  "The Rise of Independent Media Platforms": "independent-media-platforms",
  "Cybersecurity Trends to Watch in 2024": "cybersecurity-trends-2024",
  "Digital Privacy in the Modern Age": "digital-privacy-modern-age",
  "Machine Learning in Healthcare": "machine-learning-healthcare",
  "Startup Funding Reaches Record High in Q4 2023": "startup-funding-reaches-record-high-in-q4-2023",
}

export default function ArticleCard({ article, layout = "default" }: ArticleCardProps) {
  const slug = article.slug || slugMap[article.title] || generateSlug(article.title)

  if (layout === "horizontal") {
    return (
      <Link href={`/articles/${slug}`} className="group block">
        <article className="grid grid-cols-[1fr_140px] sm:grid-cols-[1fr_180px] gap-4 sm:gap-6 py-5 border-b border-rule">
          <div className="min-w-0">
            <div className="kicker mb-2">{article.category}</div>
            <h3
              className="headline text-lg sm:text-xl mb-1.5 group-hover:underline decoration-1 underline-offset-4 line-clamp-3"
              style={{ fontFamily: 'var(--font-newsreader), Georgia, serif' }}
            >
              {article.title}
            </h3>
            <p className="font-serif text-[15px] leading-snug text-muted-foreground line-clamp-2 mb-2"
              style={{ fontFamily: 'var(--font-newsreader), Georgia, serif' }}>
              {article.excerpt}
            </p>
            <div className="text-[11px] uppercase tracking-[0.1em] text-muted-foreground">
              <span className="text-ink font-semibold">{article.author}</span>
              <span className="mx-1.5">·</span>
              <span>{formatDateShort(article.date)}</span>
            </div>
          </div>
          <div className="relative flex-shrink-0">
            {article.video && <VideoBadge />}
            <Image
              src={article.image || "/placeholder.svg"}
              alt={article.title}
              className="w-full h-[100px] sm:h-[130px] object-cover grayscale-[0.05] group-hover:grayscale-0 transition-all"
              width={360}
              height={260}
            />
          </div>
        </article>
      </Link>
    )
  }

  if (layout === "compact") {
    return (
      <Link href={`/articles/${slug}`} className="group block py-4 border-b border-rule last:border-b-0">
        <div className="kicker kicker--muted mb-1.5">{article.category}</div>
        <h3
          className="headline text-base group-hover:underline decoration-1 underline-offset-4 mb-1 line-clamp-3"
          style={{ fontFamily: 'var(--font-newsreader), Georgia, serif' }}
        >
          {article.title}
        </h3>
        <div className="text-[11px] uppercase tracking-[0.1em] text-muted-foreground">
          {article.author}
          <span className="mx-1.5">·</span>
          {article.readTime} min read
        </div>
      </Link>
    )
  }

  // Default — stacked image-on-top card
  return (
    <Link href={`/articles/${slug}`} className="group block">
      <article className="flex flex-col h-full">
        <div className="relative overflow-hidden mb-3">
          {article.video && <VideoBadge />}
          <Image
            src={article.image || "/placeholder.svg"}
            alt={article.title}
            className="w-full aspect-[3/2] object-cover grayscale-[0.05] group-hover:grayscale-0 transition-all duration-300"
            width={600}
            height={400}
          />
        </div>
        <div className="flex-1 flex flex-col">
          <div className="kicker mb-2">{article.category}</div>
          <h3
            className="headline text-xl mb-2 group-hover:underline decoration-1 underline-offset-4 line-clamp-3"
            style={{ fontFamily: 'var(--font-newsreader), Georgia, serif' }}
          >
            {article.title}
          </h3>
          <p
            className="text-[15px] leading-snug text-muted-foreground line-clamp-2 mb-3 flex-1"
            style={{ fontFamily: 'var(--font-newsreader), Georgia, serif' }}
          >
            {article.excerpt}
          </p>
          <div className="text-[11px] uppercase tracking-[0.1em] text-muted-foreground mt-auto pt-2 border-t border-rule">
            <span className="text-ink font-semibold">{article.author}</span>
            <span className="mx-1.5">·</span>
            <span>{formatDateShort(article.date)}</span>
            <span className="mx-1.5">·</span>
            <span>{article.readTime} min read</span>
          </div>
        </div>
      </article>
    </Link>
  )
}
