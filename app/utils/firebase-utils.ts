import { 
  getFirebaseApp,
  getFirebaseAuth,
  getFirestoreDB,
  getFirebaseStorage,
  getFirebaseServices,
  getFirebase, // This now exists in the fixed file
  isFirebaseInitialized,
  waitForFirebaseReady,
  app,
  auth,
  db,
  storage
} from '@/app/lib/firebase/db.service';

// Re-export everything for convenience
export {
  getFirebaseApp,
  getFirebaseAuth,
  getFirestoreDB,
  getFirebaseStorage,
  getFirebaseServices,
  getFirebase, // Now available
  isFirebaseInitialized,
  waitForFirebaseReady,
  app,
  auth,
  db,
  storage
};

// Convenience functions
export const requireFirestore = () => getFirestoreDB();
export const requireAuth = () => getFirebaseAuth();
export const requireStorage = () => getFirebaseStorage();

// Type exports
export type { FirebaseApp, Auth, Firestore, FirebaseStorage } from '@/app/lib/firebase/db.service';