// app/types/growth.ts

/**
 * WHO Growth Standards Type Definitions
 * Based on WHO Child Growth Standards (0-5 years) and CDC Growth References (2-20 years)
 */

// ============================================================================
// CHILD PROFILE TYPES
// ============================================================================

export type Sex = 'male' | 'female';

export type MeasurementType = 
  | 'weight-for-age'
  | 'length-for-age'
  | 'height-for-age'
  | 'weight-for-length'
  | 'weight-for-height'
  | 'head-circumference-for-age'
  | 'bmi-for-age';

export interface ChildProfile {
  id: string;
  guardianId: string;
  clinicianIds: string[];
  name: string;
  dateOfBirth: Date;
  gestationalAgeWeeks?: number; // For preterm correction (< 37 weeks)
  sex: Sex;
  isPreterm: boolean; // Automatically set if gestationalAgeWeeks < 37
  photoUrl?: string;
  medicalNotes?: string;
  createdAt: Date;
  updatedAt: Date;
  lastMeasurementDate?: Date;
}

// ============================================================================
// MEASUREMENT TYPES
// ============================================================================

export interface GrowthMeasurement {
  id: string;
  childId: string;
  date: Date;
  
  // Age calculations
  ageMonths: number; // Chronological age in months
  ageDays: number; // Chronological age in days
  ageMonthsCorrected?: number; // Corrected age for preterm infants
  ageDaysCorrected?: number;
  
  // Measurements
  weightKg?: number; // Weight in kilograms
  recumbentLengthCm?: number; // For children <2 years (lying down)
  heightCm?: number; // For children ≥2 years (standing)
  headCircumferenceCm?: number; // Head circumference
  
  // Calculated values
  bmi?: number; // Body Mass Index (only for height-based measurements)
  
  // Metadata
  measuredBy: string; // UID of user who recorded measurement
  location?: string; // Clinic or home
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

// ============================================================================
// WHO/CDC LMS PARAMETERS
// ============================================================================

/**
 * LMS Parameters for WHO Growth Standards
 * L = Power in Box-Cox transformation
 * M = Median value
 * S = Coefficient of variation
 */
export interface LMSParameters {
  age: number; // Age in days or months depending on standard
  L: number;
  M: number;
  S: number;
}

export interface LMSDataSet {
  sex: Sex;
  measurementType: MeasurementType;
  ageUnit: 'days' | 'months';
  data: LMSParameters[];
}

// ============================================================================
// GROWTH ANALYSIS RESULTS
// ============================================================================

export interface ZScoreResult {
  zScore: number;
  percentile: number;
  measurementType: MeasurementType;
  value: number;
  age: number;
  ageUnit: 'days' | 'months';
  sex: Sex;
  standardUsed: 'WHO' | 'CDC';
}

export interface GrowthAnalysis {
  childId: string;
  measurementId: string;
  date: Date;
  ageMonths: number;
  
  // Z-scores and percentiles for each measurement
  weightForAge?: ZScoreResult;
  lengthHeightForAge?: ZScoreResult;
  weightForLengthHeight?: ZScoreResult;
  headCircumferenceForAge?: ZScoreResult;
  bmiForAge?: ZScoreResult;
  
  // Overall assessment
  alerts: GrowthAlert[];
  interpretation: GrowthInterpretation;
  
  // Growth velocity (if previous measurements exist)
  growthVelocity?: GrowthVelocity;
}

// ============================================================================
// ALERTS AND INTERPRETATIONS
// ============================================================================

export type AlertSeverity = 'info' | 'warning' | 'critical';

export type AlertType = 
  | 'severe-underweight'
  | 'underweight'
  | 'overweight'
  | 'obesity'
  | 'severe-stunting'
  | 'stunting'
  | 'severe-wasting'
  | 'wasting'
  | 'macrocephaly'
  | 'microcephaly'
  | 'crossing-percentiles-up'
  | 'crossing-percentiles-down'
  | 'poor-growth-velocity'
  | 'rapid-growth-velocity';

export interface GrowthAlert {
  type: AlertType;
  severity: AlertSeverity;
  message: string;
  measurementType: MeasurementType;
  value: number;
  zScore: number;
  percentile: number;
  threshold: number;
  recommendation?: string;
}

export interface GrowthInterpretation {
  overallStatus: 'normal' | 'monitor' | 'review-needed' | 'urgent';
  summary: string;
  details: string[];
  recommendations: string[];
}

// ============================================================================
// GROWTH VELOCITY (TREND ANALYSIS)
// ============================================================================

export interface GrowthVelocity {
  measurementType: MeasurementType;
  timeIntervalDays: number;
  
  // Change metrics
  absoluteChange: number; // e.g., kg or cm
  percentageChange: number;
  ratePerMonth: number;
  
  // Percentile crossing
  percentileCrossing: {
    previousPercentile: number;
    currentPercentile: number;
    numberOfLinescrossed: number; // Major percentile lines (3rd, 5th, 10th, etc.)
    direction: 'up' | 'down' | 'stable';
  };
  
  // Velocity assessment
  velocityStatus: 'adequate' | 'slow' | 'rapid';
  velocityZScore?: number;
}

// ============================================================================
// CALCULATION OPTIONS
// ============================================================================

export interface CalculationOptions {
  useCorrectedAge?: boolean; // For preterm infants
  roundToDecimals?: number; // Round z-scores and percentiles
  includeVelocity?: boolean; // Calculate growth velocity
  previousMeasurement?: GrowthMeasurement; // For velocity calculation
}

// ============================================================================
// THRESHOLD DEFINITIONS
// ============================================================================

export interface GrowthThresholds {
  // WHO Standard Thresholds (based on Z-scores)
  severeUnderweight: number; // < -3 SD
  underweight: number; // < -2 SD
  overweight: number; // > +2 SD
  obesity: number; // > +3 SD
  
  severeStunting: number; // < -3 SD
  stunting: number; // < -2 SD
  
  severeWasting: number; // < -3 SD
  wasting: number; // < -2 SD
  
  microcephaly: number; // < -2 SD
  macrocephaly: number; // > +2 SD
  
  // Percentile crossing threshold
  majorPercentileLinescrossed: number; // e.g., 2 lines
}

export const DEFAULT_THRESHOLDS: GrowthThresholds = {
  severeUnderweight: -3,
  underweight: -2,
  overweight: 2,
  obesity: 3,
  severeStunting: -3,
  stunting: -2,
  severeWasting: -3,
  wasting: -2,
  microcephaly: -2,
  macrocephaly: 2,
  majorPercentileLinescrossed: 2,
};

// ============================================================================
// AGE CALCULATION HELPERS
// ============================================================================

export interface AgeCalculation {
  chronological: {
    years: number;
    months: number;
    days: number;
    totalMonths: number;
    totalDays: number;
  };
  corrected?: {
    years: number;
    months: number;
    days: number;
    totalMonths: number;
    totalDays: number;
  };
  shouldUseCorrectedAge: boolean;
}

// ============================================================================
// CHART DATA TYPES
// ============================================================================

export interface ChartDataPoint {
  date: Date;
  ageMonths: number;
  value: number;
  percentile: number;
  zScore: number;
  measurementId: string;
}

export interface PercentileCurve {
  percentile: number;
  label: string;
  data: Array<{ age: number; value: number }>;
  color: string;
}

export interface GrowthChartData {
  childData: ChartDataPoint[];
  percentileCurves: PercentileCurve[];
  measurementType: MeasurementType;
  sex: Sex;
  ageRange: { min: number; max: number };
  valueRange: { min: number; max: number };
}

// ============================================================================
// STANDARD SELECTION
// ============================================================================

export interface StandardSelection {
  standard: 'WHO' | 'CDC';
  ageRange: string;
  applicableMeasurements: MeasurementType[];
  notes: string;
}

// ============================================================================
// EXPORT TYPES
// ============================================================================

export interface GrowthReport {
  child: ChildProfile;
  measurements: GrowthMeasurement[];
  analyses: GrowthAnalysis[];
  summary: {
    totalMeasurements: number;
    dateRange: { start: Date; end: Date };
    currentStatus: GrowthInterpretation;
    activeAlerts: GrowthAlert[];
  };
  generatedAt: Date;
  generatedBy: string;
}