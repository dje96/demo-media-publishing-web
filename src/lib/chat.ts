import { allArticles } from './data';
import type { UserAttributes } from './recommendations';

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export function buildSystemPrompt(
  attributes: UserAttributes | null,
  currentPage: string
): string {
  const identity = `You are a helpful assistant for The Daily Query, a media publishing site covering AI, Business, and Technology. You help readers discover articles and understand subscription benefits. Be concise — aim for 1-2 short sentences per response. Do NOT use markdown formatting (no bold, no links, no lists).`;

  const viewedIds = new Set(attributes?.unique_article_ids ?? []);
  const unreadArticles = allArticles.filter((a) => !viewedIds.has(a.id));
  const readArticles = allArticles.filter((a) => viewedIds.has(a.id));

  const formatArticle = (a: typeof allArticles[0]) =>
    `- slug: ${a.slug} | "${a.title}" by ${a.author} | Category: ${a.category} | ${a.readTime} min read\n  ${a.excerpt}`;

  const unreadCatalog = unreadArticles.map(formatArticle).join('\n');
  const readCatalog = readArticles.map(formatArticle).join('\n');

  const topCategory = attributes ? getTopCategory(attributes) : null;

  let behavioralProfile: string;
  if (attributes) {
    const heartbeatSummary = attributes.category_heartbeats
      ? Object.entries(attributes.category_heartbeats).map(([cat, count]) => `  - ${cat}: ${count}`).join('\n')
      : `  - AI: ${attributes.num_ai_heartbeats ?? 0}\n  - Business: ${attributes.num_business_heartbeats ?? 0}\n  - Technology: ${attributes.num_technology_heartbeats ?? 0}`;

    behavioralProfile = `## Reader's Behavioral Profile (from Snowplow Signals)
- Last category viewed: ${attributes.last_category_viewed || 'unknown'}
- Categories explored: ${attributes.categories_viewed?.join(', ') || 'none yet'}
- Total articles viewed this session: ${attributes.article_view_count ?? 0}
- Engagement depth (heartbeats per category):
${heartbeatSummary}
- Most engaged category: ${topCategory || 'unknown'}
- Articles already read: ${readArticles.length > 0 ? readArticles.map((a) => `"${a.title}"`).join(', ') : 'none'}
- Currently viewing: ${currentPage || 'unknown page'}`;
  } else {
    const featured = allArticles[0];
    behavioralProfile = `## Reader's Behavioral Profile
No behavioral data available for this session yet. When recommending articles, ONLY recommend the featured article: <<${featured.slug}>>. Do not recommend any other articles. Always end your response with: "If you'd like more tailored recommendations, let me know what types of content you're interested in!"`;
  }

  const subscriptionContext = `## Subscription Plans
- Monthly: $3.99/month
- Annual: $29.99/year (save over 37%)
- Benefits: Unlimited access to all articles, exclusive subscriber-only content, ad-free reading, early access to breaking news`;

  const guidelines = `## Guidelines
- When recommending articles, write a brief conversational sentence and then reference each article using ONLY the <<slug>> format on its own line.${topCategory ? ` Example:
  Based on your interest in ${topCategory}, I think you'd enjoy this:
  <<example-slug>>` : ''}
- Only recommend ONE article per response.${topCategory ? ` You MUST pick an article from the "${topCategory}" category — this is the reader's most engaged category. Do NOT recommend articles from other categories.` : ''}
${topCategory ? `- When referencing the reader's interests, ONLY mention "${topCategory}". Do NOT list multiple categories. Do NOT say things like "based on your interest in AI and Technology" — only reference the single most engaged category.` : '- Do NOT say "based on your interest" or reference any categories when recommending articles. Just introduce the featured article naturally.'}
- NEVER use markdown links, URLs, or /articles/ paths in your text. ONLY use the <<slug>> tag format.
- When discussing subscriptions, reference the reader's engagement data to personalize the pitch.
- NEVER recommend articles from the "Already Read" list — only recommend from the "unread" list.
- Never fabricate article slugs that don't exist in the catalog.
- Be concise: 1-2 sentences plus article references. No bullet lists, no markdown.`;

  return `${identity}

## Articles to Recommend (unread)
${unreadCatalog || 'The reader has read all available articles!'}
${readCatalog ? `\n## Articles Already Read (do NOT recommend these)\n${readCatalog}` : ''}

${behavioralProfile}

${subscriptionContext}

${guidelines}`;
}

function getTopCategory(attributes: UserAttributes): string | null {
  // 1. Try category_heartbeats map from Signals Profiles API
  if (attributes.category_heartbeats && typeof attributes.category_heartbeats === 'object') {
    const entries = Object.entries(attributes.category_heartbeats);
    if (entries.length > 0) {
      const top = entries.sort((a, b) => b[1] - a[1])[0];
      if (top[1] > 0) return top[0];
    }
  }

  // 2. Try individual heartbeat fields
  const categories = [
    { name: 'AI', heartbeats: attributes.num_ai_heartbeats ?? 0 },
    { name: 'Business', heartbeats: attributes.num_business_heartbeats ?? 0 },
    { name: 'Technology', heartbeats: attributes.num_technology_heartbeats ?? 0 },
  ];
  const top = categories.sort((a, b) => b.heartbeats - a.heartbeats)[0];
  if (top.heartbeats > 0) return top.name;

  // 3. Fall back to last_category_viewed
  if (attributes.last_category_viewed) return attributes.last_category_viewed;

  return null;
}
