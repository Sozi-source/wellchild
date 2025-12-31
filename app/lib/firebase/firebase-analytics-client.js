// /app/lib/firebase-analytics-client.js
// CLIENT-ONLY version - never imports Firebase during build

let analytics = null;
let firebaseInitialized = false;

const initAnalytics = async () => {
  if (typeof window === 'undefined') {
    console.warn('Firebase Analytics: Cannot initialize on server');
    return null;
  }
  
  if (firebaseInitialized) return analytics;
  
  try {
    // Dynamic imports to prevent SSR issues
    const { initializeApp } = await import('firebase/app');
    const { getAnalytics } = await import('firebase/analytics');
    
    const firebaseConfig = {
      apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
      authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
      appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
      measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
    };
    
    if (!firebaseConfig.apiKey) {
      console.error('Firebase Analytics: Missing API key in environment variables');
      return null;
    }
    
    const app = initializeApp(firebaseConfig);
    analytics = getAnalytics(app);
    firebaseInitialized = true;
    
    console.log('✅ Firebase Analytics initialized (Client-side)');
    return analytics;
  } catch (error) {
    console.error('🔥 Firebase Analytics initialization failed:', error.message);
    return null;
  }
};

// Async tracking functions
export const trackDashboardView = async (userRole) => {
  const analyticsInstance = await initAnalytics();
  if (!analyticsInstance) return;
  
  const { setUserProperties, logEvent } = await import('firebase/analytics');
  
  setUserProperties(analyticsInstance, {
    user_role: userRole || 'unknown'
  });
  
  logEvent(analyticsInstance, 'screen_view', {
    screen_name: 'dashboard',
    screen_class: 'DashboardPage',
    user_role: userRole
  });
};

export const trackNavigation = async (linkName, linkType = 'link') => {
  const analyticsInstance = await initAnalytics();
  if (!analyticsInstance) return;
  
  const { logEvent } = await import('firebase/analytics');
  
  logEvent(analyticsInstance, 'select_content', {
    content_type: linkType,
    content_id: linkName.toLowerCase().replace(/\s+/g, '_'),
    item_name: linkName
  });
};

export const trackChildProfileView = async (childId, childName, childGender) => {
  const analyticsInstance = await initAnalytics();
  if (!analyticsInstance) return;
  
  const { logEvent } = await import('firebase/analytics');
  
  logEvent(analyticsInstance, 'view_item', {
    item_id: childId,
    item_name: childName,
    item_category: 'child_profile',
    gender: childGender,
    platform: 'wellchild_dashboard'
  });
};

export const trackQuickAction = async (actionName) => {
  const analyticsInstance = await initAnalytics();
  if (!analyticsInstance) return;
  
  const { logEvent } = await import('firebase/analytics');
  
  logEvent(analyticsInstance, 'click', {
    event_category: 'quick_action',
    event_label: actionName,
    value: 1
  });
};

export { analytics };