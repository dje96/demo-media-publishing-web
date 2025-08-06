import { newTracker, trackPageView, enableActivityTracking, setUserId } from '@snowplow/browser-tracker';
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
  startMediaTracking,
  trackMediaPlay,
  trackMediaPause,
  trackMediaEnd,
  trackMediaSeekStart,
  trackMediaSeekEnd,
  trackMediaVolumeChange,
  trackMediaFullscreenChange
} from '@snowplow/browser-plugin-media';

  // Initialize Snowplow tracker
export function initializeSnowplow() {
  newTracker('sp1', 'http://localhost:9090', {
    appId: 'demo-media-publishing-web',
    appVersion: '1.0.0',
    cookieSameSite: 'Lax',
    eventMethod: 'post',
    bufferSize: 1,
    contexts: {
      webPage: true
    },
    plugins: [LinkClickTrackingPlugin(), EnhancedConsentPlugin(), SnowplowMediaPlugin(), FormTrackingPlugin()],
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

  console.log('Snowplow tracker initialized');
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

// Track page view
export function trackPageViewEvent() {
  // Ensure user ID is restored before tracking
  restoreUserFromStorage();
  trackPageView();
  
  // Clean up _sp parameter from URL after page view is tracked
  // This prevents the parameter from being shared when users copy the URL
  if (typeof window !== 'undefined' && /[?&]_sp=/.test(window.location.href)) {
    const cleanUrl = window.location.href.replace(/&?_sp=[^&]+/, '');
    history.replaceState(history.state, "", cleanUrl);
    console.log('Cleaned _sp parameter from URL');
  }
  
  console.log('Page view tracked');
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