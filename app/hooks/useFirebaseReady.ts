"use client";

import { useState, useEffect } from 'react';
import { isFirebaseInitialized } from '@/app/lib/firebase/db.service';

export const useFirebaseReady = () => {
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    if (typeof window === 'undefined') {
      // Don't run on server-side
      return;
    }

    const checkFirebase = () => {
      if (isFirebaseInitialized()) {
        setReady(true);
        setError(null);
      } else {
        const errorMsg = 'Firebase is not properly initialized. Please check your configuration.';
        setError(errorMsg);
        setReady(false);
        
        // Optional: Retry mechanism (max 3 times)
        if (retryCount < 3) {
          const retryTimer = setTimeout(() => {
            setRetryCount(prev => prev + 1);
          }, 1000);
          
          return () => clearTimeout(retryTimer);
        }
      }
    };

    checkFirebase();
  }, [retryCount]);

  return { 
    ready, 
    error, 
    retryCount,
    retry: () => setRetryCount(prev => prev + 1)
  };
};