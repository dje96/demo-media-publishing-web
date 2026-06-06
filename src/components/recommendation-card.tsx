import Link from "next/link"

interface Recommendation {
  id: string
  title: string
  author: string
  readTime: number
  category: string
  slug?: string
}

interface RecommendationCardProps {
  recommendation: Recommendation
}

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
}

export default function RecommendationCard({ recommendation }: RecommendationCardProps) {
  const slugMap: { [key: string]: string } = {
    "Digital Privacy in the Modern Age": "digital-privacy-modern-age",
    "The Evolution of Social Media": "evolution-social-media",
    "Blockchain Beyond Cryptocurrency": "blockchain-beyond-crypto",
    "Machine Learning in Healthcare": "machine-learning-healthcare",
    "Remote Work Technology Trends": "remote-work-tech-trends",
  }

  const slug = recommendation.slug || slugMap[recommendation.title] || generateSlug(recommendation.title)

  return (
    <Link href={`/articles/${slug}`} className="group block py-3 border-b border-rule last:border-b-0">
      <div className="kicker kicker--muted mb-1.5 text-[10px]">{recommendation.category}</div>
      <h4
        className="headline text-[15px] leading-snug group-hover:underline decoration-1 underline-offset-4 line-clamp-3 mb-1.5"
        style={{ fontFamily: 'var(--font-newsreader), Georgia, serif' }}
      >
        {recommendation.title}
      </h4>
      <div className="text-[10px] uppercase tracking-[0.1em] text-muted-foreground">
        {recommendation.author}
        <span className="mx-1.5">·</span>
        {recommendation.readTime} min read
      </div>
    </Link>
  )
}
