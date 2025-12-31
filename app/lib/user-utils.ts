// app/lib/user-utils.ts
import { db, auth } from '@/app/lib/firebase/firebase';
import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  query, 
  where,
  setDoc,
  updateDoc,
  orderBy,
  deleteDoc,
  writeBatch,
  deleteField
} from 'firebase/firestore';
import { sendPasswordResetEmail } from 'firebase/auth';

export interface UserData {
  id: string;
  uid?: string;
  email: string;
  name: string;
  role: 'parent' | 'healthcare' | 'admin';
  pendingRole?: 'healthcare';
  createdAt: string;
  updatedAt?: string;
  lastLogin?: string;
  emailVerified?: boolean;
  profileComplete?: boolean;
  parentData?: {
    childrenIds?: string[];
  };
  healthcareData?: {
    patientsIds?: string[];
    licenseNumber?: string;
    specialty?: string;
  };
  adminData?: {
    permissions?: string[];
    lastAudit?: string;
  };
  status?: 'active' | 'pending' | 'inactive';
  isActive?: boolean;
  deactivatedAt?: string;
  deactivatedReason?: string;
  reactivatedAt?: string;
  lastUpdated?: string;
  phone?: string;
  address?: string;
  specialization?: string;
  institution?: string;
  childrenCount?: number;
  [key: string]: any;
}

// Helper function to clean undefined values for Firestore
const cleanFirestoreData = (data: any): any => {
  const cleaned: any = {};
  
  Object.keys(data).forEach(key => {
    const value = data[key];
    
    // Keep only defined values (not undefined)
    if (value !== undefined) {
      cleaned[key] = value;
    }
  });
  
  return cleaned;
};

/**
 * Get user by Firestore document ID
 */
export async function getUserByDocId(docId: string): Promise<UserData | null> {
  try {
    if (!db) {
      console.error('Firestore database is not initialized');
      return null;
    }
    
    const userRef = doc(db, 'users', docId);
    const userSnapshot = await getDoc(userRef);
    
    if (userSnapshot.exists()) {
      return {
        id: userSnapshot.id,
        ...userSnapshot.data()
      } as UserData;
    }
    return null;
  } catch (error) {
    console.error('Error getting user by doc ID:', error);
    throw error;
  }
}

/**
 * Get user by UID (Firebase Auth UID)
 */
export async function getUserByUid(uid: string): Promise<UserData | null> {
  try {
    if (!db) {
      console.error('Firestore database is not initialized');
      return null;
    }
    
    const usersRef = collection(db, 'users');
    const q = query(usersRef, where('uid', '==', uid));
    const snapshot = await getDocs(q);
    
    if (!snapshot.empty) {
      const userDoc = snapshot.docs[0];
      return {
        id: userDoc.id,
        ...userDoc.data()
      } as UserData;
    }
    
    return await getUserByDocId(uid);
  } catch (error) {
    console.error('Error getting user by UID:', error);
    throw error;
  }
}

/**
 * Get user by email address
 */
export async function getUserByEmail(email: string): Promise<UserData | null> {
  try {
    if (!db) {
      console.error('Firestore database is not initialized');
      return null;
    }
    
    const usersRef = collection(db, 'users');
    const q = query(usersRef, where('email', '==', email));
    const snapshot = await getDocs(q);
    
    if (!snapshot.empty) {
      const userDoc = snapshot.docs[0];
      return {
        id: userDoc.id,
        ...userDoc.data()
      } as UserData;
    }
    return null;
  } catch (error) {
    console.error('Error getting user by email:', error);
    throw error;
  }
}

/**
 * Universal user lookup - tries multiple methods in order
 */
export async function findUserByIdentifier(identifier: string): Promise<UserData | null> {
  try {
    const byDocId = await getUserByDocId(identifier);
    if (byDocId) return byDocId;
    
    const byUid = await getUserByUid(identifier);
    if (byUid) return byUid;
    
    if (identifier.includes('@')) {
      const byEmail = await getUserByEmail(identifier);
      if (byEmail) return byEmail;
    }
    
    return null;
  } catch (error) {
    console.error('Error finding user by identifier:', error);
    throw error;
  }
}

/**
 * Update user data - FIXED VERSION (handles undefined values properly)
 */
export async function updateUser(userId: string, data: Partial<UserData>): Promise<void> {
  try {
    if (!db) {
      throw new Error('Firestore database is not initialized');
    }
    
    const userRef = doc(db, 'users', userId);
    
    // Clean the data - remove undefined values
    const cleanedData = cleanFirestoreData({
      ...data,
      updatedAt: new Date().toISOString(),
      lastUpdated: new Date().toISOString()
    });
    
    await updateDoc(userRef, cleanedData);
  } catch (error) {
    console.error('Error updating user:', error);
    throw error;
  }
}

/**
 * Create a new user document
 */
export async function createUser(userData: Omit<UserData, 'id' | 'createdAt'> & { id: string }): Promise<void> {
  try {
    if (!db) {
      throw new Error('Firestore database is not initialized');
    }
    
    const userRef = doc(db, 'users', userData.id);
    await setDoc(userRef, {
      ...userData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      lastUpdated: new Date().toISOString(),
      status: 'active',
      isActive: true
    });
  } catch (error) {
    console.error('Error creating user:', error);
    throw error;
  }
}

/**
 * Get all users with optional filtering
 */
export async function getAllUsers(filters?: {
  role?: string;
  pendingRole?: boolean;
  limit?: number;
  sortBy?: 'createdAt' | 'name' | 'email';
  sortDirection?: 'asc' | 'desc';
}): Promise<UserData[]> {
  try {
    if (!db) {
      console.error('Firestore database is not initialized');
      return [];
    }
    
    const usersRef = collection(db, 'users');
    
    let usersQuery;
    if (filters?.sortBy) {
      usersQuery = query(usersRef, orderBy(filters.sortBy, filters.sortDirection || 'desc'));
    } else {
      usersQuery = query(usersRef, orderBy('createdAt', 'desc'));
    }
    
    const snapshot = await getDocs(usersQuery);
    
    let users = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as UserData[];
    
    if (filters) {
      if (filters.role) {
        users = users.filter(user => user.role === filters.role);
      }
      if (filters.pendingRole === true) {
        users = users.filter(user => user.pendingRole);
      } else if (filters.pendingRole === false) {
        users = users.filter(user => !user.pendingRole);
      }
    }
    
    if (filters?.limit && filters.limit > 0) {
      users = users.slice(0, filters.limit);
    }
    
    return users;
  } catch (error) {
    console.error('Error getting all users:', error);
    throw error;
  }
}

/**
 * Delete user by ID
 */
export async function deleteUser(userId: string): Promise<void> {
  try {
    if (!db) {
      throw new Error('Firestore database is not initialized');
    }
    
    const userRef = doc(db, 'users', userId);
    await deleteDoc(userRef);
  } catch (error) {
    console.error('Error deleting user:', error);
    throw error;
  }
}

/**
 * Search users by name or email
 */
export async function searchUsers(searchTerm: string): Promise<UserData[]> {
  try {
    if (!db) {
      console.error('Firestore database is not initialized');
      return [];
    }
    
    if (!searchTerm.trim()) {
      return await getAllUsers({ limit: 50 });
    }
    
    const allUsers = await getAllUsers();
    
    const term = searchTerm.toLowerCase();
    
    return allUsers.filter(user => 
      user.name?.toLowerCase().includes(term) ||
      user.email?.toLowerCase().includes(term) ||
      user.role?.toLowerCase().includes(term)
    );
  } catch (error) {
    console.error('Error searching users:', error);
    throw error;
  }
}

/**
 * Get user statistics
 */
export async function getUserStatistics(): Promise<{
  total: number;
  byRole: Record<string, number>;
  pendingApprovals: number;
  recentSignups: number;
}> {
  try {
    const users = await getAllUsers();
    
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const recentSignups = users.filter(user => 
      new Date(user.createdAt) > thirtyDaysAgo
    ).length;
    
    const byRole = users.reduce((acc, user) => {
      acc[user.role] = (acc[user.role] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const pendingApprovals = users.filter(user => user.pendingRole).length;
    
    return {
      total: users.length,
      byRole,
      pendingApprovals,
      recentSignups
    };
  } catch (error) {
    console.error('Error getting user statistics:', error);
    throw error;
  }
}

/**
 * Bulk update users (for admin operations)
 */
export async function bulkUpdateUsers(userIds: string[], updates: Partial<UserData>): Promise<number> {
  try {
    if (!db) {
      throw new Error('Firestore database is not initialized');
    }
    
    let batch = writeBatch(db);
    let updatedCount = 0;
    let batchCount = 0;
    
    for (const userId of userIds) {
      const userRef = doc(db, 'users', userId);
      
      // Clean updates for Firestore
      const cleanedUpdates = cleanFirestoreData({
        ...updates,
        updatedAt: new Date().toISOString(),
        lastUpdated: new Date().toISOString()
      });
      
      batch.update(userRef, cleanedUpdates);
      updatedCount++;
      batchCount++;
      
      if (batchCount >= 400) {
        await batch.commit();
        batch = writeBatch(db);
        batchCount = 0;
      }
    }
    
    if (batchCount > 0) {
      await batch.commit();
    }
    
    return updatedCount;
  } catch (error) {
    console.error('Error in bulk update:', error);
    throw error;
  }
}

/**
 * Get users with pending healthcare approval
 */
export async function getPendingHealthcareUsers(): Promise<UserData[]> {
  try {
    return await getAllUsers({
      pendingRole: true,
      sortBy: 'createdAt',
      sortDirection: 'desc'
    });
  } catch (error) {
    console.error('Error getting pending healthcare users:', error);
    throw error;
  }
}

/**
 * Approve healthcare provider request - FIXED VERSION
 */
export async function approveHealthcareUser(userId: string): Promise<void> {
  try {
    if (!db) {
      throw new Error('Firestore database is not initialized');
    }
    
    const userRef = doc(db, 'users', userId);
    
    // Remove pendingRole field completely using deleteField()
    await updateDoc(userRef, {
      role: 'healthcare',
      pendingRole: deleteField(),
      updatedAt: new Date().toISOString(),
      lastUpdated: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error approving healthcare user:', error);
    throw error;
  }
}

/**
 * Get users by role
 */
export async function getUsersByRole(role: UserData['role']): Promise<UserData[]> {
  try {
    return await getAllUsers({ role });
  } catch (error) {
    console.error(`Error getting users by role ${role}:`, error);
    throw error;
  }
}

/**
 * Check if email already exists in the system
 */
export async function checkEmailExists(email: string): Promise<boolean> {
  try {
    const user = await getUserByEmail(email);
    return !!user;
  } catch (error) {
    console.error('Error checking email existence:', error);
    throw error;
  }
}

/**
 * Update user's last login timestamp
 */
export async function updateUserLastLogin(userId: string): Promise<void> {
  try {
    await updateUser(userId, {
      lastLogin: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error updating last login:', error);
    throw error;
  }
}

/**
 * Deactivate a user account (soft delete)
 */
export const deactivateUser = async (userId: string, reason?: string): Promise<void> => {
  try {
    if (!db) {
      throw new Error('Firestore database is not initialized');
    }
    
    const userRef = doc(db, 'users', userId);
    
    await updateDoc(userRef, {
      status: 'inactive',
      deactivatedAt: new Date().toISOString(),
      deactivatedReason: reason || 'Admin deactivated',
      isActive: false,
      lastUpdated: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });

    console.log(`User ${userId} deactivated successfully`);
  } catch (error: any) {
    console.error('Error deactivating user:', error);
    throw new Error(`Failed to deactivate user: ${error.message}`);
  }
};

/**
 * Reactivate a user account - FIXED VERSION
 */
export const reactivateUser = async (userId: string): Promise<void> => {
  try {
    if (!db) {
      throw new Error('Firestore database is not initialized');
    }
    
    const userRef = doc(db, 'users', userId);
    
    await updateDoc(userRef, {
      status: 'active',
      isActive: true,
      reactivatedAt: new Date().toISOString(),
      deactivatedReason: deleteField(),
      deactivatedAt: deleteField(),
      lastUpdated: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });

    console.log(`User ${userId} reactivated successfully`);
  } catch (error: any) {
    console.error('Error reactivating user:', error);
    throw new Error(`Failed to reactivate user: ${error.message}`);
  }
};

/**
 * Reset user password via email
 */
export const resetUserPassword = async (email: string): Promise<void> => {
  try {
    if (!auth) {
      throw new Error('Firebase auth is not initialized');
    }
    
    await sendPasswordResetEmail(auth, email);
    console.log(`Password reset email sent to ${email}`);
  } catch (error: any) {
    console.error('Error sending password reset email:', error);
    
    if (error.code === 'auth/user-not-found') {
      throw new Error('No user found with this email address');
    } else if (error.code === 'auth/too-many-requests') {
      throw new Error('Too many requests. Please try again later');
    } else {
      throw new Error(`Failed to send password reset email: ${error.message}`);
    }
  }
};

/**
 * Update user role - FIXED VERSION
 */
export const updateUserRole = async (userId: string, role: string, pendingRole?: string): Promise<void> => {
  try {
    if (!db) {
      throw new Error('Firestore database is not initialized');
    }
    
    const userRef = doc(db, 'users', userId);
    
    const updateData: any = {
      role: role as UserData['role'],
      updatedAt: new Date().toISOString(),
      lastUpdated: new Date().toISOString()
    };
    
    // Handle pendingRole properly
    if (pendingRole === undefined) {
      // Remove the pendingRole field completely
      updateData.pendingRole = deleteField();
    } else if (pendingRole === 'healthcare') {
      updateData.pendingRole = 'healthcare';
    }
    
    await updateDoc(userRef, updateData);
    console.log(`User ${userId} role updated to ${role}`);
  } catch (error: any) {
    console.error('Error updating user role:', error);
    throw new Error(`Failed to update user role: ${error.message}`);
  }
};

/**
 * Check if user exists and is active
 */
export const checkUserStatus = async (userId: string): Promise<{ exists: boolean; isActive: boolean; email: string | null }> => {
  try {
    const user = await getUserByDocId(userId);
    
    if (!user) {
      return { exists: false, isActive: false, email: null };
    }
    
    return {
      exists: true,
      isActive: user.isActive !== false && user.status !== 'inactive',
      email: user.email || null
    };
  } catch (error: any) {
    console.error('Error checking user status:', error);
    throw new Error(`Failed to check user status: ${error.message}`);
  }
};

/**
 * Validate user data structure
 */
export function validateUserData(userData: Partial<UserData>): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];
  
  if (!userData.email || !userData.email.includes('@')) {
    errors.push('Valid email is required');
  }
  
  if (!userData.name || userData.name.trim().length < 2) {
    errors.push('Name must be at least 2 characters');
  }
  
  if (!userData.role || !['parent', 'healthcare', 'admin'].includes(userData.role)) {
    errors.push('Valid role is required (parent, healthcare, or admin)');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Format user data for display
 */
export function formatUserForDisplay(user: UserData): {
  displayName: string;
  roleBadge: string;
  status: string;
  joinedDate: string;
} {
  const roleColors = {
    admin: 'bg-purple-100 text-purple-800',
    healthcare: 'bg-green-100 text-green-800',
    parent: 'bg-blue-100 text-blue-800'
  };
  
  const status = user.pendingRole ? 'Pending Approval' : 
                 user.status === 'inactive' ? 'Inactive' : 
                 'Active';
  
  return {
    displayName: user.name || 'Unnamed User',
    roleBadge: roleColors[user.role] || 'bg-gray-100 text-gray-800',
    status: status,
    joinedDate: new Date(user.createdAt).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  };
}

/**
 * Export user data for download
 */
export function exportUserData(user: UserData): {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
  createdAt: string;
  lastLogin?: string;
} {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    status: user.status || 'active',
    createdAt: user.createdAt,
    lastLogin: user.lastLogin
  };
}

/**
 * Get users count by status
 */
export async function getUsersCountByStatus(): Promise<{
  active: number;
  inactive: number;
  pending: number;
}> {
  try {
    const users = await getAllUsers();
    
    return {
      active: users.filter(u => u.status === 'active' || u.isActive !== false).length,
      inactive: users.filter(u => u.status === 'inactive' || u.isActive === false).length,
      pending: users.filter(u => u.pendingRole).length
    };
  } catch (error) {
    console.error('Error getting users count by status:', error);
    throw error;
  }
}

/**
 * Remove pendingRole field from user (safe method)
 */
export const removePendingRole = async (userId: string): Promise<void> => {
  try {
    if (!db) {
      throw new Error('Firestore database is not initialized');
    }
    
    const userRef = doc(db, 'users', userId);
    
    await updateDoc(userRef, {
      pendingRole: deleteField(),
      updatedAt: new Date().toISOString(),
      lastUpdated: new Date().toISOString()
    });
    
    console.log(`Removed pendingRole from user ${userId}`);
  } catch (error: any) {
    console.error('Error removing pendingRole:', error);
    throw new Error(`Failed to remove pendingRole: ${error.message}`);
  }
};