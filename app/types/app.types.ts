// ============================================
// CHILD HEALTH MONITORING SYSTEM - TYPE DEFINITIONS
// STANDARDIZED TERMINOLOGY: patients (not children), clinicians (not healthcare providers), guardians (not parents)
// ============================================

// ========== ENUMERATION TYPES ==========
export type Gender = 'male' | 'female' | 'other';
export type PatientStatus = 'active' | 'pending' | 'inactive' | 'archived';
export type GrowthStatus = 'normal' | 'warning' | 'critical' | 'needs_review';
export type UserRole = 'guardian' | 'clinician' | 'admin';
export type InvitationStatus = 'pending' | 'accepted' | 'rejected' | 'expired';
export type MedicalRecordType = 'checkup' | 'vaccination' | 'sick_visit' | 'emergency' | 'followup' | 'other';
export type AppointmentStatus = 'scheduled' | 'confirmed' | 'completed' | 'cancelled' | 'no_show';
export type VaccineStatus = 'administered' | 'due' | 'overdue' | 'scheduled' | 'contraindicated';
export type NotificationType = 'appointment' | 'vaccination' | 'growth' | 'invitation' | 'system' | 'reminder';
export type NotificationPriority = 'low' | 'medium' | 'high';
export type BloodType = 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-' | 'unknown';

// ========== BASE INTERFACES ==========
export interface BaseEntity {
  id: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface PatientBase extends BaseEntity {
  name: string;
  dob: string; // ISO date string (YYYY-MM-DD)
  sex: Gender;
  status: PatientStatus;
  growthStatus: GrowthStatus;
  guardianIds: string[]; // Guardian user IDs
  photoUrl?: string;
  preferredName?: string;
  birthPlace?: string;
  lastCheckup?: Date;
}

// ========== PERMISSIONS ==========
export interface UserPermissions {
  canManagePatients: boolean;
  canManageAppointments: boolean;
  canViewMedicalRecords: boolean;
  canEditMedicalRecords: boolean;
  canManageUsers: boolean;
  canViewAuditLogs: boolean;
  canManageSystemSettings: boolean;
  canSendNotifications: boolean;
  canExportData: boolean;
}

// ========== USER PROFILE ==========
export interface UserProfile extends BaseEntity {
  uid: string; // Firebase Auth UID
  email: string;
  name: string;
  role: UserRole;
  phone?: string;
  address?: string;
  profilePicture?: string;
  
  // Role-specific references
  patients: string[]; // Patient IDs (for all roles)
  
  // Clinician-specific fields
  clinicName?: string;
  specialization?: string;
  licenseNumber?: string;
  credentials?: string[];
  npiNumber?: string; // National Provider Identifier
  
  // Account management
  isVerified?: boolean;
  isActive?: boolean;
  lastLogin?: Date;
  timezone?: string;
  language?: string;
  
  // Admin & permissions
  permissions?: UserPermissions;
  
  // Account status
  isDeleted?: boolean;
  deletedAt?: Date;
  deactivationReason?: string;
  reactivatedAt?: Date;
  verificationDate?: Date;
  verifiedBy?: string;
  
  // Preferences
  notificationPreferences?: {
    email?: boolean;
    push?: boolean;
    sms?: boolean;
    appointmentReminders?: boolean;
    healthAlerts?: boolean;
    vaccineReminders?: boolean;
    growthUpdates?: boolean;
  };
  
  // Metadata
  signUpMethod?: 'email' | 'google' | 'microsoft';
  lastPasswordReset?: Date;
  failedLoginAttempts?: number;
  lockedUntil?: Date;
  termsAccepted?: boolean;
  termsAcceptedAt?: Date;
  privacyPolicyAccepted?: boolean;
  privacyPolicyAcceptedAt?: Date;
  
  // Contact preferences
  contactPreferences?: {
    allowMarketingEmails?: boolean;
    allowSMSNotifications?: boolean;
    contactByPhone?: boolean;
    contactByEmail?: boolean;
  };
  
  // Professional info (for clinicians)
  yearsOfExperience?: number;
  education?: string[];
  certifications?: string[];
  availability?: {
    days: string[];
    hours: {
      start: string;
      end: string;
    };
  };
}

// ========== AUTH CONTEXT TYPE ==========
export interface AuthContextType {
  user: any | null; // firebase.User from your imports
  userProfile: UserProfile | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name: string, role: UserRole) => Promise<void>;
  signOut: () => Promise<void>;
  updateProfile: (profile: Partial<UserProfile>) => Promise<void>;
  refreshProfile: () => Promise<void>;
  isAdmin: () => boolean;
  hasPermission: (permission: keyof UserPermissions) => boolean;
}

// ========== SUPPORTING MEDICAL TYPES ==========
export interface Allergy {
  id: string;
  allergen: string;
  reaction: string;
  severity: 'mild' | 'moderate' | 'severe';
  firstObserved?: Date;
  lastObserved?: Date;
  notes?: string;
  medication?: string;
}

export interface MedicalCondition {
  id: string;
  name: string;
  icd10Code?: string; // International Classification of Diseases
  diagnosedDate?: Date;
  diagnosedBy?: string; // Clinician ID
  status: 'active' | 'resolved' | 'chronic' | 'monitoring';
  symptoms?: string[];
  treatment?: string;
  notes?: string;
}

export interface Medication {
  id: string;
  name: string;
  ndcCode?: string; // National Drug Code
  dosage: string;
  frequency: string;
  route: 'oral' | 'topical' | 'injection' | 'inhaled' | 'other';
  startDate: Date;
  endDate?: Date;
  prescribedBy?: string; // Clinician ID
  prescribingClinicianName?: string;
  purpose?: string;
  notes?: string;
  instructions?: string;
}

export interface ImmunizationStatus {
  vaccineName: string;
  cptCode?: string; // Current Procedural Terminology code
  status: 'up_to_date' | 'due' | 'overdue' | 'not_applicable' | 'contraindicated';
  lastDoseDate?: Date;
  nextDueDate?: Date;
  dosesReceived: number;
  totalDoses: number;
  manufacturer?: string;
  lotNumber?: string;
}

export interface Surgery extends BaseEntity {
  patientId: string;
  procedure: string;
  icd10PcsCode?: string; // Procedure code
  date: Date;
  hospital?: string;
  surgeon?: string;
  anesthesiologist?: string;
  complications?: string[];
  notes?: string;
  followUpRequired?: boolean;
}

export interface Hospitalization extends BaseEntity {
  patientId: string;
  reason: string;
  admissionDate: Date;
  dischargeDate: Date;
  hospital: string;
  department?: string;
  attendingClinician?: string; // Clinician ID
  diagnosis?: string[];
  treatment?: string;
  dischargeSummary?: string;
  notes?: string;
}

export interface EmergencyContact {
  id: string;
  name: string;
  relationship: 'parent' | 'grandparent' | 'aunt' | 'uncle' | 'sibling' | 'family_friend' | 'other';
  phone: string;
  phone2?: string;
  email?: string;
  address?: string;
  canPickUp: boolean;
  authorizedForTreatment: boolean;
  priority: number; // 1 = primary, 2 = secondary, etc.
  notes?: string;
}

export interface DevelopmentMilestones {
  socialSmile?: Date;
  headControl?: Date;
  rollingOver?: Date;
  sittingWithoutSupport?: Date;
  crawling?: Date;
  standing?: Date;
  walking?: Date;
  firstWords?: Date;
  twoWordSentences?: Date;
  toiletTrained?: Date;
  notes?: string;
  assessedBy?: string; // Clinician ID
  assessmentDate?: Date;
}

export interface GrowthParameters {
  lastHeight?: number;
  lastWeight?: number;
  lastHeadCircumference?: number;
  lastBMIPercentile?: number;
  lastMeasurementDate?: Date;
  growthVelocity?: {
    height?: number;
    weight?: number;
  };
  growthChartPercentile?: {
    height?: number;
    weight?: number;
    headCircumference?: number;
  };
  growthStandard: 'who' | 'cdc'; // Which growth standard used
}

// ========== MAIN PATIENT INTERFACE ==========
export interface HealthcarePatient extends PatientBase {
  // Medical Identification
  medicalRecordNumber: string;
  insuranceId?: string;
  insuranceProvider?: string;
  primaryCareClinicianId?: string;
  pediatricianId?: string;
  
  // Birth Information
  birthWeight: number;
  birthLength: number;
  birthHeadCircumference?: number;
  gestationalAge: number;
  bloodType?: BloodType;
  apgarScore?: {
    oneMinute?: number;
    fiveMinute?: number;
  };
  
  // Healthcare Team
  clinicianIds: string[]; // Clinician user IDs
  createdBy: string; // User ID of creator
  createdByName?: string;
  createdByEmail?: string;
  createdByRole: UserRole; // Role of creator
  
  // Medical Information
  allergies: Allergy[];
  conditions: MedicalCondition[];
  medications: Medication[];
  immunizations: ImmunizationStatus[];
  surgeries: Surgery[];
  hospitalizations: Hospitalization[];
  
  // Emergency Information
  emergencyContacts: EmergencyContact[];
  preferredHospital?: string;
  medicalAlertInfo?: string;
  advanceDirectives?: string;
  
  // Development
  developmentMilestones?: DevelopmentMilestones;
  developmentConcerns?: string[];
  
  // Growth Tracking
  growthParameters: GrowthParameters;
  
  // Additional Information
  notes?: string;
  importantNotes?: string;
  specialInstructions?: string;
  carePlan?: string;
  dietaryRestrictions?: string[];
  specialNeeds?: string[];
  preferredLanguage?: string;
  culturalConsiderations?: string;
  
  // Consent & Permissions
  consentForTreatment?: boolean;
  consentDate?: Date;
  photoReleaseConsent?: boolean;
  dataSharingConsent?: {
    guardians?: boolean;
    clinicians?: boolean;
    emergency?: boolean;
  };
}

// ========== MEDICAL RECORDS ==========
export interface MedicalRecord extends BaseEntity {
  patientId: string;
  date: Date;
  type: MedicalRecordType;
  
  // Vital Signs
  height?: number;
  weight?: number;
  temperature?: number;
  headCircumference?: number;
  bloodPressure?: string;
  heartRate?: number;
  respiratoryRate?: number;
  oxygenSaturation?: number;
  
  // Clinical Information
  notes: string;
  chiefComplaint?: string;
  historyOfPresentIllness?: string;
  
  // Clinician Information
  clinicianId: string;
  clinicianName: string;
  clinicianSignature?: string;
  
  // Assessment & Plan
  diagnosis?: string[];
  icd10Codes?: string[];
  assessment?: string;
  plan?: string;
  
  // Prescriptions & Referrals
  prescription?: Medication[];
  labResults?: string[];
  imagingResults?: string[];
  referrals?: string[];
  referralClinicianId?: string;
  
  // Follow-up
  nextAppointment?: Date;
  followUpInstructions?: string;
  followUpNeeded?: boolean;
  
  // Growth Percentiles
  heightPercentile?: number;
  weightPercentile?: number;
  headCircumferencePercentile?: number;
  bmiPercentile?: number;
  
  // Vaccination-specific
  vaccineName?: string;
  vaccineLotNumber?: string;
  administeredBy?: string; // Clinician ID
  nextVaccineDate?: Date;
  
  // Billing
  cptCodes?: string[];
  icd10ProcedureCodes?: string[];
}

export interface VaccineRecord extends BaseEntity {
  patientId: string;
  vaccineName: string;
  vaccineCode: string; // CVX code
  dateAdministered: Date;
  administeredBy: string; // Clinician ID
  administeredByName: string; // Clinician name
  lotNumber?: string;
  manufacturer?: string;
  expirationDate?: Date;
  nextDueDate?: Date;
  status: VaccineStatus;
  notes?: string;
  doseNumber: number;
  totalDoses: number;
  route: 'injection' | 'oral' | 'nasal' | 'other';
  site?: 'left_arm' | 'right_arm' | 'left_thigh' | 'right_thigh' | 'other';
  reaction?: string;
}

export interface GrowthChartData {
  date: Date;
  ageInMonths: number;
  height?: number;
  weight?: number;
  headCircumference?: number;
  heightPercentile?: number;
  weightPercentile?: number;
  headCircumferencePercentile?: number;
  bmi?: number;
  bmiPercentile?: number;
  measurementType: 'clinical' | 'home'; // Where measurement taken
  measuredBy?: string; // Clinician ID or guardian ID
}

// ========== APPOINTMENTS ==========
export interface Appointment extends BaseEntity {
  patientId: string;
  dateTime: Date;
  type: 'checkup' | 'vaccination' | 'sick_visit' | 'followup' | 'consultation' | 'specialist';
  
  // Clinician Information
  clinicianId: string;
  clinicianName: string;
  
  // Location
  location?: string;
  locationType: 'clinic' | 'hospital' | 'home' | 'telehealth';
  roomNumber?: string;
  
  // Details
  notes?: string;
  status: AppointmentStatus;
  
  // Participants
  guardianId?: string; // Primary guardian attending
  additionalGuardians?: string[]; // Other guardians attending
  additionalClinicians?: string[]; // Other clinicians involved
  
  // Scheduling
  duration: number; // in minutes
  reason?: string;
  preparationInstructions?: string;
  
  // Reminders
  remindersSent?: Date[];
  reminderPreferences?: {
    email?: boolean;
    sms?: boolean;
    push?: boolean;
    daysBefore?: number[];
  };
  
  // Follow-up
  followUpNeeded?: boolean;
  followUpAppointmentId?: string;
  
  // Billing
  insurancePreauthorization?: boolean;
  preauthorizationNumber?: string;
}

// ========== INVITATIONS ==========
export interface Invitation extends BaseEntity {
  patientId: string;
  patientName: string;
  
  // Invitation Details
  invitationCode: string;
  invitationType: 'guardian' | 'clinician'; // Role being invited to
  
  // Invitee Information
  inviteeEmail: string;
  inviteeName?: string;
  inviteePhone?: string;
  relationshipToPatient?: string;
  
  // Inviter Information
  inviterId: string; // User ID who sent invitation
  inviterName: string;
  inviterEmail: string;
  inviterRole: UserRole;
  
  // Message
  customMessage?: string;
  
  // Status
  status: InvitationStatus;
  expiresAt?: Date;
  acceptedAt?: Date;
  acceptedBy?: string; // User ID who accepted
  declinedAt?: Date;
  declinedReason?: string;
  
  // Access Level
  accessLevel: 'full' | 'limited'; // Limited = view only, no edits
  permissions?: {
    viewMedicalRecords?: boolean;
    addMedicalRecords?: boolean;
    scheduleAppointments?: boolean;
    viewGrowthData?: boolean;
    manageEmergencyContacts?: boolean;
  };
}

// ========== NOTIFICATIONS ==========
export interface Notification extends BaseEntity {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  
  // Context
  relatedId?: string; // Patient ID, appointment ID, etc.
  relatedType?: 'patient' | 'appointment' | 'medical_record' | 'invitation';
  
  // Status
  isRead: boolean;
  readAt?: Date;
  
  // Action
  actionUrl?: string;
  actionLabel?: string;
  requiresAction?: boolean;
  
  // Priority
  priority: NotificationPriority;
  
  // Metadata
  metadata?: Record<string, any>;
  
  // Delivery
  deliveryMethods: ('email' | 'push' | 'sms')[];
  emailSent?: boolean;
  pushSent?: boolean;
  smsSent?: boolean;
}

// ========== DASHBOARD TYPES ==========
export interface PatientSummary {
  id: string;
  name: string;
  dob: string;
  sex: Gender;
  ageInMonths: number;
  ageString: string;
  photoUrl?: string;
  status: PatientStatus;
  growthStatus: GrowthStatus;
  lastCheckup?: Date;
  nextAppointment?: Date;
  vaccinesDue?: number;
  healthAlerts?: number;
  guardianNames?: string[];
  clinicianNames?: string[];
}

export interface ClinicianStats {
  totalPatients: number;
  activePatients: number;
  pendingInvitations: number;
  upcomingAppointments: number;
  recentRecords: number; // Last 30 days
  growthAlerts: number;
  vaccinationDue: number;
  averagePatientsPerDay?: number;
  patientRetentionRate?: number;
}

export interface GuardianStats {
  totalPatients: number;
  upcomingAppointments: number;
  healthAlerts: number;
  recentRecords: number; // Last 30 days
  vaccinationDue: number;
  missedAppointments?: number;
  averageAppointmentsPerMonth?: number;
}

export interface AdminStats {
  totalUsers: number;
  totalPatients: number;
  totalClinicians: number;
  totalGuardians: number;
  totalAdmins: number;
  pendingInvitations: number;
  recentActivity: number;
  systemHealth: 'good' | 'warning' | 'critical';
  activeUsers?: number;
  inactiveUsers?: number;
  deletedUsers?: number;
}

// ========== FORM DATA TYPES ==========
export interface PatientRegistrationData {
  name: string;
  dob: string;
  sex: Gender;
  birthWeight?: number;
  birthLength?: number;
  gestationalAge?: number;
  bloodType?: BloodType;
  allergies?: Omit<Allergy, 'id'>[];
  conditions?: Omit<MedicalCondition, 'id'>[];
  notes?: string;
  medicalRecordNumber?: string;
  emergencyContacts?: Omit<EmergencyContact, 'id'>[];
  photoUrl?: string;
}

export interface MedicalRecordFormData {
  patientId: string;
  date: Date;
  type: MedicalRecordType;
  
  // Vital Signs
  height?: number;
  weight?: number;
  temperature?: number;
  headCircumference?: number;
  bloodPressure?: string;
  heartRate?: number;
  respiratoryRate?: number;
  oxygenSaturation?: number;
  
  // Clinical Information
  notes: string;
  chiefComplaint?: string;
  
  // Assessment
  diagnosis?: string[];
  assessment?: string;
  plan?: string;
  
  // Follow-up
  nextAppointment?: Date;
  followUpInstructions?: string;
  
  // Vaccination
  vaccineName?: string;
  vaccineLotNumber?: string;
}

export interface InvitationFormData {
  patientId: string;
  inviteeEmail: string;
  inviteeName?: string;
  inviteePhone?: string;
  invitationType: 'guardian' | 'clinician';
  customMessage?: string;
  expiresInDays?: number;
  relationshipToPatient?: string;
  accessLevel?: 'full' | 'limited';
  permissions?: {
    viewMedicalRecords?: boolean;
    addMedicalRecords?: boolean;
    scheduleAppointments?: boolean;
    viewGrowthData?: boolean;
    manageEmergencyContacts?: boolean;
  };
}

// ========== API RESPONSE TYPES ==========
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  timestamp: Date;
  requestId?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
  totalPages: number;
  
}


export interface CreateUserAccountResponse {
  userId: string;
  email: string;
  name: string;
  role: UserRole;
  tempPassword?: string;
}

// Or update your existing ApiResponse type to be generic:
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  timestamp: Date;
  requestId?: string;
}

// ========== FILTER TYPES ==========
export interface PatientFilterOptions {
  search?: string;
  status?: PatientStatus[];
  growthStatus?: GrowthStatus[];
  ageRange?: {
    minMonths?: number;
    maxMonths?: number;
  };
  hasUpcomingAppointments?: boolean;
  hasVaccinesDue?: boolean;
  hasHealthAlerts?: boolean;
  guardianId?: string;
  clinicianId?: string;
  sortBy?: 'name' | 'dob' | 'lastCheckup' | 'nextAppointment' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
  limit?: number;
  offset?: number;
}

export interface AppointmentFilterOptions {
  patientId?: string;
  clinicianId?: string;
  guardianId?: string;
  status?: AppointmentStatus[];
  dateRange?: {
    start: Date;
    end: Date;
  };
  type?: string[];
  locationType?: ('clinic' | 'hospital' | 'home' | 'telehealth')[];
}

// ========== COMPOSITE TYPES ==========
export interface PatientWithDetails {
  // Basic Info
  id: string;
  name: string;
  dob: string;
  sex: Gender;
  status: PatientStatus;
  growthStatus: GrowthStatus;
  photoUrl?: string;
  
  // Medical Info
  medicalRecordNumber: string;
  birthWeight: number;
  birthLength: number;
  gestationalAge: number;
  
  // Relationships
  guardianIds: string[];
  clinicianIds: string[];
  
  // Populated Relationships
  guardians: UserProfile[];
  clinicians: UserProfile[];
  
  // Additional Data
  recentRecords: MedicalRecord[];
  upcomingAppointments: Appointment[];
  growthData: GrowthChartData[];
  
  // Creator Info
  createdBy: string;
  createdByName?: string;
  createdByRole: UserRole;
  
  // Medical Data
  allergies: Allergy[];
  conditions: MedicalCondition[];
  medications: Medication[];
  emergencyContacts: EmergencyContact[];
  immunizations: ImmunizationStatus[];
}

export interface UserWithPatients extends UserProfile {
  patientsDetails: HealthcarePatient[];
}

export interface ClinicianWithStats extends UserProfile {
  stats: ClinicianStats;
  upcomingSchedule: Appointment[];
  recentPatients: HealthcarePatient[];
}

// ========== SETTINGS & PREFERENCES ==========
export interface UserPreferences {
  notifications: {
    email: boolean;
    push: boolean;
    sms: boolean;
    appointmentReminders: boolean;
    healthAlerts: boolean;
    vaccineReminders: boolean;
    growthUpdates: boolean;
  };
  privacy: {
    shareDataWithClinicians: boolean;
    shareDataWithGuardians: boolean;
    visibleToOtherGuardians: boolean;
    allowTelehealth: boolean;
  };
  display: {
    language: string;
    timezone: string;
    dateFormat: string;
    measurementSystem: 'metric' | 'imperial';
    theme: 'light' | 'dark' | 'auto';
  };
}

// ========== AUDIT LOG TYPES ==========
export interface AuditLog extends BaseEntity {
  userId: string;
  userEmail: string;
  userRole: UserRole;
  action: string;
  targetUserId?: string;
  details?: string;
  metadata?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  createdAt: Date;
  updatedAt: Date;
}

// ========== SYSTEM HEALTH TYPES ==========
export interface SystemHealth {
  status: 'healthy' | 'degraded' | 'unhealthy';
  services: {
    database: ServiceHealth;
    authentication: ServiceHealth;
    storage: ServiceHealth;
    notifications: ServiceHealth;
  };
  metrics: {
    uptime: number;
    responseTime: number;
    errorRate: number;
    activeUsers: number;
    storageUsed: number;
  };
  lastChecked: Date;
}

export interface ServiceHealth {
  status: 'up' | 'down' | 'slow';
  responseTime: number;
  lastChecked: Date;
  error?: string;
}

// ========== PERMISSION CHECK TYPES ==========
export interface PermissionCheck {
  userId: string;
  resourceId: string;
  resourceType: 'patient' | 'user' | 'appointment' | 'medical_record' | 'invitation' | 'audit_log' | 'system';
  action: 'read' | 'create' | 'update' | 'delete' | 'share' | 'export' | 'manage';
  requiredRole?: UserRole;
  requiredRelationship?: 'guardian' | 'clinician' | 'creator' | 'admin';
  requiredPermissions?: (keyof UserPermissions)[];
}

export interface PermissionResult {
  allowed: boolean;
  reason?: string;
  requiredAction?: 'request_access' | 'contact_admin' | 'verify_account';
}

// ========== FIREBASE TYPES ==========
export interface FirestoreUserData {
  uid: string;
  email: string;
  name: string;
  role: UserRole;
  isActive?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
  [key: string]: any;
}

// ========== NEW: USER CREATION & MANAGEMENT TYPES ==========
export interface AdminCreateUserData {
  adminId: string;
  email: string;
  password: string;
  name: string;
  role: UserRole;
  phone?: string;
  clinicName?: string;
  specialization?: string;
  sendWelcomeEmail?: boolean;
  requirePasswordChange?: boolean;
  permissions?: Partial<UserPermissions>;
}

export interface UserCreationResponse {
  userId: string;
  tempPassword?: string;
  email: string;
  name: string;
  role: UserRole;
  createdAt: Date;
}

export interface UserUpdateRequest {
  userId: string;
  updates: Partial<{
    name: string;
    email: string;
    phone: string;
    role: UserRole;
    clinicName: string;
    specialization: string;
    isActive: boolean;
    isVerified: boolean;
    permissions: Partial<UserPermissions>;
    notificationPreferences: {
      email?: boolean;
      push?: boolean;
      sms?: boolean;
      appointmentReminders?: boolean;
      healthAlerts?: boolean;
    };
  }>;
  updatedBy: string; // Admin ID
}

export interface BulkUserCreationData {
  users: Array<{
    email: string;
    name: string;
    role: UserRole;
    phone?: string;
    clinicName?: string;
    specialization?: string;
  }>;
  defaultPassword: string;
  sendWelcomeEmails: boolean;
  createdBy: string; // Admin ID
}

export interface BulkUserCreationResult {
  success: number;
  failed: number;
  results: Array<{
    email: string;
    success: boolean;
    userId?: string;
    error?: string;
  }>;
  generatedPassword?: string;
}

export interface UserPasswordResetRequest {
  userId: string;
  resetBy: string; // Admin ID
  sendEmail: boolean;
  generateNewPassword?: boolean;
  newPassword?: string;
}

export interface UserPasswordResetResponse {
  success: boolean;
  tempPassword?: string;
  resetAt: Date;
  resetBy: string;
  emailSent: boolean;
}

export interface UserDeactivationRequest {
  userId: string;
  deactivatedBy: string; // Admin ID
  reason?: string;
  notifyUser: boolean;
  message?: string;
}

export interface UserReactivationRequest {
  userId: string;
  reactivatedBy: string; // Admin ID
  reason?: string;
  notifyUser: boolean;
}

export interface UserRoleChangeRequest {
  userId: string;
  newRole: UserRole;
  changedBy: string; // Admin ID
  reason?: string;
  effectiveDate?: Date;
  permissions?: Partial<UserPermissions>;
}

export interface UserVerificationRequest {
  userId: string;
  verifiedBy: string; // Admin ID
  verificationMethod?: 'manual' | 'document' | 'email';
  notes?: string;
}

export interface UserPermissionUpdate {
  userId: string;
  permissions: Partial<UserPermissions>;
  updatedBy: string; // Admin ID
  reason?: string;
}

// ========== NEW: USER ACTIVITY & STATS TYPES ==========
export interface UserActivityStats {
  userId: string;
  lastLogin: Date;
  loginCount: number;
  patientsCreated: number;
  appointmentsScheduled: number;
  recordsCreated: number;
  lastActivity: Date;
  averageSessionDuration: number;
  notificationsSent: number;
  invitationsSent: number;
}

export interface UserSessionData {
  sessionId: string;
  userId: string;
  startTime: Date;
  endTime?: Date;
  duration?: number;
  ipAddress?: string;
  userAgent?: string;
  deviceType?: 'desktop' | 'mobile' | 'tablet';
  browser?: string;
  os?: string;
  activities: Array<{
    action: string;
    timestamp: Date;
    resourceType?: string;
    resourceId?: string;
    details?: string;
  }>;
}

export interface UserLoginHistory {
  userId: string;
  logins: Array<{
    timestamp: Date;
    ipAddress?: string;
    userAgent?: string;
    success: boolean;
    failureReason?: string;
    location?: {
      country?: string;
      city?: string;
      latitude?: number;
      longitude?: number;
    };
  }>;
}

// ========== NEW: USER VALIDATION TYPES ==========
export interface UserValidationRules {
  requireEmailVerification: boolean;
  requirePhoneVerification: boolean;
  requireStrongPassword: boolean;
  passwordMinLength: number;
  passwordRequireUppercase: boolean;
  passwordRequireLowercase: boolean;
  passwordRequireNumbers: boolean;
  passwordRequireSpecialChars: boolean;
  allowDuplicateEmails: boolean;
  allowRoleChanges: boolean;
  maxLoginAttempts: number;
  lockoutDuration: number;
  sessionTimeout: number;
}

export interface UserValidationResult {
  email: {
    valid: boolean;
    available: boolean;
    message?: string;
  };
  password: {
    valid: boolean;
    strength: 'very_weak' | 'weak' | 'medium' | 'strong' | 'very_strong';
    score: number; // 0-100
    message?: string;
  };
  name: {
    valid: boolean;
    message?: string;
  };
  role: {
    valid: boolean;
    allowed: boolean;
    message?: string;
  };
  phone: {
    valid: boolean;
    format: boolean;
    message?: string;
  };
  overall: {
    valid: boolean;
    errors: string[];
    warnings: string[];
  };
}

// ========== NEW: USER NOTIFICATION PREFERENCES ==========
export interface UserNotificationSettings {
  general: {
    email: boolean;
    push: boolean;
    sms: boolean;
  };
  appointments: {
    reminders: boolean;
    confirmations: boolean;
    cancellations: boolean;
    changes: boolean;
  };
  medical: {
    newRecords: boolean;
    vaccineReminders: boolean;
    growthAlerts: boolean;
    testResults: boolean;
  };
  system: {
    announcements: boolean;
    updates: boolean;
    securityAlerts: boolean;
  };
  frequency: {
    email: 'immediate' | 'daily' | 'weekly';
    push: 'immediate' | 'delayed';
    sms: 'immediate' | 'urgent_only';
  };
  quietHours?: {
    enabled: boolean;
    start: string; // HH:mm format
    end: string;   // HH:mm format
    days: string[]; // ['monday', 'tuesday', ...]
  };
}

// ========== NEW: USER PERMISSION MATRIX ==========
export interface UserRolePermissions {
  guardian: {
    canViewOwnPatients: boolean;
    canAddPatients: boolean;
    canEditOwnPatientInfo: boolean;
    canViewMedicalRecords: boolean;
    canScheduleAppointments: boolean;
    canCancelOwnAppointments: boolean;
    canInviteGuardians: boolean;
    canInviteClinicians: boolean;
    canViewGrowthCharts: boolean;
    canUploadDocuments: boolean;
  };
  clinician: {
    canViewAllPatients: boolean;
    canAddPatients: boolean;
    canEditPatientInfo: boolean;
    canCreateMedicalRecords: boolean;
    canEditMedicalRecords: boolean;
    canScheduleAppointments: boolean;
    canManageAppointments: boolean;
    canPrescribeMedications: boolean;
    canOrderTests: boolean;
    canInviteGuardians: boolean;
    canInviteClinicians: boolean;
    canViewAuditLogs: boolean;
    canExportData: boolean;
  };
  admin: {
    canManageAllUsers: boolean;
    canManageAllPatients: boolean;
    canManageAllRecords: boolean;
    canManageSystemSettings: boolean;
    canViewAllAuditLogs: boolean;
    canExportAllData: boolean;
    canManageRoles: boolean;
    canManagePermissions: boolean;
    canResetPasswords: boolean;
    canDeactivateUsers: boolean;
    canRunReports: boolean;
    canManageBilling: boolean;
  };
}

// ========== NEW: GROWTH TREND TYPES ==========
export interface GrowthTrends {
  heightTrend: 'increasing' | 'decreasing' | 'stable';
  weightTrend: 'increasing' | 'decreasing' | 'stable';
  bmiTrend: 'increasing' | 'decreasing' | 'stable';
  lastMeasurementDate?: Date;
}

export interface GrowthChartDataWithTrends extends GrowthChartData {
  trend?: GrowthTrends;
}

// ========== NEW: ADMIN MANAGEMENT QUERY TYPES ==========
export interface AdminActivityLogsQuery {
  limit?: number;
  lastDoc?: any; // QueryDocumentSnapshot type from Firestore
  action?: string;
  startDate?: Date;
  endDate?: Date;
  userId?: string;
}

export interface AdminUserQuery {
  search?: string;
  role?: UserRole;
  isActive?: boolean;
  isVerified?: boolean;
  createdAfter?: Date;
  createdBefore?: Date;
  hasPatients?: boolean;
  sortBy?: 'name' | 'email' | 'createdAt' | 'lastLogin';
  sortOrder?: 'asc' | 'desc';
  limit?: number;
  offset?: number;
}

export interface AdminAuditFilter {
  startDate?: Date;
  endDate?: Date;
  userId?: string;
  userRole?: UserRole;
  action?: string;
  resourceType?: string;
  limit?: number;
  offset?: number;
}

export interface BulkUserAction {
  userIds: string[];
  action: 'activate' | 'deactivate' | 'verify' | 'sendWelcomeEmail' | 'resetPassword';
  reason?: string;
  notifyUsers?: boolean;
}

// ========== NEW: ADMIN REPORT TYPES ==========
export interface AdminReport {
  id: string;
  type: 'user_activity' | 'patient_growth' | 'system_usage' | 'compliance' | 'custom';
  title: string;
  description?: string;
  data: any;
  generatedAt: Date;
  generatedBy: string;
  dateRange: {
    start: Date;
    end: Date;
  };
  format: 'json' | 'csv' | 'pdf';
  downloadUrl?: string;
}

export interface AdminUserStats {
  totalUsers: number;
  activeUsers: number;
  newUsersLast7Days: number;
  usersByRole: Record<UserRole, number>;
  pendingVerifications: number;
  userActivityRate: number;
}

export interface AdminPatientStats {
  totalPatients: number;
  activePatients: number;
  newPatientsLast30Days: number;
  averagePatientsPerGuardian: number;
  averagePatientsPerClinician: number;
  patientsByStatus: Record<PatientStatus, number>;
  patientsByGrowthStatus: Record<GrowthStatus, number>;
}

// ========== NEW: UTILITY TYPES ==========
export type QueryDocumentSnapshot = any; // You'll need to import the actual type from firebase/firestore

export type UserWithActivity = UserProfile & {
  lastActivity?: Date;
  activityCount?: number;
  patientsCount?: number;
};

export interface UserSearchResult {
  users: UserProfile[];
  total: number;
  hasMore: boolean;
}

export interface BulkOperationResult {
  success: number;
  failed: number;
  errors: Array<{
    userId: string;
    error: string;
  }>;
}

// ========== TYPE GUARDS ==========

// User Profile Type Guards
export function isUserProfile(obj: any): obj is UserProfile {
  return obj && typeof obj === 'object' && 'uid' in obj && 'role' in obj;
}

export function isGuardianProfile(profile: UserProfile): boolean {
  return profile.role === 'guardian';
}

export function isClinicianProfile(profile: UserProfile): boolean {
  return profile.role === 'clinician';
}

export function isAdminProfile(profile: UserProfile): boolean {
  return profile.role === 'admin';
}

// Patient Type Guards
export function isHealthcarePatient(obj: any): obj is HealthcarePatient {
  return obj && typeof obj === 'object' && 'medicalRecordNumber' in obj && 'clinicianIds' in obj;
}

export function isPatientBase(obj: any): obj is PatientBase {
  return obj && typeof obj === 'object' && 'name' in obj && 'dob' in obj && 'guardianIds' in obj;
}

// New Type Guards
export function isAdminCreateUserData(obj: any): obj is AdminCreateUserData {
  return obj && typeof obj === 'object' && 
    'adminId' in obj && 
    'email' in obj && 
    'password' in obj && 
    'name' in obj && 
    'role' in obj;
}

export function isUserCreationResponse(obj: any): obj is UserCreationResponse {
  return obj && typeof obj === 'object' && 
    'userId' in obj && 
    'email' in obj && 
    'name' in obj && 
    'role' in obj && 
    'createdAt' in obj;
}

export function isBulkUserCreationResult(obj: any): obj is BulkUserCreationResult {
  return obj && typeof obj === 'object' && 
    'success' in obj && 
    'failed' in obj && 
    'results' in obj;
}

export function isGrowthTrends(obj: any): obj is GrowthTrends {
  return obj && typeof obj === 'object' && 
    'heightTrend' in obj && 
    'weightTrend' in obj && 
    'bmiTrend' in obj;
}

export function isBulkOperationResult(obj: any): obj is BulkOperationResult {
  return obj && typeof obj === 'object' && 
    'success' in obj && 
    'failed' in obj && 
    'errors' in obj;
}

export function isUserValidationResult(obj: any): obj is UserValidationResult {
  return obj && typeof obj === 'object' && 
    'email' in obj && 
    'password' in obj && 
    'name' in obj && 
    'overall' in obj;
}

// ========== PERMISSION CHECK FUNCTIONS ==========
export function hasAdminPermission(profile: UserProfile | null, permission: keyof UserPermissions): boolean {
  if (!profile) return false;
  if (isAdminProfile(profile)) return true;
  return profile.permissions?.[permission] || false;
}

export function hasPermission(profile: UserProfile | null, permission: keyof UserPermissions): boolean {
  if (!profile) return false;
  if (isAdminProfile(profile)) return true;
  return profile.permissions?.[permission] || false;
}

export function canManageUsers(profile: UserProfile | null): boolean {
  return hasPermission(profile, 'canManageUsers');
}

export function canViewAuditLogs(profile: UserProfile | null): boolean {
  return hasPermission(profile, 'canViewAuditLogs');
}

export function isActiveUser(profile: UserProfile | null): boolean {
  return profile?.isActive !== false && !profile?.isDeleted;
}

export function isVerifiedUser(profile: UserProfile | null): boolean {
  return profile?.isVerified === true;
}

// New Permission Functions
export function canCreateUser(profile: UserProfile | null): boolean {
  return profile ? hasPermission(profile, 'canManageUsers') : false;
}

export function canResetPassword(profile: UserProfile | null): boolean {
  return profile ? hasPermission(profile, 'canManageUsers') : false;
}

export function canDeactivateUser(profile: UserProfile | null, targetUserId: string): boolean {
  if (!profile || profile.uid === targetUserId) return false;
  return hasPermission(profile, 'canManageUsers');
}

export function canViewAdminDashboard(profile: UserProfile | null): boolean {
  return profile ? isAdminProfile(profile) : false;
}

export function canManageAllPatients(profile: UserProfile | null): boolean {
  return profile ? hasPermission(profile, 'canManagePatients') : false;
}

// ========== UTILITY FUNCTIONS ==========
export function getDefaultPermissionsForRole(role: UserRole): Partial<UserPermissions> {
  switch (role) {
    case 'admin':
      return {
        canManagePatients: true,
        canManageAppointments: true,
        canViewMedicalRecords: true,
        canEditMedicalRecords: true,
        canManageUsers: true,
        canViewAuditLogs: true,
        canManageSystemSettings: true,
        canSendNotifications: true,
        canExportData: true
      };
    case 'clinician':
      return {
        canManagePatients: true,
        canManageAppointments: true,
        canViewMedicalRecords: true,
        canEditMedicalRecords: true,
        canManageUsers: false,
        canViewAuditLogs: false,
        canManageSystemSettings: false,
        canSendNotifications: true,
        canExportData: true
      };
    case 'guardian':
      return {
        canManagePatients: false,
        canManageAppointments: false,
        canViewMedicalRecords: true,
        canEditMedicalRecords: false,
        canManageUsers: false,
        canViewAuditLogs: false,
        canManageSystemSettings: false,
        canSendNotifications: false,
        canExportData: false
      };
    default:
      return {};
  }
}

export function validateUserRole(role: string): role is UserRole {
  return ['guardian', 'clinician', 'admin'].includes(role);
}

export function generateTempPassword(length: number = 12): string {
  const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const lowercase = 'abcdefghijklmnopqrstuvwxyz';
  const numbers = '0123456789';
  const special = '!@#$%^&*()-_=+[]{}|;:,.<>?';
  
  let password = '';
  
  // Ensure at least one of each type
  password += uppercase[Math.floor(Math.random() * uppercase.length)];
  password += lowercase[Math.floor(Math.random() * lowercase.length)];
  password += numbers[Math.floor(Math.random() * numbers.length)];
  password += special[Math.floor(Math.random() * special.length)];
  
  // Fill the rest
  const allChars = uppercase + lowercase + numbers + special;
  for (let i = 4; i < length; i++) {
    password += allChars[Math.floor(Math.random() * allChars.length)];
  }
  
  // Shuffle
  return password.split('').sort(() => Math.random() - 0.5).join('');
}

export function calculatePasswordStrength(password: string): {
  score: number;
  strength: 'very_weak' | 'weak' | 'medium' | 'strong' | 'very_strong';
} {
  let score = 0;
  
  // Length
  if (password.length >= 8) score += 20;
  if (password.length >= 12) score += 20;
  if (password.length >= 16) score += 10;
  
  // Character variety
  if (/[A-Z]/.test(password)) score += 10;
  if (/[a-z]/.test(password)) score += 10;
  if (/[0-9]/.test(password)) score += 10;
  if (/[^A-Za-z0-9]/.test(password)) score += 10;
  
  // Deduct for patterns
  if (/(.)\1{2,}/.test(password)) score -= 10; // Repeated characters
  if (/^\d+$/.test(password)) score -= 20; // All numbers
  if (/^[a-zA-Z]+$/.test(password)) score -= 20; // All letters
  
  // Normalize to 0-100
  score = Math.max(0, Math.min(100, score));
  
  let strength: 'very_weak' | 'weak' | 'medium' | 'strong' | 'very_strong';
  if (score < 30) strength = 'very_weak';
  else if (score < 50) strength = 'weak';
  else if (score < 70) strength = 'medium';
  else if (score < 90) strength = 'strong';
  else strength = 'very_strong';
  
  return { score, strength };
}



// ========== GET USERS BY ROLE TYPES ==========
export interface GetUsersByRoleOptions {
  limit?: number;
  lastDoc?: QueryDocumentSnapshot;
  includeInactive?: boolean;
  includeDeleted?: boolean;
  sortBy?: 'name' | 'email' | 'createdAt' | 'lastLogin';
  sortOrder?: 'asc' | 'desc';
}

export interface GetUsersByRoleResponse extends PaginatedResponse<UserProfile> {
  role: UserRole;
  filteredCount: number;
}


// ========== TYPE GUARD ==========
export function isGetUsersByRoleOptions(obj: any): obj is GetUsersByRoleOptions {
  return obj && typeof obj === 'object' && (
    'limit' in obj ||
    'lastDoc' in obj ||
    'includeInactive' in obj ||
    'includeDeleted' in obj ||
    'sortBy' in obj ||
    'sortOrder' in obj
  );
}



