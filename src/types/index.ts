export type VaccineStatus = 'completed' | 'upcoming' | 'overdue';

export interface Hospital {
  id: number;
  name: string;
  type: 'Government' | 'Private';
  city: string;
  latitude?: number;
  longitude?: number;
  address?: string;
  phone?: string;
  isVaccinationCenter: boolean;
  status: 'Active' | 'Inactive';
  vaccines?: VaccineBasic[];
}

export interface VaccineBasic {
  id: number;
  vaccineName: string;
  description?: string;
  recommendedAgeMonths: number;
  doseNumber: number;
  availability: 'Government' | 'Private' | 'Both';
}

export interface VaccineHospitals {
  all: Hospital[];
  government: Hospital[];
  private: Hospital[];
}

export interface Vaccine {
  id: string; // childVaccineId
  vaccineId: string; // raw vaccineId from vaccines table
  name: string;
  code: string;
  description: string;
  ageGroup: string;
  targetAgeMonths: number;
  scheduledDate: string;
  completedDate?: string;
  status: VaccineStatus;
  notes?: string;
  sideEffects?: string[];
  administratorName?: string;
  clinicName?: string;
  availability?: 'Government' | 'Private' | 'Both';
  intervalRules?: string;
  safeWindowStartDays?: number;
  safeWindowEndDays?: number;
  hospitals?: VaccineHospitals;
}

export interface Child {
  id: string;
  name: string;
  dateOfBirth: string;
  weightKg?: number;
  heightCm?: number;
  gender: 'male' | 'female';
}

export interface User {
  id: string;
  fullName: string;
  name: string;
  email: string;
  phone?: string;
}

export interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: 'before' | 'after' | 'side-effects' | 'general';
  source?: string;
}

export interface HealthAlert {
  id: string;
  type: 'urgent' | 'warning' | 'info';
  title: string;
  message: string;
  date: string;
  vaccineId?: string;
}
