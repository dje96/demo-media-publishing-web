# Media Publishing Web Demo

A modern, feature-rich media publishing platform built with Next.js 15, React 19, and TypeScript. This demo showcases how Snowplow can be implemented on media & publishing websites or apps to provide comprehensive behavioral tracking to support analytics and real-time use cases.

## 🚀 Features

### Core Publishing Functionality
- **Article Content**: Dynamic article pages with rich content display
- **Categorization**: Organized content by Business, Technology, and AI categories
- **Search Functionality**: Full-text search across all articles
- **Subscriptions**: Mock subscription signup workflow
- **Advertising**: Advertising and sponsorship displays
- **Newsletter Signup**: Email subscription module

### Demo Functionality
- **UTM Generation**: Realistic UTM parameter generation
- **Consent Managment**: Realistic GDPR/CCPA compliant consent management
- **Video Popup**: Video popup with media tracking
- **UTM Parameter Support**: Comprehensive marketing attribution
- **Contact Forms**: Interactive contact and feedback forms

### Configurability
- **Centralized Config**: Config.ts file to manage data structures and site funcationality
- **Component Architecture**: Built with reusable React components and modular modals for optimal code organization

### Snowplow Tracking
- **Out-Of-The-Box Tracking**: Automatically tracks page views, page pings, link clicks, form interactions, consent interactions, and video events.
- **Custom Media & Publishing Events**: Tracks custom events for interactions with articles, search, ads, etc.
- **Snowtype**: All custom tracking implemented using Snowtype with included instructions file

## 🛠️ Tech Stack

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **Analytics**: Snowplow Browser Tracker
- **Icons**: Lucide React
- **UI Components**: Custom design system with class-variance-authority

## 📦 Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd media-publishing-web-demo
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🏃‍♂️ Development

### Project Structure

```
media-publishing-web-demo/
├── app/                    # Next.js App Router pages
│   ├── articles/          # Article pages and components
│   ├── category/          # Category listing pages
│   ├── search/           # Search functionality
│   └── layout.tsx        # Root layout
├── src/
│   ├── components/       # Reusable UI components
│   ├── contexts/         # React contexts
│   ├── hooks/           # Custom React hooks
│   ├── lib/             # Utility functions and config
│   ├── styles/          # Global styles
│   └── types/           # TypeScript type definitions
├── public/              # Static assets
│   ├── images/          # Article and advertisement images
│   └── videos/          # Video content
└── snowtype/            # Snowplow type definitions
```

For detailed setup, see [DESIGN_SYSTEM.md](./DESIGN_SYSTEM.md)

## 🎨 Design System

The app uses a comprehensive design system with:
- **Consistent Typography**: Modern, readable fonts
- **Component Library**: Reusable UI components
- **Responsive Grid**: Mobile-first responsive design

## 📱 Pages & Features

### Main Pages
- **Homepage** (`/`) - Featured articles and latest news
- **Article Pages** (`/articles/[slug]`) - Individual article views
- **Category Pages** (`/category/[slug]`) - Category-specific content
- **Search** (`/search`) - Full-text search functionality
- **Contact** (`/contact`) - Contact form and business info
- **Subscribe** (`/subscribe`) - Newsletter signup
- **Video** (`/video`) - Video content with tracking

## 🔧 Configuration

### Site Configuration
Main site configuration is in `src/lib/config.ts`:
- Brand settings and navigation
- Content categories and article types
- Advertising configuration
- UTM parameter settings

### Snowplow Configuration
- Snowplow initialization setup in `src/lib/snowplow-config.ts`
- Business event tracking in `src/lib/business-events.ts`
- Consent management in `src/lib/consent.ts`
- Type definitions generated via SnowType in `snowtype/`

## 🚀 Deployment

### Environment Setup
- Ensure all environment variables are configured
- Configure domain-specific settings in `src/lib/config.ts`

## 🔗 Related Documentation

### Site Documentation
- [Overview of Snowplow Implementation](./SNOWPLOW_SETUP.md)
- [Design System Documentation](./DESIGN_SYSTEM.md)

### Snowplow Data Products
- [Editorial Content Engagement](https://console.snowplowanalytics.com/b12539df-a711-42bd-bdfa-175308c55fd5/data-products/98f633e6-ab32-43a8-8e07-0d6124da0ee7)
- [Advertising Performance](https://console.snowplowanalytics.com/b12539df-a711-42bd-bdfa-175308c55fd5/data-products/58526f0a-c5b6-4d08-bc4f-199836217d0c)
- [Customer Acquisition](https://console.snowplowanalytics.com/b12539df-a711-42bd-bdfa-175308c55fd5/data-products/ead1f30f-1234-4350-a112-02003991e391)

### Coming Soon
- Custom DBT models with Media & Publishing specific aggregations
---
