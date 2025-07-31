# Media Publishing Web Demo - Architecture & Design System Documentation

This document provides comprehensive documentation of the architecture, components, patterns, and design system for The Powder Post media publishing website. This serves as a complete guide for developers and AI agents working on this codebase.

## 🏗️ Tech Stack & Architecture

### Core Technologies
- **Next.js 14** (App Router) - React framework with file-based routing
- **React 18** - UI library with hooks and context
- **TypeScript 5** - Type-safe JavaScript
- **Tailwind CSS 3** - Utility-first CSS framework
- **Lucide React** - Icon library
- **Snowplow Analytics** - User tracking and analytics with Enhanced Consent Plugin

### Architectural Patterns
- **Configuration-Driven Development** - All hardcoded values moved to `lib/config.ts`
- **Component Composition** - Reusable layout and content components
- **Centralized Data Layer** - Single source of truth for articles and configuration
- **Type Safety** - Strict TypeScript with interfaces for all data structures
- **Separation of Concerns** - Clear separation between tracking, consent management, and UI components

## 📁 Project Structure

```
media-publishing-web-demo/
├── app/
│   ├── components/          # Reusable UI components
│   ├── contexts/           # React context providers
│   ├── hooks/              # Custom React hooks
│   ├── articles/[slug]/    # Article detail pages
│   └── [page].tsx          # Page routes
├── lib/
│   ├── config.ts           # Centralized site configuration
│   ├── data.ts             # Article data and access functions
│   ├── recommendations.ts  # Recommendation logic
│   ├── snowplow.ts         # Snowplow tracking and Enhanced Consent Plugin
│   ├── consent.ts          # Consent management utilities
│   ├── utils.ts            # Utility functions
│   └── design-system.ts    # Design tokens and constants
├── types/
│   └── global.d.ts         # Global TypeScript declarations
└── public/
    └── images/             # Static images organized by type
```

## 🧩 Component Hierarchy & Visual Structure

### Page Structure (Every page follows this pattern)
```
PageLayout
├── Header (Global Navigation)
├── MainContentLayout
│   ├── MainContent (lg:col-span-3)
│   └── Sidebar (lg:col-span-1)
├── Footer
└── ConsentManager (Global - Available on all pages)
```

### Layout Components

#### PageLayout
- **Purpose**: Wraps entire page with Header, Footer, and background
- **Styling**: `min-h-screen bg-gray-50`
- **Usage**: Every page starts with this component
- **ConsentManager**: Now included globally in PageLayout for site-wide access

#### MainContentLayout
- **Purpose**: Provides 3-column + 1-column sidebar grid layout
- **Styling**: `max-w-screen-xl mx-auto px-2 md:px-4 py-8`
- **Children**: Main content area + Sidebar
- **Advertising Management**: Accepts an optional `advertising` prop to centrally manage the placement and type of advertising/sponsorship elements on the page. This replaces the previous pattern of hard-coding ad components in each page.
- **Props**:
  - `advertising?: { banner?: boolean; inArticle?: boolean; sponsored?: boolean }`
  - Example usage:

```tsx
<MainContentLayout advertising={{ banner: true, inArticle: false, sponsored: false }}>
  {/* Page content */}
</MainContentLayout>
```

- **How it works**: When the `advertising` prop is set, the layout will automatically render the appropriate ad components (e.g., banner, in-article, sponsored) in their designated locations, if the `advertising` feature flag is enabled in `siteConfig`. This centralizes ad logic and keeps page components clean.

#### Header
- **Purpose**: Global navigation with logo, menu, search, and user auth
- **Features**: Responsive navigation, search dropdown, login modal, user context
- **Styling**: `bg-white shadow-sm border-b`

#### Footer
- **Purpose**: Site footer with links and branding
- **Features**: UTM reload button, Manage Consent button, social links
- **Styling**: `bg-gray-900 text-white`
- **Consent Integration**: "Manage Consent" button dispatches custom event to show consent manager

#### Sidebar
- **Purpose**: Consistent sidebar with recommendations, ads, newsletter
- **Children**: Recommendations → Advertisement → NewsletterSignup
- **Styling**: `sticky top-8 space-y-6`

### Content Components

#### PageHeader
- **Purpose**: Page-specific title and description
- **Props**: `title`, `description`, `className`
- **Styling**: `text-3xl font-bold text-gray-900 mb-2`

#### ArticleCard
- **Purpose**: Article preview card for grids
- **Props**: `article`
- **Styling**: `bg-white rounded-lg shadow-md overflow-hidden`

#### ArticleGrid
- **Purpose**: 2-column responsive grid for articles
- **Props**: `articles`, `className`
- **Styling**: `grid grid-cols-1 md:grid-cols-2 gap-6`

### Form Components

#### FormInput
- **Purpose**: Consistent input with label and error handling
- **Props**: `label`, `error`, `className`, `...inputProps`
- **Styling**: `w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-brand-primary`

#### FormTextarea
- **Purpose**: Consistent textarea with label and error handling
- **Props**: `label`, `error`, `className`, `...textareaProps`
- **Styling**: Same as FormInput

### Feature Components

#### SearchDropdown
- **Purpose**: Search functionality with dropdown results
- **Features**: Debounced search, article filtering, keyboard navigation
- **Behavior**: Only shows results when there's text in the search box

#### LoginModal
- **Purpose**: User authentication modal
- **Features**: Email validation, user context integration

#### NewsletterSignup
- **Purpose**: Email newsletter subscription
- **Features**: Form validation, success/error states

#### Advertisement
- **Purpose**: Configurable ad placements (banner, sidebar, sponsored)
- **Integration**: Now managed centrally via the `advertising` prop on `MainContentLayout`. Pages specify which ad types to show by passing the appropriate configuration, rather than rendering ad components directly.
- **Types**: `banner`, `sidebar`, `sponsored`

#### ConsentManager
- **Purpose**: GDPR/CCPA compliant cookie and tracking consent management
- **Features**: 
  - Manual activation via footer button or floating settings button
  - Granular cookie preference controls
  - Persistent settings storage
  - Snowplow Enhanced Consent Plugin integration
  - Floating settings button for later access
  - Global availability across all pages
- **Cookie Categories**:
  - **Necessary**: Always enabled (required for site functionality)
  - **Analytics**: For tracking user behavior and site performance
  - **Marketing**: For personalized advertising and campaigns
  - **Preferences**: For remembering user settings and choices
- **Integration**: 
  - Available globally via PageLayout component
  - Footer "Manage Consent" button dispatches custom event
  - Floating settings button in bottom-right corner
  - Tracks consent events using Snowplow Enhanced Consent Plugin
- **Storage**: Uses localStorage for persistence across sessions via `lib/consent.ts`
- **Styling**: Modal overlay with responsive design, matches site aesthetic

## 📊 Data Architecture

### Core Data Types
- **Article**: Main content type with id, title, excerpt, author, date, category, image, readTime, slug, content
- **SiteConfig**: Centralized configuration interface
- **User**: User authentication context
- **ConsentPreferences**: Cookie consent preferences interface (defined in `lib/consent.ts`)

### Data Access Patterns
- **Articles**: `lib/data.ts` - Record<string, Article> with slug as key
- **getArticleBySlug**: Function to retrieve article by slug
- **getArticlesByCategory**: Function to filter articles by category
- **searchArticles**: Function to search articles by query
- **getRecommendations**: `lib/recommendations.ts` - Returns random article selection
- **Consent Management**: `lib/consent.ts` - Consent utilities and state management

### Configuration Structure
- **brand**: Site branding (name, tagline, logo)
- **navigation**: Menu structure and routing
- **content**: Article categories and types
- **features**: Feature flags (search, newsletter, userAccounts, advertising)
- **business**: Contact information and business details
- **seo**: Default SEO metadata
- **marketing**: UTM parameters and marketing configuration

## 🎨 Design System & Styling

### Color System

#### Brand Colors
All brand colors are defined as CSS custom properties in `app/globals.css`:

```css
:root {
  --brand-primary: #9e62dd;           /* Purple - your original brand color */
  --brand-primary-hover: #8a4fd1;     /* Darker purple for hover states */
  --brand-secondary: #646cff;         /* Blue for secondary actions */
}
```

#### Usage
- **Text**: `text-brand-primary`
- **Background**: `bg-brand-primary`
- **Hover states**: `hover:bg-brand-primary-hover`
- **Borders**: `border-brand-primary`

#### Semantic Colors
- `--success: #10b981` - Green for success states
- `--warning: #f59e0b` - Amber for warning states  
- `--info: #3b82f6` - Blue for informational states
- `--destructive: #ef4444` - Red for error/destructive actions

#### Category Colors
Category colors are managed through the `getCategoryColor()` utility function in `lib/utils.ts`:

```typescript
getCategoryColor("technology") // Returns: "bg-green-100 text-green-800"
getCategoryColor("business")   // Returns: "bg-blue-100 text-blue-800"
getCategoryColor("ai")         // Returns: "bg-purple-100 text-purple-800"
```

### Typography Scale
```typescript
typography: {
  headings: {
    h1: "text-3xl font-bold text-gray-900",
    h2: "text-2xl font-bold text-gray-900",
    h3: "text-lg font-bold text-gray-900",
  },
  body: {
    default: "text-gray-700",
    muted: "text-gray-600",
    small: "text-sm text-gray-500",
  },
}
```

### Spacing System
```typescript
spacing: {
  container: "max-w-screen-xl mx-auto px-2 md:px-4",
  section: "py-8",
  component: "mb-8",
  element: "space-y-6",
}
```

### Layout Patterns
```typescript
layout: {
  grid: "grid grid-cols-1 lg:grid-cols-4 gap-8",
  card: "bg-white rounded-lg shadow-md",
  sidebar: "sticky top-8 space-y-6",
}
```

## 🛣️ Routing & Navigation

### Page Routes
- **Home**: `/`
- **AI**: `/ai`
- **Business**: `/business`
- **Technology**: `/technology`
- **Contact**: `/contact`
- **Search**: `/search`
- **Articles**: `/articles/[slug]`
- **Advertiser Redirect**: `/advertiser-redirect` - Advertiser landing page with countdown redirect

### Navigation Structure
- **Main Menu**: Defined in `siteConfig.navigation.mainMenu`
- **Footer Links**: Defined in `siteConfig.navigation.footerLinks` (includes advertiser redirect)
- **Active States**: Border-bottom for desktop, background color for mobile
- **Responsive**: Hamburger menu for mobile, horizontal for desktop

## 🔄 State Management & Context

### React Context
- **UserContext**: User authentication state (`app/contexts/user-context.tsx`)
- **Providers**: UserProvider
- **Hooks**: useUser

### Local State Patterns
- **Modals**: useState for modal visibility
- **Forms**: useState for form data
- **Search**: useState for search queries
- **Consent**: useState for consent preferences and modal states

## 📈 Analytics & Tracking

### Snowplow Integration
- **Setup**: `lib/snowplow.ts` - Core tracking and Enhanced Consent Plugin
- **Provider**: `app/components/snowplow-provider.tsx`
- **Hook**: `app/hooks/use-snowplow-tracking.ts`
- **Events**: page_view, consent events

### Consent Management Architecture

#### File Structure
- **`lib/consent.ts`**: Consent utilities and state management
- **`lib/snowplow.ts`**: Snowplow tracking and Enhanced Consent Plugin integration
- **`app/components/consent-manager.tsx`**: UI component for consent management
- **`types/global.d.ts`**: Global TypeScript declarations for Snowplow

#### Consent Utilities (`lib/consent.ts`)
```typescript
// Core consent interface
interface ConsentPreferences {
  necessary: boolean
  analytics: boolean
  marketing: boolean
  preferences: boolean
}

// Utility functions
hasAnalyticsConsent(): boolean
hasMarketingConsent(): boolean
getConsentPreferences(): ConsentPreferences | null
saveConsentPreferences(preferences: ConsentPreferences): void
hasConsentBeenGiven(): boolean
clearConsentData(): void
```

#### Snowplow Enhanced Consent Plugin (`lib/snowplow.ts`)
```typescript
// Consent event tracking functions
trackConsentAllowEvent(consentScopes: string[])
trackConsentDenyEvent(consentScopes: string[])
trackConsentSelectedEvent(consentScopes: string[])
trackConsentWithdrawnEvent(consentScopes: string[])
trackCmpVisibleEvent()
```

#### Consent Event Tracking
- **Schema**: Uses Snowplow's official Enhanced Consent Plugin schemas
- **Events**: 
  - `consent_allow` - When user accepts all cookies
  - `consent_deny` - When user rejects non-necessary cookies
  - `consent_selected` - When user saves custom preferences
  - `consent_withdrawn` - When user withdraws consent
  - `cmp_visible` - When consent banner becomes visible
- **Data**: Includes consent scopes, basis for processing, consent URL, version, domains, and GDPR applicability

### Consent-Aware Tracking Pattern
```typescript
// ✅ Good - Checking consent before tracking
import { hasAnalyticsConsent } from '@/lib/consent'

const handleUserAction = () => {
  if (hasAnalyticsConsent()) {
    // Track user action
    trackSelfDescribingEvent({
      event: {
        schema: 'iglu:com.example/event/jsonschema/1-0-0',
        data: { action: 'user_clicked_button' }
      }
    })
  }
}
```

## 💻 Development Patterns & Conventions

### File Naming
- **Components**: kebab-case (`page-header.tsx`)
- **Pages**: `page.tsx` in route directories
- **Hooks**: `use-` prefix (`use-snowplow-tracking.ts`)
- **Types**: `global.d.ts` for global TypeScript declarations

### Import Patterns
- **Components**: Relative imports from components directory
- **Lib**: Absolute imports with `@/lib` prefix
- **Types**: Import from `lib/config.ts` for shared types

### Component Patterns
- **Props**: TypeScript interfaces for all props
- **Children**: React.ReactNode for flexible content
- **ClassName**: Optional className prop for customization
- **ForwardRef**: Used for form components

### Error Handling
- **NotFound**: `next/navigation notFound()` for 404s
- **Loading**: Suspense boundaries for async components
- **Validation**: Form validation with error states

## 🤖 AI Agent Context & Helpful Information

### Key Files to Understand
- **config**: `lib/config.ts` - All site configuration and types
- **data**: `lib/data.ts` - Article data and access functions
- **layout**: `app/components/page-layout.tsx` - Page structure with global consent manager
- **sidebar**: `app/components/sidebar.tsx` - Sidebar composition
- **consent**: `lib/consent.ts` - Consent utilities and state management
- **snowplow**: `lib/snowplow.ts` - Snowplow tracking and Enhanced Consent Plugin
- **consent-manager**: `app/components/consent-manager.tsx` - Consent management UI

### Common Patterns to Follow
- **New Pages**: Use PageLayout + MainContentLayout + PageHeader
- **New Components**: Follow existing prop patterns and styling
- **Data Access**: Use functions from `lib/data.ts`, don't access articles directly
- **Styling**: Use Tailwind classes, follow existing color/typography patterns
- **Consent**: Check consent status before tracking user behavior using `lib/consent.ts`

### Things to Avoid
- **Hardcoding**: Don't hardcode values, use siteConfig
- **Duplication**: Don't duplicate layout code, use existing components
- **Direct Data Access**: Don't import articles directly, use data functions
- **Inconsistent Styling**: Don't create new color schemes, use existing tokens
- **Tracking Without Consent**: Don't track user behavior without proper consent
- **Mixed Concerns**: Don't mix consent utilities with tracking functions

### Useful Context for Modifications
- **Add New Page**: Copy existing page structure, update imports, add to navigation
- **Add New Component**: Follow existing patterns, add to appropriate directory
- **Modify Layout**: Update PageLayout or MainContentLayout components
- **Change Styling**: Update design tokens in this file or component styles
- **Add New Feature**: Check if it should be configurable in siteConfig
- **Add Tracking**: Ensure consent is checked before implementing new tracking
- **Consent Management**: Use utilities from `lib/consent.ts` for consent checks

## ⚡ Performance & Optimization

### Next.js Optimizations
- **Image Optimization**: Next.js Image component for all images
- **Static Generation**: Static pages where possible
- **Dynamic Imports**: Suspense for search results

### React Optimizations
- **Memoization**: React.memo for expensive components
- **Lazy Loading**: Dynamic imports for heavy components
- **Context Optimization**: Minimal context updates

### Bundle Optimization
- **Tree Shaking**: Import only needed components
- **Code Splitting**: Route-based code splitting
- **Asset Optimization**: Optimized images and fonts

## 🚀 Deployment & Environment

### Environment Variables
- **SNOWPLOW_ENDPOINT**: Snowplow analytics endpoint
- **NEXT_PUBLIC_SITE_URL**: Public site URL for analytics

### Build Process
- **Static Export**: `next build && next export`
- **Optimization**: Image optimization, code splitting
- **Analytics**: Snowplow tracking enabled in production

## 📝 Best Practices

### ✅ Do's
- Use CSS custom properties for all colors
- Use the `getCategoryColor()` utility for category badges
- Use `commonClasses` for repeated patterns
- Use semantic color names (success, warning, info, destructive)
- Use the design system constants for spacing and typography
- Follow the established component hierarchy
- Use configuration-driven development
- Maintain type safety with TypeScript
- Check consent before tracking user behavior using `lib/consent.ts`
- Use consent utility functions for conditional tracking
- Separate concerns: tracking in `lib/snowplow.ts`, consent in `lib/consent.ts`

### ❌ Don'ts
- Don't use hardcoded hex colors (`#9e62dd`) - use CSS custom properties instead
- Don't use inline styles for colors
- Don't duplicate color logic across components
- Don't use arbitrary values when design system tokens exist
- Don't hardcode values - use siteConfig
- Don't duplicate layout code - use existing components
- Don't import articles directly - use data functions
- Don't create new color schemes - use existing tokens
- Don't track user behavior without checking consent first
- Don't bypass consent management for analytics
- Don't mix consent utilities with tracking functions

## 🔍 Component Examples

### Header Component
```tsx
// ✅ Good - Using centralized colors
<h1 className="text-2xl font-bold text-brand-primary">
  The Powder Post
</h1>

// ❌ Bad - Using hardcoded colors
<h1 className="text-2xl font-bold" style={{ color: "#9e62dd" }}>
  The Powder Post
</h1>
```

### Category Badge
```tsx
// ✅ Good - Using utility function
<span className={`px-2 py-1 text-xs font-semibold rounded ${getCategoryColor(article.category)}`}>
  {article.category}
</span>

// ❌ Bad - Duplicating logic
const getCategoryColor = (category: string) => {
  switch (category.toLowerCase()) {
    case "technology": return "bg-green-100 text-green-800"
    // ... duplicate logic
  }
}
```

### New Page Structure
```tsx
// ✅ Good - Following established patterns
export default function NewPage() {
  return (
    <PageLayout>
      <MainContentLayout>
        <PageHeader 
          title="New Page" 
          description="Page description" 
        />
        {/* Page content */}
      </MainContentLayout>
    </PageLayout>
  )
}
```

### Consent-Aware Tracking
```tsx
// ✅ Good - Checking consent before tracking
import { hasAnalyticsConsent } from '@/lib/consent'

const handleUserAction = () => {
  if (hasAnalyticsConsent()) {
    // Track user action
    trackSelfDescribingEvent({
      event: {
        schema: 'iglu:com.example/event/jsonschema/1-0-0',
        data: { action: 'user_clicked_button' }
      }
    })
  }
}

// ❌ Bad - Tracking without consent check
const handleUserAction = () => {
  // Always track regardless of consent
  trackSelfDescribingEvent({
    event: {
      schema: 'iglu:com.example/event/jsonschema/1-0-0',
      data: { action: 'user_clicked_button' }
    }
  })
}
```

### Consent Management Integration
```tsx
// ✅ Good - Using consent utilities
import { getConsentPreferences, saveConsentPreferences } from '@/lib/consent'
import { trackConsentAllowEvent } from '@/lib/snowplow'

const handleAcceptAll = () => {
  const preferences = {
    necessary: true,
    analytics: true,
    marketing: true,
    preferences: true
  }
  
  saveConsentPreferences(preferences)
  trackConsentAllowEvent(['necessary', 'analytics', 'marketing', 'preferences'])
}
```

## 📚 Additional Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [React Documentation](https://react.dev/)
- [TypeScript Documentation](https://www.typescriptlang.org/docs/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [CSS Custom Properties Guide](https://developer.mozilla.org/en-US/docs/Web/CSS/Using_CSS_custom_properties)
- [Design Tokens Best Practices](https://www.designtokens.org/) 
- [GDPR Compliance Guide](https://gdpr.eu/)
- [Snowplow Enhanced Consent Plugin](https://docs.snowplow.io/docs/sources/trackers/web-trackers/tracking-events/consent-gdpr/)

### Feature Flags (`lib/config.ts`)
- `search`: Enables search functionality
- `newsletter`: Enables newsletter signup components
- `userAccounts`: Enables user account features (login modal)
- `advertising`: Enables advertisement and sponsorship components throughout the site 

### Consent Management Files
- `app/components/consent-manager.tsx`: Main consent management UI component
- `lib/consent.ts`: Consent utilities and state management
- `lib/snowplow.ts`: Snowplow tracking and Enhanced Consent Plugin integration
- `types/global.d.ts`: Global TypeScript declarations for Snowplow
- `app/components/page-layout.tsx`: Global integration point for consent manager 