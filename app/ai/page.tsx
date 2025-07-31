import type { Metadata } from "next";
import PageLayout from "../components/page-layout"
import MainContentLayout from "../components/main-content-layout"
import PageHeader from "../components/page-header"
import ArticleGrid from "../components/article-grid"
import { getArticlesByCategory } from "@/lib/data"
import { siteConfig } from "@/lib/config"

export const metadata: Metadata = {
  title: `AI | ${siteConfig.brand.name}`,
  description: "Latest AI news and insights",
};

const aiArticles = getArticlesByCategory("AI")

export default function AIPage() {
  return (
    <PageLayout>
      <MainContentLayout advertising={{ sponsored: true, category: "AI" }}>
        <PageHeader 
          title="Artificial Intelligence" 
          description="Latest developments in AI, machine learning, and automation" 
        />

        {/* Articles Grid */}
        <ArticleGrid articles={aiArticles} />
      </MainContentLayout>
    </PageLayout>
  )
}
