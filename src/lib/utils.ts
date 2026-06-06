import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Format date consistently for server and client rendering
 * This prevents hydration errors by ensuring the same output on both server and client
 * Always uses 'en-US' locale to avoid locale-specific formatting differences
 */
export function formatDate(date: string | Date, options?: Intl.DateTimeFormatOptions): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  
  // Use consistent locale and options to prevent hydration mismatches
  const defaultOptions: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    ...options
  }
  
  return dateObj.toLocaleDateString('en-US', defaultOptions)
}

/**
 * Format date for short display (e.g., "Jan 15, 2024")
 */
export function formatDateShort(date: string | Date): string {
  return formatDate(date, {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

/**
 * Format date for long display (e.g., "January 15, 2024")
 */
export function formatDateLong(date: string | Date): string {
  return formatDate(date, {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

/**
 * Editorial category styling — kicker (all-caps text label), not a colored pill.
 * Returns class names suitable for a small uppercase label.
 */
export function getCategoryColor(_category: string): string {
  // Single editorial treatment for all categories.
  return "kicker"
}

export const brandColors = {
  primary: "text-ink hover:text-breaking",
  bgPrimary: "bg-ink hover:bg-breaking text-paper",
  borderPrimary: "border-ink",
  bgPrimaryLight: "bg-muted",
  textPrimary: "text-ink"
} as const

/**
 * Build a URL with UTM parameters for marketing tracking
 *
 * Supports all parameters that Snowplow's Campaign Attribution Enrichment can collect:
 * - Standard UTM parameters (source, medium, campaign, term, content)
 * - Click ID parameters (gclid for Google, msclkid for Microsoft, dclid for DoubleClick)
 *
 * Note: mkt_network is automatically populated by Snowplow based on the click ID parameter
 */
export function buildUrlWithUtm(url: string, utmParams: {
  source: string
  medium: string
  campaign: string
  term?: string
  content?: string
  gclid?: string      // Google Click ID
  msclkid?: string    // Microsoft Click ID
  dclid?: string      // DoubleClick Click ID
}): string {
  const urlObj = new URL(url, window.location.origin)

  // Add required UTM parameters
  urlObj.searchParams.set('utm_source', utmParams.source)
  urlObj.searchParams.set('utm_medium', utmParams.medium)
  urlObj.searchParams.set('utm_campaign', utmParams.campaign)

  // Add optional UTM parameters
  if (utmParams.term) {
    urlObj.searchParams.set('utm_term', utmParams.term)
  }

  if (utmParams.content) {
    urlObj.searchParams.set('utm_content', utmParams.content)
  }

  // Add click ID parameters (for paid advertising tracking)
  if (utmParams.gclid) {
    urlObj.searchParams.set('gclid', utmParams.gclid)
  }

  if (utmParams.msclkid) {
    urlObj.searchParams.set('msclkid', utmParams.msclkid)
  }

  if (utmParams.dclid) {
    urlObj.searchParams.set('dclid', utmParams.dclid)
  }

  return urlObj.toString()
}
