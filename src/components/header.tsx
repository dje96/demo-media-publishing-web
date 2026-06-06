"use client"

import { Menu, X, LogOut, User } from "lucide-react"
import { useEffect, useState } from "react"
import { usePathname, useRouter } from "next/navigation"
import Link from "next/link"
import SearchDropdown from "./search-dropdown"
import LoginModal from "./login-modal"
import { useUser } from "../contexts/user-context"
import { siteConfig } from "@/src/lib/config"
import { formatDate } from "@/src/lib/utils"

function MastheadDate() {
  const [today, setToday] = useState<string>("")
  useEffect(() => {
    setToday(formatDate(new Date(), { weekday: "long", year: "numeric", month: "long", day: "numeric" }))
  }, [])
  return <span suppressHydrationWarning>{today}</span>
}

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false)
  const pathname = usePathname()
  const router = useRouter()
  const { user, isLoading, login, logout } = useUser()

  const handleLogin = (email: string) => {
    login(email)
    setIsLoginModalOpen(false)
  }

  const handleSubscribeClick = () => {
    router.push('/subscribe')
  }

  const renderAuthContent = () => {
    if (isLoading) {
      return <div className="w-20 h-7 bg-muted animate-pulse" />
    }

    if (user) {
      return (
        <div className="flex items-center gap-3 text-xs uppercase tracking-[0.12em] text-ink">
          <User className="h-3.5 w-3.5" />
          <span className="hidden sm:inline normal-case tracking-normal text-muted-foreground">{user.email}</span>
          <button
            onClick={logout}
            className="flex items-center gap-1.5 hover:text-breaking transition-colors cursor-pointer"
          >
            <LogOut className="h-3.5 w-3.5" />
            <span>Sign out</span>
          </button>
        </div>
      )
    }

    return (
      <div className="flex items-center gap-2">
        <button
          onClick={() => setIsLoginModalOpen(true)}
          className="text-xs font-semibold uppercase tracking-[0.12em] text-ink hover:text-breaking transition-colors cursor-pointer"
        >
          Sign in
        </button>
        <span className="text-rule" aria-hidden>|</span>
        <button
          onClick={handleSubscribeClick}
          className="bg-ink text-paper px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] hover:bg-breaking transition-colors cursor-pointer"
        >
          Subscribe
        </button>
      </div>
    )
  }

  const renderMobileAuthContent = () => {
    if (isLoading) {
      return <div className="px-3 py-3 border-t border-rule"><div className="w-32 h-4 bg-muted animate-pulse" /></div>
    }

    if (user) {
      return (
        <div className="px-3 py-3 border-t border-rule space-y-2">
          <div className="flex items-center text-xs text-muted-foreground">
            <User className="h-3.5 w-3.5 mr-2" />
            <span>{user.email}</span>
          </div>
          <button
            onClick={logout}
            className="flex items-center w-full text-xs uppercase tracking-[0.12em] font-semibold text-ink hover:text-breaking transition-colors cursor-pointer"
          >
            <LogOut className="h-3.5 w-3.5 mr-2" />
            Sign out
          </button>
        </div>
      )
    }

    return (
      <div className="px-3 py-3 border-t border-rule space-y-2">
        <button
          onClick={() => { handleSubscribeClick(); setIsMenuOpen(false) }}
          className="w-full bg-ink text-paper py-2.5 text-xs font-semibold uppercase tracking-[0.12em] hover:bg-breaking transition-colors cursor-pointer"
        >
          Subscribe
        </button>
        <button
          onClick={() => { setIsLoginModalOpen(true); setIsMenuOpen(false) }}
          className="w-full border border-ink text-ink py-2.5 text-xs font-semibold uppercase tracking-[0.12em] hover:bg-ink hover:text-paper transition-colors cursor-pointer"
        >
          Sign in
        </button>
      </div>
    )
  }

  return (
    <>
      <header className="bg-paper border-b border-ink">
        {/* Top utility bar */}
        <div className="border-b border-rule">
          <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center h-9 text-[11px] uppercase tracking-[0.12em] text-muted-foreground">
            <MastheadDate />
            <div className="hidden md:block">
              {siteConfig.features.userAccounts && renderAuthContent()}
            </div>
          </div>
        </div>

        {/* Masthead */}
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-3 items-center py-5 sm:py-7">
            {/* Left: mobile menu button */}
            <div className="flex items-center lg:hidden">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="inline-flex items-center justify-center p-2 text-ink hover:text-breaking focus:outline-none cursor-pointer"
                aria-label="Toggle menu"
              >
                {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
            </div>
            <div className="hidden lg:block text-xs uppercase tracking-[0.18em] text-muted-foreground">
              Today&apos;s Edition
            </div>

            {/* Center: wordmark */}
            <div className="flex justify-center">
              <Link
                href="/"
                className="font-serif text-3xl sm:text-5xl font-bold tracking-[-0.01em] text-ink whitespace-nowrap"
                style={{ fontFamily: 'var(--font-newsreader), Georgia, serif' }}
              >
                {siteConfig.brand.name}
              </Link>
            </div>

            {/* Right: search */}
            <div className="flex justify-end items-center">
              {siteConfig.features.search && <SearchDropdown />}
            </div>
          </div>
        </div>

        {/* Section nav (under masthead) */}
        <nav className="border-t border-b border-rule bg-paper">
          <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
            <ul className="hidden lg:flex justify-center items-center gap-8 h-11">
              {siteConfig.navigation.mainMenu.map((item) => {
                const isActive = pathname === item.href
                return (
                  <li key={item.name}>
                    <Link
                      href={item.href}
                      className={`text-[11px] font-semibold uppercase tracking-[0.18em] transition-colors ${
                        isActive ? "text-breaking" : "text-ink hover:text-breaking"
                      }`}
                    >
                      {item.name}
                    </Link>
                  </li>
                )
              })}
            </ul>
          </div>
        </nav>

        {/* Mobile drawer */}
        {isMenuOpen && (
          <div className="lg:hidden border-b border-rule bg-paper">
            <ul className="px-4 py-3 space-y-1">
              {siteConfig.navigation.mainMenu.map((item) => {
                const isActive = pathname === item.href
                return (
                  <li key={item.name}>
                    <Link
                      href={item.href}
                      onClick={() => setIsMenuOpen(false)}
                      className={`block px-2 py-2.5 text-sm font-semibold uppercase tracking-[0.12em] border-b border-rule ${
                        isActive ? "text-breaking" : "text-ink hover:text-breaking"
                      }`}
                    >
                      {item.name}
                    </Link>
                  </li>
                )
              })}
            </ul>
            {siteConfig.features.userAccounts && renderMobileAuthContent()}
          </div>
        )}
      </header>

      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onLogin={handleLogin}
      />
    </>
  )
}
