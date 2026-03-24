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

  let behavioralProfile: string;
  if (attributes) {
    const topCategory = getTopCategory(attributes);
    behavioralProfile = `## Reader's Behavioral Profile (from Snowplow Signals)
- Last category viewed: ${attributes.last_category_viewed || 'unknown'}
- Categories explored: ${attributes.categories_viewed?.join(', ') || 'none yet'}
- Total articles viewed this session: ${attributes.article_view_count ?? 0}
- Engagement depth (heartbeats per category):
  - AI: ${attributes.num_ai_heartbeats ?? 0}
  - Business: ${attributes.num_business_heartbeats ?? 0}
  - Technology: ${attributes.num_technology_heartbeats ?? 0}
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
- When recommending articles, write a brief conversational sentence and then reference each article using ONLY the <<slug>> format on its own line. Example:
  Based on your interest in AI, I think you'd enjoy this:
  <<future-ai-journalism>>
- Only recommend ONE article per response. Pick the single best match from the category with the most heartbeats.
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
  const categories = [
    { name: 'AI', heartbeats: attributes.num_ai_heartbeats ?? 0 },
    { name: 'Business', heartbeats: attributes.num_business_heartbeats ?? 0 },
    { name: 'Technology', heartbeats: attributes.num_technology_heartbeats ?? 0 },
  ];
  const top = categories.sort((a, b) => b.heartbeats - a.heartbeats)[0];
  return top.heartbeats > 0 ? top.name : null;
}
