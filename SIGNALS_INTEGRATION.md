# Snowplow Signals Integration

This document explains how to use the Snowplow Signals integration for personalized article recommendations.

## Overview

The integration uses Snowplow Signals to retrieve user attributes and provide personalized article recommendations based on user behavior patterns. The system analyzes user engagement with different categories, authors, and articles to suggest relevant content.

## Setup

### 1. Environment Variables

Add the following environment variables to your `.env.local` file:

```env
SIGNALS_API_URL=https://7f9742b834d7.signals.snowplowanalytics.com
SIGNALS_API_KEY=your-api-key-here
SIGNALS_API_KEY_ID=your-api-key-id-here
SIGNALS_ORG_ID=b12539df-a711-42bd-bdfa-175308c55fd5
```

### 2. Signals Service Configuration

The integration uses the `media_publishing_demo` service with the following attributes:

- `article_view_count`: Number of articles viewed by the user
- `categories_viewed`: Array of categories the user has viewed
- `last_category_viewed`: Most recently viewed category
- `last_author_viewed`: Most recently viewed author
- `num_ai_heartbeats`: Engagement with AI category content
- `num_business_heartbeats`: Engagement with Business category content
- `num_technology_heartbeats`: Engagement with Technology category content

## Usage

### Basic Usage

```typescript
import { getPersonalizedRecommendations } from '@/src/lib/recommendations';

// Get personalized recommendations
const recommendations = await getPersonalizedRecommendations(4);
```

### Using the PersonalizedRecommendations Component

```tsx
import { PersonalizedRecommendations } from '@/src/components/personalized-recommendations';

function MyPage() {
  return (
    <PersonalizedRecommendations 
      count={4}
      title="Recommended for You"
      showLoadingState={true}
    />
  );
}
```

### Using with Sidebar

The sidebar component now supports personalized recommendations:

```tsx
import Sidebar from '@/src/components/sidebar';

function MyPage() {
  return (
    <Sidebar 
      recommendationCount={4}
      usePersonalizedRecommendations={true}
    />
  );
}
```

## Recommendation Strategies

The system uses multiple strategies to generate personalized recommendations:

1. **Most Active Category**: Recommends articles from the category with the highest engagement (heartbeats)
2. **Last Viewed Category**: Suggests articles from the most recently viewed category
3. **Last Viewed Author**: Recommends articles from the most recently viewed author
4. **Preferred Categories**: Suggests articles from categories ordered by engagement level
5. **Trending Articles**: For active users (5+ article views), recommends recent articles

## Fallback Behavior

The system includes robust fallback mechanisms:

- If no session ID is found, falls back to default recommendations
- If Signals API is unavailable, uses default recommendations
- If no user attributes are found, uses default recommendations
- All errors are logged and handled gracefully

## Session Management

The system automatically manages user sessions:

- Generates a unique session ID if none exists
- Stores session ID in localStorage
- Uses the session ID to retrieve user attributes from Signals

## Error Handling

The integration includes comprehensive error handling:

- Network errors are caught and logged
- Invalid responses are handled gracefully
- Fallback to default recommendations on any error
- User-friendly error messages in the UI

## Testing

To test the integration:

1. Ensure your Signals service is configured and running
2. Set up the environment variables
3. Browse articles to generate user behavior data
4. Check the browser console for logs about personalized recommendations
5. Verify that recommendations change based on user behavior

## Monitoring

The system logs important events:

- User attributes retrieved from Signals
- Recommendation generation process
- Fallback scenarios
- Error conditions

Check the browser console for detailed logs about the recommendation process.

## Customization

You can customize the recommendation logic by modifying:

- `src/lib/signals.ts`: Signals connection and attribute processing
- `src/lib/recommendations.ts`: Recommendation generation strategies
- `src/components/personalized-recommendations.tsx`: UI component behavior

## Troubleshooting

### Common Issues

1. **No personalized recommendations**: Check that Signals API credentials are correct
2. **Default recommendations only**: Verify that user attributes are being calculated in Signals
3. **Session ID issues**: Check browser localStorage for the session ID
4. **Network errors**: Verify Signals API URL and network connectivity

### Debug Mode

Enable debug logging by checking the browser console for detailed information about:
- Session ID generation and retrieval
- Signals API calls and responses
- Recommendation generation process
- Fallback scenarios
