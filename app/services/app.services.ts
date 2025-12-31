// ============================================================================
// IMPORTS
// ============================================================================
import { 
  collection, doc, getDoc, getDocs, addDoc, updateDoc, deleteDoc,
  query, where, orderBy, limit, startAfter, serverTimestamp,
  DocumentData, QueryDocumentSnapshot, arrayUnion, arrayRemove,
  writeBatch, runTransaction, Timestamp, getCountFromServer,
  QueryConstraint, Query, DocumentSnapshot, setDoc
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { getAuth } from 'firebase/auth';
import { db, auth, storage } from '@/app/lib/firebase/firebase';
import type * as AppTypes from '@/app/types/app.types';

// ============================================================================
// CONSTANTS (Updated Terminology)
// ============================================================================
const COLLECTIONS = {
  USERS: 'users',
  PATIENTS: 'patients', // Changed from 'children'
  MEDICAL_RECORDS: 'medicalRecords',
  VACCINATIONS: 'vaccinations',
  APPOINTMENTS: 'appointments',
  INVITATIONS: 'invitations',
  NOTIFICATIONS: 'notifications',
  AUDIT_LOGS: 'auditLogs'
} as const;

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

const withErrorHandling = async <T>(
  operation: () => Promise<T>,
  operationName: string
): Promise<T> => {
  try {
    return await operation();
  } catch (error) {
    console.error(`Error in ${operationName}:`, error);
    throw error instanceof Error 
      ? new Error(`${operationName} failed: ${error.message}`)
      : new Error(`Operation ${operationName} failed`);
  }
};

const convertTimestamp = (field: any): Date | undefined => {
  if (!field) return undefined;
  if (field?.toDate && typeof field.toDate === 'function') return field.toDate();
  if (field instanceof Date) return field;
  if (typeof field === 'string') return new Date(field);
  if (typeof field === 'number') return new Date(field);
  return undefined;
};

const ensureArray = <T>(field: any): T[] => {
  if (!field) return [];
  if (Array.isArray(field)) return field;
  return [];
};

const sanitizeText = (input: string): string => {
  return input?.trim().replace(/[<>]/g, '').substring(0, 1000) || '';
};

const validateEmail = (email: string): boolean => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

export const calculateAgeInMonths = (dob: string | Date): number => {
  const birth = typeof dob === 'string' ? new Date(dob) : dob;
  const today = new Date();
  
  let months = (today.getFullYear() - birth.getFullYear()) * 12;
  months += today.getMonth() - birth.getMonth();
  
  if (today.getDate() < birth.getDate()) months--;
  
  return Math.max(0, months);
};

export const calculateAgeString = (dob: string | Date): string => {
  const months = calculateAgeInMonths(dob);
  
  if (months >= 12) {
    const years = Math.floor(months / 12);
    const remainingMonths = months % 12;
    if (remainingMonths > 0) return `${years}y ${remainingMonths}m`;
    return `${years}y`;
  }
  
  return `${months}m`;
};

const generateRecordNumber = (): string => {
  const prefix = 'CHM';
  const timestamp = Date.now().toString().slice(-8);
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `${prefix}-${timestamp}-${random}`;
};

const generateInvitationCode = (): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
};

const calculateSystemHealth = (
  pendingInvites: number,
  recentActivity: number
): 'good' | 'warning' | 'critical' => {
  if (pendingInvites > 50) return 'warning';
  if (recentActivity === 0) return 'warning';
  return 'good';
};

// ============================================================================
// DATA CONVERTERS (Updated for Patient Terminology)
// ============================================================================

const toUserProfile = (doc: DocumentSnapshot<DocumentData>): AppTypes.UserProfile => {
  const data = doc.data() || {};
  
  return {
    id: doc.id,
    uid: doc.id,
    email: data.email || '',
    name: data.name || '',
    role: (data.role as AppTypes.UserRole) || 'guardian',
    phone: data.phone,
    address: data.address,
    profilePicture: data.profilePicture,
    patients: data.patients ? ensureArray<string>(data.patients) : [], // All roles can have patients
    clinicName: data.clinicName,
    specialization: data.specialization,
    licenseNumber: data.licenseNumber,
    credentials: ensureArray<string>(data.credentials),
    npiNumber: data.npiNumber,
    isVerified: data.isVerified || false,
    isActive: data.isActive !== false,
    permissions: data.permissions,
    isDeleted: data.isDeleted || false,
    timezone: data.timezone || 'UTC',
    language: data.language || 'en',
    notificationPreferences: data.notificationPreferences || {
      email: true,
      push: true,
      sms: false,
      appointmentReminders: true,
      healthAlerts: true
    },
    createdAt: convertTimestamp(data.createdAt),
    updatedAt: convertTimestamp(data.updatedAt),
    lastLogin: convertTimestamp(data.lastLogin)
  };
};

const toHealthcarePatient = (doc: DocumentSnapshot<DocumentData>): AppTypes.HealthcarePatient => {
  const data = doc.data() || {};
  
  return {
    id: doc.id,
    name: data.name || '',
    dob: data.dob || '',
    sex: (data.sex as AppTypes.Gender) || 'male',
    status: (data.status as AppTypes.PatientStatus) || 'active',
    growthStatus: (data.growthStatus as AppTypes.GrowthStatus) || 'normal',
    guardianIds: ensureArray<string>(data.guardianIds),
    clinicianIds: ensureArray<string>(data.clinicianIds),
    photoUrl: data.photoUrl,
    medicalRecordNumber: data.medicalRecordNumber || '',
    birthWeight: data.birthWeight || 0,
    birthLength: data.birthLength || 0,
    gestationalAge: data.gestationalAge || 40,
    bloodType: (data.bloodType as AppTypes.BloodType) || 'unknown',
    createdBy: data.createdBy || '',
    createdByName: data.createdByName || '',
    createdByEmail: data.createdByEmail || '',
    createdByRole: (data.createdByRole as AppTypes.UserRole) || 'guardian',
    allergies: ensureArray<AppTypes.Allergy>(data.allergies),
    conditions: ensureArray<AppTypes.MedicalCondition>(data.conditions),
    medications: ensureArray<AppTypes.Medication>(data.medications),
    immunizations: ensureArray<AppTypes.ImmunizationStatus>(data.immunizations),
    surgeries: ensureArray<AppTypes.Surgery>(data.surgeries),
    hospitalizations: ensureArray<AppTypes.Hospitalization>(data.hospitalizations),
    emergencyContacts: ensureArray<AppTypes.EmergencyContact>(data.emergencyContacts),
    growthParameters: data.growthParameters || { growthStandard: 'who' },
    developmentMilestones: data.developmentMilestones,
    developmentConcerns: ensureArray<string>(data.developmentConcerns),
    notes: data.notes,
    importantNotes: data.importantNotes,
    specialInstructions: data.specialInstructions,
    carePlan: data.carePlan,
    dietaryRestrictions: ensureArray<string>(data.dietaryRestrictions),
    specialNeeds: ensureArray<string>(data.specialNeeds),
    preferredLanguage: data.preferredLanguage,
    culturalConsiderations: data.culturalConsiderations,
    consentForTreatment: data.consentForTreatment,
    consentDate: convertTimestamp(data.consentDate),
    photoReleaseConsent: data.photoReleaseConsent,
    dataSharingConsent: data.dataSharingConsent,
    createdAt: convertTimestamp(data.createdAt),
    updatedAt: convertTimestamp(data.updatedAt),
    lastCheckup: convertTimestamp(data.lastCheckup),
    preferredName: data.preferredName,
    birthPlace: data.birthPlace,
    insuranceId: data.insuranceId,
    insuranceProvider: data.insuranceProvider,
    primaryCareClinicianId: data.primaryCareClinicianId,
    pediatricianId: data.pediatricianId,
    birthHeadCircumference: data.birthHeadCircumference,
    apgarScore: data.apgarScore,
    preferredHospital: data.preferredHospital,
    medicalAlertInfo: data.medicalAlertInfo,
    advanceDirectives: data.advanceDirectives
  };
};

const toMedicalRecord = (doc: DocumentSnapshot<DocumentData>): AppTypes.MedicalRecord => {
  const data = doc.data() || {};
  const date = convertTimestamp(data.date);
  
  if (!date) throw new Error('Medical record has invalid date');
  
  return {
    id: doc.id,
    patientId: data.patientId || '', // Changed from childId
    date,
    type: (data.type as AppTypes.MedicalRecordType) || 'checkup',
    height: data.height,
    weight: data.weight,
    temperature: data.temperature,
    headCircumference: data.headCircumference,
    bloodPressure: data.bloodPressure,
    heartRate: data.heartRate,
    respiratoryRate: data.respiratoryRate,
    oxygenSaturation: data.oxygenSaturation,
    notes: data.notes || '',
    chiefComplaint: data.chiefComplaint,
    historyOfPresentIllness: data.historyOfPresentIllness,
    clinicianId: data.clinicianId || '',
    clinicianName: data.clinicianName || '',
    clinicianSignature: data.clinicianSignature,
    diagnosis: ensureArray<string>(data.diagnosis),
    icd10Codes: ensureArray<string>(data.icd10Codes),
    assessment: data.assessment,
    plan: data.plan,
    prescription: ensureArray<AppTypes.Medication>(data.prescription),
    labResults: ensureArray<string>(data.labResults),
    imagingResults: ensureArray<string>(data.imagingResults),
    referrals: ensureArray<string>(data.referrals),
    referralClinicianId: data.referralClinicianId,
    nextAppointment: convertTimestamp(data.nextAppointment),
    followUpInstructions: data.followUpInstructions,
    followUpNeeded: data.followUpNeeded,
    heightPercentile: data.heightPercentile,
    weightPercentile: data.weightPercentile,
    headCircumferencePercentile: data.headCircumferencePercentile,
    bmiPercentile: data.bmiPercentile,
    vaccineName: data.vaccineName,
    vaccineLotNumber: data.vaccineLotNumber,
    administeredBy: data.administeredBy,
    nextVaccineDate: convertTimestamp(data.nextVaccineDate),
    cptCodes: ensureArray<string>(data.cptCodes),
    icd10ProcedureCodes: ensureArray<string>(data.icd10ProcedureCodes),
    createdAt: convertTimestamp(data.createdAt),
    updatedAt: convertTimestamp(data.updatedAt)
  };
};

const toAppointment = (doc: DocumentSnapshot<DocumentData>): AppTypes.Appointment => {
  const data = doc.data() || {};
  const dateTime = convertTimestamp(data.dateTime);
  
  if (!dateTime) throw new Error('Appointment has invalid date');
  
  return {
    id: doc.id,
    patientId: data.patientId || '', // Changed from childId
    dateTime,
    type: data.type || 'checkup',
    clinicianId: data.clinicianId || '',
    clinicianName: data.clinicianName || '',
    location: data.location,
    locationType: data.locationType || 'clinic',
    roomNumber: data.roomNumber,
    notes: data.notes,
    status: (data.status as AppTypes.AppointmentStatus) || 'scheduled',
    guardianId: data.guardianId,
    additionalGuardians: ensureArray<string>(data.additionalGuardians),
    additionalClinicians: ensureArray<string>(data.additionalClinicians),
    duration: data.duration || 30,
    reason: data.reason,
    preparationInstructions: data.preparationInstructions,
    remindersSent: data.remindersSent?.map((ts: any) => convertTimestamp(ts)).filter(Boolean) as Date[],
    reminderPreferences: data.reminderPreferences,
    followUpNeeded: data.followUpNeeded,
    followUpAppointmentId: data.followUpAppointmentId,
    insurancePreauthorization: data.insurancePreauthorization,
    preauthorizationNumber: data.preauthorizationNumber,
    createdAt: convertTimestamp(data.createdAt),
    updatedAt: convertTimestamp(data.updatedAt)
  };
};

const toInvitation = (doc: DocumentSnapshot<DocumentData>): AppTypes.Invitation => {
  const data = doc.data() || {};
  
  return {
    id: doc.id,
    patientId: data.patientId || '', // Changed from childId
    patientName: data.patientName || '', // Changed from childName
    invitationCode: data.invitationCode || '',
    invitationType: (data.invitationType as 'guardian' | 'clinician') || 'guardian',
    inviteeEmail: data.inviteeEmail || '',
    inviteeName: data.inviteeName,
    inviteePhone: data.inviteePhone,
    relationshipToPatient: data.relationshipToPatient, // Changed from relationshipToChild
    inviterId: data.inviterId || '',
    inviterName: data.inviterName || '',
    inviterEmail: data.inviterEmail || '',
    inviterRole: (data.inviterRole as AppTypes.UserRole) || 'guardian',
    customMessage: data.customMessage,
    status: (data.status as AppTypes.InvitationStatus) || 'pending',
    expiresAt: convertTimestamp(data.expiresAt),
    acceptedAt: convertTimestamp(data.acceptedAt),
    acceptedBy: data.acceptedBy,
    declinedAt: convertTimestamp(data.declinedAt),
    declinedReason: data.declinedReason,
    accessLevel: data.accessLevel || 'full',
    permissions: data.permissions,
    createdAt: convertTimestamp(data.createdAt),
    updatedAt: convertTimestamp(data.updatedAt)
  };
};

const toAuditLog = (doc: DocumentSnapshot<DocumentData>): AppTypes.AuditLog => {
  const data = doc.data() || {};
  
  return {
    id: doc.id,
    userId: data.userId || '',
    userEmail: data.userEmail || '',
    userRole: (data.userRole as AppTypes.UserRole) || 'guardian',
    action: data.action || '',
    targetUserId: data.targetUserId || undefined,
    details: data.details || '',
    metadata: data.metadata || {},
    ipAddress: data.ipAddress || '',
    userAgent: data.userAgent || '',
    createdAt: convertTimestamp(data.createdAt) || new Date(),
    updatedAt: convertTimestamp(data.updatedAt) || new Date()
  } as AppTypes.AuditLog;
};

// ============================================================================
// AUTHENTICATION SERVICES
// ============================================================================

export const getCurrentUser = async (): Promise<{
  user: any | null;
  profile: AppTypes.UserProfile | null;
}> => {
  return withErrorHandling(async () => {
    const user = auth.currentUser;
    if (!user) return { user: null, profile: null };
    
    const profile = await getUserProfile(user.uid);
    return { user, profile };
  }, 'getCurrentUser');
};

export const getAuthToken = async (): Promise<string | null> => {
  return withErrorHandling(async () => {
    const user = auth.currentUser;
    if (!user) return null;
    return await user.getIdToken(true);
  }, 'getAuthToken');
};

// ============================================================================
// USER SERVICES
// ============================================================================

export const getUserProfile = async (userId: string): Promise<AppTypes.UserProfile | null> => {
  return withErrorHandling(async () => {
    const userDoc = await getDoc(doc(db, COLLECTIONS.USERS, userId));
    if (!userDoc.exists()) return null;
    return toUserProfile(userDoc);
  }, `getUserProfile(${userId})`);
};

export const createUserProfile = async (
  profileData: Omit<AppTypes.UserProfile, 'id' | 'createdAt' | 'updatedAt'>
): Promise<void> => {
  return withErrorHandling(async () => {
    if (!validateEmail(profileData.email)) {
      throw new Error('Invalid email address');
    }
    
    const profile: Omit<AppTypes.UserProfile, 'id'> = {
      ...profileData,
      patients: profileData.patients || [],
      createdAt: new Date(),
      updatedAt: new Date(),
      lastLogin: new Date()
    };
    
    await setDoc(doc(db, COLLECTIONS.USERS, profileData.uid), {
      ...profile,
      createdAt: serverTimestamp(),  // Converted to Firestore timestamp
      updatedAt: serverTimestamp(),
      lastLogin: serverTimestamp()
    });
  }, `createUserProfile(${profileData.email})`);
};

export const updateUserProfile = async (
  userId: string, 
  updates: Partial<AppTypes.UserProfile>
): Promise<void> => {
  return withErrorHandling(async () => {
    const sanitizedUpdates = { ...updates };
    if (updates.name) sanitizedUpdates.name = sanitizeText(updates.name);
    if (updates.email) {
      if (!validateEmail(updates.email)) throw new Error('Invalid email');
      sanitizedUpdates.email = updates.email.toLowerCase().trim();
    }
    
    await updateDoc(doc(db, COLLECTIONS.USERS, userId), {
      ...sanitizedUpdates,
      updatedAt: serverTimestamp()
    });
  }, `updateUserProfile(${userId})`);
};

export const getUsersByIds = async (userIds: string[]): Promise<AppTypes.UserProfile[]> => {
  if (userIds.length === 0) return [];
  
  return withErrorHandling(async () => {
    const results: AppTypes.UserProfile[] = [];
    
    // Process in batches of 10
    for (let i = 0; i < userIds.length; i += 10) {
      const batchIds = userIds.slice(i, i + 10);
      const batchQuery = query(
        collection(db, COLLECTIONS.USERS),
        where('uid', 'in', batchIds)
      );
      const snapshot = await getDocs(batchQuery);
      results.push(...snapshot.docs.map(toUserProfile));
    }
    
    return results;
  }, 'getUsersByIds');
};

export const searchUsers = async (
  searchTerm: string, 
  role?: AppTypes.UserRole
): Promise<AppTypes.UserProfile[]> => {
  return withErrorHandling(async () => {
    const constraints: QueryConstraint[] = [
      where('isActive', '==', true),
      orderBy('name')
    ];
    
    if (role) {
      constraints.push(where('role', '==', role));
    }
    
    const usersQuery = query(collection(db, COLLECTIONS.USERS), ...constraints);
    const snapshot = await getDocs(usersQuery);
    
    const searchLower = searchTerm.toLowerCase();
    return snapshot.docs
      .map(toUserProfile)
      .filter(user => 
        user.name.toLowerCase().includes(searchLower) ||
        user.email.toLowerCase().includes(searchLower)
      );
  }, 'searchUsers');
};

// ============================================================================
// PATIENT SERVICES (Updated from Child Services)
// ============================================================================

export const registerPatient = async (
  patientData: AppTypes.PatientRegistrationData,
  creatorId: string
): Promise<AppTypes.ApiResponse<{ patientId: string; medicalRecordNumber: string }>> => {
  return withErrorHandling(async () => {
    const creator = await getUserProfile(creatorId);
    if (!creator) throw new Error('Creator not found');
    
    const medicalRecordNumber = patientData.medicalRecordNumber || generateRecordNumber();
    
    const patientDoc = {
      name: sanitizeText(patientData.name.trim()),
      dob: patientData.dob,
      sex: patientData.sex,
      medicalRecordNumber,
      guardianIds: creator.role === 'guardian' ? [creatorId] : [],
      clinicianIds: creator.role === 'clinician' ? [creatorId] : [],
      createdBy: creatorId,
      createdByName: creator.name,
      createdByEmail: creator.email,
      createdByRole: creator.role,
      birthWeight: patientData.birthWeight || 0,
      birthLength: patientData.birthLength || 0,
      gestationalAge: patientData.gestationalAge || 40,
      bloodType: patientData.bloodType || 'unknown',
      status: 'active' as AppTypes.PatientStatus,
      growthStatus: 'normal' as AppTypes.GrowthStatus,
      allergies: patientData.allergies || [],
      conditions: patientData.conditions || [],
      emergencyContacts: patientData.emergencyContacts || [],
      notes: sanitizeText(patientData.notes || ''),
      photoUrl: patientData.photoUrl || '',
      growthParameters: { growthStandard: 'who' },
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };
    
    const patientRef = await addDoc(collection(db, COLLECTIONS.PATIENTS), patientDoc);
    const patientId = patientRef.id;
    
    // Update creator's references
    const userUpdate: Record<string, any> = {
      updatedAt: serverTimestamp()
    };
    
    // All roles can have patients array
    userUpdate.patients = arrayUnion(patientId);
    
    await updateDoc(doc(db, COLLECTIONS.USERS, creatorId), userUpdate);
    
    return {
      success: true,
      data: { patientId, medicalRecordNumber },
      message: 'Patient registered successfully',
      timestamp: new Date()
    };
  }, 'registerPatient');
};

export const getPatient = async (patientId: string): Promise<AppTypes.HealthcarePatient | null> => {
  return withErrorHandling(async () => {
    const patientDoc = await getDoc(doc(db, COLLECTIONS.PATIENTS, patientId));
    if (!patientDoc.exists()) return null;
    return toHealthcarePatient(patientDoc);
  }, `getPatient(${patientId})`);
};

export const getPatientWithDetails = async (patientId: string): Promise<AppTypes.PatientWithDetails | null> => {
  return withErrorHandling(async () => {
    const patient = await getPatient(patientId);
    if (!patient) return null;
    
    const [guardians, clinicians, recentRecords, upcomingAppointments] = await Promise.all([
      getUsersByIds(patient.guardianIds),
      getUsersByIds(patient.clinicianIds),
      getPatientMedicalRecords(patientId, { limit: 5 }),
      getPatientAppointments(patientId, { upcomingOnly: true, limit: 3 })
    ]);
    
    return {
      id: patient.id,
      name: patient.name,
      dob: patient.dob,
      sex: patient.sex,
      status: patient.status,
      growthStatus: patient.growthStatus,
      photoUrl: patient.photoUrl,
      medicalRecordNumber: patient.medicalRecordNumber,
      birthWeight: patient.birthWeight,
      birthLength: patient.birthLength,
      gestationalAge: patient.gestationalAge,
      guardianIds: patient.guardianIds,
      clinicianIds: patient.clinicianIds,
      guardians: guardians,
      clinicians: clinicians,
      recentRecords: recentRecords.records,
      upcomingAppointments: upcomingAppointments.appointments,
      growthData: await getGrowthChartData(patientId),
      createdBy: patient.createdBy,
      createdByName: patient.createdByName,
      createdByRole: patient.createdByRole,
      allergies: patient.allergies,
      conditions: patient.conditions,
      medications: patient.medications,
      emergencyContacts: patient.emergencyContacts,
      immunizations: patient.immunizations
    };
  }, `getPatientWithDetails(${patientId})`);
};

export const updatePatient = async (
  patientId: string, 
  updates: Partial<AppTypes.HealthcarePatient>
): Promise<void> => {
  return withErrorHandling(async () => {
    const sanitizedUpdates = { ...updates };
    
    if (updates.name) sanitizedUpdates.name = sanitizeText(updates.name);
    if (updates.notes) sanitizedUpdates.notes = sanitizeText(updates.notes);
    if (updates.importantNotes) sanitizedUpdates.importantNotes = sanitizeText(updates.importantNotes);
    if (updates.specialInstructions) sanitizedUpdates.specialInstructions = sanitizeText(updates.specialInstructions);
    
    await updateDoc(doc(db, COLLECTIONS.PATIENTS, patientId), {
      ...sanitizedUpdates,
      updatedAt: serverTimestamp()
    });
  }, `updatePatient(${patientId})`);
};

export const getClinicianPatients = async (
  clinicianId: string,
  options?: { limit?: number; lastDoc?: QueryDocumentSnapshot<DocumentData> }
): Promise<AppTypes.PaginatedResponse<AppTypes.HealthcarePatient>> => {
  return withErrorHandling(async () => {
    const constraints: QueryConstraint[] = [
      where('clinicianIds', 'array-contains', clinicianId),
      orderBy('createdAt', 'desc')
    ];
    
    if (options?.limit) constraints.push(limit(options.limit));
    if (options?.lastDoc) constraints.push(startAfter(options.lastDoc));
    
    const patientsQuery = query(collection(db, COLLECTIONS.PATIENTS), ...constraints);
    const snapshot = await getDocs(patientsQuery);
    
    const patients = snapshot.docs.map(toHealthcarePatient);
    
    // Get total count
    const totalQuery = query(
      collection(db, COLLECTIONS.PATIENTS),
      where('clinicianIds', 'array-contains', clinicianId)
    );
    const totalSnapshot = await getCountFromServer(totalQuery);
    
    const hasMore = snapshot.docs.length === (options?.limit || 10);
    const lastDoc = snapshot.docs.length > 0 ? snapshot.docs[snapshot.docs.length - 1] : null;
    
    return {
      items: patients,
      total: totalSnapshot.data().count,
      page: options?.lastDoc ? 2 : 1,
      pageSize: options?.limit || 10,
      hasMore,
      totalPages: Math.ceil(totalSnapshot.data().count / (options?.limit || 10))
    };
  }, `getClinicianPatients(${clinicianId})`);
};

export const getGuardianPatients = async (
  guardianId: string,
  options?: { limit?: number; lastDoc?: QueryDocumentSnapshot<DocumentData> }
): Promise<AppTypes.PaginatedResponse<AppTypes.HealthcarePatient>> => {
  return withErrorHandling(async () => {
    const constraints: QueryConstraint[] = [
      where('guardianIds', 'array-contains', guardianId),
      orderBy('createdAt', 'desc')
    ];
    
    if (options?.limit) constraints.push(limit(options.limit));
    if (options?.lastDoc) constraints.push(startAfter(options.lastDoc));
    
    const patientsQuery = query(collection(db, COLLECTIONS.PATIENTS), ...constraints);
    const snapshot = await getDocs(patientsQuery);
    
    const patients = snapshot.docs.map(toHealthcarePatient);
    
    // Get total count
    const totalQuery = query(
      collection(db, COLLECTIONS.PATIENTS),
      where('guardianIds', 'array-contains', guardianId)
    );
    const totalSnapshot = await getCountFromServer(totalQuery);
    
    const hasMore = snapshot.docs.length === (options?.limit || 10);
    const lastDoc = snapshot.docs.length > 0 ? snapshot.docs[snapshot.docs.length - 1] : null;
    
    return {
      items: patients,
      total: totalSnapshot.data().count,
      page: options?.lastDoc ? 2 : 1,
      pageSize: options?.limit || 10,
      hasMore,
      totalPages: Math.ceil(totalSnapshot.data().count / (options?.limit || 10))
    };
  }, `getGuardianPatients(${guardianId})`);
};

// ============================================================================
// RELATIONSHIP MANAGEMENT (Updated Terminology)
// ============================================================================

export const addGuardianToPatient = async (patientId: string, guardianId: string): Promise<void> => {
  return withErrorHandling(async () => {
    await runTransaction(db, async (transaction) => {
      const patientRef = doc(db, COLLECTIONS.PATIENTS, patientId);
      const guardianRef = doc(db, COLLECTIONS.USERS, guardianId);
      
      const [patientDoc, guardianDoc] = await Promise.all([
        transaction.get(patientRef),
        transaction.get(guardianRef)
      ]);
      
      if (!patientDoc.exists()) throw new Error('Patient not found');
      if (!guardianDoc.exists()) throw new Error('User not found');
      
      const guardianData = guardianDoc.data();
      if (guardianData?.role !== 'guardian') {
        throw new Error('User is not a guardian');
      }
      
      transaction.update(patientRef, {
        guardianIds: arrayUnion(guardianId),
        updatedAt: serverTimestamp()
      });
      
      transaction.update(guardianRef, {
        patients: arrayUnion(patientId),
        updatedAt: serverTimestamp()
      });
    });
  }, `addGuardianToPatient(${patientId}, ${guardianId})`);
};

export const addClinicianToPatient = async (patientId: string, clinicianId: string): Promise<void> => {
  return withErrorHandling(async () => {
    await runTransaction(db, async (transaction) => {
      const patientRef = doc(db, COLLECTIONS.PATIENTS, patientId);
      const clinicianRef = doc(db, COLLECTIONS.USERS, clinicianId);
      
      const [patientDoc, clinicianDoc] = await Promise.all([
        transaction.get(patientRef),
        transaction.get(clinicianRef)
      ]);
      
      if (!patientDoc.exists()) throw new Error('Patient not found');
      if (!clinicianDoc.exists()) throw new Error('User not found');
      
      const clinicianData = clinicianDoc.data();
      if (clinicianData?.role !== 'clinician') {
        throw new Error('User is not a clinician');
      }
      
      transaction.update(patientRef, {
        clinicianIds: arrayUnion(clinicianId),
        updatedAt: serverTimestamp()
      });
      
      transaction.update(clinicianRef, {
        patients: arrayUnion(patientId),
        updatedAt: serverTimestamp()
      });
    });
  }, `addClinicianToPatient(${patientId}, ${clinicianId})`);
};

// ============================================================================
// MEDICAL RECORDS SERVICES (Updated Terminology)
// ============================================================================

export const createMedicalRecord = async (
  recordData: AppTypes.MedicalRecordFormData
): Promise<AppTypes.ApiResponse<{ recordId: string }>> => {
  return withErrorHandling(async () => {
    const currentUser = auth.currentUser;
    if (!currentUser) throw new Error('Not authenticated');
    
    const clinician = await getUserProfile(currentUser.uid);
    if (!clinician || clinician.role !== 'clinician') {
      throw new Error('Only clinicians can create medical records');
    }
    
    const sanitizedRecord = {
      ...recordData,
      notes: sanitizeText(recordData.notes || ''),
      chiefComplaint: recordData.chiefComplaint ? sanitizeText(recordData.chiefComplaint) : undefined,
      diagnosis: recordData.diagnosis?.map(sanitizeText) || [],
      assessment: recordData.assessment ? sanitizeText(recordData.assessment) : undefined,
      plan: recordData.plan ? sanitizeText(recordData.plan) : undefined,
      clinicianId: currentUser.uid,
      clinicianName: clinician.name
    };
    
    const recordRef = await addDoc(collection(db, COLLECTIONS.MEDICAL_RECORDS), {
      ...sanitizedRecord,
      date: Timestamp.fromDate(recordData.date),
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    
    // Update patient's last checkup
    await updateDoc(doc(db, COLLECTIONS.PATIENTS, recordData.patientId), {
      lastCheckup: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    
    return {
      success: true,
      data: { recordId: recordRef.id },
      message: 'Medical record created successfully',
      timestamp: new Date()
    };
  }, 'createMedicalRecord');
};

export const getMedicalRecord = async (recordId: string): Promise<AppTypes.MedicalRecord | null> => {
  return withErrorHandling(async () => {
    const recordDoc = await getDoc(doc(db, COLLECTIONS.MEDICAL_RECORDS, recordId));
    if (!recordDoc.exists()) return null;
    return toMedicalRecord(recordDoc);
  }, `getMedicalRecord(${recordId})`);
};

export const getPatientMedicalRecords = async (
  patientId: string,
  options?: { limit?: number; lastDoc?: QueryDocumentSnapshot<DocumentData> }
): Promise<{ records: AppTypes.MedicalRecord[]; lastDoc: QueryDocumentSnapshot<DocumentData> | null }> => {
  return withErrorHandling(async () => {
    const constraints: QueryConstraint[] = [
      where('patientId', '==', patientId), // Changed from childId
      orderBy('date', 'desc')
    ];
    
    if (options?.limit) constraints.push(limit(options.limit));
    if (options?.lastDoc) constraints.push(startAfter(options.lastDoc));
    
    const recordsQuery = query(collection(db, COLLECTIONS.MEDICAL_RECORDS), ...constraints);
    const snapshot = await getDocs(recordsQuery);
    
    const records = snapshot.docs.map(toMedicalRecord);
    const lastDoc = snapshot.docs.length > 0 ? snapshot.docs[snapshot.docs.length - 1] : null;
    
    return { records, lastDoc };
  }, `getPatientMedicalRecords(${patientId})`);
};

// ============================================================================
// APPOINTMENT SERVICES (Updated Terminology)
// ============================================================================

export const scheduleAppointment = async (
  appointmentData: Omit<AppTypes.Appointment, 'id' | 'createdAt' | 'updatedAt'>
): Promise<AppTypes.ApiResponse<string>> => {
  return withErrorHandling(async () => {
    const appointmentRef = await addDoc(collection(db, COLLECTIONS.APPOINTMENTS), {
      ...appointmentData,
      dateTime: Timestamp.fromDate(appointmentData.dateTime),
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    
    return {
      success: true,
      data: appointmentRef.id,
      message: 'Appointment scheduled successfully',
      timestamp: new Date()
    };
  }, 'scheduleAppointment');
};

export const getAppointment = async (appointmentId: string): Promise<AppTypes.Appointment | null> => {
  return withErrorHandling(async () => {
    const appointmentDoc = await getDoc(doc(db, COLLECTIONS.APPOINTMENTS, appointmentId));
    if (!appointmentDoc.exists()) return null;
    return toAppointment(appointmentDoc);
  }, `getAppointment(${appointmentId})`);
};

export const getPatientAppointments = async (
  patientId: string,
  options?: { upcomingOnly?: boolean; limit?: number }
): Promise<{ appointments: AppTypes.Appointment[]; lastDoc: QueryDocumentSnapshot<DocumentData> | null }> => {
  return withErrorHandling(async () => {
    const constraints: QueryConstraint[] = [
      where('patientId', '==', patientId), // Changed from childId
      orderBy('dateTime', 'asc')
    ];
    
    if (options?.upcomingOnly) {
      constraints.push(where('dateTime', '>=', Timestamp.fromDate(new Date())));
    }
    
    if (options?.limit) constraints.push(limit(options.limit));
    
    const appointmentsQuery = query(collection(db, COLLECTIONS.APPOINTMENTS), ...constraints);
    const snapshot = await getDocs(appointmentsQuery);
    
    const appointments = snapshot.docs.map(toAppointment);
    const lastDoc = snapshot.docs.length > 0 ? snapshot.docs[snapshot.docs.length - 1] : null;
    
    return { appointments, lastDoc };
  }, `getPatientAppointments(${patientId})`);
};

export const updateAppointmentStatus = async (
  appointmentId: string,
  status: AppTypes.AppointmentStatus,
  notes?: string
): Promise<void> => {
  return withErrorHandling(async () => {
    const updates: Record<string, any> = {
      status,
      updatedAt: serverTimestamp()
    };
    
    if (notes) updates.notes = sanitizeText(notes);
    
    await updateDoc(doc(db, COLLECTIONS.APPOINTMENTS, appointmentId), updates);
  }, `updateAppointmentStatus(${appointmentId})`);
};

// ============================================================================
// GROWTH TRACKING SERVICES (Updated Terminology)
// ============================================================================

export const getGrowthChartData = async (patientId: string): Promise<AppTypes.GrowthChartData[]> => {
  return withErrorHandling(async (): Promise<AppTypes.GrowthChartData[]> => {
    const patient = await getPatient(patientId);
    if (!patient) return [];
    
    const { records } = await getPatientMedicalRecords(patientId, { limit: 100 });
    
    const growthData: AppTypes.GrowthChartData[] = [];
    
    records.forEach(record => {
      if ((record.height || record.weight || record.headCircumference) && record.date) {
        const ageInMonths = calculateAgeInMonths(patient.dob);
        
        // Calculate BMI if both height and weight are available
        let bmi: number | undefined;
        if (record.height && record.weight) {
          // Convert height from cm to meters
          const heightInMeters = record.height / 100;
          bmi = record.weight / (heightInMeters * heightInMeters);
        }
        
        const data: AppTypes.GrowthChartData = {
          date: record.date,
          ageInMonths,
          height: record.height,
          weight: record.weight,
          headCircumference: record.headCircumference,
          heightPercentile: record.heightPercentile,
          weightPercentile: record.weightPercentile,
          headCircumferencePercentile: record.headCircumferencePercentile,
          bmi,
          bmiPercentile: record.bmiPercentile,
          measurementType: 'clinical'
        };
        
        growthData.push(data);
      }
    });
    
    // Sort by date ascending
    return growthData.sort((a, b) => a.date.getTime() - b.date.getTime());
  }, `getGrowthChartData(${patientId})`);
};

export const getCompleteGrowthData = async (patientId: string): Promise<AppTypes.GrowthChartData[]> => {
  return withErrorHandling(async (): Promise<AppTypes.GrowthChartData[]> => {
    try {
      const patient = await getPatient(patientId);
      if (!patient) return [];
      
      // Get medical records (clinical measurements)
      const { records } = await getPatientMedicalRecords(patientId, { limit: 100 });
      
      const growthData: AppTypes.GrowthChartData[] = [];
      
      // Process clinical records
      records.forEach(record => {
        if ((record.height || record.weight || record.headCircumference) && record.date) {
          const ageInMonths = calculateAgeInMonths(patient.dob);
          
          // Calculate BMI
          let bmi: number | undefined;
          if (record.height && record.weight) {
            const heightInMeters = record.height / 100;
            bmi = record.weight / (heightInMeters * heightInMeters);
          }
          
          growthData.push({
            date: record.date,
            ageInMonths,
            height: record.height,
            weight: record.weight,
            headCircumference: record.headCircumference,
            heightPercentile: record.heightPercentile,
            weightPercentile: record.weightPercentile,
            headCircumferencePercentile: record.headCircumferencePercentile,
            bmi,
            bmiPercentile: record.bmiPercentile,
            measurementType: 'clinical',
            measuredBy: record.clinicianId
          });
        }
      });
      
      // Sort by date
      return growthData.sort((a, b) => a.date.getTime() - b.date.getTime());
      
    } catch (error) {
      console.error('Error fetching growth data:', error);
      return [];
    }
  }, `getCompleteGrowthData(${patientId})`);
};

export const getGrowthTrends = async (patientId: string): Promise<{
  heightTrend: 'increasing' | 'decreasing' | 'stable';
  weightTrend: 'increasing' | 'decreasing' | 'stable';
  bmiTrend: 'increasing' | 'decreasing' | 'stable';
  lastMeasurementDate?: Date;
}> => {
  return withErrorHandling(async () => {
    const growthData = await getGrowthChartData(patientId);
    
    if (growthData.length < 2) {
      return {
        heightTrend: 'stable',
        weightTrend: 'stable',
        bmiTrend: 'stable',
        lastMeasurementDate: growthData[0]?.date
      };
    }
    
    // Sort by date descending to get most recent first
    const sortedData = [...growthData].sort((a, b) => b.date.getTime() - a.date.getTime());
    const recentData = sortedData.slice(0, 3); // Last 3 measurements
    
    // Calculate trends
    let heightSum = 0;
    let weightSum = 0;
    let bmiSum = 0;
    let validHeightCount = 0;
    let validWeightCount = 0;
    let validBmiCount = 0;
    
    recentData.forEach(data => {
      if (data.height !== undefined) {
        heightSum += data.height;
        validHeightCount++;
      }
      if (data.weight !== undefined) {
        weightSum += data.weight;
        validWeightCount++;
      }
      if (data.bmi !== undefined) {
        bmiSum += data.bmi;
        validBmiCount++;
      }
    });
    
    const avgHeight = validHeightCount > 0 ? heightSum / validHeightCount : 0;
    const avgWeight = validWeightCount > 0 ? weightSum / validWeightCount : 0;
    const avgBmi = validBmiCount > 0 ? bmiSum / validBmiCount : 0;
    
    // Compare with previous measurements (if available)
    const previousData = sortedData.slice(3, 6);
    let prevHeightSum = 0;
    let prevWeightSum = 0;
    let prevBmiSum = 0;
    let prevValidHeightCount = 0;
    let prevValidWeightCount = 0;
    let prevValidBmiCount = 0;
    
    previousData.forEach(data => {
      if (data.height !== undefined) {
        prevHeightSum += data.height;
        prevValidHeightCount++;
      }
      if (data.weight !== undefined) {
        prevWeightSum += data.weight;
        prevValidWeightCount++;
      }
      if (data.bmi !== undefined) {
        prevBmiSum += data.bmi;
        prevValidBmiCount++;
      }
    });
    
    const prevAvgHeight = prevValidHeightCount > 0 ? prevHeightSum / prevValidHeightCount : 0;
    const prevAvgWeight = prevValidWeightCount > 0 ? prevWeightSum / prevValidWeightCount : 0;
    const prevAvgBmi = prevValidBmiCount > 0 ? prevBmiSum / prevValidBmiCount : 0;
    
    // Determine trends (with threshold to avoid noise)
    const threshold = 0.1; // 0.1 unit threshold
    
    const heightTrend = 
      validHeightCount > 0 && prevValidHeightCount > 0
        ? avgHeight > prevAvgHeight + threshold ? 'increasing'
        : avgHeight < prevAvgHeight - threshold ? 'decreasing'
        : 'stable'
        : 'stable';
    
    const weightTrend = 
      validWeightCount > 0 && prevValidWeightCount > 0
        ? avgWeight > prevAvgWeight + threshold ? 'increasing'
        : avgWeight < prevAvgWeight - threshold ? 'decreasing'
        : 'stable'
        : 'stable';
    
    const bmiTrend = 
      validBmiCount > 0 && prevValidBmiCount > 0
        ? avgBmi > prevAvgBmi + threshold ? 'increasing'
        : avgBmi < prevAvgBmi - threshold ? 'decreasing'
        : 'stable'
        : 'stable';
    
    return {
      heightTrend,
      weightTrend,
      bmiTrend,
      lastMeasurementDate: sortedData[0]?.date
    };
  }, `getGrowthTrends(${patientId})`);
};

export const addGrowthMeasurement = async (
  patientId: string,
  measurement: {
    date: Date;
    height?: number;
    weight?: number;
    headCircumference?: number;
    notes?: string;
    measuredBy: string; // User ID
    measurementType: 'clinical' | 'home';
  }
): Promise<AppTypes.ApiResponse<{ measurementId: string }>> => {
  return withErrorHandling(async () => {
    const patient = await getPatient(patientId);
    if (!patient) {
      throw new Error('Patient not found');
    }
    
    // Calculate BMI if both height and weight are provided
    let bmi: number | undefined;
    let bmiPercentile: number | undefined;
    if (measurement.height && measurement.weight) {
      const heightInMeters = measurement.height / 100;
      bmi = measurement.weight / (heightInMeters * heightInMeters);
    }
    
    const measurementData = {
      patientId,
      date: measurement.date,
      type: 'checkup' as AppTypes.MedicalRecordType,
      height: measurement.height,
      weight: measurement.weight,
      headCircumference: measurement.headCircumference,
      notes: sanitizeText(measurement.notes || ''),
      bmi,
      bmiPercentile,
      measurementType: measurement.measurementType,
      measuredBy: measurement.measuredBy,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };
    
    // Store in appropriate collection based on measurement type
    let collectionRef;
    if (measurement.measurementType === 'clinical') {
      collectionRef = collection(db, COLLECTIONS.MEDICAL_RECORDS);
    } else {
      collectionRef = collection(db, COLLECTIONS.MEDICAL_RECORDS);
    }
    
    const docRef = await addDoc(collectionRef, measurementData);
    
    // Update patient's last checkup if clinical measurement
    if (measurement.measurementType === 'clinical') {
      await updateDoc(doc(db, COLLECTIONS.PATIENTS, patientId), {
        lastCheckup: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
    }
    
    return {
      success: true,
      data: { measurementId: docRef.id },
      message: 'Growth measurement recorded successfully',
      timestamp: new Date()
    };
  }, 'addGrowthMeasurement');
};

// ============================================================================
// NOTIFICATION SERVICES
// ============================================================================

export const sendNotification = async (
  notification: Omit<AppTypes.Notification, 'id' | 'createdAt' | 'updatedAt'>
): Promise<AppTypes.ApiResponse<string>> => {
  return withErrorHandling(async () => {
    const notificationRef = await addDoc(collection(db, COLLECTIONS.NOTIFICATIONS), {
      ...notification,
      isRead: false,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    
    return {
      success: true,
      data: notificationRef.id,
      message: 'Notification sent',
      timestamp: new Date()
    };
  }, 'sendNotification');
};

export const getUserNotifications = async (
  userId: string,
  options?: { unreadOnly?: boolean; limit?: number }
): Promise<{ notifications: AppTypes.Notification[]; lastDoc: QueryDocumentSnapshot<DocumentData> | null }> => {
  return withErrorHandling(async () => {
    const constraints: QueryConstraint[] = [
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    ];
    
    if (options?.unreadOnly) constraints.push(where('isRead', '==', false));
    if (options?.limit) constraints.push(limit(options.limit));
    
    const notificationsQuery = query(collection(db, COLLECTIONS.NOTIFICATIONS), ...constraints);
    const snapshot = await getDocs(notificationsQuery);
    
    const notifications = snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        userId: data.userId || '',
        type: (data.type as AppTypes.NotificationType) || 'system',
        title: data.title || '',
        message: data.message || '',
        relatedId: data.relatedId,
        relatedType: data.relatedType,
        isRead: data.isRead || false,
        readAt: convertTimestamp(data.readAt),
        actionUrl: data.actionUrl,
        actionLabel: data.actionLabel,
        requiresAction: data.requiresAction,
        priority: (data.priority as AppTypes.NotificationPriority) || 'medium',
        metadata: data.metadata,
        deliveryMethods: ensureArray<string>(data.deliveryMethods),
        emailSent: data.emailSent,
        pushSent: data.pushSent,
        smsSent: data.smsSent,
        createdAt: convertTimestamp(data.createdAt),
        updatedAt: convertTimestamp(data.updatedAt)
      } as AppTypes.Notification;
    });
    
    const lastDoc = snapshot.docs.length > 0 ? snapshot.docs[snapshot.docs.length - 1] : null;
    
    return { notifications, lastDoc };
  }, `getUserNotifications(${userId})`);
};

// ============================================================================
// FILE MANAGEMENT SERVICES (Updated Terminology)
// ============================================================================

export const uploadPatientPhoto = async (
  patientId: string, 
  file: File
): Promise<AppTypes.ApiResponse<string>> => {
  return withErrorHandling(async () => {
    const validTypes = ['image/jpeg', 'image/png', 'image/gif'];
    if (!validTypes.includes(file.type)) {
      throw new Error('Invalid file type');
    }
    
    if (file.size > 5 * 1024 * 1024) {
      throw new Error('File size exceeds 5MB limit');
    }
    
    const timestamp = Date.now();
    const fileName = `${timestamp}_${file.name.replace(/[^a-zA-Z0-9.]/g, '_')}`;
    const storageRef = ref(storage, `patients/${patientId}/photos/${fileName}`);
    
    const snapshot = await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(snapshot.ref);
    
    await updatePatient(patientId, { photoUrl: downloadURL });
    
    return {
      success: true,
      data: downloadURL,
      message: 'Photo uploaded successfully',
      timestamp: new Date()
    };
  }, `uploadPatientPhoto(${patientId})`);
};

export const deleteFile = async (fileUrl: string): Promise<AppTypes.ApiResponse<void>> => {
  return withErrorHandling(async () => {
    const fileRef = ref(storage, fileUrl);
    await deleteObject(fileRef);
    
    return {
      success: true,
      message: 'File deleted successfully',
      timestamp: new Date()
    };
  }, `deleteFile(${fileUrl})`);
};

// ============================================================================
// PERMISSION SERVICES (Updated Terminology)
// ============================================================================

export const canAccessPatient = async (
  userId: string, 
  patientId: string
): Promise<boolean> => {
  return withErrorHandling(async () => {
    const [user, patient] = await Promise.all([
      getUserProfile(userId),
      getPatient(patientId)
    ]);
    
    if (!user || !patient) return false;
    
    if (user.role === 'admin') return true;
    if (user.role === 'clinician' && patient.clinicianIds.includes(userId)) return true;
    if (user.role === 'guardian' && patient.guardianIds.includes(userId)) return true;
    
    return false;
  }, `canAccessPatient(${userId}, ${patientId})`);
};

export const hasRole = async (
  userId: string, 
  role: AppTypes.UserRole
): Promise<boolean> => {
  return withErrorHandling(async () => {
    const user = await getUserProfile(userId);
    return user?.role === role;
  }, `hasRole(${userId}, ${role})`);
};

// ============================================================================
// DASHBOARD SERVICES (Updated Terminology)
// ============================================================================

export const getPatientSummary = async (patientId: string): Promise<AppTypes.PatientSummary | null> => {
  return withErrorHandling(async () => {
    const patient = await getPatient(patientId);
    if (!patient) return null;
    
    const ageInMonths = calculateAgeInMonths(patient.dob);
    const guardians = await getUsersByIds(patient.guardianIds.slice(0, 2));
    const guardianNames = guardians.map(g => g.name);
    
    // Get upcoming appointments
    const { appointments } = await getPatientAppointments(patientId, { upcomingOnly: true, limit: 1 });
    const nextAppointment = appointments.length > 0 ? appointments[0].dateTime : undefined;
    
    return {
      id: patient.id,
      name: patient.name,
      dob: patient.dob,
      sex: patient.sex,
      ageInMonths,
      ageString: calculateAgeString(patient.dob),
      photoUrl: patient.photoUrl,
      status: patient.status,
      growthStatus: patient.growthStatus,
      lastCheckup: patient.lastCheckup,
      nextAppointment,
      vaccinesDue: 0,
      healthAlerts: patient.growthStatus === 'warning' || patient.growthStatus === 'critical' ? 1 : 0,
      guardianNames
    };
  }, `getPatientSummary(${patientId})`);
};

// ============================================================================
// AUDIT LOG SERVICES
// ============================================================================

export const logAudit = async (
  auditData: {
    userId: string;
    action: string;
    targetUserId?: string;
    details?: string;
    ipAddress?: string;
    userAgent?: string;
    metadata?: Record<string, any>;
  }
): Promise<void> => {
  return withErrorHandling(async () => {
    const user = await getUserProfile(auditData.userId);
    
    const auditDoc = {
      userId: auditData.userId,
      userEmail: user?.email || '',
      userRole: user?.role || 'guardian',
      action: auditData.action,
      targetUserId: auditData.targetUserId,
      details: auditData.details || '',
      ipAddress: auditData.ipAddress || '',
      userAgent: auditData.userAgent || '',
      metadata: auditData.metadata || {},
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };
    
    await addDoc(collection(db, COLLECTIONS.AUDIT_LOGS), auditDoc);
  }, 'logAudit');
};

// ============================================================================
// ADMIN DASHBOARD SERVICES
// ============================================================================

export const getAdminDashboardStats = async (): Promise<AppTypes.AdminStats> => {
  return withErrorHandling(async () => {
    // Get all users count
    const usersQuery = query(collection(db, COLLECTIONS.USERS));
    const usersSnapshot = await getCountFromServer(usersQuery);
    
    // Get users to filter by role
    const usersDocs = await getDocs(usersQuery);
    const usersList = usersDocs.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Array<{ id: string; role?: string; [key: string]: any }>;
    
    // Count users by role
    const totalClinicians = usersList.filter(user => 
      user.role && typeof user.role === 'string' && user.role.toLowerCase() === 'clinician'
    ).length;
    
    const totalGuardians = usersList.filter(user => 
      user.role && typeof user.role === 'string' && user.role.toLowerCase() === 'guardian'
    ).length;
    
    const totalAdmins = usersList.filter(user => 
      user.role && typeof user.role === 'string' && user.role.toLowerCase() === 'admin'
    ).length;
    
    // Get all patients count
    const patientsQuery = query(collection(db, COLLECTIONS.PATIENTS));
    const patientsSnapshot = await getCountFromServer(patientsQuery);
    
    // Get pending invitations count
    const invitationsQuery = query(
      collection(db, COLLECTIONS.INVITATIONS),
      where('status', '==', 'pending')
    );
    const invitationsSnapshot = await getCountFromServer(invitationsQuery);
    
    // Get recent activity count (last 7 days)
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    
    const activityQuery = query(
      collection(db, COLLECTIONS.AUDIT_LOGS),
      where('createdAt', '>=', Timestamp.fromDate(oneWeekAgo))
    );
    const activitySnapshot = await getCountFromServer(activityQuery);
    
    // Determine system health
    const systemHealth = calculateSystemHealth(
      invitationsSnapshot.data().count,
      activitySnapshot.data().count
    );

    return {
      totalUsers: usersSnapshot.data().count,
      totalPatients: patientsSnapshot.data().count,
      totalClinicians,
      totalGuardians,
      totalAdmins,
      pendingInvitations: invitationsSnapshot.data().count,
      recentActivity: activitySnapshot.data().count,
      systemHealth
    };
  }, 'getAdminDashboardStats');
};

export const getClinicianStats = async (clinicianId: string): Promise<AppTypes.ClinicianStats> => {
  return withErrorHandling(async () => {
    const patientsResponse = await getClinicianPatients(clinicianId);
    const patients = patientsResponse.items;
    
    // Get upcoming appointments
    const appointmentsQuery = query(
      collection(db, COLLECTIONS.APPOINTMENTS),
      where('clinicianId', '==', clinicianId),
      where('dateTime', '>=', Timestamp.fromDate(new Date())),
      where('status', 'in', ['scheduled', 'confirmed'])
    );
    const appointmentsSnapshot = await getCountFromServer(appointmentsQuery);
    
    // Get recent medical records (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const recordsQuery = query(
      collection(db, COLLECTIONS.MEDICAL_RECORDS),
      where('clinicianId', '==', clinicianId),
      where('createdAt', '>=', Timestamp.fromDate(thirtyDaysAgo))
    );
    const recordsSnapshot = await getCountFromServer(recordsQuery);
    
    // Calculate growth alerts
    const growthAlerts = patients.filter(p => 
      p.growthStatus === 'warning' || p.growthStatus === 'critical'
    ).length;
    
    return {
      totalPatients: patientsResponse.total,
      activePatients: patients.filter(p => p.status === 'active').length,
      pendingInvitations: 0,
      upcomingAppointments: appointmentsSnapshot.data().count,
      recentRecords: recordsSnapshot.data().count,
      growthAlerts,
      vaccinationDue: 0,
      averagePatientsPerDay: 0,
      patientRetentionRate: 100
    };
  }, `getClinicianStats(${clinicianId})`);
};

export const getGuardianStats = async (guardianId: string): Promise<AppTypes.GuardianStats> => {
  return withErrorHandling(async () => {
    const patientsResponse = await getGuardianPatients(guardianId);
    const patients = patientsResponse.items;
    
    // Get upcoming appointments for all guardian's patients
    const patientIds = patients.map(p => p.id);
    let upcomingAppointments = 0;
    
    if (patientIds.length > 0) {
      const appointmentsQuery = query(
        collection(db, COLLECTIONS.APPOINTMENTS),
        where('patientId', 'in', patientIds),
        where('dateTime', '>=', Timestamp.fromDate(new Date())),
        where('status', 'in', ['scheduled', 'confirmed'])
      );
      const appointmentsSnapshot = await getCountFromServer(appointmentsQuery);
      upcomingAppointments = appointmentsSnapshot.data().count;
    }
    
    // Calculate health alerts
    const healthAlerts = patients.filter(p => 
      p.growthStatus === 'warning' || p.growthStatus === 'critical'
    ).length;
    
    return {
      totalPatients: patientsResponse.total,
      upcomingAppointments,
      healthAlerts,
      recentRecords: 0,
      vaccinationDue: 0,
      missedAppointments: 0,
      averageAppointmentsPerMonth: 0
    };
  }, `getGuardianStats(${guardianId})`);
};

// ============================================================================
// UTILITY EXPORTS
// ============================================================================

export const formatDate = (date: Date | string | undefined): string => {
  if (!date) return 'Never';
  
  try {
    const d = typeof date === 'string' ? new Date(date) : date;
    if (isNaN(d.getTime())) return 'Invalid date';
    
    return d.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  } catch {
    return 'Invalid date';
  }
};

export const formatDateTime = (date: Date | string | undefined): string => {
  if (!date) return 'Never';
  
  try {
    const d = typeof date === 'string' ? new Date(date) : date;
    if (isNaN(d.getTime())) return 'Invalid date';
    
    return d.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch {
    return 'Invalid date';
  }
};

export { sanitizeText as sanitizeInput, validateEmail };

// ============================================================================
// ADDITIONAL FUNCTIONS
// ============================================================================

export const getAllPatients = async (
  options?: { limit?: number; lastDoc?: QueryDocumentSnapshot<DocumentData> }
): Promise<AppTypes.PaginatedResponse<AppTypes.HealthcarePatient>> => {
  return withErrorHandling(async () => {
    const constraints: QueryConstraint[] = [
      orderBy('createdAt', 'desc')
    ];
    
    if (options?.limit) constraints.push(limit(options.limit));
    if (options?.lastDoc) constraints.push(startAfter(options.lastDoc));
    
    const patientsQuery = query(collection(db, COLLECTIONS.PATIENTS), ...constraints);
    const snapshot = await getDocs(patientsQuery);
    
    const patients = snapshot.docs.map(toHealthcarePatient);
    
    // Get total count
    const totalQuery = query(collection(db, COLLECTIONS.PATIENTS));
    const totalSnapshot = await getCountFromServer(totalQuery);
    
    const hasMore = snapshot.docs.length === (options?.limit || 10);
    const lastDoc = snapshot.docs.length > 0 ? snapshot.docs[snapshot.docs.length - 1] : null;
    
    return {
      items: patients,
      total: totalSnapshot.data().count,
      page: options?.lastDoc ? 2 : 1,
      pageSize: options?.limit || 10,
      hasMore,
      totalPages: Math.ceil(totalSnapshot.data().count / (options?.limit || 10))
    };
  }, 'getAllPatients');
};

export const getAllUsers = async (
  options?: { limit?: number; lastDoc?: QueryDocumentSnapshot<DocumentData> }
): Promise<AppTypes.PaginatedResponse<AppTypes.UserProfile>> => {
  return withErrorHandling(async () => {
    const constraints: QueryConstraint[] = [
      orderBy('createdAt', 'desc')
    ];
    
    if (options?.limit) constraints.push(limit(options.limit));
    if (options?.lastDoc) constraints.push(startAfter(options.lastDoc));
    
    const usersQuery = query(collection(db, COLLECTIONS.USERS), ...constraints);
    const snapshot = await getDocs(usersQuery);
    
    const users = snapshot.docs.map(toUserProfile);
    
    // Get total count
    const totalQuery = query(collection(db, COLLECTIONS.USERS));
    const totalSnapshot = await getCountFromServer(totalQuery);
    
    const hasMore = snapshot.docs.length === (options?.limit || 10);
    const lastDoc = snapshot.docs.length > 0 ? snapshot.docs[snapshot.docs.length - 1] : null;
    
    return {
      items: users,
      total: totalSnapshot.data().count,
      page: options?.lastDoc ? 2 : 1,
      pageSize: options?.limit || 10,
      hasMore,
      totalPages: Math.ceil(totalSnapshot.data().count / (options?.limit || 10))
    };
  }, 'getAllUsers');
};

export const getUsersByRole = async (
  role: AppTypes.UserRole,
  options?: { limit?: number; lastDoc?: QueryDocumentSnapshot<DocumentData> }
): Promise<AppTypes.PaginatedResponse<AppTypes.UserProfile>> => {
  return withErrorHandling(async () => {
    const constraints: QueryConstraint[] = [
      where('role', '==', role),
      orderBy('createdAt', 'desc')
    ];
    
    if (options?.limit) constraints.push(limit(options.limit));
    if (options?.lastDoc) constraints.push(startAfter(options.lastDoc));
    
    const usersQuery = query(collection(db, COLLECTIONS.USERS), ...constraints);
    const snapshot = await getDocs(usersQuery);
    
    const users = snapshot.docs.map(toUserProfile);
    
    // Get total count
    const totalQuery = query(
      collection(db, COLLECTIONS.USERS),
      where('role', '==', role)
    );
    const totalSnapshot = await getCountFromServer(totalQuery);
    
    const hasMore = snapshot.docs.length === (options?.limit || 10);
    const lastDoc = snapshot.docs.length > 0 ? snapshot.docs[snapshot.docs.length - 1] : null;
    
    return {
      items: users,
      total: totalSnapshot.data().count,
      page: options?.lastDoc ? 2 : 1,
      pageSize: options?.limit || 10,
      hasMore,
      totalPages: Math.ceil(totalSnapshot.data().count / (options?.limit || 10))
    };
  }, `getUsersByRole(${role})`);
};

// ============================================================================
// NEW ADMIN USER MANAGEMENT SERVICES
// ============================================================================

export const promoteToAdmin = async (adminId: string, targetUserId: string): Promise<void> => {
  return withErrorHandling(async () => {
    // Check if requester is admin
    const adminUser = await getUserProfile(adminId);
    if (!adminUser || adminUser.role !== 'admin') {
      throw new Error('Unauthorized: Only admins can perform this action');
    }

    // Check if target user exists
    const targetUser = await getUserProfile(targetUserId);
    if (!targetUser) {
      throw new Error('Target user not found');
    }

    // Prevent self-promotion
    if (adminId === targetUserId) {
      throw new Error('Cannot promote yourself');
    }

    // Update user role to admin
    await updateDoc(doc(db, COLLECTIONS.USERS, targetUserId), {
      role: 'admin' as AppTypes.UserRole,
      permissions: {
        canManagePatients: true,
        canManageAppointments: true,
        canViewMedicalRecords: true,
        canEditMedicalRecords: true,
        canManageUsers: true,
        canViewAuditLogs: true,
        canManageSystemSettings: true,
        canSendNotifications: true,
        canExportData: true
      },
      updatedAt: serverTimestamp()
    });

    // Log the action
    await logAudit({
      userId: adminId,
      action: 'promote_to_admin',
      targetUserId: targetUserId,
      details: `Promoted ${targetUser.email} to admin role`,
      ipAddress: '',
      userAgent: ''
    });
  }, `promoteToAdmin(${targetUserId})`);
};

export const demoteFromAdmin = async (adminId: string, targetUserId: string, newRole: AppTypes.UserRole): Promise<void> => {
  return withErrorHandling(async () => {
    // Check if requester is admin
    const adminUser = await getUserProfile(adminId);
    if (!adminUser || adminUser.role !== 'admin') {
      throw new Error('Unauthorized: Only admins can perform this action');
    }

    // Prevent self-demotion
    if (adminId === targetUserId) {
      throw new Error('Cannot demote yourself');
    }

    const targetUser = await getUserProfile(targetUserId);
    if (!targetUser) {
      throw new Error('Target user not found');
    }

    // Validate new role
    if (!['guardian', 'clinician'].includes(newRole)) {
      throw new Error('Invalid role. Must be guardian or clinician');
    }

    await updateDoc(doc(db, COLLECTIONS.USERS, targetUserId), {
      role: newRole,
      permissions: null, // Remove admin permissions
      updatedAt: serverTimestamp()
    });

    await logAudit({
      userId: adminId,
      action: 'demote_from_admin',
      targetUserId: targetUserId,
      details: `Demoted ${targetUser.email} from admin to ${newRole}`,
      ipAddress: '',
      userAgent: ''
    });
  }, `demoteFromAdmin(${targetUserId})`);
};

export const deactivateUser = async (adminId: string, targetUserId: string, reason?: string): Promise<void> => {
  return withErrorHandling(async () => {
    const adminUser = await getUserProfile(adminId);
    if (!adminUser || adminUser.role !== 'admin') {
      throw new Error('Unauthorized: Only admins can perform this action');
    }

    // Prevent self-deactivation
    if (adminId === targetUserId) {
      throw new Error('Cannot deactivate yourself');
    }

    await updateDoc(doc(db, COLLECTIONS.USERS, targetUserId), {
      isActive: false,
      deactivatedAt: serverTimestamp(),
      deactivationReason: reason,
      updatedAt: serverTimestamp()
    });

    // Log the action
    const targetUser = await getUserProfile(targetUserId);
    await logAudit({
      userId: adminId,
      action: 'deactivate_user',
      targetUserId: targetUserId,
      details: `Deactivated user ${targetUser?.email || targetUserId}. Reason: ${reason || 'No reason provided'}`,
      ipAddress: '',
      userAgent: ''
    });
  }, `deactivateUser(${targetUserId})`);
};

export const reactivateUser = async (adminId: string, targetUserId: string): Promise<void> => {
  return withErrorHandling(async () => {
    const adminUser = await getUserProfile(adminId);
    if (!adminUser || adminUser.role !== 'admin') {
      throw new Error('Unauthorized: Only admins can perform this action');
    }

    await updateDoc(doc(db, COLLECTIONS.USERS, targetUserId), {
      isActive: true,
      reactivatedAt: serverTimestamp(),
      deactivationReason: null,
      updatedAt: serverTimestamp()
    });

    // Log the action
    const targetUser = await getUserProfile(targetUserId);
    await logAudit({
      userId: adminId,
      action: 'reactivate_user',
      targetUserId: targetUserId,
      details: `Reactivated user ${targetUser?.email || targetUserId}`,
      ipAddress: '',
      userAgent: ''
    });
  }, `reactivateUser(${targetUserId})`);
};

export const deleteUser = async (adminId: string, targetUserId: string): Promise<void> => {
  return withErrorHandling(async () => {
    const adminUser = await getUserProfile(adminId);
    if (!adminUser || adminUser.role !== 'admin') {
      throw new Error('Unauthorized: Only admins can perform this action');
    }

    // Prevent self-deletion
    if (adminId === targetUserId) {
      throw new Error('Cannot delete yourself');
    }

    const targetUser = await getUserProfile(targetUserId);
    if (!targetUser) {
      throw new Error('User not found');
    }

    // Check if user has any patients
    if (targetUser.patients && targetUser.patients.length > 0) {
      throw new Error('Cannot delete user with associated patients. Reassign patients first.');
    }

    // Instead of deleting, mark as deleted (soft delete)
    await updateDoc(doc(db, COLLECTIONS.USERS, targetUserId), {
      isDeleted: true,
      deletedAt: serverTimestamp(),
      email: `deleted_${Date.now()}_${targetUser.email}`,
      updatedAt: serverTimestamp()
    });

    await logAudit({
      userId: adminId,
      action: 'delete_user',
      targetUserId: targetUserId,
      details: `Deleted user ${targetUser.email}`,
      ipAddress: '',
      userAgent: ''
    });
  }, `deleteUser(${targetUserId})`);
};

export const updateUserPermissions = async (
  adminId: string,
  targetUserId: string,
  permissions: Partial<AppTypes.UserPermissions>
): Promise<void> => {
  return withErrorHandling(async () => {
    const adminUser = await getUserProfile(adminId);
    if (!adminUser || adminUser.role !== 'admin') {
      throw new Error('Unauthorized: Only admins can perform this action');
    }

    await updateDoc(doc(db, COLLECTIONS.USERS, targetUserId), {
      permissions,
      updatedAt: serverTimestamp()
    });

    await logAudit({
      userId: adminId,
      action: 'update_permissions',
      targetUserId: targetUserId,
      details: 'Updated user permissions',
      metadata: permissions,
      ipAddress: '',
      userAgent: ''
    });
  }, `updateUserPermissions(${targetUserId})`);
};

export const getAdminActivityLogs = async (
  adminId: string,
  options?: { 
    limit?: number; 
    lastDoc?: QueryDocumentSnapshot<DocumentData>;
    action?: string;
    startDate?: Date;
    endDate?: Date;
  }
): Promise<AppTypes.PaginatedResponse<AppTypes.AuditLog>> => {
  return withErrorHandling(async () => {
    // Verify admin
    const adminUser = await getUserProfile(adminId);
    if (!adminUser || adminUser.role !== 'admin') {
      throw new Error('Unauthorized: Only admins can access activity logs');
    }

    const constraints: QueryConstraint[] = [
      orderBy('createdAt', 'desc')
    ];

    if (options?.action) {
      constraints.push(where('action', '==', options.action));
    }

    if (options?.startDate) {
      constraints.push(where('createdAt', '>=', Timestamp.fromDate(options.startDate)));
    }

    if (options?.endDate) {
      constraints.push(where('createdAt', '<=', Timestamp.fromDate(options.endDate)));
    }

    if (options?.limit) constraints.push(limit(options.limit));

    const logsQuery = query(collection(db, COLLECTIONS.AUDIT_LOGS), ...constraints);
    const snapshot = await getDocs(logsQuery);

    const logs = snapshot.docs.map(toAuditLog);

    // Get total count
    const totalQuery = query(collection(db, COLLECTIONS.AUDIT_LOGS));
    const totalSnapshot = await getCountFromServer(totalQuery);

    const hasMore = snapshot.docs.length === (options?.limit || 50);

    return {
      items: logs,
      total: totalSnapshot.data().count,
      page: 1,
      pageSize: options?.limit || 50,
      hasMore,
      totalPages: Math.ceil(totalSnapshot.data().count / (options?.limit || 50))
    };
  }, 'getAdminActivityLogs');
};