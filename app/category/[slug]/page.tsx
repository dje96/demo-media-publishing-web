import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { getCategoryBySlug, siteConfig } from '@/src/lib/config'
import { getArticlesByCategory } from '@/src/lib/data'
import PageLayout from '@/src/components/page-layout'
import MainContentLayout from '@/src/components/main-content-layout'
import PageHeader from '@/src/components/page-header'
import ArticleGrid from '@/src/components/article-grid'

interface CategoryPageProps {
  params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
  return siteConfig.content.categories.map((category) => ({
    slug: category.slug,
  }))
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { slug } = await params
  const category = getCategoryBySlug(slug)
  
  if (!category) {
    notFound()
  }

  const articles = getArticlesByCategory(category.name)

  return (
    <PageLayout>
      <MainContentLayout advertising={{ sponsored: true, category: category.name }}>
        <PageHeader 
          title={category.name} 
          description={category.description} 
        />
        <ArticleGrid articles={articles} />
      </MainContentLayout>
    </PageLayout>
  )
}

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const { slug } = await params
  const category = getCategoryBySlug(slug)
  
  if (!category) {
    return { 
      title: 'Category Not Found',
      description: 'The requested category could not be found.'
    }
  }

  return {
    title: `${category.name} | ${siteConfig.brand.name}`,
    description: category.description,
  }
} 