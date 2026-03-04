import {
  newTracker,
  trackPageView,
  enableActivityTracking,
  setUserId,
  enableAnonymousTracking,
  disableAnonymousTracking
} from '@snowplow/browser-tracker';
import { LinkClickTrackingPlugin, enableLinkClickTracking } from '@snowplow/browser-plugin-link-click-tracking';
import {
  EnhancedConsentPlugin,
  trackConsentAllow,
  trackConsentDeny,
  trackConsentSelected,
  trackConsentWithdrawn,
  trackCmpVisible
} from '@snowplow/browser-plugin-enhanced-consent';
import { SnowplowMediaPlugin } from '@snowplow/browser-plugin-media';
import { FormTrackingPlugin, enableFormTracking } from '@snowplow/browser-plugin-form-tracking';
import {
  SignalsPlugin,
  addInterventionHandlers,
  subscribeToInterventions
} from '@snowplow/signals-browser-plugin';
import {
  startMediaTracking,
  trackMediaPlay,
  trackMediaPause,
  trackMediaEnd,
  trackMediaSeekStart,
  trackMediaSeekEnd,
  trackMediaVolumeChange,
  trackMediaFullscreenChange
} from '@snowplow/browser-plugin-media';
import { createArticle, type Article } from '../../snowtype/snowplow';
import { getArticleBySlug } from './data';
import { isSignalsEnabled, hasAnalyticsConsent } from './consent';

  // Initialize Snowplow tracker
export function initializeSnowplow() {
  newTracker('sp1', 'https://com-snplow-sales-aws-prod1.collector.snplow.net', {
  // 127.0.0.1:9090 - Localhost
  // https://com-snplow-sales-aws-prod1.mini.snplow.net - Mini
  // https://com-snplow-sales-aws-prod1.collector.snplow.net - Prod
    appId: 'demo-media-publishing-web',
    appVersion: '1.0.0',
    cookieSameSite: 'Lax',
    eventMethod: 'post',
    bufferSize: 1,
    contexts: {
      webPage: true
    },
    plugins: [LinkClickTrackingPlugin(), EnhancedConsentPlugin(), SnowplowMediaPlugin(), FormTrackingPlugin(), SignalsPlugin()],
    crossDomainLinker: function (linkElement) {
      // Enable cross-domain linking for snowplow.io domain
      // This adds a _sp parameter to outbound links containing the domain user ID and timestamp
      // The enrichment process will populate refr_domain_userid and refr_dvce_tstamp fields
      return linkElement.hostname === 'snowplow.io';
    }
  });

  // Enable activity tracking (page pings)
  enableActivityTracking({
    minimumVisitLength: 20,
    heartbeatDelay: 10
  });

  // Enable link click tracking with recommended settings
  enableLinkClickTracking({
    trackContent: true, // Capture link text content
    options: {
      // Optional: Add any filtering criteria here if needed
      // denylist: ['no-track'], // Exclude links with 'no-track' class
      // allowlist: ['track-me'], // Only track links with 'track-me' class
    }
  });

  // Enable form tracking with configuration for contact forms
  enableFormTracking({
    options: {
      // Track all forms by default, but you can customize this
      forms: {
        // Optional: Add specific form classes to track/ignore
        // allowlist: ['contact-form'], // Only track forms with 'contact-form' class
        // Exclude forms with 'no-track' class
        denylist: ['no-track'],
      },
      fields: {
        // Exclude sensitive fields from tracking
        denylist: ['password', 'ssn', 'credit-card'],
        // Optional: Transform function to redact sensitive data
        transform: (value, elementInfo, element) => {
          // Redact email addresses for privacy
          if (element.name === 'email' || element.id === 'email') {
            return '***@***.***';
          }
          // Redact phone numbers
          if (element.name === 'phone' || element.id === 'phone') {
            return '***-***-****';
          }
          return value;
        }
      }
    }
  });

  // Restore user ID from localStorage if available
  restoreUserFromStorage();

  // Set up Signals intervention handlers
  setupSignalsInterventions();

  // Configure anonymous tracking based on consent
  configureAnonymousTracking();

  console.log('Snowplow tracker initialized');
}

// Set up Signals intervention handlers for paywall
function setupSignalsInterventions() {
  // Add intervention handler for subscription nudge
  addInterventionHandlers({
    paywallHandler(intervention) {
      console.log("Paywall intervention received!", intervention);

      // Only process intervention if Signals personalization is enabled
      if (!isSignalsEnabled()) {
        console.log("Signals personalization is disabled, ignoring paywall intervention");
        return;
      }

      // Store intervention in sessionStorage to persist across article pages
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('paywall-intervention', JSON.stringify({
          triggered: true,
          timestamp: Date.now(),
          intervention: intervention
        }));

        // Dispatch custom event to notify components
        window.dispatchEvent(new CustomEvent('paywallInterventionTriggered', {
          detail: { intervention }
        }));
      }
    }
  });

  // Subscribe to interventions from Signals endpoint
  subscribeToInterventions({
    endpoint: "https://7f9742b834d7.signals.snowplowanalytics.com"
  });

  console.log('Signals interventions configured');
}

// Configure anonymous tracking based on current consent
function configureAnonymousTracking() {
  if (typeof window === 'undefined') return;

  const analyticsConsent = hasAnalyticsConsent();

  if (!analyticsConsent) {
    // No analytics consent - enable anonymous tracking with server anonymization
    // This prevents the collector from generating network_userid cookie and capturing IP address
    enableAnonymousTracking({
      options: {
        withServerAnonymisation: true,
        withSessionTracking: true
      }
    });
    console.log('Anonymous tracking enabled with server anonymization (no analytics consent)');
  } else {
    // Analytics consent given - disable anonymous tracking to track with full identifiers
    disableAnonymousTracking();
    console.log('Anonymous tracking disabled (analytics consent given)');
  }
}

// Enable anonymous tracking when consent is denied or withdrawn
export function enableAnonymousTrackingMode() {
  if (typeof window === 'undefined') return;

  enableAnonymousTracking({
    options: {
      withServerAnonymisation: true,
      withSessionTracking: true
    }
  });
  console.log('Anonymous tracking mode enabled with server anonymization');
}

// Disable anonymous tracking when consent is granted
export function disableAnonymousTrackingMode() {
  if (typeof window === 'undefined') return;

  disableAnonymousTracking();
  console.log('Anonymous tracking mode disabled - full tracking enabled');
}

// Check if paywall intervention has been triggered this session
export function hasPaywallInterventionTriggered(): boolean {
  if (typeof window === 'undefined') return false;

  // Don't show paywall if Signals personalization is disabled
  if (!isSignalsEnabled()) return false;

  const stored = sessionStorage.getItem('paywall-intervention');
  if (!stored) return false;

  try {
    const data = JSON.parse(stored);
    return data.triggered === true;
  } catch {
    return false;
  }
}

// Clear paywall intervention (for testing or when user subscribes)
export function clearPaywallIntervention() {
  if (typeof window === 'undefined') return;
  sessionStorage.removeItem('paywall-intervention');

  // Dispatch event to notify components
  window.dispatchEvent(new CustomEvent('paywallInterventionCleared'));
}

// Enable form tracking for contact forms with enhanced configuration
export function enableContactFormTracking() {
  enableFormTracking({
    options: {
      forms: {
        // Track forms with contact-form class
        allowlist: ['contact-form'],
        // Exclude forms with 'no-track' class
        denylist: ['no-track']
      },
      fields: {
        // Exclude sensitive fields from tracking
        denylist: ['password', 'ssn', 'credit-card'],
        // Transform function to redact sensitive data for privacy
        transform: (value, elementInfo, element) => {
          // Redact email addresses for privacy
          if (element.name === 'email' || element.id === 'email') {
            return '***@***.***';
          }
          // Redact phone numbers
          if (element.name === 'phone' || element.id === 'phone') {
            return '***-***-****';
          }
          return value;
        }
      }
    },
    // Add context for contact form events
    context: [
      {
        schema: 'iglu:com.demo.media/contact_form/jsonschema/1-0-0',
        data: {
          form_type: 'contact',
          page: 'contact'
        }
      }
    ]
  });
  
  console.log('Contact form tracking enabled');
}

// Restore user ID from localStorage
function restoreUserFromStorage() {
  if (typeof window !== 'undefined') {
    const savedUser = localStorage.getItem("demo-user");
    if (savedUser) {
      try {
        const userData = JSON.parse(savedUser);
        if (userData.email) {
          setUserId(userData.email);
          console.log('User ID restored from storage:', userData.email);
        }
      } catch (error) {
        console.error("Error parsing saved user:", error);
        localStorage.removeItem("demo-user");
      }
    }
  }
}

// Helper function to extract article data from URL path
function getArticleDataFromPath(pathname: string): Article | null {
  // Check if we're on an article page (/articles/[slug])
  const articleMatch = pathname.match(/^\/articles\/([^\/]+)$/);
  if (!articleMatch) {
    return null;
  }
  
  const slug = articleMatch[1];
  const article = getArticleBySlug(slug);
  
  if (!article) {
    return null;
  }
  
  // Convert the article data to the Article entity format
  return {
    article_id: article.id,
    title: article.title,
    author: article.author,
    category: article.category,
    position: null // Page views don't have a position context
  };
}

// Track page view
export function trackPageViewEvent() {
  // Ensure user ID is restored before tracking
  restoreUserFromStorage();
  
  // Check if we're on an article page and get article data
  let articleEntity: Article | null = null;
  if (typeof window !== 'undefined') {
    articleEntity = getArticleDataFromPath(window.location.pathname);
  }
  
  // Track page view with article context if available
  if (articleEntity) {
    trackPageView({
      context: [createArticle(articleEntity)]
    });
    console.log('Page view tracked with article entity:', articleEntity.title);
  } else {
    trackPageView();
    console.log('Page view tracked');
  }
  
  // Clean up _sp parameter from URL after page view is tracked
  // This prevents the parameter from being shared when users copy the URL
  if (typeof window !== 'undefined' && /[?&]_sp=/.test(window.location.href)) {
    const cleanUrl = window.location.href.replace(/&?_sp=[^&]+/, '');
    history.replaceState(history.state, "", cleanUrl);
    console.log('Cleaned _sp parameter from URL');
  }
}

// Set user ID for tracking
export function setUserForTracking(email: string) {
  setUserId(email);
  console.log('User ID set for tracking:', email);
}

// Clear user ID (for logout)
export function clearUserForTracking() {
  setUserId(null);
  console.log('User ID cleared for tracking');
}

// Enable cross-domain linking for dynamically added links
export function enableCrossDomainLinking() {
  if (typeof window !== 'undefined' && (window as any).snowplow) {
    (window as any).snowplow('crossDomainLinker', function (linkElement: HTMLAnchorElement) {
      // Enable cross-domain linking for snowplow.io domain
      return linkElement.hostname === 'snowplow.io';
    });
    console.log('Cross-domain linking enabled for dynamic links');
  }
}

// Initialize tracker only (no page view tracking)
export function initializeSnowplowOnly() {
  initializeSnowplow();
}

// Enhanced Consent Plugin tracking functions
/**
 * Track consent allow event
 */
export function trackConsentAllowEvent(consentScopes: string[]) {
  trackConsentAllow({
    consentScopes,
    basisForProcessing: "consent",
    consentUrl: window.location.origin + "/privacy-policy",
    consentVersion: "1.0",
    domainsApplied: [window.location.hostname],
    gdprApplies: true
  });
}

/**
 * Track consent deny event
 */
export function trackConsentDenyEvent(consentScopes: string[]) {
  trackConsentDeny({
    consentScopes,
    basisForProcessing: "consent",
    consentUrl: window.location.origin + "/privacy-policy",
    consentVersion: "1.0",
    domainsApplied: [window.location.hostname],
    gdprApplies: true
  });
}

/**
 * Track consent selected event (for custom preferences)
 */
export function trackConsentSelectedEvent(consentScopes: string[]) {
  trackConsentSelected({
    consentScopes,
    basisForProcessing: "consent",
    consentUrl: window.location.origin + "/privacy-policy",
    consentVersion: "1.0",
    domainsApplied: [window.location.hostname],
    gdprApplies: true
  });
}

/**
 * Track consent withdrawn event
 */
export function trackConsentWithdrawnEvent(consentScopes: string[]) {
  trackConsentWithdrawn({
    consentScopes,
    basisForProcessing: "consent",
    consentUrl: window.location.origin + "/privacy-policy",
    consentVersion: "1.0",
    domainsApplied: [window.location.hostname],
    gdprApplies: true
  });
}

/**
 * Track CMP visible event
 */
export function trackCmpVisibleEvent() {
  trackCmpVisible({
    elapsedTime: performance.now(),
  });
}

// Media Tracking functions
/**
 * Initialize media tracking for a video
 */
export function initializeVideoTracking(videoId: string) {
  startMediaTracking({
    id: videoId,
    boundaries: [25, 50, 75, 100]
  });
  console.log('Video tracking initialized:', videoId);
}

/**
 * Track video popup open event
 */
export function trackVideoPopupOpenEvent(videoUrl: string, videoId: string) {
  // Initialize tracking first
  initializeVideoTracking(videoId);
  
  // Track play event
  trackMediaPlay({
    id: videoId
  });
  console.log('Video popup open tracked:', videoId);
}

/**
 * Track video popup close event
 */
export function trackVideoPopupCloseEvent(videoId: string) {
  trackMediaEnd({
    id: videoId
  });
  console.log('Video popup close tracked:', videoId);
}

export function trackVideoPopupPauseEvent(videoId: string) {
  trackMediaPause({ id: videoId });
  console.log('Video popup pause tracked:', videoId);
}

export function trackVideoPopupSeekStartEvent(videoId: string) {
  trackMediaSeekStart({ id: videoId });
  console.log('Video popup seek start tracked:', videoId);
}

export function trackVideoPopupSeekEndEvent(videoId: string) {
  trackMediaSeekEnd({ id: videoId });
  console.log('Video popup seek end tracked:', videoId);
}

export function trackVideoPopupVolumeChangeEvent(videoId: string, newVolume: number) {
  trackMediaVolumeChange({ id: videoId, newVolume });
  console.log('Video popup volume change tracked:', videoId, newVolume);
}

export function trackVideoPopupFullscreenChangeEvent(videoId: string, fullscreen: boolean) {
  trackMediaFullscreenChange({ id: videoId, fullscreen });
  console.log('Video popup fullscreen change tracked:', videoId, fullscreen);
}