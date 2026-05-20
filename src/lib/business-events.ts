import {
  trackArticleViewSpec,
  trackQuickSearchSpec,
  trackFullSearchSpec,
  trackAdClickSpec,
  trackAdImpressionSpec,
  trackEnterSubscriptionFlowSpec,
  trackConfirmPaymentSpec,
  trackSelectAPlanSpec,
  trackPersonalDetailsSpec,
  trackUserMessageSpec,
  trackAgentMessageSpec,
  createArticle,
  createAd,
  createAgent,
  createMessage,
  type Article,
  type Ad,
  type ArticleQuickSearch,
  type ArticleFullSearch,
} from '../../snowtype/snowplow';

// Article View Tracking
export function trackArticleView(articleData: {
  id: string;
  title: string;
  author: string;
  category: string;
  article_id?: string;
  position?: number;
}) {
  console.log('Tracking article view:', articleData.title);
  
  // Check if we're in a browser environment
  if (typeof window === 'undefined') {
    console.error('Not in browser environment');
    return;
  }
  
  const article: Article = {
    article_id: articleData.article_id || articleData.id,
    title: articleData.title,
    author: articleData.author,
    category: articleData.category,
    position: articleData.position || null
  };

  try {
    trackArticleViewSpec({
      type: 'view',
      context: [createArticle(article)]
    });
    console.log('Article view tracking successful');
  } catch (error) {
    console.error('Error tracking article view:', error);
  }
}

// Quick Search Tracking
export function trackQuickSearch(searchTerm: string, selectedArticle: {
  id: string;
  title: string;
  author: string;
  category: string;
  position: number;
}) {
  console.log('Tracking quick search:', searchTerm, '->', selectedArticle.title);
  
  const article: ArticleQuickSearch = {
    article_id: selectedArticle.id,
    title: selectedArticle.title,
    author: selectedArticle.author,
    category: selectedArticle.category,
    position: selectedArticle.position
  };

  try {
    trackQuickSearchSpec({
      term: searchTerm,
      search_type: 'quick',
      context: [createArticle(article)]
    });
    console.log('Quick search tracking successful');
  } catch (error) {
    console.error('Error tracking quick search:', error);
  }
}

// Full Search Tracking
export function trackFullSearch(searchTerm: string, totalResults: number, articles?: Array<{
  id: string;
  title: string;
  author: string;
  category: string;
  position: number;
}>) {
  console.log('Tracking full search:', searchTerm, 'with', totalResults, 'results');
  
  const context: ArticleFullSearch[] = articles?.map((article, index) => ({
    article_id: article.id,
    title: article.title,
    author: article.author,
    category: article.category,
    position: article.position || index + 1
  })) || [];

  try {
    trackFullSearchSpec({
      term: searchTerm,
      search_type: 'full',
      total_results: totalResults,
      context: context.map(article => createArticle(article))
    });
    console.log('Full search tracking successful');
  } catch (error) {
    console.error('Error tracking full search:', error);
  }
}


// Ad Click Tracking
export function trackAdClick(adData: {
  ad_id: string;
  advertiser_id?: string;
  campaign_id?: string;
  creative_id?: string;
  placement?: 'header' | 'sidebar' | 'footer' | 'in-feed' | 'native' | 'search_results' | 'content_body' | 'video_pre-roll';
  position?: number;
  type?: 'banner' | 'video' | 'native' | 'interstitial' | 'rich_media' | 'sponsored_content' | 'search' | 'email' | 'audio';
  cost?: number;
  cost_model?: 'cpc' | 'cpm' | 'cpa';
}) {
  console.log('Tracking ad click:', adData.ad_id);
  
  const ad: Ad = {
    ad_id: adData.ad_id,
    advertiser_id: adData.advertiser_id || null,
    campaign_id: adData.campaign_id || null,
    creative_id: adData.creative_id || null,
    placement: adData.placement,
    position: adData.position || null,
    type: adData.type,
    cost: adData.cost || null,
    cost_model: adData.cost_model
  };

  try {
    trackAdClickSpec({
      type: 'click',
      context: [createAd(ad)]
    });
    console.log('Ad click tracking successful');
  } catch (error) {
    console.error('Error tracking ad click:', error);
  }
}

// Ad Impression Tracking
export function trackAdImpression(adData: {
  ad_id: string;
  advertiser_id?: string;
  campaign_id?: string;
  creative_id?: string;
  placement?: 'header' | 'sidebar' | 'footer' | 'in-feed' | 'native' | 'search_results' | 'content_body' | 'video_pre-roll';
  position?: number;
  type?: 'banner' | 'video' | 'native' | 'interstitial' | 'rich_media' | 'sponsored_content' | 'search' | 'email' | 'audio';
  cost?: number;
  cost_model?: 'cpc' | 'cpm' | 'cpa';
}) {
  console.log('Tracking ad impression:', adData.ad_id);
  
  const ad: Ad = {
    ad_id: adData.ad_id,
    advertiser_id: adData.advertiser_id || null,
    campaign_id: adData.campaign_id || null,
    creative_id: adData.creative_id || null,
    placement: adData.placement,
    position: adData.position || null,
    type: adData.type,
    cost: adData.cost || null,
    cost_model: adData.cost_model
  };

  try {
    trackAdImpressionSpec({
      type: 'impression',
      context: [createAd(ad)]
    });
    console.log('Ad impression tracking successful');
  } catch (error) {
    console.error('Error tracking ad impression:', error);
  }
}

// Enter Subscription Flow Tracking
export function trackEnterSubscriptionFlow() {
  console.log('Tracking enter subscription flow');
  
  try {
    trackEnterSubscriptionFlowSpec({
      step_name: 'begin_workflow'
    });
    console.log('Enter subscription flow tracking successful');
  } catch (error) {
    console.error('Error tracking enter subscription flow:', error);
  }
}

// Confirm Payment Tracking
export function trackConfirmPayment() {
  console.log('Tracking confirm payment');
  
  try {
    trackConfirmPaymentSpec({
      step_name: 'confirm_payment'
    });
    console.log('Confirm payment tracking successful');
  } catch (error) {
    console.error('Error tracking confirm payment:', error);
  }
}

// Select a Plan Tracking
export function trackSelectPlan(planType: 'monthly' | 'annually') {
  console.log('Tracking select plan:', planType);
  
  try {
    trackSelectAPlanSpec({
      step_name: 'select_plan',
      value: planType
    });
    console.log('Select plan tracking successful');
  } catch (error) {
    console.error('Error tracking select plan:', error);
  }
}

// Personal Details Tracking
export function trackPersonalDetails() {
  console.log('Tracking personal details');
  
  try {
    trackPersonalDetailsSpec({
      step_name: 'personal_details'
    });
    console.log('Personal details tracking successful');
  } catch (error) {
    console.error('Error tracking personal details:', error);
  }
}

// User Message Tracking
export function trackUserMessage(messageData: {
  chatSessionId: string;
  messageId: string;
  messageIndex: number;
  messageLength: number;
  messagePreview: string;
  conversationTurn: number;
}) {
  console.log('Tracking user message:', messageData.messageId);

  try {
    trackUserMessageSpec({
      sent_at: new Date(),
      context: [
        createMessage({
          chat_session_id: messageData.chatSessionId,
          id: messageData.messageId,
          index: messageData.messageIndex,
          length: messageData.messageLength,
          preview: messageData.messagePreview,
          role: 'user',
          conversation_turn: messageData.conversationTurn,
        }),
      ],
    });
    console.log('User message tracking successful');
  } catch (error) {
    console.error('Error tracking user message:', error);
  }
}

// Agent Message Tracking
export function trackAgentMessage(messageData: {
  chatSessionId: string;
  messageId: string;
  messageIndex: number;
  messageLength: number;
  messagePreview: string;
  conversationTurn: number;
  invocationId: string;
  responseTimeMs: number;
  toolCallsCount: number;
  tokensUsed?: number;
  recommendedArticles?: Array<{
    article_id: string;
    title: string;
    author: string;
    category: string;
    position: number;
  }>;
}) {
  console.log('Tracking agent message:', messageData.messageId);

  const context: ReturnType<typeof createAgent | typeof createMessage | typeof createArticle>[] = [
    createAgent({
      type: 'chatbot',
      invocation_id: messageData.invocationId,
      model_name: 'claude-sonnet-4-20250514',
      model_provider: 'anthropic',
    }),
    createMessage({
      chat_session_id: messageData.chatSessionId,
      id: messageData.messageId,
      index: messageData.messageIndex,
      length: messageData.messageLength,
      preview: messageData.messagePreview,
      role: 'assistant',
      conversation_turn: messageData.conversationTurn,
    }),
  ];

  if (messageData.recommendedArticles) {
    for (const article of messageData.recommendedArticles) {
      context.push(createArticle({
        article_id: article.article_id,
        title: article.title,
        author: article.author,
        category: article.category,
        position: article.position,
      }));
    }
  }

  try {
    trackAgentMessageSpec({
      invocation_id: messageData.invocationId,
      received_at: new Date(),
      response_time_ms: messageData.responseTimeMs,
      tokens_used: messageData.tokensUsed ?? null,
      tool_calls_count: messageData.toolCallsCount,
      context,
    });
    console.log('Agent message tracking successful');
  } catch (error) {
    console.error('Error tracking agent message:', error);
  }
}
