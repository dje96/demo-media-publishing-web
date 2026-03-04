import { allArticles } from './data'
import { Article } from './config'
import { isSignalsEnabled } from './consent'

interface UserAttributes {
  last_category_viewed?: string
  last_author_viewed?: string
  article_view_count?: number
  categories_viewed?: string[]
  num_ai_heartbeats?: number
  num_business_heartbeats?: number
  num_technology_heartbeats?: number
}

export function getRecommendations(count: number = 4): Article[] {
  return allArticles.slice(0, count)
}

// Get a personalized featured article based on the last viewed category
export async function getPersonalizedFeaturedArticle(): Promise<Article> {
  try {
    // Check if Signals personalization is enabled
    if (!isSignalsEnabled()) {
      console.log('Signals personalization is disabled, using default featured article');
      return allArticles[0];
    }

    const sessionId = getSessionId();

    if (!sessionId) {
      // Fall back to default featured article if no session ID
      return allArticles[0];
    }

    const userAttributes = await getUserAttributesFromSignals(sessionId);

    if (!userAttributes) {
      // Fall back to default featured article if no attributes
      return allArticles[0];
    }

    // Use the last_category_viewed attribute to recommend a featured article
    if (userAttributes.last_category_viewed) {
      const categoryArticles = allArticles.filter(
        article => article.category === userAttributes.last_category_viewed
      );

      if (categoryArticles.length > 0) {
        // Return the first article from the last viewed category
        console.log(`Personalized featured article from category: ${userAttributes.last_category_viewed}`);
        return categoryArticles[0];
      }
    }

    // Fall back to default featured article if no matching category articles
    return allArticles[0];

  } catch (error) {
    console.error('Error generating personalized featured article:', error);
    // Fall back to default featured article on error
    return allArticles[0];
  }
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

// Get the actual Snowplow session ID
function getSessionId(): string {
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
async function getUserAttributesFromSignals(sessionId: string): Promise<UserAttributes | null> {
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