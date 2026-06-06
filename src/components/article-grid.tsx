import ArticleCard from "./article-card"
import { Article } from "@/src/lib/config"

interface ArticleGridProps {
  articles: Article[]
  className?: string
  columns?: 2 | 3 | 4
  layout?: "default" | "horizontal"
}

export default function ArticleGrid({ articles, className = "", columns = 3, layout = "default" }: ArticleGridProps) {
  if (layout === "horizontal") {
    return (
      <div className={className}>
        {articles.map((article) => (
          <ArticleCard key={article.id} article={article} layout="horizontal" />
        ))}
      </div>
    )
  }

  const cols = columns === 4
    ? "md:grid-cols-2 lg:grid-cols-4"
    : columns === 2
    ? "md:grid-cols-2"
    : "md:grid-cols-2 lg:grid-cols-3"

  return (
    <div className={`grid grid-cols-1 ${cols} gap-x-8 gap-y-10 ${className}`}>
      {articles.map((article) => (
        <ArticleCard key={article.id} article={article} />
      ))}
    </div>
  )
}
