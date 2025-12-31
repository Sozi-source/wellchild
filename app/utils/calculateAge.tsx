// utils/calculateAge.ts
import { Timestamp } from "firebase/firestore";

export function calculateAgeInMonths(dob: string | Date | Timestamp): number {
  if (!dob) return 0;

  let birthDate: Date;

  // Firestore Timestamp
  if (dob instanceof Timestamp) {
    birthDate = dob.toDate();
  }
  // JS Date
  else if (dob instanceof Date) {
    birthDate = dob;
  }
  // ISO string "YYYY-MM-DD"
  else {
    birthDate = new Date(dob);
  }

  if (isNaN(birthDate.getTime())) {
    console.error("Invalid DOB:", dob);
    return 0;
  }

  const today = new Date();

  let months =
    (today.getFullYear() - birthDate.getFullYear()) * 12 +
    (today.getMonth() - birthDate.getMonth());

  // WHO-compliant completed months
  if (today.getDate() < birthDate.getDate()) {
    months -= 1;
  }

  return Math.max(months, 0);
}
