import type { Metadata } from "next";
import PageLayout from "../components/page-layout"
import MainContentLayout from "../components/main-content-layout"
import PageHeader from "../components/page-header"
import ArticleGrid from "../components/article-grid"
import { getArticlesByCategory } from "@/lib/data"
import { siteConfig } from "@/lib/config"

export const metadata: Metadata = {
  title: `Business | ${siteConfig.brand.name}`,
  description: "Latest business news and insights",
};

const businessArticles = getArticlesByCategory("Business")

export default function BusinessPage() {
  return (
    <PageLayout>
      <MainContentLayout advertising={{ sponsored: true, category: "Business" }}>
        <PageHeader 
          title="Business" 
          description="Latest business news, market insights, and industry trends" 
        />

        {/* Articles Grid */}
        <ArticleGrid articles={businessArticles} />
      </MainContentLayout>
    </PageLayout>
  )
}
