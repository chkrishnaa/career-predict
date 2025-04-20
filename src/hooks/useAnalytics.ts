import { useCallback } from 'react';

// Add type declaration for gtag
declare global {
  interface Window {
    gtag: (command: string, action: string, params?: any) => void;
  }
}

export const useAnalytics = () => {
  // Track page views
  const trackPageView = useCallback((pageName: string) => {
    try {
      // Placeholder for actual analytics implementation
      console.log(`Page viewed: ${pageName}`);
      
      // If you were using a real analytics service like Google Analytics
      // you would call their API here
      if (typeof window !== 'undefined' && window.gtag) {
        window.gtag('event', 'page_view', {
          page_title: pageName,
          page_location: window.location.href,
          page_path: window.location.pathname,
        });
      }
    } catch (error) {
      console.error('Failed to track page view:', error);
    }
  }, []);

  // Track events
  const trackEvent = useCallback((eventName: string, eventProperties?: Record<string, any>) => {
    try {
      // Placeholder for actual analytics implementation
      console.log(`Event tracked: ${eventName}`, eventProperties);
      
      // If you were using a real analytics service
      if (typeof window !== 'undefined' && window.gtag) {
        window.gtag('event', eventName, eventProperties);
      }
    } catch (error) {
      console.error('Failed to track event:', error);
    }
  }, []);

  return {
    trackPageView,
    trackEvent
  };
}; 