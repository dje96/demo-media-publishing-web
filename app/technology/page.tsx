import type { Metadata } from "next";
import PageLayout from "../components/page-layout"
import MainContentLayout from "../components/main-content-layout"
import PageHeader from "../components/page-header"
import ArticleGrid from "../components/article-grid"
import { getArticlesByCategory } from "@/lib/data"
import { siteConfig } from "@/lib/config"

export const metadata: Metadata = {
  title: `Technology | ${siteConfig.brand.name}`,
  description: "Latest technology news and insights",
};

const technologyArticles = getArticlesByCategory("Technology")

export default function TechnologyPage() {
  return (
    <PageLayout>
      <MainContentLayout advertising={{ sponsored: true, category: "Technology" }}>
        <PageHeader 
          title="Technology" 
          description="Latest technology news, product launches, and industry insights" 
        />

        {/* Articles Grid */}
        <ArticleGrid articles={technologyArticles} />
      </MainContentLayout>
    </PageLayout>
  )
}
