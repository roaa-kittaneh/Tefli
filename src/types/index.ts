export type VaccineStatus = 'completed' | 'upcoming' | 'overdue';

export interface Vaccine {
  id: string;
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
  idNumber: string;
  email: string;
  name: string;
}

export interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: 'before' | 'after' | 'side-effects' | 'general';
}

export interface HealthAlert {
  id: string;
  type: 'urgent' | 'warning' | 'info';
  title: string;
  message: string;
  date: string;
  vaccineId?: string;
}
