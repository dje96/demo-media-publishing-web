import PageLayout from "@/src/components/page-layout"
import MainContentLayout from "@/src/components/main-content-layout"

// Branded loading skeleton for the search route. Used both as the route-level
// loading.tsx and as the <Suspense> fallback in page.tsx, so any brief flash
// (dev on-demand compile, or a streaming gap in prod) matches the results page
// instead of showing a blank screen / bare "Loading…" text.
export default function SearchSkeleton() {
  return (
    <PageLayout>
      <MainContentLayout>
        <div className="animate-pulse">
          {/* Page header */}
          <div className="mb-8 pb-6 border-b border-rule">
            <div className="h-3 w-24 bg-muted mb-4" />
            <div className="h-9 w-64 bg-muted mb-3" />
            <div className="h-4 w-80 bg-muted" />
          </div>

          {/* Results grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-10">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="flex flex-col">
                <div className="aspect-[3/2] bg-muted mb-3" />
                <div className="h-3 w-20 bg-muted mb-2" />
                <div className="h-5 w-full bg-muted mb-1" />
                <div className="h-5 w-3/4 bg-muted mb-3" />
                <div className="h-3 w-full bg-muted mb-1" />
                <div className="h-3 w-2/3 bg-muted" />
              </div>
            ))}
          </div>
        </div>
      </MainContentLayout>
    </PageLayout>
  )
}
