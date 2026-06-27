import { create } from 'zustand';
import type { Child, Vaccine, FAQItem, HealthAlert, VaccineStatus, User, Hospital, VaccineHospitals } from '../types';
import { apiFetch } from '../utils/api';
import { initialFAQs } from '../data/faqs';

export interface VaccineStore {
  children: Child[];
  selectedChildId: string;
  vaccines: Record<string, Vaccine[]>;
  faqs: FAQItem[];
  alerts: Record<string, HealthAlert[]>;
  activeTab: 'dashboard' | 'calendar' | 'history' | 'faq' | 'chatbot' | 'map';

  // Hospital State
  hospitals: Hospital[];
  hospitalsLoading: boolean;
  selectedHospitalIdForMap: number | null;
  setSelectedHospitalIdForMap: (id: number | null) => void;

  // Auth State
  currentUser: User | null;
  isLoggedIn: boolean;
  authError: string | null;
  isLoading: boolean;

  // Actions
  setSelectedChildId: (id: string) => void;
  updateChildStats: (childId: string, weightKg: number, heightCm: number) => Promise<boolean>;
  toggleVaccineStatus: (childId: string, vaccineId: string, status: VaccineStatus, completedDate?: string) => Promise<boolean>;
  rescheduleVaccine: (childId: string, vaccineId: string, newDate: string) => Promise<{ success: boolean; message?: string }>;
  addVaccineNote: (childId: string, vaccineId: string, note: string) => void;
  setActiveTab: (tab: 'dashboard' | 'calendar' | 'history' | 'faq' | 'chatbot' | 'map') => void;
  dismissAlert: (childId: string, alertId: string) => Promise<void>;
  triggerTestNotification: () => Promise<{ success: boolean; message: string }>;

  // Hospital Actions
  fetchHospitals: () => Promise<void>;
  fetchVaccineHospitals: (vaccineId: string) => Promise<VaccineHospitals>;

  // Auth Actions
  login: (email: string, idNumber: string) => Promise<boolean>;
  signup: (signupData: { fullName: string; email: string; idNumber: string; childName: string; birthDate: string; gender: 'male' | 'female' }) => Promise<boolean>;
  logout: () => void;
  clearAuthError: () => void;
  checkAuth: () => Promise<void>;
  addChild: (childData: { firstName: string; lastName: string; gender: 'Male' | 'Female'; birthDate: string }) => Promise<boolean>;
  fetchSchedule: (childId: string) => Promise<void>;
}

export const useVaccineStore = create<VaccineStore>((set, get) => {
  // Helper to fetch and load a child's schedule
  const fetchChildSchedule = async (childId: string) => {
    try {
      const response = await apiFetch(`/calendar?childId=${childId}`);
      const mapped = response.data.map((r: any) => {
        let status: VaccineStatus = 'upcoming';
        if (r.status === 'Completed') {
          status = 'completed';
        } else if (r.status === 'Pending' || r.status === 'Missed') {
          status = 'overdue';
        }

        return {
          id: r.id.toString(),
          vaccineId: r.vaccine.id.toString(),
          name: r.vaccine.vaccineName,
          code: r.vaccine.vaccineName.split(' ')[0] || 'VAC',
          description: r.vaccine.description || '',
          ageGroup: r.vaccine.recommendedAgeMonths === 0 ? 'عند الولادة' : `${r.vaccine.recommendedAgeMonths} شهراً`,
          targetAgeMonths: r.vaccine.recommendedAgeMonths,
          scheduledDate: r.scheduledDate,
          completedDate: r.takenDate || undefined,
          status,
          availability: r.vaccine.availability,
          intervalRules: r.vaccine.intervalRules || '',
          safeWindowStartDays: r.vaccine.safeWindowStartDays,
          safeWindowEndDays: r.vaccine.safeWindowEndDays,
        };
      });

      set((state) => ({
        vaccines: { ...state.vaccines, [childId]: mapped }
      }));
    } catch (error) {
      console.error('Failed to fetch child schedule:', error);
    }
  };

  // Helper to fetch in-app notifications and map to HealthAlerts
  const fetchUserNotifications = async () => {
    try {
      const response = await apiFetch('/notifications');
      const mappedAlerts: Record<string, HealthAlert[]> = {};

      response.data.forEach((n: any) => {
        // Map backend notifications to HealthAlert
        const alert: HealthAlert = {
          id: n.id.toString(),
          type: n.isRead ? 'info' : (n.title.includes('متأخر') || n.title.includes('تحذير') ? 'urgent' : 'warning'),
          title: n.title,
          message: n.body,
          date: n.createdAt.split('T')[0],
          vaccineId: n.childVaccineId ? n.childVaccineId.toString() : undefined,
        };

        // Put notifications in active child's bucket for display
        const activeChildId = get().selectedChildId;
        if (activeChildId) {
          if (!mappedAlerts[activeChildId]) {
            mappedAlerts[activeChildId] = [];
          }
          mappedAlerts[activeChildId].push(alert);
        }
      });

      set({ alerts: mappedAlerts });
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    }
  };

  return {
    children: [],
    selectedChildId: '',
    vaccines: {},
    faqs: initialFAQs,
    alerts: {},
    hospitals: [],
    hospitalsLoading: false,
    activeTab: 'dashboard',
    currentUser: null,
    isLoggedIn: false,
    authError: null,
    selectedHospitalIdForMap: null,
    setSelectedHospitalIdForMap: (id) => set({ selectedHospitalIdForMap: id }),
    isLoading: false,

    setSelectedChildId: (id) => {
      set({ selectedChildId: id });
      if (id) {
        fetchChildSchedule(id);
        fetchUserNotifications();
      }
    },

    setActiveTab: (tab) => set({ activeTab: tab }),

    clearAuthError: () => set({ authError: null }),

    // Auth Operations
    login: async (email, password) => {
      set({ isLoading: true, authError: null });
      try {
        const response = await apiFetch('/auth/login', {
          method: 'POST',
          body: JSON.stringify({ email, password }),
        });

        localStorage.setItem('tefli_token', response.token);
        
        const user: User = {
          id: response.user.id.toString(),
          fullName: response.user.fullName,
          name: response.user.fullName,
          email: response.user.email,
          phone: response.user.phone,
        };

        set({ currentUser: user, isLoggedIn: true, isLoading: false });

        // Load children data
        const childrenResponse = await apiFetch('/children');
        const childrenData: Child[] = childrenResponse.data.map((c: any) => ({
          id: c.id.toString(),
          name: `${c.firstName} ${c.lastName}`.trim(),
          dateOfBirth: c.birthDate,
          weightKg: c.weight ? Number(c.weight) : undefined,
          heightCm: c.height ? Number(c.height) : undefined,
          gender: c.gender.toLowerCase() === 'female' ? 'female' : 'male',
        }));

        set({ children: childrenData });
        
        if (childrenData.length > 0) {
          const firstChildId = childrenData[0].id;
          set({ selectedChildId: firstChildId });
          await fetchChildSchedule(firstChildId);
          await fetchUserNotifications();
        }

        return true;
      } catch (error: any) {
        set({ authError: error.message, isLoading: false });
        return false;
      }
    },

    signup: async (signupData) => {
      set({ isLoading: true, authError: null });
      try {
        // Sign up expects childName and birthDate to create the first child atomically
        const response = await apiFetch('/auth/register', {
          method: 'POST',
          body: JSON.stringify({
            fullName: signupData.fullName,
            email: signupData.email,
            password: signupData.idNumber, // uses ID number field as password input
            childName: signupData.childName,
            birthDate: signupData.birthDate,
            gender: signupData.gender === 'female' ? 'Female' : 'Male',
          }),
        });

        localStorage.setItem('tefli_token', response.token);
        
        const user: User = {
          id: response.user.id.toString(),
          fullName: response.user.fullName,
          name: response.user.fullName,
          email: response.user.email,
          phone: response.user.phone,
        };

        set({ currentUser: user, isLoggedIn: true, isLoading: false });

        const firstChild: Child = {
          id: response.child.id.toString(),
          name: `${response.child.firstName} ${response.child.lastName}`.trim(),
          dateOfBirth: response.child.birthDate,
          gender: response.child.gender?.toLowerCase() === 'female' ? 'female' : 'male',
        };

        set({ children: [firstChild], selectedChildId: firstChild.id });
        await fetchChildSchedule(firstChild.id);
        await fetchUserNotifications();

        return true;
      } catch (error: any) {
        set({ authError: error.message, isLoading: false });
        return false;
      }
    },

    logout: () => {
      localStorage.removeItem('tefli_token');
      set({
        currentUser: null,
        isLoggedIn: false,
        children: [],
        selectedChildId: '',
        vaccines: {},
        alerts: {},
        activeTab: 'dashboard',
        authError: null,
      });
    },

    checkAuth: async () => {
      const token = localStorage.getItem('tefli_token');
      if (!token) return;

      try {
        // Try getting user's children. If it succeeds, user is authenticated
        const childrenResponse = await apiFetch('/children');
        
        // Setup user details from the backend profile
        const profileResponse = await apiFetch('/users/profile');
        const userData = profileResponse.data || profileResponse;

        const user: User = {
          id: userData.id.toString(),
          fullName: userData.fullName,
          name: userData.fullName,
          email: userData.email,
        };

        const childrenData: Child[] = childrenResponse.data.map((c: any) => ({
          id: c.id.toString(),
          name: `${c.firstName} ${c.lastName}`.trim(),
          dateOfBirth: c.birthDate,
          weightKg: c.weight ? Number(c.weight) : undefined,
          heightCm: c.height ? Number(c.height) : undefined,
          gender: c.gender.toLowerCase() === 'female' ? 'female' : 'male',
        }));

        set({ currentUser: user, isLoggedIn: true, children: childrenData });

        if (childrenData.length > 0) {
          const activeId = get().selectedChildId || childrenData[0].id;
          set({ selectedChildId: activeId });
          await fetchChildSchedule(activeId);
          await fetchUserNotifications();
        }
      } catch (error) {
        console.error('Check auth failed, logging out:', error);
        localStorage.removeItem('tefli_token');
      }
    },

    // Children Operations
    addChild: async (childData) => {
      try {
        const response = await apiFetch('/children', {
          method: 'POST',
          body: JSON.stringify(childData),
        });

        // Re-fetch all children to ensure synchrony
        const childrenResponse = await apiFetch('/children');
        const childrenData: Child[] = childrenResponse.data.map((c: any) => ({
          id: c.id.toString(),
          name: `${c.firstName} ${c.lastName}`.trim(),
          dateOfBirth: c.birthDate,
          weightKg: c.weight ? Number(c.weight) : undefined,
          heightCm: c.height ? Number(c.height) : undefined,
          gender: c.gender.toLowerCase() === 'female' ? 'female' : 'male',
        }));

        // Set state and select the newly created child
        const newChildId = response.data.id.toString();
        set({ children: childrenData, selectedChildId: newChildId });

        await fetchChildSchedule(newChildId);
        await fetchUserNotifications();

        return true;
      } catch (error) {
        console.error('Failed to add child:', error);
        return false;
      }
    },

    updateChildStats: async (childId, weightKg, heightCm) => {
      try {
        await apiFetch(`/children/${childId}`, {
          method: 'PUT',
          body: JSON.stringify({
            weight: weightKg,
            height: heightCm,
          }),
        });

        set((state) => ({
          children: state.children.map((c) =>
            c.id === childId ? { ...c, weightKg, heightCm } : c
          ),
        }));

        return true;
      } catch (error) {
        console.error('Failed to update child stats:', error);
        return false;
      }
    },

    // Vaccination Operations
    toggleVaccineStatus: async (childId, vaccineId, status, completedDate) => {
      try {
        if (status === 'completed') {
          // Mark as taken
          await apiFetch(`/child-vaccines/${vaccineId}/mark-taken`, {
            method: 'PATCH',
            body: JSON.stringify({
              takenDate: completedDate || new Date().toISOString().split('T')[0],
            }),
          });
        } else {
          // Reset status to upcoming/pending (resets takenDate to null on backend)
          await apiFetch(`/child-vaccines/${vaccineId}/status`, {
            method: 'PATCH',
            body: JSON.stringify({
              status: 'Upcoming',
            }),
          });
        }

        // Reload schedule and notifications
        await fetchChildSchedule(childId);
        await fetchUserNotifications();
        return true;
      } catch (error) {
        console.error('Failed to toggle vaccine status:', error);
        return false;
      }
    },

    rescheduleVaccine: async (childId, vaccineId, newDate) => {
      try {
        const response = await apiFetch(`/child-vaccines/${vaccineId}/reschedule`, {
          method: 'PATCH',
          body: JSON.stringify({ newDate }),
        });

        // Reload schedule and notifications
        await fetchChildSchedule(childId);
        await fetchUserNotifications();

        return { success: true, message: response.message };
      } catch (error: any) {
        console.error('Failed to reschedule vaccine:', error.message);
        return { success: false, message: error.message };
      }
    },

    addVaccineNote: (childId, vaccineId, note) => {
      set((state) => ({
        vaccines: {
          ...state.vaccines,
          [childId]: (state.vaccines[childId] || []).map((v) =>
            v.id === vaccineId ? { ...v, notes: note } : v
          ),
        },
      }));
    },

    dismissAlert: async (childId, alertId) => {
      try {
        await apiFetch(`/notifications/${alertId}`, {
          method: 'DELETE',
        });

        set((state) => ({
          alerts: {
            ...state.alerts,
            [childId]: (state.alerts[childId] || []).filter((a) => a.id !== alertId),
          },
        }));
      } catch (error) {
        console.error('Failed to dismiss alert:', error);
      }
    },

    triggerTestNotification: async () => {
      try {
        const response = await apiFetch('/notifications/test', {
          method: 'POST',
        });

        // Reload notifications to show in UI
        await fetchUserNotifications();

        return { success: true, message: response.message };
      } catch (error: any) {
        console.error('Failed to trigger test notification:', error.message);
        return { success: false, message: error.message };
      }
    },

    fetchSchedule: async (childId: string) => {
      await fetchChildSchedule(childId);
    },

    fetchHospitals: async () => {
      if (get().hospitalsLoading) return;
      set({ hospitalsLoading: true });
      try {
        const response = await apiFetch('/hospitals/city/amman');
        set({ hospitals: response.data, hospitalsLoading: false });
      } catch (error) {
        console.error('Failed to fetch hospitals:', error);
        set({ hospitalsLoading: false });
      }
    },

    fetchVaccineHospitals: async (vaccineId: string): Promise<VaccineHospitals> => {
      try {
        const response = await apiFetch(`/vaccines/${vaccineId}/hospitals`);
        const result: VaccineHospitals = {
          all: response.data.all || [],
          government: response.data.government || [],
          private: response.data.private || [],
        };

        // Cache in vaccine entry
        set((state) => ({
          vaccines: Object.fromEntries(
            Object.entries(state.vaccines).map(([childId, vacs]) => [
              childId,
              vacs.map((v) =>
                v.vaccineId === vaccineId ? { ...v, hospitals: result } : v
              ),
            ])
          ),
        }));

        return result;
      } catch (error) {
        console.error('Failed to fetch vaccine hospitals:', error);
        return { all: [], government: [], private: [] };
      }
    },
  };
});
