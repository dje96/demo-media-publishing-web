export interface SiteConfig {
  // Brand & Identity
  brand: {
    name: string
    tagline: string
    logo?: string
    favicon?: string
  }
  
  // Navigation
  navigation: {
    mainMenu: Array<{
      name: string
      href: string
      icon?: string
      description?: string
    }>
    footerLinks: Array<{
      name: string
      href: string
      category: 'company' | 'product' | 'support' | 'legal'
    }>
  }
  
  // Content Structure
  content: {
    articleTypes: Array<{
      name: string
      slug: string
      description: string
      fields: Array<{
        name: string
        type: 'text' | 'number' | 'date' | 'select' | 'textarea'
        required: boolean
        options?: string[] | (() => string[])
      }>
    }>
    categories: Array<{
      name: string
      slug: string
      description: string
      color: string
      icon?: string
    }>
  }
  
  // Features & Functionality
  features: {
    search: boolean
    newsletter: boolean
    userAccounts: boolean
    advertising: boolean
    utmParameters: boolean
    consentManager: boolean
  }
  
  // Advertisement management
  // 
  // This section centralizes all advertisement content and configuration.
  // Each advertisement can be:
  // - Targeted by type (banner, sidebar, sponsored)
  // - Targeted by category (Technology, Business, AI)
  // - Prioritized using the priority field (lower number = higher priority)
  // - Used across multiple types and categories
  //
  // Usage examples:
  // - getRandomAdvertisement('banner') - Gets any banner ad
  // - getRandomAdvertisementByCategory('Technology', 'sidebar') - Gets tech-specific sidebar ad
  // - <Advertisement type="banner" category="Business" /> - Renders business-targeted banner
  advertising: {
    advertisements: Array<{
      id: string
      title: string
      description: string
      image: string
      ctaText: string
      ctaLink: string
      types: Array<'banner' | 'sidebar' | 'sponsored'>
      category?: string
      priority?: number
      cost: number
      cost_model: 'cpc' | 'cpm' | 'cpa'
      campaign_id: string
      advertiser_id: string
    }>
  }
  
  // UTM Parameters generation
  marketing: {
    utmParameters: {
      // Logical pairs of source and medium that should not need to be updated
      sources: [
        { source: "google", medium: "cpc", name: "Google Ads" },
        { source: "google", medium: "organic", name: "Google Search" },
        { source: "facebook", medium: "paid_social", name: "Facebook Ads" },
        { source: "facebook", medium: "social", name: "Facebook Shares" },
        { source: "linkedin", medium: "paid_social", name: "LinkedIn Ads" },
        { source: "linkedin", medium: "social", name: "LinkedIn Shares" },
        { source: "twitter", medium: "social", name: "Twitter" },
        { source: "newsletter", medium: "email", name: "Email Newsletter" },
        { source: "slack", medium: "referral", name: "Slack" },
        { source: "substack", medium: "email", name: "Substack" },
        { source: "reddit", medium: "social", name: "Reddit" },
        { source: "medium_com", medium: "referral", name: "Medium" }
      ],

      // Update these campaign values to match theme of the website
      campaigns: [
        "ai_ethics_2025",
        "generative_ai_guide", 
        "data_privacy_special",
        "machine_learning_basics",
        "tech_policy_series",
        "open_source_ai_focus"
      ]
    }
  }
  
  // Contact & Business Info
  business: {
    contact: {
      email: string
      phone: string
      address: string
      hours: string
    }
    social: {
      twitter?: string
      linkedin?: string
      facebook?: string
      instagram?: string
    }
  }
  
  // SEO & Meta
  seo: {
    title: string
    description: string
    keywords: string[]
    ogImage?: string
  }
}

export interface Article {
  id: string
  title: string
  excerpt: string
  author: string
  date: string
  category: string
  image: string
  readTime: number
  slug: string
  content?: string
}

// Define categories first to avoid circular dependency
const categories = [
  {
    name: "AI",
    slug: "ai",
    description: "Artificial Intelligence and Machine Learning",
    color: "#3B82F6",
    icon: "Brain"
  },
  {
    name: "Business",
    slug: "business",
    description: "Business trends and corporate news",
    color: "#10B981",
    icon: "Building2"
  },
  {
    name: "Technology",
    slug: "technology",
    description: "Technology industry updates",
    color: "#8B5CF6",
    icon: "Cpu"
  }
]

// Export the default configuration
export const siteConfig: SiteConfig = {
  brand: {
    name: "The Daily Query",
    tagline: "Your trusted source for the latest in business, technology, and artificial intelligence. Stay informed with expert insights and breaking news.",
    logo: "#",
    favicon: "/favicon.ico"
  },
  
  navigation: {
    mainMenu: [
      { name: "Business", href: "/category/business", icon: "Building2", description: "Business trends and analysis" },
      { name: "Technology", href: "/category/technology", icon: "Cpu", description: "Tech industry updates" },
      { name: "AI", href: "/category/ai", icon: "Brain", description: "Artificial intelligence coverage" }
    ],
    footerLinks: [
      { name: "Home", href: "/", category: "company" },
      { name: "Business", href: "/category/business", category: "company" },
      { name: "Technology", href: "/category/technology", category: "company" },
      { name: "AI", href: "/category/ai", category: "company" },
      { name: "Contact", href: "/contact", category: "support" },
      { name: "Advertiser Redirect", href: "/advertiser-redirect", category: "support" },
      { name: "Privacy Policy", href: "https://snowplow.io/privacy-policy/", category: "legal" },
      { name: "Snowplow.io", href: "https://snowplow.io", category: "legal" }
    ]
  },
  
  content: {
    categories,
    articleTypes: [
      {
        name: "Article",
        slug: "article",
        description: "Standard news and feature articles",
        fields: [
          { name: "title", type: "text", required: true },
          { name: "excerpt", type: "textarea", required: true },
          { name: "author", type: "text", required: true },
          { name: "date", type: "date", required: true },
          { name: "category", type: "select", required: true, options: categories.map(cat => cat.name) },
          { name: "image", type: "text", required: true },
          { name: "readTime", type: "number", required: true },
          { name: "content", type: "textarea", required: false }
        ]
      }
    ]
  },
  
  features: {
    search: true,
    newsletter: true,
    userAccounts: true,
    advertising: true,
    utmParameters: true,
    consentManager: true
  },
  
  business: {
    contact: {
      email: "contact@theplow.com",
      phone: "(555) 123-4567",
      address: "123 Media Street, Boston, MA 10001",
      hours: "Monday - Friday: 9:00 AM - 6:00 PM EST"
    },
    social: {
      twitter: "#",
      linkedin: "#"
    }
  },
  
  seo: {
    title: "The Daily Query - Media Publishing Demo",
    description: "Stay updated with the latest in technology, media, and breaking news",
    keywords: ["technology", "business", "AI", "media", "news", "journalism"],
    ogImage: "/images/logos/plow-logo.png"
  },
  
  marketing: {
    utmParameters: {
      sources: [
        { source: "google", medium: "cpc", name: "Google Ads" },
        { source: "google", medium: "organic", name: "Google Search" },
        { source: "facebook", medium: "paid_social", name: "Facebook Ads" },
        { source: "facebook", medium: "social", name: "Facebook Shares" },
        { source: "linkedin", medium: "paid_social", name: "LinkedIn Ads" },
        { source: "linkedin", medium: "social", name: "LinkedIn Shares" },
        { source: "twitter", medium: "social", name: "Twitter" },
        { source: "newsletter", medium: "email", name: "Email Newsletter" },
        { source: "slack", medium: "referral", name: "Slack" },
        { source: "direct", medium: "", name: "Direct" },
        { source: "substack", medium: "email", name: "Substack" },
        { source: "reddit", medium: "social", name: "Reddit" },
        { source: "medium_com", medium: "referral", name: "Medium" }
      ],
      campaigns: [
        "ai_ethics_2025",
        "generative_ai_guide", 
        "data_privacy_special",
        "machine_learning_basics",
        "tech_policy_series",
        "open_source_ai_focus"
      ]
    }
  },
  
  advertising: {
    advertisements: [
      {
        id: "cloud-solutions",
        title: "Boost Your Business with Cloud Solutions",
        description: "Discover how leading companies are scaling with enterprise cloud infrastructure.",
        image: "/images/advertisements/cloud-solutions.webp",
        ctaText: "Learn More",
        ctaLink: "/advertiser-redirect",
        types: ["banner", "sponsored"],
        category: "Technology",
        priority: 1,
        cost: 2.5,
        cost_model: "cpc",
        campaign_id: "cloud-solutions-2025",
        advertiser_id: "enterprise-cloud-corp"
      },
      {
        id: "professional-development",
        title: "Professional Development Courses",
        description: "Advance your career with expert-led courses in technology, business, and AI.",
        image: "/images/advertisements/professional-development-courses.webp",
        ctaText: "Explore Courses",
        ctaLink: "/advertiser-redirect",
        types: ["sidebar"],
        category: "Business",
        priority: 2,
        cost: 2.5,
        cost_model: "cpc",
        campaign_id: "professional-dev-2025",
        advertiser_id: "skill-academy"
      },
      {
        id: "ai-marketing",
        title: "The Future of Digital Marketing: AI-Powered Analytics",
        description: "See how industry leaders are using artificial intelligence to transform their marketing strategies and drive growth.",
        image: "/images/advertisements/cloud-solutions.webp", // Reusing image for now
        ctaText: "Read Case Study",
        ctaLink: "/advertiser-redirect",
        types: ["sponsored"],
        category: "AI",
        priority: 3,
        cost: 2.5,
        cost_model: "cpc",
        campaign_id: "ai-marketing-2025",
        advertiser_id: "marketing-ai-solutions"
      },
      {
        id: "data-privacy",
        title: "Protect Your Data with Enterprise Security",
        description: "Learn how top companies are implementing robust data protection strategies in the age of AI.",
        image: "/images/advertisements/professional-development-courses.webp", // Reusing image for now
        ctaText: "Get Security Guide",
        ctaLink: "/advertiser-redirect",
        types: ["banner", "sidebar"],
        category: "Technology",
        priority: 4,
        cost: 2.5,
        cost_model: "cpc",
        campaign_id: "data-security-2025",
        advertiser_id: "cyber-security-pro"
      }
    ]
  }
}

// Generate TypeScript types from config
export type ArticleType = typeof siteConfig.content.articleTypes[0]
export type Category = typeof siteConfig.content.categories[0]
export type NavigationItem = typeof siteConfig.navigation.mainMenu[0]
export type FooterLink = typeof siteConfig.navigation.footerLinks[0]
export type Advertisement = typeof siteConfig.advertising.advertisements[0]

// Helper functions
export function getCategoryBySlug(slug: string): Category | undefined {
  return siteConfig.content.categories.find(cat => cat.slug === slug)
}

export function getCategoryByName(name: string): Category | undefined {
  return siteConfig.content.categories.find(cat => cat.name === name)
}

export function getNavigationItemByHref(href: string): NavigationItem | undefined {
  return siteConfig.navigation.mainMenu.find(item => item.href === href)
}

export function getCategoryOptions(): string[] {
  return siteConfig.content.categories.map(cat => cat.name)
}

// Helper function to get random UTM parameters
export function getRandomUtmParameters() {
  const sources = siteConfig.marketing.utmParameters.sources
  const campaigns = siteConfig.marketing.utmParameters.campaigns
  
  const randomSource = sources[Math.floor(Math.random() * sources.length)]
  const randomCampaign = campaigns[Math.floor(Math.random() * campaigns.length)]
  
  return {
    source: randomSource.source,
    medium: randomSource.medium,
    campaign: randomCampaign,
    sourceName: randomSource.name
  }
}

// Helper functions for advertisement management
export function getAdvertisementsByType(type: 'banner' | 'sidebar' | 'sponsored') {
  return siteConfig.advertising.advertisements.filter(ad => ad.types.includes(type))
}

export function getRandomAdvertisement(type: 'banner' | 'sidebar' | 'sponsored') {
  const ads = getAdvertisementsByType(type)
  if (ads.length === 0) return null
  
  // Sort by priority (lower number = higher priority) and return random from top priority
  const sortedAds = ads.sort((a, b) => (a.priority || 999) - (b.priority || 999))
  const topPriority = sortedAds[0].priority || 999
  const topPriorityAds = sortedAds.filter(ad => (ad.priority || 999) === topPriority)
  
  return topPriorityAds[Math.floor(Math.random() * topPriorityAds.length)]
}

export function getAdvertisementById(id: string) {
  return siteConfig.advertising.advertisements.find(ad => ad.id === id)
}

export function getAdvertisementsByCategory(category: string) {
  return siteConfig.advertising.advertisements.filter(ad => ad.category === category)
}

export function getRandomAdvertisementByCategory(category: string, type: 'banner' | 'sidebar' | 'sponsored') {
  const categoryAds = getAdvertisementsByCategory(category)
  const typeAds = categoryAds.filter(ad => ad.types.includes(type))
  
  if (typeAds.length === 0) {
    // Fallback to any ad of the requested type if no category-specific ads
    return getRandomAdvertisement(type)
  }
  
  // Sort by priority and return random from top priority
  const sortedAds = typeAds.sort((a, b) => (a.priority || 999) - (b.priority || 999))
  const topPriority = sortedAds[0].priority || 999
  const topPriorityAds = sortedAds.filter(ad => (ad.priority || 999) === topPriority)
  
  return topPriorityAds[Math.floor(Math.random() * topPriorityAds.length)]
} 