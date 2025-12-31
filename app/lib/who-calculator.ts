// import weightData from '@/data/who-standards/dataset/weightForAge.json';

// // Type for your data structure
// interface AgeDataPoint {
//   ageMonths: number;
//   male: { mean: number; sd: number };
//   female: { mean: number; sd: number };
// }

// interface WHODataPoint {
//   ageMonths: number;
//   mean: number;
//   sd: number;
// }

// export interface WHOResult {
//   zScore: number;
//   percentile: number;
//   classification: string;
//   sdCategory: string;
//   whoAgeMonths: number; // Age used from WHO data
//   actualAgeMonths: number; // Actual calculated age
// }

// // Calculate exact age in months
// export function calculateAgeMonths(dob: string, measurementDate?: string): number {
//   try {
//     const birthDate = new Date(dob);
//     const currentDate = measurementDate ? new Date(measurementDate) : new Date();
    
//     if (isNaN(birthDate.getTime())) {
//       console.error('Invalid date of birth:', dob);
//       return 0;
//     }
    
//     let months = (currentDate.getFullYear() - birthDate.getFullYear()) * 12;
//     months += currentDate.getMonth() - birthDate.getMonth();
    
//     // Adjust for days
//     if (currentDate.getDate() < birthDate.getDate()) {
//       months--;
//     }
    
//     // Add fractional month based on days
//     const dayDiff = Math.abs(currentDate.getDate() - birthDate.getDate());
//     const fraction = dayDiff / 30.44; // Average days per month
    
//     return Math.max(0, months + fraction);
//   } catch (error) {
//     console.error('Error calculating age:', error);
//     return 0;
//   }
// }

// // Find closest WHO data point for age
// function getWHODataPoint(ageMonths: number, sex: 'male' | 'female'): WHODataPoint {
//   // Ensure age is within data range (0-60 months)
//   const clampedAge = Math.max(0, Math.min(60, ageMonths));
  
//   // Find exact match first
//   const exactMatch = (weightData as AgeDataPoint[]).find(d => d.ageMonths === Math.round(clampedAge));
  
//   if (exactMatch) {
//     return {
//       ageMonths: exactMatch.ageMonths,
//       mean: exactMatch[sex].mean,
//       sd: exactMatch[sex].sd
//     };
//   }
  
//   // Find closest match
//   const closest = (weightData as AgeDataPoint[]).reduce((prev, curr) => {
//     const prevDiff = Math.abs(prev.ageMonths - clampedAge);
//     const currDiff = Math.abs(curr.ageMonths - clampedAge);
//     return currDiff < prevDiff ? curr : prev;
//   });
  
//   return {
//     ageMonths: closest.ageMonths,
//     mean: closest[sex].mean,
//     sd: closest[sex].sd
//   };
// }

// // Calculate Z-score
// export function calculateZScore(value: number, mean: number, sd: number): number {
//   if (sd === 0) {
//     console.warn('Standard deviation is zero, cannot calculate Z-score');
//     return 0;
//   }
  
//   return (value - mean) / sd;
// }

// // Get weight classification based on Z-score (WHO standards)
// export function getWeightClassification(zScore: number): string {
//   if (zScore < -3) return 'Severely Underweight';
//   if (zScore < -2) return 'Underweight';
//   if (zScore < 2) return 'Normal';
//   if (zScore < 3) return 'Overweight';
//   return 'Obese';
// }

// // Get SD category
// export function getSDCategory(zScore: number): string {
//   if (zScore < -3) return 'SD-3';
//   if (zScore < -2) return 'SD-2';
//   if (zScore < -1) return 'SD-1';
//   if (zScore < 1) return 'Median';
//   if (zScore < 2) return 'SD+1';
//   if (zScore < 3) return 'SD+2';
//   return 'SD+3';
// }

// // Convert Z-score to percentile
// export function zScoreToPercentile(zScore: number): number {
//   // Simplified percentiles based on standard normal distribution
//   if (zScore <= -3) return 0.1;
//   if (zScore <= -2) return 2.3;
//   if (zScore <= -1) return 15.9;
//   if (zScore <= 0) return 50.0;
//   if (zScore <= 1) return 84.1;
//   if (zScore <= 2) return 97.7;
//   return 99.9;
// }

// // Main function to assess weight
// export function assessWeightForAge(
//   weight: number, 
//   sex: 'male' | 'female', 
//   dob: string,
//   measurementDate?: string
// ): WHOResult {
//   try {
//     if (weight <= 0 || isNaN(weight)) {
//       throw new Error(`Invalid weight value: ${weight}`);
//     }
    
//     const actualAgeMonths = calculateAgeMonths(dob, measurementDate);
    
//     if (actualAgeMonths > 60) {
//       console.warn(`Age ${actualAgeMonths.toFixed(1)} months exceeds WHO data range (0-60 months)`);
//     }
    
//     const dataPoint = getWHODataPoint(actualAgeMonths, sex);
//     const zScore = calculateZScore(weight, dataPoint.mean, dataPoint.sd);
    
//     return {
//       zScore,
//       percentile: zScoreToPercentile(zScore),
//       classification: getWeightClassification(zScore),
//       sdCategory: getSDCategory(zScore),
//       whoAgeMonths: dataPoint.ageMonths,
//       actualAgeMonths
//     };
//   } catch (error) {
//     console.error('Error assessing weight:', error);
//     return {
//       zScore: 0,
//       percentile: 50,
//       classification: 'Unable to assess',
//       sdCategory: 'N/A',
//       whoAgeMonths: 0,
//       actualAgeMonths: 0
//     };
//   }
// }

// // Helper function to get color based on Z-score (for UI)
// export function getZScoreColor(zScore: number): string {
//   if (zScore < -2) return 'bg-red-100 text-red-800 border-red-200';
//   if (zScore < 2) return 'bg-green-100 text-green-800 border-green-200';
//   return 'bg-yellow-100 text-yellow-800 border-yellow-200';
// }

// // Helper function to get badge color classes
// export function getBadgeColorClasses(zScore: number): string {
//   if (zScore < -3) return 'bg-red-100 text-red-800';
//   if (zScore < -2) return 'bg-orange-100 text-orange-800';
//   if (zScore < 2) return 'bg-green-100 text-green-800';
//   if (zScore < 3) return 'bg-yellow-100 text-yellow-800';
//   return 'bg-red-100 text-red-800';
// }

// // Helper function to get icon based on Z-score
// export function getStatusIcon(zScore: number): string {
//   if (zScore < -2) return '⚠️'; // Warning for underweight
//   if (zScore < 2) return '✓'; // Check for normal
//   return '⚠️'; // Warning for overweight
// }

// // Helper to format age display
// export function formatAge(ageMonths: number): string {
//   const years = Math.floor(ageMonths / 12);
//   const months = Math.round(ageMonths % 12);
  
//   if (years === 0) return `${months} month${months !== 1 ? 's' : ''}`;
//   if (months === 0) return `${years} year${years !== 1 ? 's' : ''}`;
//   return `${years}y ${months}m`;
// }

import weightData from '@/data/who-standards/dataset/weightForAge.json';

// Type for your data structure
interface AgeDataPoint {
  ageMonths: number;
  male: { mean: number; sd: number };
  female: { mean: number; sd: number };
}

interface WHODataPoint {
  ageMonths: number;
  mean: number;
  sd: number;
}

export interface WHOResult {
  zScore: number;
  percentile: number;
  classification: string;
  sdCategory: string;
  whoAgeMonths: number; // Age used from WHO data
  actualAgeMonths: number; // Actual calculated age (completed months only)
}

// Calculate COMPLETED MONTHS ONLY (no fractions)
export function calculateAgeMonths(dob: string, measurementDate?: string): number {
  try {
    const birthDate = new Date(dob);
    const currentDate = measurementDate ? new Date(measurementDate) : new Date();
    
    if (isNaN(birthDate.getTime())) {
      console.error('Invalid date of birth:', dob);
      return 0;
    }
    
    if (isNaN(currentDate.getTime())) {
      console.error('Invalid measurement date:', measurementDate);
      return 0;
    }
    
    // Calculate COMPLETED MONTHS (whole months only, no fractions)
    let completedMonths = (currentDate.getFullYear() - birthDate.getFullYear()) * 12;
    completedMonths += currentDate.getMonth() - birthDate.getMonth();
    
    // Adjust if current day is before birth day (month not completed)
    if (currentDate.getDate() < birthDate.getDate()) {
      completedMonths--;
    }
    
    // Ensure non-negative and return whole number only
    return Math.max(0, completedMonths);
    
  } catch (error) {
    console.error('Error calculating age:', error);
    return 0;
  }
}

// Find closest WHO data point for age
function getWHODataPoint(ageMonths: number, sex: 'male' | 'female'): WHODataPoint {
  // Ensure age is within data range (0-60 months)
  const clampedAge = Math.max(0, Math.min(60, ageMonths));
  
  // Find exact match first
  const exactMatch = (weightData as AgeDataPoint[]).find(d => d.ageMonths === Math.round(clampedAge));
  
  if (exactMatch) {
    return {
      ageMonths: exactMatch.ageMonths,
      mean: exactMatch[sex].mean,
      sd: exactMatch[sex].sd
    };
  }
  
  // Find closest match
  const closest = (weightData as AgeDataPoint[]).reduce((prev, curr) => {
    const prevDiff = Math.abs(prev.ageMonths - clampedAge);
    const currDiff = Math.abs(curr.ageMonths - clampedAge);
    return currDiff < prevDiff ? curr : prev;
  });
  
  return {
    ageMonths: closest.ageMonths,
    mean: closest[sex].mean,
    sd: closest[sex].sd
  };
}

// Calculate Z-score
export function calculateZScore(value: number, mean: number, sd: number): number {
  if (sd === 0) {
    console.warn('Standard deviation is zero, cannot calculate Z-score');
    return 0;
  }
  
  return (value - mean) / sd;
}

// Get weight classification based on Z-score (WHO standards)
export function getWeightClassification(zScore: number): string {
  if (zScore < -3) return 'Severely Underweight';
  if (zScore < -2) return 'Underweight';
  if (zScore < 2) return 'Normal';
  if (zScore < 3) return 'Overweight';
  return 'Obese';
}

// Get SD category
export function getSDCategory(zScore: number): string {
  if (zScore < -3) return 'SD-3';
  if (zScore < -2) return 'SD-2';
  if (zScore < -1) return 'SD-1';
  if (zScore < 1) return 'Median';
  if (zScore < 2) return 'SD+1';
  if (zScore < 3) return 'SD+2';
  return 'SD+3';
}

// Convert Z-score to percentile
export function zScoreToPercentile(zScore: number): number {
  // Simplified percentiles based on standard normal distribution
  if (zScore <= -3) return 0.1;
  if (zScore <= -2) return 2.3;
  if (zScore <= -1) return 15.9;
  if (zScore <= 0) return 50.0;
  if (zScore <= 1) return 84.1;
  if (zScore <= 2) return 97.7;
  return 99.9;
}

// Main function to assess weight using COMPLETED MONTHS ONLY
export function assessWeightForAge(
  weight: number, 
  sex: 'male' | 'female', 
  dob: string,
  measurementDate?: string
): WHOResult {
  try {
    if (weight <= 0 || isNaN(weight)) {
      throw new Error(`Invalid weight value: ${weight}`);
    }
    
    // Calculate COMPLETED MONTHS (whole months only)
    const completedMonths = calculateAgeMonths(dob, measurementDate);
    
    if (completedMonths > 60) {
      console.warn(`Age ${completedMonths} months exceeds WHO data range (0-60 months)`);
    }
    
    const dataPoint = getWHODataPoint(completedMonths, sex);
    const zScore = calculateZScore(weight, dataPoint.mean, dataPoint.sd);
    
    return {
      zScore,
      percentile: zScoreToPercentile(zScore),
      classification: getWeightClassification(zScore),
      sdCategory: getSDCategory(zScore),
      whoAgeMonths: dataPoint.ageMonths,
      actualAgeMonths: completedMonths // Completed whole months
    };
  } catch (error) {
    console.error('Error assessing weight:', error);
    return {
      zScore: 0,
      percentile: 50,
      classification: 'Unable to assess',
      sdCategory: 'N/A',
      whoAgeMonths: 0,
      actualAgeMonths: 0
    };
  }
}

// Helper function to get color based on Z-score (for UI)
export function getZScoreColor(zScore: number): string {
  if (zScore < -2) return 'bg-red-100 text-red-800 border-red-200';
  if (zScore < 2) return 'bg-green-100 text-green-800 border-green-200';
  return 'bg-yellow-100 text-yellow-800 border-yellow-200';
}

// Helper function to get badge color classes
export function getBadgeColorClasses(zScore: number): string {
  if (zScore < -3) return 'bg-red-100 text-red-800';
  if (zScore < -2) return 'bg-orange-100 text-orange-800';
  if (zScore < 2) return 'bg-green-100 text-green-800';
  if (zScore < 3) return 'bg-yellow-100 text-yellow-800';
  return 'bg-red-100 text-red-800';
}

// Helper function to get icon based on Z-score
export function getStatusIcon(zScore: number): string {
  if (zScore < -2) return '⚠️'; // Warning for underweight
  if (zScore < 2) return '✓'; // Check for normal
  return '⚠️'; // Warning for overweight
}

// Helper to format age display using COMPLETED MONTHS
export function formatAge(ageMonths: number): string {
  const years = Math.floor(ageMonths / 12);
  const months = ageMonths % 12;
  
  if (years === 0) return `${months} month${months !== 1 ? 's' : ''}`;
  if (months === 0) return `${years} year${years !== 1 ? 's' : ''}`;
  return `${years}y ${months}m`;
}

// NEW: Quick test function to verify calculations
export function testAgeCalculationExamples(): void {
  const tests = [
    { dob: '2023-01-15', measurement: '2023-02-14', expected: 0, reason: '29 days = 0 completed months' },
    { dob: '2023-01-15', measurement: '2023-02-15', expected: 1, reason: 'Exactly 1 month' },
    { dob: '2022-12-31', measurement: '2023-01-30', expected: 0, reason: '30 days but not completed month' },
    { dob: '2022-06-15', measurement: '2023-06-14', expected: 11, reason: '1 day short of 1 year' },
    { dob: '2022-06-15', measurement: '2023-06-15', expected: 12, reason: 'Exactly 1 year' },
    { dob: '2020-03-10', measurement: '2023-03-09', expected: 35, reason: '3 years minus 1 day' },
    { dob: '2020-03-10', measurement: '2023-03-10', expected: 36, reason: 'Exactly 3 years' }
  ];

  console.log('🧮 Age Calculation Test (Completed Months Only)');
  console.log('==============================================');
  
  tests.forEach(test => {
    const result = calculateAgeMonths(test.dob, test.measurement);
    const passed = result === test.expected;
    
    console.log(
      `${passed ? '✅' : '❌'}`,
      `DOB: ${test.dob},`,
      `Measured: ${test.measurement}`,
      `\n  Expected: ${test.expected} months,`,
      `Got: ${result} months`,
      `(${test.reason})`,
      passed ? '' : 'FAILED'
    );
  });
}