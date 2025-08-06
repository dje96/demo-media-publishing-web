import {
  trackArticleViewSpec,
  trackQuickSearchSpec,
  trackFullSearchSpec,
  trackNewsletterSignupSpec,
  trackAdClickSpec,
  trackAdImpressionSpec,
  trackLoginSuccessSpec,
  trackEnterSubscriptionFlowSpec,
  trackConfirmPaymentSpec,
  trackSelectAPlanSpec,
  trackPersonalDetailsSpec,
  createArticle,
  createAd,
  type Article,
  type Ad,
  type ArticleQuickSearch,
  type ArticleFullSearch,
  createAbTest
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

// Newsletter Signup Tracking
export function trackNewsletterSignup(abTestData?: {
  experiment_id: string;
  experiment_name?: string;
  variant_id: string;
  variant_name?: string;
}) {
  console.log('Tracking newsletter signup');
  
  const context = abTestData ? [createAbTest({
    experiment_id: abTestData.experiment_id,
    experiment_name: abTestData.experiment_name || null,
    variant_id: abTestData.variant_id,
    variant_name: abTestData.variant_name || null
  })] : undefined;

  try {
    trackNewsletterSignupSpec({
      conversion_type: 'newsletter_signup',
      context
    });
    console.log('Newsletter signup tracking successful');
  } catch (error) {
    console.error('Error tracking newsletter signup:', error);
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

// Login Success Tracking
export function trackLoginSuccess(loginMethod?: 'email' | 'google' | 'facebook' | 'apple') {
  console.log('Tracking login success');
  
  try {
    trackLoginSuccessSpec({
      login_status: 'success',
      login_method: loginMethod
    });
    console.log('Login success tracking successful');
  } catch (error) {
    console.error('Error tracking login success:', error);
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
export function trackSelectPlan(planType: 'monthly' | 'annualy') {
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