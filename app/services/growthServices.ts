// app/services/growthServices.ts

/**
 * Consolidated Growth Services
 * Handles WHO Growth Standards, calculations, Firestore operations, and analysis
 */

import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  Timestamp,
  serverTimestamp,
  addDoc,
} from 'firebase/firestore';
import { db } from '@/app/lib/firebase/firebase';
import {
  ChildProfile,
  GrowthMeasurement,
  LMSParameters,
  LMSDataSet,
  ZScoreResult,
  GrowthAnalysis,
  GrowthAlert,
  GrowthInterpretation,
  GrowthVelocity,
  AgeCalculation,
  CalculationOptions,
  MeasurementType,
  Sex,
  AlertType,
  AlertSeverity,
  DEFAULT_THRESHOLDS,
  ChartDataPoint,
  GrowthChartData,
  PercentileCurve,
} from '@/app/types/growth';

// ============================================================================
// LMS DATA STORAGE (In-memory cache)
// ============================================================================

/**
 * In production, load these from JSON files or API
 * For now, this demonstrates the structure
 */
const lmsDataCache: Map<string, LMSDataSet> = new Map();

/**
 * Load LMS parameters for a specific measurement type and sex
 * In production, this would load from /public/who-data/ JSON files
 */
function getLMSData(
  sex: Sex,
  measurementType: MeasurementType
): LMSParameters[] | null {
  const key = `${sex}-${measurementType}`;
  const dataset = lmsDataCache.get(key);
  return dataset?.data || null;
}

/**
 * Initialize LMS data cache
 * Call this on app startup to load WHO reference data
 */
export async function initializeWHOData(): Promise<void> {
  // TODO: Load actual WHO LMS data from JSON files
  // Example structure:
  /*
  const weightForAgeBoys = await fetch('/who-data/weight-for-age-boys.json');
  const data = await weightForAgeBoys.json();
  lmsDataCache.set('male-weight-for-age', {
    sex: 'male',
    measurementType: 'weight-for-age',
    ageUnit: 'days',
    data: data
  });
  */
  
  console.log('WHO Growth Standards data initialized');
}

// ============================================================================
// AGE CALCULATION UTILITIES
// ============================================================================

/**
 * Calculate age in days from birth date
 */
export function calculateAgeInDays(dateOfBirth: Date, measurementDate: Date): number {
  const diffTime = measurementDate.getTime() - dateOfBirth.getTime();
  return Math.floor(diffTime / (1000 * 60 * 60 * 24));
}

/**
 * Calculate age in months (decimal)
 */
export function calculateAgeInMonths(dateOfBirth: Date, measurementDate: Date): number {
  const days = calculateAgeInDays(dateOfBirth, measurementDate);
  return days / 30.4375; // Average days per month
}

/**
 * Calculate corrected age for preterm infants
 */
export function calculateCorrectedAge(
  chronologicalAgeDays: number,
  gestationalAgeWeeks: number
): number {
  if (gestationalAgeWeeks >= 37) {
    return chronologicalAgeDays; // Not preterm
  }
  
  const weeksPreterm = 40 - gestationalAgeWeeks;
  const daysPreterm = weeksPreterm * 7;
  return chronologicalAgeDays - daysPreterm;
}

/**
 * Comprehensive age calculation
 */
export function calculateAge(
  dateOfBirth: Date,
  measurementDate: Date,
  gestationalAgeWeeks?: number
): AgeCalculation {
  const chronologicalDays = calculateAgeInDays(dateOfBirth, measurementDate);
  const chronologicalMonths = calculateAgeInMonths(dateOfBirth, measurementDate);
  
  const years = Math.floor(chronologicalMonths / 12);
  const months = Math.floor(chronologicalMonths % 12);
  const days = Math.floor((chronologicalMonths % 1) * 30.4375);
  
  const result: AgeCalculation = {
    chronological: {
      years,
      months,
      days,
      totalMonths: chronologicalMonths,
      totalDays: chronologicalDays,
    },
    shouldUseCorrectedAge: false,
  };
  
  // Calculate corrected age if preterm and under 24 months
  if (gestationalAgeWeeks && gestationalAgeWeeks < 37 && chronologicalMonths < 24) {
    const correctedDays = calculateCorrectedAge(chronologicalDays, gestationalAgeWeeks);
    const correctedMonths = correctedDays / 30.4375;
    
    const corrYears = Math.floor(correctedMonths / 12);
    const corrMonths = Math.floor(correctedMonths % 12);
    const corrDays = Math.floor((correctedMonths % 1) * 30.4375);
    
    result.corrected = {
      years: corrYears,
      months: corrMonths,
      days: corrDays,
      totalMonths: correctedMonths,
      totalDays: correctedDays,
    };
    
    result.shouldUseCorrectedAge = true;
  }
  
  return result;
}

// ============================================================================
// LMS INTERPOLATION
// ============================================================================

/**
 * Linear interpolation between two LMS parameter points
 */
function interpolateLMS(
  age: number,
  lmsData: LMSParameters[]
): LMSParameters | null {
  if (!lmsData || lmsData.length === 0) return null;
  
  // Find surrounding data points
  let lower: LMSParameters | null = null;
  let upper: LMSParameters | null = null;
  
  for (let i = 0; i < lmsData.length; i++) {
    if (lmsData[i].age <= age) {
      lower = lmsData[i];
    }
    if (lmsData[i].age >= age && !upper) {
      upper = lmsData[i];
      break;
    }
  }
  
  // Exact match
  if (lower && lower.age === age) return lower;
  if (upper && upper.age === age) return upper;
  
  // Interpolate
  if (lower && upper) {
    const ratio = (age - lower.age) / (upper.age - lower.age);
    return {
      age,
      L: lower.L + ratio * (upper.L - lower.L),
      M: lower.M + ratio * (upper.M - lower.M),
      S: lower.S + ratio * (upper.S - lower.S),
    };
  }
  
  // Outside range - use closest
  if (lower) return lower;
  if (upper) return upper;
  
  return null;
}

// ============================================================================
// Z-SCORE CALCULATIONS (LMS Method)
// ============================================================================

/**
 * Calculate Z-score from measurement value using LMS method
 * Based on CDC/WHO formula: Z = ((X/M)^L - 1) / (L*S)
 */
export function calculateZScore(
  value: number,
  L: number,
  M: number,
  S: number
): number {
  if (Math.abs(L) < 0.0001) {
    // L ≈ 0: Use natural log
    return Math.log(value / M) / S;
  } else {
    // L ≠ 0: Use Box-Cox transformation
    return (Math.pow(value / M, L) - 1) / (L * S);
  }
}

/**
 * Calculate measurement value from Z-score using LMS method
 */
export function calculateValueFromZScore(
  zScore: number,
  L: number,
  M: number,
  S: number
): number {
  if (Math.abs(L) < 0.0001) {
    // L ≈ 0
    return M * Math.exp(S * zScore);
  } else {
    // L ≠ 0
    return M * Math.pow(1 + L * S * zScore, 1 / L);
  }
}

/**
 * Convert Z-score to percentile using cumulative normal distribution
 * Approximation of the error function (erf)
 */
export function zScoreToPercentile(zScore: number): number {
  // Clamp extreme values
  if (zScore < -4) return 0.00003; // ~0.003rd percentile
  if (zScore > 4) return 99.99997; // ~99.997th percentile
  
  // Approximation using error function
  const t = 1 / (1 + 0.2316419 * Math.abs(zScore));
  const d = 0.3989423 * Math.exp(-zScore * zScore / 2);
  const probability = d * t * (0.3193815 + t * (-0.3565638 + t * (1.781478 + t * (-1.821256 + t * 1.330274))));
  
  const cdf = zScore >= 0 ? 1 - probability : probability;
  return cdf * 100;
}

/**
 * Convert percentile to Z-score
 */
export function percentileToZScore(percentile: number): number {
  // Clamp to valid range
  percentile = Math.max(0.001, Math.min(99.999, percentile));
  
  // Convert percentile to probability
  const p = percentile / 100;
  
  // Rational approximation (Beasley-Springer-Moro algorithm)
  const a = [
    -3.969683028665376e1, 2.209460984245205e2,
    -2.759285104469687e2, 1.383577518672690e2,
    -3.066479806614716e1, 2.506628277459239
  ];
  const b = [
    -5.447609879822406e1, 1.615858368580409e2,
    -1.556989798598866e2, 6.680131188771972e1,
    -1.328068155288572e1
  ];
  const c = [
    -7.784894002430293e-3, -3.223964580411365e-1,
    -2.400758277161838, -2.549732539343734,
    4.374664141464968, 2.938163982698783
  ];
  const d = [
    7.784695709041462e-3, 3.224671290700398e-1,
    2.445134137142996, 3.754408661907416
  ];
  
  const pLow = 0.02425;
  const pHigh = 1 - pLow;
  
  let q: number, r: number, z: number;
  
  if (p < pLow) {
    q = Math.sqrt(-2 * Math.log(p));
    z = (((((c[0] * q + c[1]) * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5]) /
        ((((d[0] * q + d[1]) * q + d[2]) * q + d[3]) * q + 1);
  } else if (p <= pHigh) {
    q = p - 0.5;
    r = q * q;
    z = (((((a[0] * r + a[1]) * r + a[2]) * r + a[3]) * r + a[4]) * r + a[5]) * q /
        (((((b[0] * r + b[1]) * r + b[2]) * r + b[3]) * r + b[4]) * r + 1);
  } else {
    q = Math.sqrt(-2 * Math.log(1 - p));
    z = -(((((c[0] * q + c[1]) * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5]) /
         ((((d[0] * q + d[1]) * q + d[2]) * q + d[3]) * q + 1);
  }
  
  return z;
}

// ============================================================================
// GROWTH ANALYSIS
// ============================================================================

/**
 * Analyze a single measurement type
 */
export function analyzeMeasurement(
  value: number,
  ageMonths: number,
  sex: Sex,
  measurementType: MeasurementType,
  options: CalculationOptions = {}
): ZScoreResult | null {
  // Get LMS data for this measurement type
  const lmsData = getLMSData(sex, measurementType);
  if (!lmsData) {
    console.warn(`No LMS data found for ${sex} ${measurementType}`);
    return null;
  }
  
  // Determine age unit and convert if needed
  const ageUnit = measurementType.includes('length') || measurementType.includes('weight-for-length')
    ? 'days'
    : 'months';
  
  const age = ageUnit === 'days' ? ageMonths * 30.4375 : ageMonths;
  
  // Get interpolated LMS parameters
  const lms = interpolateLMS(age, lmsData);
  if (!lms) {
    console.warn(`Could not interpolate LMS for age ${age} ${ageUnit}`);
    return null;
  }
  
  // Calculate Z-score and percentile
  const zScore = calculateZScore(value, lms.L, lms.M, lms.S);
  const percentile = zScoreToPercentile(zScore);
  
  // Determine which standard was used
  const standardUsed = ageMonths < 24 ? 'WHO' : 'CDC';
  
  return {
    zScore: options.roundToDecimals !== undefined 
      ? parseFloat(zScore.toFixed(options.roundToDecimals))
      : zScore,
    percentile: options.roundToDecimals !== undefined
      ? parseFloat(percentile.toFixed(options.roundToDecimals))
      : percentile,
    measurementType,
    value,
    age,
    ageUnit,
    sex,
    standardUsed,
  };
}

/**
 * Generate alerts based on Z-scores and thresholds
 */
function generateAlerts(
  analysis: Partial<GrowthAnalysis>
): GrowthAlert[] {
  const alerts: GrowthAlert[] = [];
  const thresholds = DEFAULT_THRESHOLDS;
  
  // Weight-for-age alerts
  if (analysis.weightForAge) {
    const { zScore, percentile, value } = analysis.weightForAge;
    
    if (zScore < thresholds.severeUnderweight) {
      alerts.push({
        type: 'severe-underweight',
        severity: 'critical',
        message: 'Severe underweight detected',
        measurementType: 'weight-for-age',
        value,
        zScore,
        percentile,
        threshold: thresholds.severeUnderweight,
        recommendation: 'Immediate medical evaluation recommended. Assess for malnutrition and underlying conditions.',
      });
    } else if (zScore < thresholds.underweight) {
      alerts.push({
        type: 'underweight',
        severity: 'warning',
        message: 'Underweight detected',
        measurementType: 'weight-for-age',
        value,
        zScore,
        percentile,
        threshold: thresholds.underweight,
        recommendation: 'Monitor closely. Consider nutritional assessment and counseling.',
      });
    } else if (zScore > thresholds.obesity) {
      alerts.push({
        type: 'obesity',
        severity: 'warning',
        message: 'Obesity detected',
        measurementType: 'weight-for-age',
        value,
        zScore,
        percentile,
        threshold: thresholds.obesity,
        recommendation: 'Nutritional counseling and lifestyle modifications recommended.',
      });
    } else if (zScore > thresholds.overweight) {
      alerts.push({
        type: 'overweight',
        severity: 'info',
        message: 'Overweight detected',
        measurementType: 'weight-for-age',
        value,
        zScore,
        percentile,
        threshold: thresholds.overweight,
        recommendation: 'Monitor weight gain. Consider dietary review.',
      });
    }
  }
  
  // Length/Height-for-age alerts
  if (analysis.lengthHeightForAge) {
    const { zScore, percentile, value } = analysis.lengthHeightForAge;
    
    if (zScore < thresholds.severeStunting) {
      alerts.push({
        type: 'severe-stunting',
        severity: 'critical',
        message: 'Severe stunting detected',
        measurementType: 'length-for-age',
        value,
        zScore,
        percentile,
        threshold: thresholds.severeStunting,
        recommendation: 'Medical evaluation required. Assess for chronic malnutrition and growth disorders.',
      });
    } else if (zScore < thresholds.stunting) {
      alerts.push({
        type: 'stunting',
        severity: 'warning',
        message: 'Stunting detected',
        measurementType: 'length-for-age',
        value,
        zScore,
        percentile,
        threshold: thresholds.stunting,
        recommendation: 'Monitor growth closely. Nutritional and medical assessment recommended.',
      });
    }
  }
  
  // Head circumference alerts
  if (analysis.headCircumferenceForAge) {
    const { zScore, percentile, value } = analysis.headCircumferenceForAge;
    
    if (zScore < thresholds.microcephaly) {
      alerts.push({
        type: 'microcephaly',
        severity: 'critical',
        message: 'Microcephaly detected',
        measurementType: 'head-circumference-for-age',
        value,
        zScore,
        percentile,
        threshold: thresholds.microcephaly,
        recommendation: 'Neurological evaluation recommended.',
      });
    } else if (zScore > thresholds.macrocephaly) {
      alerts.push({
        type: 'macrocephaly',
        severity: 'warning',
        message: 'Macrocephaly detected',
        measurementType: 'head-circumference-for-age',
        value,
        zScore,
        percentile,
        threshold: thresholds.macrocephaly,
        recommendation: 'Medical evaluation to rule out hydrocephalus or other conditions.',
      });
    }
  }
  
  return alerts;
}

/**
 * Generate interpretation summary
 */
function generateInterpretation(
  alerts: GrowthAlert[],
  ageMonths: number
): GrowthInterpretation {
  const criticalAlerts = alerts.filter(a => a.severity === 'critical');
  const warningAlerts = alerts.filter(a => a.severity === 'warning');
  
  let overallStatus: GrowthInterpretation['overallStatus'] = 'normal';
  let summary = 'Growth measurements are within normal range.';
  const details: string[] = [];
  const recommendations: string[] = [];
  
  if (criticalAlerts.length > 0) {
    overallStatus = 'urgent';
    summary = 'Critical growth concerns detected requiring immediate medical attention.';
    criticalAlerts.forEach(alert => {
      details.push(alert.message);
      if (alert.recommendation) recommendations.push(alert.recommendation);
    });
  } else if (warningAlerts.length > 0) {
    overallStatus = 'review-needed';
    summary = 'Growth concerns detected requiring medical review.';
    warningAlerts.forEach(alert => {
      details.push(alert.message);
      if (alert.recommendation) recommendations.push(alert.recommendation);
    });
  } else if (alerts.length > 0) {
    overallStatus = 'monitor';
    summary = 'Growth is generally normal but should be monitored.';
    alerts.forEach(alert => {
      details.push(alert.message);
      if (alert.recommendation) recommendations.push(alert.recommendation);
    });
  } else {
    details.push('All measurements are within normal percentile ranges.');
    recommendations.push('Continue routine monitoring and well-child visits.');
  }
  
  // Add age-specific recommendations
  if (ageMonths < 6) {
    recommendations.push('Ensure exclusive breastfeeding if possible.');
  } else if (ageMonths < 24) {
    recommendations.push('Monitor introduction of complementary foods.');
  }
  
  return {
    overallStatus,
    summary,
    details,
    recommendations: [...new Set(recommendations)], // Remove duplicates
  };
}

/**
 * Calculate growth velocity between two measurements
 */
function calculateGrowthVelocity(
  current: GrowthMeasurement,
  previous: GrowthMeasurement,
  measurementType: MeasurementType,
  currentAnalysis: ZScoreResult
): GrowthVelocity | null {
  let currentValue: number | undefined;
  let previousValue: number | undefined;
  
  // Extract values based on measurement type
  if (measurementType === 'weight-for-age') {
    currentValue = current.weightKg;
    previousValue = previous.weightKg;
  } else if (measurementType.includes('length') || measurementType.includes('height')) {
    currentValue = current.heightCm || current.recumbentLengthCm;
    previousValue = previous.heightCm || previous.recumbentLengthCm;
  } else if (measurementType === 'head-circumference-for-age') {
    currentValue = current.headCircumferenceCm;
    previousValue = previous.headCircumferenceCm;
  }
  
  if (!currentValue || !previousValue) return null;
  
  // Calculate time interval
  const timeIntervalDays = calculateAgeInDays(previous.date, current.date);
  if (timeIntervalDays <= 0) return null;
  
  // Calculate changes
  const absoluteChange = currentValue - previousValue;
  const percentageChange = (absoluteChange / previousValue) * 100;
  const ratePerMonth = (absoluteChange / timeIntervalDays) * 30.4375;
  
  // Determine percentile crossing (simplified - would need previous analysis)
  const direction: 'up' | 'down' | 'stable' = 
    Math.abs(absoluteChange) < 0.01 ? 'stable' :
    absoluteChange > 0 ? 'up' : 'down';
  
  // Assess velocity status (simplified)
  let velocityStatus: 'adequate' | 'slow' | 'rapid' = 'adequate';
  
  if (measurementType === 'weight-for-age') {
    // Expected weight gain varies by age
    if (current.ageMonths < 3) {
      // ~25-30g/day expected
      const expectedGainPerDay = 27.5;
      const actualGainPerDay = (absoluteChange * 1000) / timeIntervalDays;
      if (actualGainPerDay < expectedGainPerDay * 0.6) velocityStatus = 'slow';
      if (actualGainPerDay > expectedGainPerDay * 1.5) velocityStatus = 'rapid';
    }
  }
  
  return {
    measurementType,
    timeIntervalDays,
    absoluteChange,
    percentageChange,
    ratePerMonth,
    percentileCrossing: {
      previousPercentile: 50, // Would need previous analysis
      currentPercentile: currentAnalysis.percentile,
      numberOfLinescrossed: 0,
      direction,
    },
    velocityStatus,
  };
}

/**
 * Complete growth analysis for a measurement
 */
export function analyzeGrowthMeasurement(
  child: ChildProfile,
  measurement: GrowthMeasurement,
  options: CalculationOptions = {}
): GrowthAnalysis {
  const ageToUse = options.useCorrectedAge && measurement.ageMonthsCorrected
    ? measurement.ageMonthsCorrected
    : measurement.ageMonths;
  
  const analysis: Partial<GrowthAnalysis> = {
    childId: child.id,
    measurementId: measurement.id,
    date: measurement.date,
    ageMonths: ageToUse,
  };
  
  // Analyze each available measurement
  if (measurement.weightKg) {
    analysis.weightForAge = analyzeMeasurement(
      measurement.weightKg,
      ageToUse,
      child.sex,
      'weight-for-age',
      options
    ) || undefined;
  }
  
  const lengthOrHeight = measurement.heightCm || measurement.recumbentLengthCm;
  if (lengthOrHeight) {
    const measurementType = measurement.ageMonths < 24 ? 'length-for-age' : 'height-for-age';
    analysis.lengthHeightForAge = analyzeMeasurement(
      lengthOrHeight,
      ageToUse,
      child.sex,
      measurementType,
      options
    ) || undefined;
    
    // Calculate BMI if height available
    if (measurement.weightKg) {
      const heightM = lengthOrHeight / 100;
      const bmi = measurement.weightKg / (heightM * heightM);
      measurement.bmi = bmi;
      
      if (measurement.ageMonths >= 24) {
        analysis.bmiForAge = analyzeMeasurement(
          bmi,
          ageToUse,
          child.sex,
          'bmi-for-age',
          options
        ) || undefined;
      }
    }
  }
  
  if (measurement.headCircumferenceCm) {
    analysis.headCircumferenceForAge = analyzeMeasurement(
      measurement.headCircumferenceCm,
      ageToUse,
      child.sex,
      'head-circumference-for-age',
      options
    ) || undefined;
  }
  
  // Generate alerts and interpretation
  analysis.alerts = generateAlerts(analysis);
  analysis.interpretation = generateInterpretation(analysis.alerts, ageToUse);
  
  // Calculate growth velocity if previous measurement provided
  if (options.previousMeasurement && analysis.weightForAge) {
    analysis.growthVelocity = calculateGrowthVelocity(
      measurement,
      options.previousMeasurement,
      'weight-for-age',
      analysis.weightForAge
    ) || undefined;
  }
  
  return analysis as GrowthAnalysis;
}

// ============================================================================
// FIRESTORE OPERATIONS - CHILDREN
// ============================================================================

/**
 * Create a new child profile
 */
export async function createChild(
  childData: Omit<ChildProfile, 'id' | 'createdAt' | 'updatedAt'>
): Promise<ChildProfile> {
  try {
    const childRef = doc(collection(db, 'patients'));
    
    const newChild: ChildProfile = {
      ...childData,
      id: childRef.id,
      isPreterm: childData.gestationalAgeWeeks ? childData.gestationalAgeWeeks < 37 : false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    await setDoc(childRef, {
      ...newChild,
      dateOfBirth: Timestamp.fromDate(childData.dateOfBirth),
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    
    return newChild;
  } catch (error) {
    console.error('Error creating child:', error);
    throw new Error('Failed to create child profile');
  }
}

/**
 * Get child by ID
 */
export async function getChild(childId: string): Promise<ChildProfile | null> {
  try {
    const childRef = doc(db, 'patients', childId);
    const childSnap = await getDoc(childRef);
    
    if (!childSnap.exists()) {
      return null;
    }
    
    const data = childSnap.data();
    return {
      id: childSnap.id,
      ...data,
      dateOfBirth: data.dateOfBirth.toDate(),
      createdAt: data.createdAt.toDate(),
      updatedAt: data.updatedAt.toDate(),
      lastMeasurementDate: data.lastMeasurementDate?.toDate(),
    } as ChildProfile;
  } catch (error) {
    console.error('Error fetching child:', error);
    throw new Error('Failed to fetch child profile');
  }
}

/**
 * Get all children for a guardian
 */
export async function getChildrenByGuardian(guardianId: string): Promise<ChildProfile[]> {
  try {
    const q = query(
      collection(db, 'patients'),
      where('guardianId', '==', guardianId),
      orderBy('dateOfBirth', 'desc')
    );
    
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      dateOfBirth: doc.data().dateOfBirth.toDate(),
      createdAt: doc.data().createdAt.toDate(),
      updatedAt: doc.data().updatedAt.toDate(),
      lastMeasurementDate: doc.data().lastMeasurementDate?.toDate(),
    })) as ChildProfile[];
  } catch (error) {
    console.error('Error fetching children:', error);
    throw new Error('Failed to fetch children');
  }
}

/**
 * Get all children for a clinician
 */
export async function getChildrenByClinician(clinicianId: string): Promise<ChildProfile[]> {
  try {
    const q = query(
      collection(db, 'patients'),
      where('clinicianIds', 'array-contains', clinicianId),
      orderBy('updatedAt', 'desc')
    );
    
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      dateOfBirth: doc.data().dateOfBirth.toDate(),
      createdAt: doc.data().createdAt.toDate(),
      updatedAt: doc.data().updatedAt.toDate(),
      lastMeasurementDate: doc.data().lastMeasurementDate?.toDate(),
    })) as ChildProfile[];
  } catch (error) {
    console.error('Error fetching children:', error);
    throw new Error('Failed to fetch children');
  }
}

