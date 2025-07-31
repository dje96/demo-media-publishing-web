import Sidebar from "./sidebar"
import Advertisement from "./advertisement"
import { siteConfig } from "@/lib/config"

interface MainContentLayoutProps {
  children: React.ReactNode
  sidebar?: React.ReactNode
  className?: string
  advertising?: {
    banner?: boolean
    inArticle?: boolean
    sponsored?: boolean
    category?: string
  }
}

export default function MainContentLayout({ 
  children, 
  sidebar = <Sidebar />, 
  className = "",
  advertising = {}
}: MainContentLayoutProps) {
  const { banner = false, inArticle = false, sponsored = false, category } = advertising
  const hasSidebar = sidebar !== null && sidebar !== undefined

  return (
    <main className={`max-w-screen-xl mx-auto px-2 md:px-4 py-8 ${className}`}>
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className={hasSidebar ? "lg:col-span-3" : "lg:col-span-4"}>
          {children}
          
          {/* In-Article Advertisement */}
          {siteConfig.features.advertising && inArticle && (
            <div className="my-8">
              <Advertisement type="banner" category={category} />
            </div>
          )}
          
          {/* Banner Advertisement */}
          {siteConfig.features.advertising && banner && (
            <div className="mt-8">
              <Advertisement type="banner" category={category} />
            </div>
          )}
          
          {/* Sponsored Content Advertisement */}
          {siteConfig.features.advertising && sponsored && (
            <div className="mt-8">
              <Advertisement type="sponsored" category={category} />
            </div>
          )}
        </div>
        {hasSidebar && sidebar}
      </div>
    </main>
  )
} 