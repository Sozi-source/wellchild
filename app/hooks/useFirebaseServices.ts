"use client";

import { useState, useEffect } from 'react';
import { 
  app, auth, db, storage, 
  isFirebaseInitialized, getFirebaseServices 
} from '@/app/lib/firebase/db.service';
import { FirebaseStorage } from 'firebase/storage'; // Import the type

interface FirebaseServices {
  app: typeof app;
  auth: typeof auth;
  db: typeof db;
  storage: FirebaseStorage | null; // Use the proper type
  ready: boolean;
  error: string | null;
}

export const useFirebaseServices = (): FirebaseServices => {
  const [services, setServices] = useState<FirebaseServices>({
    app,
    auth,
    db,
    storage,
    ready: false,
    error: null,
  });

  useEffect(() => {
    if (isFirebaseInitialized()) {
      setServices({
        app,
        auth,
        db,
        storage,
        ready: true,
        error: null,
      });
    } else {
      setServices(prev => ({
        ...prev,
        ready: false,
        error: 'Firebase services are not available',
      }));
    }
  }, []);

  return services;
};