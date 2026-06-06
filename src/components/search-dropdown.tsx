"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { Search } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { allArticles } from "@/src/lib/data"
import { trackQuickSearch } from "@/src/lib/business-events"

interface ArticleLite {
  id: string
  title: string
  excerpt: string
  author: string
  category: string
  readTime: number
  slug?: string
}

export default function SearchDropdown() {
  const [isOpen, setIsOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [filteredArticles, setFilteredArticles] = useState<ArticleLite[]>(allArticles)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredArticles([])
      setIsOpen(false)
    } else {
      const filtered = allArticles
        .filter((article) =>
          article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          article.excerpt.toLowerCase().includes(searchTerm.toLowerCase()) ||
          article.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
          article.category.toLowerCase().includes(searchTerm.toLowerCase())
        )
        .slice(0, 5)
      setFilteredArticles(filtered)
      setIsOpen(true)
    }
  }, [searchTerm])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)
  const handleInputFocus = () => { if (searchTerm.trim() !== "") setIsOpen(true) }

  const handleArticleClick = (article: ArticleLite) => {
    trackQuickSearch(searchTerm, {
      id: article.id,
      title: article.title,
      author: article.author,
      category: article.category,
      position: filteredArticles.findIndex(a => a.id === article.id) + 1
    });
    setIsOpen(false)
    setSearchTerm("")
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && searchTerm.trim()) {
      e.preventDefault()
      router.push(`/search?q=${encodeURIComponent(searchTerm.trim())}`)
      setIsOpen(false)
      setSearchTerm("")
    }
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <div className="relative">
        <Search className="h-3.5 w-3.5 text-muted-foreground absolute left-3 top-1/2 transform -translate-y-1/2" />
        <input
          type="text"
          placeholder="Search"
          value={searchTerm}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          onKeyDown={handleKeyDown}
          className="block w-44 lg:w-56 pl-9 pr-3 py-1.5 border border-rule bg-paper text-sm placeholder-muted-foreground focus:outline-none focus:border-ink"
          style={{ fontFamily: 'var(--font-newsreader), Georgia, serif' }}
        />
      </div>

      {isOpen && searchTerm.trim() !== "" && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-paper border border-ink shadow-lg z-50 max-h-96 overflow-y-auto">
          {filteredArticles.length > 0 ? (
            filteredArticles.map((article) => (
              <Link key={article.id} href={`/articles/${article.slug}`} onClick={() => handleArticleClick(article)}>
                <div className="px-4 py-3 hover:bg-muted cursor-pointer border-b border-rule last:border-b-0 transition-colors">
                  <div className="kicker kicker--muted mb-1 text-[10px]">{article.category}</div>
                  <h4
                    className="headline text-sm leading-snug line-clamp-2 mb-1"
                    style={{ fontFamily: 'var(--font-newsreader), Georgia, serif' }}
                  >
                    {article.title}
                  </h4>
                  <div className="text-[10px] uppercase tracking-[0.1em] text-muted-foreground">
                    {article.author}
                    <span className="mx-1.5">·</span>
                    {article.readTime} min read
                  </div>
                </div>
              </Link>
            ))
          ) : (
            <div className="px-4 py-6 text-sm text-muted-foreground text-center" style={{ fontFamily: 'var(--font-newsreader), Georgia, serif' }}>
              No articles found for &ldquo;{searchTerm}&rdquo;.
            </div>
          )}
        </div>
      )}
    </div>
  )
}
