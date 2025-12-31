// types/firebase.ts
export interface CustomClaims {
  admin?: boolean;
  role?: string;
  permissions?: string[];
  [key: string]: any;
}

export interface IdTokenResult {
  token: string;
  expirationTime: string;
  authTime: string;
  issuedAtTime: string;
  signInProvider: string | null;
  signInSecondFactor: string | null;
  claims: CustomClaims;
}

// For the auth user
export interface ExtendedUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  emailVerified: boolean;
  getIdTokenResult(forceRefresh?: boolean): Promise<IdTokenResult>;
  // ... other Firebase User properties
}