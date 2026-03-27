// Initialize Google Analytics (call once in main.jsx)
export function initializeAnalytics(GA_ID) {
  if (!GA_ID) return;
  
  window.dataLayer = window.dataLayer || [];
  
  function gtag() {
    window.dataLayer.push(arguments);
  }
  
  window.gtag = gtag;
  gtag('js', new Date());
  gtag('config', GA_ID, {
    'allow_google_signals': true,
    'allow_ad_personalization_signals': true,
  });
}

// Track page views
export function trackPageView(pagePath, pageTitle) {
  if (typeof window.gtag !== 'function') return;
  
  window.gtag('event', 'page_view', {
    'page_path': pagePath,
    'page_title': pageTitle,
  });
}

// Track custom events
export function trackEvent(eventName, eventParams = {}) {
  if (typeof window.gtag !== 'function') return;
  
  window.gtag('event', eventName, eventParams);
}

// Track button clicks
export function trackClick(buttonName, buttonLabel = '') {
  trackEvent('button_click', {
    'button_name': buttonName,
    'button_label': buttonLabel,
  });
}

// Track form submissions
export function trackFormSubmit(formName) {
  trackEvent('form_submit', {
    'form_name': formName,
  });
}

// Track sign ups
export function trackSignUp(method = 'unknown') {
  trackEvent('sign_up', {
    'method': method,
  });
}

// Track sign in
export function trackSignIn(method = 'unknown') {
  trackEvent('login', {
    'method': method,
  });
}

// Track feature usage
export function trackFeature(featureName, metadata = {}) {
  trackEvent('feature_used', {
    'feature_name': featureName,
    ...metadata,
  });
}

export default {
  initializeAnalytics,
  trackPageView,
  trackEvent,
  trackClick,
  trackFormSubmit,
  trackSignUp,
  trackSignIn,
  trackFeature,
};
