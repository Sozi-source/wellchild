// app/context/AuthContext.tsx - COMPLETE VERSION
'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { 
  onAuthStateChanged, 
  User,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  sendPasswordResetEmail,
  updateProfile as firebaseUpdateProfile
} from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp, updateDoc } from 'firebase/firestore';
import { auth, db } from '@/app/lib/firebase/firebase';

// Types
export type UserRole = 'admin' | 'clinician' | 'guardian';

export interface UserProfile {
  id: string;
  uid: string;
  email: string;
  name: string;
  role: UserRole;
  patients: string[];
  isActive: boolean;
  isVerified: boolean;
  profilePicture?: string;
  phone?: string;
  address?: string;
  clinicName?: string;
  specialization?: string;
  licenseNumber?: string;
  createdAt: Date;
  updatedAt: Date;
  lastLogin: Date;
  notificationPreferences?: {
    email: boolean;
    push: boolean;
    sms: boolean;
    appointmentReminders: boolean;
    healthAlerts: boolean;
  };
}

interface AuthContextType {
  // State
  user: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  isAuthenticated: boolean;
  
  // Auth Actions
  signUp: (
    email: string, 
    password: string, 
    name: string, 
    role: UserRole
  ) => Promise<User>;
  signIn: (email: string, password: string) => Promise<User>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>;
  
  // Status
  error: string | null;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType>({
  // Default values
  user: null,
  userProfile: null,
  loading: true,
  isAuthenticated: false,
  
  signUp: async () => { throw new Error('Not implemented'); },
  signIn: async () => { throw new Error('Not implemented'); },
  logout: async () => {},
  resetPassword: async () => {},
  updateProfile: async () => {},
  
  error: null,
  clearError: () => {},
});

// Helper function to create/update user profile
const createOrUpdateUserProfile = async (
  firebaseUser: User, 
  userData?: Partial<UserProfile>
): Promise<UserProfile> => {
  const userRef = doc(db, 'users', firebaseUser.uid);
  const userSnap = await getDoc(userRef);
  
  const baseProfile = {
    uid: firebaseUser.uid,
    email: firebaseUser.email!,
    name: userData?.name || firebaseUser.displayName || firebaseUser.email!.split('@')[0],
    lastLogin: new Date(),
    updatedAt: new Date(),
  };
  
  if (!userSnap.exists()) {
    // Create new user profile
    const newProfile: UserProfile = {
      id: firebaseUser.uid,
      ...baseProfile,
      role: userData?.role || 'guardian',
      patients: [],
      isActive: true,
      isVerified: false,
      createdAt: new Date(),
    };
    
    await setDoc(userRef, {
      ...newProfile,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      lastLogin: serverTimestamp(),
    });
    
    // Update Firebase Auth display name
    if (userData?.name) {
      await firebaseUpdateProfile(firebaseUser, {
        displayName: userData.name
      });
    }
    
    return newProfile;
  } else {
    // Update existing profile
    const existingData = userSnap.data();
    
    const updatedProfile: UserProfile = {
      id: firebaseUser.uid,
      ...baseProfile,
      role: userData?.role || existingData.role || 'guardian',
      patients: existingData.patients || [],
      isActive: existingData.isActive !== false,
      isVerified: existingData.isVerified || false,
      profilePicture: existingData.profilePicture,
      phone: existingData.phone,
      address: existingData.address,
      clinicName: existingData.clinicName,
      specialization: existingData.specialization,
      licenseNumber: existingData.licenseNumber,
      createdAt: existingData.createdAt?.toDate() || new Date(),
      notificationPreferences: existingData.notificationPreferences || {
        email: true,
        push: true,
        sms: false,
        appointmentReminders: true,
        healthAlerts: true,
      },
    };
    
    await setDoc(userRef, {
      ...updatedProfile,
      updatedAt: serverTimestamp(),
      lastLogin: serverTimestamp(),
    }, { merge: true });
    
    return updatedProfile;
  }
};

// Helper to fetch user profile
const fetchUserProfile = async (firebaseUser: User): Promise<UserProfile | null> => {
  try {
    const userRef = doc(db, 'users', firebaseUser.uid);
    const userSnap = await getDoc(userRef);
    
    if (!userSnap.exists()) {
      // Profile doesn't exist, create one
      return await createOrUpdateUserProfile(firebaseUser);
    }
    
    const data = userSnap.data();
    
    // Validate required fields
    if (!data.email || !data.role) {
      // Profile is incomplete, update it
      return await createOrUpdateUserProfile(firebaseUser);
    }
    
    const profile: UserProfile = {
      id: userSnap.id,
      uid: data.uid || userSnap.id,
      email: data.email,
      name: data.name || firebaseUser.displayName || data.email.split('@')[0],
      role: data.role || 'guardian',
      patients: data.patients || [],
      isActive: data.isActive !== false,
      isVerified: data.isVerified || false,
      profilePicture: data.profilePicture,
      phone: data.phone,
      address: data.address,
      clinicName: data.clinicName,
      specialization: data.specialization,
      licenseNumber: data.licenseNumber,
      createdAt: data.createdAt?.toDate() || new Date(),
      updatedAt: data.updatedAt?.toDate() || new Date(),
      lastLogin: data.lastLogin?.toDate() || new Date(),
      notificationPreferences: data.notificationPreferences || {
        email: true,
        push: true,
        sms: false,
        appointmentReminders: true,
        healthAlerts: true,
      },
    };
    
    return profile;
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return null;
  }
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Clear error
  const clearError = () => setError(null);

  // Sign up function
  const signUp = async (
    email: string, 
    password: string, 
    name: string, 
    role: UserRole
  ): Promise<User> => {
    try {
      clearError();
      
      // 1. Create Firebase Auth user
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;
      
      // 2. Create user profile in Firestore
      await createOrUpdateUserProfile(firebaseUser, { name, role });
      
      // 3. Fetch the created profile
      const profile = await fetchUserProfile(firebaseUser);
      
      // Update local state
      setUser(firebaseUser);
      setUserProfile(profile);
      
      console.log('Sign up successful:', firebaseUser.uid);
      return firebaseUser;
      
    } catch (error: any) {
      console.error('Sign up error:', error);
      
      // Map Firebase errors to user-friendly messages
      switch (error.code) {
        case 'auth/email-already-in-use':
          throw new Error('This email is already registered. Please use a different email or login.');
        case 'auth/weak-password':
          throw new Error('Password is too weak. Please choose a stronger password (min 6 characters).');
        case 'auth/invalid-email':
          throw new Error('Please enter a valid email address.');
        case 'auth/operation-not-allowed':
          throw new Error('Email/password sign up is not enabled. Please contact support.');
        default:
          throw new Error('Failed to create account. Please try again.');
      }
    }
  };

  // Sign in function
  const signIn = async (email: string, password: string): Promise<User> => {
    try {
      clearError();
      
      // Sign in with Firebase Auth
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;
      
      // Fetch user profile
      const profile = await fetchUserProfile(firebaseUser);
      
      // Check if user is active
      if (profile && !profile.isActive) {
        await firebaseSignOut(auth);
        throw new Error('Your account has been deactivated. Please contact support.');
      }
      
      // Update local state
      setUser(firebaseUser);
      setUserProfile(profile);
      
      console.log('Sign in successful:', firebaseUser.uid);
      return firebaseUser;
      
    } catch (error: any) {
      console.error('Sign in error:', error);
      
      // Map Firebase errors to user-friendly messages
      switch (error.code) {
        case 'auth/invalid-credential':
        case 'auth/wrong-password':
        case 'auth/user-not-found':
          throw new Error('Invalid email or password. Please try again.');
        case 'auth/too-many-requests':
          throw new Error('Too many failed attempts. Please try again later.');
        case 'auth/user-disabled':
          throw new Error('This account has been disabled. Please contact support.');
        case 'auth/network-request-failed':
          throw new Error('Network error. Please check your connection and try again.');
        default:
          throw new Error('Failed to sign in. Please try again.');
      }
    }
  };

  // Logout function
  const logout = async (): Promise<void> => {
    try {
      clearError();
      await firebaseSignOut(auth);
      setUser(null);
      setUserProfile(null);
      console.log('Logout successful');
    } catch (error: any) {
      console.error('Logout error:', error);
      throw new Error('Failed to logout. Please try again.');
    }
  };

  // Reset password function
  const resetPassword = async (email: string): Promise<void> => {
    try {
      clearError();
      await sendPasswordResetEmail(auth, email);
      console.log('Password reset email sent to:', email);
    } catch (error: any) {
      console.error('Reset password error:', error);
      
      switch (error.code) {
        case 'auth/user-not-found':
          throw new Error('No account found with this email address.');
        case 'auth/invalid-email':
          throw new Error('Please enter a valid email address.');
        default:
          throw new Error('Failed to send reset email. Please try again.');
      }
    }
  };

  // Update profile function
  const updateProfile = async (updates: Partial<UserProfile>): Promise<void> => {
    try {
      clearError();
      
      if (!user) {
        throw new Error('No user is signed in');
      }
      
      const userRef = doc(db, 'users', user.uid);
      
      // Update Firestore
      await updateDoc(userRef, {
        ...updates,
        updatedAt: serverTimestamp(),
      });
      
      // Update Firebase Auth display name if name changed
      if (updates.name && user.displayName !== updates.name) {
        await firebaseUpdateProfile(user, {
          displayName: updates.name
        });
      }
      
      // Update local state
      if (userProfile) {
        const updatedProfile = {
          ...userProfile,
          ...updates,
          updatedAt: new Date(),
        };
        setUserProfile(updatedProfile);
      }
      
      console.log('Profile updated successfully');
      
    } catch (error: any) {
      console.error('Update profile error:', error);
      throw new Error('Failed to update profile. Please try again.');
    }
  };

  // Auth state listener
  useEffect(() => {
    console.log('AuthProvider: Setting up auth listener');
    
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      console.log('Auth state changed:', firebaseUser?.email);
      
      if (firebaseUser) {
        setUser(firebaseUser);
        
        try {
          const profile = await fetchUserProfile(firebaseUser);
          console.log('User profile loaded:', profile);
          setUserProfile(profile);
          
          // Check if user is active
          if (profile && !profile.isActive) {
            console.log('User account is inactive, logging out...');
            await firebaseSignOut(auth);
            setUser(null);
            setUserProfile(null);
            setError('Your account has been deactivated. Please contact support.');
          }
        } catch (error) {
          console.error('Error in auth state change:', error);
          setUserProfile(null);
        }
      } else {
        console.log('No user signed in');
        setUser(null);
        setUserProfile(null);
      }
      
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const value: AuthContextType = {
    user,
    userProfile,
    loading,
    isAuthenticated: !!user && !!userProfile,
    signUp,
    signIn,
    logout,
    resetPassword,
    updateProfile,
    error,
    clearError,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};