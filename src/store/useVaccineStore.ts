import { create } from 'zustand';
import type { Child, Vaccine, FAQItem, HealthAlert, VaccineStatus, User } from '../types';

interface VaccineStore {
  children: Child[];
  selectedChildId: string;
  vaccines: Record<string, Vaccine[]>;
  faqs: FAQItem[];
  alerts: Record<string, HealthAlert[]>;
  activeTab: 'dashboard' | 'calendar' | 'history' | 'faq' | 'chatbot';

  // Auth State
  currentUser: User | null;
  isLoggedIn: boolean;
  authError: string | null;
  registeredUsers: User[];

  // Actions
  setSelectedChildId: (id: string) => void;
  updateChildStats: (childId: string, weightKg: number, heightCm: number) => void;
  toggleVaccineStatus: (childId: string, vaccineId: string, status: VaccineStatus, completedDate?: string) => void;
  rescheduleVaccine: (childId: string, vaccineId: string, newDate: string) => void;
  addVaccineNote: (childId: string, vaccineId: string, note: string) => void;
  setActiveTab: (tab: 'dashboard' | 'calendar' | 'history' | 'faq' | 'chatbot') => void;
  addAlert: (childId: string, alert: Omit<HealthAlert, 'id'>) => void;
  dismissAlert: (childId: string, alertId: string) => void;

  // Auth Actions
  login: (email: string, idNumber: string) => boolean;
  signup: (user: User) => boolean;
  logout: () => void;
  clearAuthError: () => void;
}

const initialChildren: Child[] = [
  {
    id: 'child-1',
    name: 'سارة أحمد',
    dateOfBirth: '2025-12-12',
    weightKg: 7.2,
    heightCm: 65,
    gender: 'female',
  },
  {
    id: 'child-2',
    name: 'زيد أحمد',
    dateOfBirth: '2023-04-10',
    weightKg: 14.5,
    heightCm: 96,
    gender: 'male',
  }
];

const initialVaccines: Record<string, Vaccine[]> = {
  'child-1': [
    {
      id: 'v1',
      name: 'السل (BCG)',
      code: 'BCG',
      description: 'يحمي من التهاب السحايا السلي والسل المنتشر.',
      ageGroup: 'عند الولادة',
      targetAgeMonths: 0,
      scheduledDate: '2025-12-12',
      completedDate: '2025-12-12',
      status: 'completed',
      notes: 'أُعطيَ في مستشفى الجامعة الأردنية.',
      administratorName: 'د. خالد المطيري',
      clinicName: 'مركز صحة العقبة',
    },
    {
      id: 'v2',
      name: 'التهاب الكبد B - الجرعة 1',
      code: 'HepB-1',
      description: 'يحمي من الإصابة بفيروس التهاب الكبد B.',
      ageGroup: 'عند الولادة',
      targetAgeMonths: 0,
      scheduledDate: '2025-12-12',
      completedDate: '2025-12-12',
      status: 'completed',
      administratorName: 'د. خالد المطيري',
      clinicName: 'مركز صحة العقبة',
    },
    {
      id: 'v3',
      name: 'فيروس الروتا - الجرعة 1',
      code: 'Rota-1',
      description: 'لقاح فموي يحمي من الإسهال الشديد الناجم عن فيروس الروتا.',
      ageGroup: 'شهران',
      targetAgeMonths: 2,
      scheduledDate: '2026-02-12',
      completedDate: '2026-02-14',
      status: 'completed',
      administratorName: 'د. رانيا جراح',
      clinicName: 'عيادة أطفال عمان',
    },
    {
      id: 'v4',
      name: 'اللقاح السداسي - الجرعة 1',
      code: 'DTaP-IPV-Hib-HepB-1',
      description: 'يحمي من الدفتيريا والتيتانوس والسعال الديكي وشلل الأطفال والمستدمية النزلية والتهاب الكبد B.',
      ageGroup: 'شهران',
      targetAgeMonths: 2,
      scheduledDate: '2026-02-12',
      completedDate: '2026-02-14',
      status: 'completed',
      administratorName: 'د. رانيا جراح',
      clinicName: 'عيادة أطفال عمان',
    },
    {
      id: 'v5',
      name: 'المكورات الرئوية (PCV13) - الجرعة 1',
      code: 'PCV-1',
      description: 'يحمي من الالتهاب الرئوي والتهاب السحايا الناجم عن المكورات الرئوية.',
      ageGroup: 'شهران',
      targetAgeMonths: 2,
      scheduledDate: '2026-02-12',
      completedDate: '2026-02-14',
      status: 'completed',
      administratorName: 'د. رانيا جراح',
      clinicName: 'عيادة أطفال عمان',
    },
    {
      id: 'v6',
      name: 'اللقاح السداسي - الجرعة 2',
      code: 'DTaP-IPV-Hib-HepB-2',
      description: 'الجرعة الثانية للحماية من الأمراض الستة الرئيسية للأطفال.',
      ageGroup: '٤ أشهر',
      targetAgeMonths: 4,
      scheduledDate: '2026-04-12',
      completedDate: '2026-04-12',
      status: 'completed',
      administratorName: 'د. خالد المطيري',
      clinicName: 'مركز صحة العقبة',
    },
    {
      id: 'v7',
      name: 'المكورات الرئوية (PCV13) - الجرعة 2',
      code: 'PCV-2',
      description: 'الجرعة التنشيطية الثانية للوقاية من المكورات الرئوية.',
      ageGroup: '٤ أشهر',
      targetAgeMonths: 4,
      scheduledDate: '2026-04-12',
      completedDate: '2026-04-12',
      status: 'completed',
      administratorName: 'د. خالد المطيري',
      clinicName: 'مركز صحة العقبة',
    },
    {
      id: 'v8',
      name: 'فيروس الروتا - الجرعة 2',
      code: 'Rota-2',
      description: 'الجرعة الفموية الثانية للوقاية من الروتا.',
      ageGroup: '٤ أشهر',
      targetAgeMonths: 4,
      scheduledDate: '2026-04-12',
      completedDate: '2026-04-12',
      status: 'completed',
      administratorName: 'د. خالد المطيري',
      clinicName: 'مركز صحة العقبة',
    },
    {
      id: 'v9',
      name: 'اللقاح السداسي - الجرعة 3 (منشط السعال الديكي)',
      code: 'DTaP-IPV-Hib-HepB-3',
      description: 'الجرعة الثالثة. مهمة للمناعة طويلة الأمد ضد السعال الديكي وشلل الأطفال.',
      ageGroup: '٦ أشهر',
      targetAgeMonths: 6,
      scheduledDate: '2026-07-12',
      status: 'upcoming',
      notes: 'الموعد الساعة 10:00 صباحاً. أحضري الدفتر الصحي.',
    },
    {
      id: 'v10',
      name: 'المكورات الرئوية (PCV13) - الجرعة 3',
      code: 'PCV-3',
      description: 'الجرعة الثالثة للوقاية من المكورات الرئوية.',
      ageGroup: '٦ أشهر',
      targetAgeMonths: 6,
      scheduledDate: '2026-06-15',
      status: 'overdue',
      notes: 'تأجّل الموعد في 15 يونيو بسبب زكام خفيف. يرجى إعادة الجدولة فوراً.',
    },
    {
      id: 'v11',
      name: 'لقاح الحصبة',
      code: 'Measles',
      description: 'تحصين ضد الحصبة بمستضد واحد.',
      ageGroup: '٩ أشهر',
      targetAgeMonths: 9,
      scheduledDate: '2026-09-12',
      status: 'upcoming',
    },
    {
      id: 'v12',
      name: 'الثلاثي الفيروسي MMR - الجرعة 1',
      code: 'MMR-1',
      description: 'حماية ثلاثية ضد الحصبة والنكاف والحصبة الألمانية.',
      ageGroup: '١٢ شهراً',
      targetAgeMonths: 12,
      scheduledDate: '2026-12-12',
      status: 'upcoming',
    },
    {
      id: 'v13',
      name: 'المكورات السحائية ACWY',
      code: 'MenACWY',
      description: 'يحمي من التهاب السحايا البكتيري الناجم عن أنواع A و C و W و Y.',
      ageGroup: '١٢ شهراً',
      targetAgeMonths: 12,
      scheduledDate: '2026-12-12',
      status: 'upcoming',
    },
    {
      id: 'v14',
      name: 'جدري الماء (Varicella) - الجرعة 1',
      code: 'Varicella-1',
      description: 'يحمي من فيروس الحماق النطاقي (جدري الماء).',
      ageGroup: '١٨ شهراً',
      targetAgeMonths: 18,
      scheduledDate: '2027-06-12',
      status: 'upcoming',
    }
  ],
  'child-2': [
    {
      id: 'v2-1',
      name: 'السل (BCG)',
      code: 'BCG',
      description: 'يحمي من التهاب السحايا السلي.',
      ageGroup: 'عند الولادة',
      targetAgeMonths: 0,
      scheduledDate: '2023-04-10',
      completedDate: '2023-04-10',
      status: 'completed',
    },
    {
      id: 'v2-2',
      name: 'التهاب الكبد B - الجرعة 1',
      code: 'HepB-1',
      description: 'الحماية من التهاب الكبد B.',
      ageGroup: 'عند الولادة',
      targetAgeMonths: 0,
      scheduledDate: '2023-04-10',
      completedDate: '2023-04-10',
      status: 'completed',
    },
    {
      id: 'v2-3',
      name: 'اللقاح السداسي - الجرعة 1',
      code: 'DTaP-IPV-Hib-HepB-1',
      description: 'الحماية السداسية الكاملة.',
      ageGroup: 'شهران',
      targetAgeMonths: 2,
      scheduledDate: '2023-06-10',
      completedDate: '2023-06-12',
      status: 'completed',
    },
    {
      id: 'v2-4',
      name: 'اللقاح السداسي - الجرعة 2',
      code: 'DTaP-IPV-Hib-HepB-2',
      description: 'الحماية السداسية الكاملة.',
      ageGroup: '٤ أشهر',
      targetAgeMonths: 4,
      scheduledDate: '2023-08-10',
      completedDate: '2023-08-10',
      status: 'completed',
    },
    {
      id: 'v2-5',
      name: 'اللقاح السداسي - الجرعة 3',
      code: 'DTaP-IPV-Hib-HepB-3',
      description: 'الحماية السداسية الكاملة.',
      ageGroup: '٦ أشهر',
      targetAgeMonths: 6,
      scheduledDate: '2023-10-10',
      completedDate: '2023-10-10',
      status: 'completed',
    },
    {
      id: 'v2-6',
      name: 'الثلاثي الفيروسي MMR - الجرعة 1',
      code: 'MMR-1',
      description: 'الحصبة والنكاف والحصبة الألمانية.',
      ageGroup: '١٢ شهراً',
      targetAgeMonths: 12,
      scheduledDate: '2024-04-10',
      completedDate: '2024-04-12',
      status: 'completed',
    },
    {
      id: 'v2-7',
      name: 'جدري الماء - الجرعة 1',
      code: 'Varicella-1',
      description: 'الوقاية من جدري الماء.',
      ageGroup: '١٨ شهراً',
      targetAgeMonths: 18,
      scheduledDate: '2024-10-10',
      completedDate: '2024-10-10',
      status: 'completed',
    },
    {
      id: 'v2-8',
      name: 'الثلاثي الفيروسي MMR - الجرعة 2',
      code: 'MMR-2',
      description: 'الجرعة التنشيطية الثانية.',
      ageGroup: '٤-٦ سنوات',
      targetAgeMonths: 48,
      scheduledDate: '2027-04-10',
      status: 'upcoming',
    }
  ]
};

const initialAlerts: Record<string, HealthAlert[]> = {
  'child-1': [
    {
      id: 'a1',
      type: 'urgent',
      title: 'تطعيم PCV-3 متأخر',
      message: 'سارة متأخرة في تطعيم المكورات الرئوية PCV-3 منذ 15 يونيو 2026. يرجى تحديد موعد فوراً.',
      date: '2026-06-16',
      vaccineId: 'v10'
    },
    {
      id: 'a2',
      type: 'warning',
      title: 'موعد اللقاح السداسي القادم',
      message: 'الجرعة الثالثة من اللقاح السداسي مجدولة في 12 يوليو 2026 (البرنامج الوطني الأردني للتطعيم).',
      date: '2026-06-25',
      vaccineId: 'v9'
    }
  ],
  'child-2': [
    {
      id: 'a3',
      type: 'info',
      title: 'الجرعة التنشيطية القادمة في 2027',
      message: 'زيد محدّث بجميع تطعيمات مرحلة الطفولة! الجرعة التالية المجدولة (MMR-2) عند بلوغه ٤ سنوات.',
      date: '2025-05-01'
    }
  ]
};

const initialFAQs: FAQItem[] = [
  {
    id: 'faq-1',
    category: 'before',
    question: 'هل يجب أن يكون طفلي بصحة كاملة قبل التطعيم؟',
    answer: 'الأمراض البسيطة كالزكام الخفيف أو الحمى المنخفضة أو السعال الطفيف لا تستدعي عادةً تأجيل التطعيم. أما إذا كان طفلك يعاني من مرض متوسط أو شديد مع حمى أو بدونها، فيُنصح بإعادة جدولة الموعد مع طبيب الأطفال.',
  },
  {
    id: 'faq-2',
    category: 'before',
    question: 'هل يجب إعطاء طفلي مسكنات ألم وقائية قبل الحقنة؟',
    answer: 'لا يُنصح باستخدام مسكنات الألم (كالباراسيتامول أو الإيبوبروفين) بشكل وقائي قبل التطعيم؛ لأنها قد تقلل قليلاً من الاستجابة المناعية لبعض اللقاحات. من الأفضل الانتظار ومراقبة ما إذا أصيب الطفل بحمى أو انزعاج بعد الحقن.',
  },
  {
    id: 'faq-3',
    category: 'before',
    question: 'ما الوثائق التي يجب إحضارها إلى المركز الصحي؟',
    answer: 'احرصي دائماً على إحضار: الدفتر الصحي للطفل (الدفتر الورقي الوطني)، ونسخة من الهوية الوطنية أو شهادة الميلاد، وبطاقة التأمين الصحي إن وُجدت. يساعد التتبع الرقمي، لكن الدفتر الورقي ضروري للختم الرسمي.',
  },
  {
    id: 'faq-4',
    category: 'after',
    question: 'كيف أعتني بطفلي بعد التطعيم؟',
    answer: 'احتضني طفلك وواسِيه، وأرضعيه أو أعطِيه الحليب الصناعي بكميات أكبر من المعتاد للترطيب، وضعي قطعة قماش باردة مبللة على موضع الحقن لتخفيف الألم. اتركِيه يرتاح كما يشاء، وراقِبيه لعدة أيام.',
  },
  {
    id: 'faq-5',
    category: 'side-effects',
    question: 'ما هي الآثار الجانبية الشائعة للتطعيمات؟',
    answer: 'تشمل الآثار الجانبية الشائعة: حمى خفيفة، واحمرار وتورم وألم في موضع الحقن، وتهيج خفيف أو نعاس. تزول عادةً خلال 24 إلى 48 ساعة. إذا تجاوزت الحمى 38.5 درجة أو استمرت، استشيري طبيب الأطفال.',
  },
  {
    id: 'faq-6',
    category: 'general',
    question: 'لماذا يجب اتباع جدول التطعيم الأردني الوطني؟',
    answer: 'صُمِّم جدول التطعيم علمياً لحماية الأطفال الرضع في الوقت الذي يكونون فيه أكثر عرضة للمضاعفات الخطيرة المهددة للحياة. يعرّض إهمال التطعيمات أو تأجيلها الأطفال لخطر الأوبئة القابلة للوقاية.',
  }
];

export const useVaccineStore = create<VaccineStore>((set) => ({
  children: initialChildren,
  selectedChildId: 'child-1',
  vaccines: initialVaccines,
  faqs: initialFAQs,
  alerts: initialAlerts,
  activeTab: 'dashboard',

  currentUser: null,
  isLoggedIn: false,
  authError: null,
  registeredUsers: [
    { idNumber: '1234567890', email: 'sara@tifli.jo', name: 'سارة الأحمد' }
  ],

  setSelectedChildId: (id) => set({ selectedChildId: id }),

  login: (email, idNumber) => {
    let success = false;
    set((state) => {
      const user = state.registeredUsers.find(
        (u) => u.email.toLowerCase() === email.toLowerCase() && u.idNumber === idNumber
      );
      if (user) {
        success = true;
        return { currentUser: user, isLoggedIn: true, authError: null };
      } else {
        return { authError: 'البريد الإلكتروني أو رقم الهوية غير صحيح. يرجى المحاولة مرة أخرى.' };
      }
    });
    return success;
  },

  signup: (user) => {
    let success = false;
    set((state) => {
      const exists = state.registeredUsers.some(
        (u) => u.email.toLowerCase() === user.email.toLowerCase() || u.idNumber === user.idNumber
      );
      if (exists) {
        return { authError: 'يوجد حساب بالفعل بهذا البريد الإلكتروني أو رقم الهوية.' };
      }
      success = true;
      return {
        registeredUsers: [...state.registeredUsers, user],
        currentUser: user,
        isLoggedIn: true,
        authError: null,
      };
    });
    return success;
  },

  logout: () => set({ currentUser: null, isLoggedIn: false, authError: null, activeTab: 'dashboard' }),
  clearAuthError: () => set({ authError: null }),

  updateChildStats: (childId, weightKg, heightCm) =>
    set((state) => ({
      children: state.children.map((c) =>
        c.id === childId ? { ...c, weightKg, heightCm } : c
      ),
    })),

  toggleVaccineStatus: (childId, vaccineId, status, completedDate) =>
    set((state) => {
      const childVaccines = state.vaccines[childId] || [];
      const updatedVaccines = childVaccines.map((v) => {
        if (v.id === vaccineId) {
          return {
            ...v,
            status,
            completedDate: status === 'completed' ? completedDate || new Date().toISOString().split('T')[0] : undefined,
          };
        }
        return v;
      });

      let updatedAlerts = state.alerts[childId] || [];
      if (status === 'completed') {
        updatedAlerts = updatedAlerts.filter((a) => a.vaccineId !== vaccineId);
      } else if (status === 'overdue') {
        const vInfo = childVaccines.find((v) => v.id === vaccineId);
        if (vInfo && !updatedAlerts.some((a) => a.vaccineId === vaccineId)) {
          updatedAlerts = [
            ...updatedAlerts,
            {
              id: `alert-${Date.now()}`,
              type: 'urgent',
              title: `تطعيم ${vInfo.code} متأخر`,
              message: `${vInfo.name} متأخر منذ ${vInfo.scheduledDate}. يرجى إعادة الجدولة.`,
              date: new Date().toISOString().split('T')[0],
              vaccineId,
            },
          ];
        }
      }

      return {
        vaccines: { ...state.vaccines, [childId]: updatedVaccines },
        alerts: { ...state.alerts, [childId]: updatedAlerts },
      };
    }),

  rescheduleVaccine: (childId, vaccineId, newDate) =>
    set((state) => {
      const childVaccines = state.vaccines[childId] || [];
      const updatedVaccines = childVaccines.map((v) => {
        if (v.id === vaccineId) {
          const isFuture = new Date(newDate) > new Date();
          return {
            ...v,
            scheduledDate: newDate,
            status: isFuture ? 'upcoming' as const : 'overdue' as const,
          };
        }
        return v;
      });

      let updatedAlerts = state.alerts[childId] || [];
      const vInfo = updatedVaccines.find((v) => v.id === vaccineId);
      if (vInfo) {
        updatedAlerts = updatedAlerts.map((a) => {
          if (a.vaccineId === vaccineId) {
            const isFuture = new Date(newDate) > new Date();
            return {
              ...a,
              type: isFuture ? ('warning' as const) : ('urgent' as const),
              title: isFuture ? `موعد ${vInfo.code} القادم` : `تطعيم ${vInfo.code} متأخر`,
              message: isFuture
                ? `${vInfo.name} مجدول في ${newDate}.`
                : `${vInfo.name} متأخر منذ ${newDate}. يرجى إعادة الجدولة.`,
            };
          }
          return a;
        });
      }

      return {
        vaccines: { ...state.vaccines, [childId]: updatedVaccines },
        alerts: { ...state.alerts, [childId]: updatedAlerts },
      };
    }),

  addVaccineNote: (childId, vaccineId, note) =>
    set((state) => ({
      vaccines: {
        ...state.vaccines,
        [childId]: (state.vaccines[childId] || []).map((v) =>
          v.id === vaccineId ? { ...v, notes: note } : v
        ),
      },
    })),

  setActiveTab: (tab) => set({ activeTab: tab }),

  addAlert: (childId, alert) =>
    set((state) => ({
      alerts: {
        ...state.alerts,
        [childId]: [
          ...(state.alerts[childId] || []),
          { ...alert, id: `alert-${Date.now()}` },
        ],
      },
    })),

  dismissAlert: (childId, alertId) =>
    set((state) => ({
      alerts: {
        ...state.alerts,
        [childId]: (state.alerts[childId] || []).filter((a) => a.id !== alertId),
      },
    })),
}));
