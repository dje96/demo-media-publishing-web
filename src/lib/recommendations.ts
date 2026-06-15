import { allArticles } from './data'
import { Article } from './config'
import { isSignalsEnabled } from './consent'

export interface UserAttributes {
  last_category_viewed?: string
  last_author_viewed?: string
  article_view_count?: number
  categories_viewed?: string[]
  num_ai_heartbeats?: number
  num_business_heartbeats?: number
  num_technology_heartbeats?: number
  category_heartbeats?: Record<string, number>
  unique_article_ids?: string[]
  // Attributes the `subscription_nudge` intervention is computed from.
  unique_article_view_count?: number
  article_heartbeats?: number
  // Identity attribute group.
  last_snowplow_id?: string
}

// Client-side mirror of the remote `subscription_nudge` Signals recipe.
//
// IMPORTANT: these thresholds MUST stay in sync with the intervention configured
// in Snowplow Console for the `media_publishing_demo` service. The live recipe
// fires when ALL of:
//   unique_article_view_count >= 3  AND  article_heartbeats >= 5
// They are the single source of truth for both the dual-path paywall fallback
// (isEligibleForPaywall) and the Signals Inspector criteria display, so the
// pull path behaves identically to the real push intervention.
export const PAYWALL_CRITERIA = {
  uniqueArticleViewCount: 3,
  articleHeartbeats: 5,
} as const;

// Re-derive paywall eligibility locally from polled Signals attributes. This is
// the PULL half of the dual-path pattern (guide §5.3): if the live push
// intervention is slow or missed, the popup can still fire from these attributes.
export function isEligibleForPaywall(attrs: UserAttributes | null): boolean {
  if (!attrs) return false;
  const uniqueViews = attrs.unique_article_view_count ?? attrs.unique_article_ids?.length ?? 0;
  const heartbeats = attrs.article_heartbeats ?? 0;
  return (
    uniqueViews >= PAYWALL_CRITERIA.uniqueArticleViewCount &&
    heartbeats >= PAYWALL_CRITERIA.articleHeartbeats
  );
}

export function getRecommendations(count: number = 4): Article[] {
  return allArticles.slice(0, count)
}

// Get personalized recommendations based on Signals attributes
export async function getPersonalizedRecommendations(count: number = 4): Promise<Article[]> {
  try {
    // Check if Signals personalization is enabled
    if (!isSignalsEnabled()) {
      console.log('Signals personalization is disabled, using default recommendations');
      return getRecommendations(count);
    }
    
    const sessionId = getSessionId();
    
    if (!sessionId) {
      // Fall back to default recommendations if no session ID
      return getRecommendations(count);
    }
    
    const userAttributes = await getUserAttributesFromSignals(sessionId);
    
    if (!userAttributes) {
      // Fall back to default recommendations if no attributes
      return getRecommendations(count);
    }

    // Use the last_category_viewed attribute to recommend articles
    if (userAttributes.last_category_viewed) {
      const categoryArticles = allArticles.filter(
        article => article.category === userAttributes.last_category_viewed
      );
      
      if (categoryArticles.length > 0) {
        // Return up to the requested count of articles from the same category
        return categoryArticles.slice(0, count);
      }
    }
    
    // Fall back to default recommendations if no matching category articles
    return getRecommendations(count);
    
  } catch (error) {
    console.error('Error generating personalized recommendations:', error);
    // Fall back to default recommendations on error
    return getRecommendations(count);
  }
} 

// Personalized "Recommended Reading" panel powered by Signals.
//
// When Signals is enabled we slot two targeted recommendations:
//   1. an article from the reader's `last_category_viewed`
//   2. an article from the reader's `last_author_viewed`
// In both cases we exclude anything already in `unique_article_ids` so we never
// recommend an article the reader has already seen. Any unfilled slots fall back
// to unseen articles first, then to the default recommendations.
export async function getSignalsRecommendedReading(
  count: number = 2,
): Promise<{ articles: Article[]; personalized: boolean }> {
  const fallback = () => ({ articles: getRecommendations(count), personalized: false });

  try {
    if (!isSignalsEnabled()) return fallback();

    const sessionId = getSessionId();
    if (!sessionId) return fallback();

    const attrs = await getUserAttributesFromSignals(sessionId);
    if (!attrs) return fallback();

    const viewed = new Set(attrs.unique_article_ids ?? []);
    const picked: Article[] = [];
    const pickedIds = new Set<string>();

    const take = (article?: Article) => {
      if (article && !pickedIds.has(article.id)) {
        picked.push(article);
        pickedIds.add(article.id);
      }
    };

    const isCandidate = (article: Article) =>
      !viewed.has(article.id) && !pickedIds.has(article.id);

    // Slot 1 — same category the reader last viewed.
    if (attrs.last_category_viewed) {
      take(
        allArticles.find(
          (a) => a.category === attrs.last_category_viewed && isCandidate(a),
        ),
      );
    }

    // Slot 2 — same author the reader last viewed.
    if (attrs.last_author_viewed) {
      take(
        allArticles.find(
          (a) => a.author === attrs.last_author_viewed && isCandidate(a),
        ),
      );
    }

    const personalized = picked.length > 0;

    // Fill any remaining slots with unseen articles first…
    for (const article of allArticles) {
      if (picked.length >= count) break;
      if (isCandidate(article)) take(article);
    }
    // …then, if still short, allow already-seen articles as a last resort.
    for (const article of allArticles) {
      if (picked.length >= count) break;
      take(article);
    }

    return { articles: picked.slice(0, count), personalized };
  } catch (error) {
    console.error('Error generating Signals recommended reading:', error);
    return fallback();
  }
}

// Get the actual Snowplow session ID
export function getSessionId(): string {
  if (typeof window === 'undefined') {
    return 'default-session';
  }

  // Get the Snowplow session ID from the tracker
  try {
    const windowWithSnowplow = window as typeof window & { snowplow?: (command: string) => string }
    if (windowWithSnowplow.snowplow) {
      const sessionId = windowWithSnowplow.snowplow('getSessionId');
      if (sessionId) {
        return sessionId;
      }
    }
  } catch {
    // Silently continue to cookie fallback
  }

  // Fallback: try to get from Snowplow cookie
  try {
    const cookies = document.cookie.split(';');
    for (const cookie of cookies) {
      const [name, value] = cookie.trim().split('=');

      // Check for Snowplow cookies (they can have suffixes like .1fff)
      if (name.startsWith('_sp_id') || name === 'sp') {
        // Parse the Snowplow cookie to extract session ID
        // The format is: domain_userid.session_id.first_event_time.visit_count.last_event_time.session_id.etc
        const parts = value.split('.');

        // Look for the session ID in the cookie parts
        // The session ID is at index 5 in the _sp_id cookie
        if (parts.length >= 6) {
          const sessionId = parts[5]; // This should be the session ID
          return sessionId;
        }
      }
    }
  } catch {
    // Silently continue
  }

  // If we can't get the session ID, return empty string
  return '';
}

// Get user attributes from Signals via our API route
export async function getUserAttributesFromSignals(sessionId: string): Promise<UserAttributes | null> {
  try {
    const response = await fetch('/api/signals', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ sessionId }),
    });

    const data = await response.json();

    if (data.success) {
      return data.attributes;
    } else {
      console.error('Signals API error:', data.error);
      return null;
    }
  } catch (error) {
    console.error('Error retrieving user attributes from Signals:', error);
    return null;
  }
}

// Test function to call on page load
export async function testSignalsOnPageLoad(): Promise<void> {
  if (typeof window === 'undefined') {
    return; // Only run on client side
  }

  // Wait a bit for Snowplow to initialize
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  try {
    const sessionId = getSessionId();
    
    if (!sessionId) {
      return;
    }
    
    const attributes = await getUserAttributesFromSignals(sessionId);
    
    if (attributes) {
      console.log('✅ Successfully retrieved user attributes:', attributes);
    }
  } catch (error) {
    console.error('❌ Error testing Signals on page load:', error);
  }
}