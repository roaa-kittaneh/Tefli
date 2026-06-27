'use strict';

const bcrypt = require('bcryptjs');

module.exports = {
  async up(queryInterface, Sequelize) {
    const salt = await bcrypt.genSalt(10);
    const adminPassword = await bcrypt.hash('admin123', salt);
    const parentPassword = await bcrypt.hash('1234567890', salt); // Default ID as password to match user experience

    // 1. Seed Users
    const users = await queryInterface.bulkInsert('users', [
      {
        fullName: 'المشرف الرئيسي',
        email: 'admin@tifli.jo',
        password: adminPassword,
        phone: '0790000000',
        role: 'Admin',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        fullName: 'سارة الأحمد',
        email: 'sara@tifli.jo',
        password: parentPassword,
        phone: '0791234567',
        role: 'Parent',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ], { returning: true });

    // 2. Seed Vaccines
    const vaccines = await queryInterface.bulkInsert('vaccines', [
      {
        vaccineName: 'السل (BCG)',
        description: 'يحمي من التهاب السحايا السلي والسل المنتشر.',
        recommendedAgeMonths: 0,
        doseNumber: 1,
        availability: 'Government',
        intervalRules: 'يُعطى كجرعة واحدة عند الولادة أو في أقرب وقت ممكن. لا يتطلب جرعة منشطة.',
        safeWindowStartDays: 0,
        safeWindowEndDays: 30,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        vaccineName: 'التهاب الكبد البائي (HepB - الجرعة 1)',
        description: 'يحمي من الإصابة بفيروس التهاب الكبد B.',
        recommendedAgeMonths: 0,
        doseNumber: 1,
        availability: 'Government',
        intervalRules: 'الجرعة الأولى عند الولادة خلال أول 24 ساعة، تليها الجرعة الثانية كجزء من اللقاح السداسي في عمر شهرين.',
        safeWindowStartDays: 0,
        safeWindowEndDays: 30,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        vaccineName: 'اللقاح السداسي (الجرعة 1)',
        description: 'يحمي من الدفتيريا والتيتانوس والسعال الديكي وشلل الأطفال والمستدمية النزلية والتهاب الكبد البائي.',
        recommendedAgeMonths: 2,
        doseNumber: 1,
        availability: 'Government',
        intervalRules: 'الجرعة الأولى في عمر شهرين. يجب أن يفصل بين الجرعات 4 أسابيع على الأقل.',
        safeWindowStartDays: -7,
        safeWindowEndDays: 45,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        vaccineName: 'المكورات الرئوية (PCV13 - الجرعة 1)',
        description: 'يحمي من الالتهاب الرئوي والتهاب السحايا الناجم عن المكورات الرئوية.',
        recommendedAgeMonths: 2,
        doseNumber: 1,
        availability: 'Both',
        intervalRules: 'الجرعة الأولى في عمر شهرين. تفصل 4-8 أسابيع بين الجرعات.',
        safeWindowStartDays: -7,
        safeWindowEndDays: 45,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        vaccineName: 'فيروس الروتا (الجرعة 1)',
        description: 'لقاح فموي يحمي من الإسهال الشديد الناجم عن فيروس الروتا.',
        recommendedAgeMonths: 2,
        doseNumber: 1,
        availability: 'Private',
        intervalRules: 'يجب إعطاء الجرعة الأولى قبل عمر 15 أسبوعاً كحد أقصى للوقاية من النزلات المعوية.',
        safeWindowStartDays: -7,
        safeWindowEndDays: 15,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        vaccineName: 'اللقاح السداسي (الجرعة 2)',
        description: 'الجرعة الثانية للوقاية من الأمراض الستة الرئيسية للأطفال.',
        recommendedAgeMonths: 4,
        doseNumber: 2,
        availability: 'Government',
        intervalRules: 'الجرعة الثانية في عمر 4 أشهر. يجب أن تكون هناك 4 أسابيع على الأقل بعد الجرعة الأولى.',
        safeWindowStartDays: -7,
        safeWindowEndDays: 45,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        vaccineName: 'المكورات الرئوية (PCV13 - الجرعة 2)',
        description: 'الجرعة الثانية للوقاية من المكورات الرئوية.',
        recommendedAgeMonths: 4,
        doseNumber: 2,
        availability: 'Both',
        intervalRules: 'الجرعة الثانية في عمر 4 أشهر. يجب أن تكون هناك 4 أسابيع على الأقل بعد الجرعة الأولى.',
        safeWindowStartDays: -7,
        safeWindowEndDays: 45,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        vaccineName: 'فيروس الروتا (الجرعة 2)',
        description: 'الجرعة الثانية للوقاية من فيروس الروتا.',
        recommendedAgeMonths: 4,
        doseNumber: 2,
        availability: 'Private',
        intervalRules: 'الجرعة الثانية والأخيرة في عمر 4 أشهر. يجب إكمال السلسلة قبل عمر 8 أشهر.',
        safeWindowStartDays: -7,
        safeWindowEndDays: 30,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        vaccineName: 'اللقاح السداسي (الجرعة 3)',
        description: 'الجرعة الثالثة والمهمة لبناء مناعة طويلة الأجل.',
        recommendedAgeMonths: 6,
        doseNumber: 3,
        availability: 'Government',
        intervalRules: 'الجرعة الثالثة في عمر 6 أشهر لتأمين مناعة كاملة طويلة الأمد.',
        safeWindowStartDays: -7,
        safeWindowEndDays: 45,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        vaccineName: 'المكورات الرئوية (PCV13 - الجرعة 3)',
        description: 'الجرعة الثالثة للوقاية من المكورات الرئوية.',
        recommendedAgeMonths: 6,
        doseNumber: 3,
        availability: 'Both',
        intervalRules: 'الجرعة الثالثة والمنشطة للوقاية من بكتيريا المكورات الرئوية.',
        safeWindowStartDays: -7,
        safeWindowEndDays: 45,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        vaccineName: 'لقاح الحصبة',
        description: 'تحصين ضد الحصبة المفرة.',
        recommendedAgeMonths: 9,
        doseNumber: 1,
        availability: 'Government',
        intervalRules: 'يُعطى كجرعة منفردة في عمر 9 أشهر للتحصين الأولي ضد الحصبة.',
        safeWindowStartDays: -7,
        safeWindowEndDays: 45,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        vaccineName: 'الثلاثي الفيروسي (MMR - الجرعة 1)',
        description: 'حماية ثلاثية ضد الحصبة والنكاف والحصبة الألمانية.',
        recommendedAgeMonths: 12,
        doseNumber: 1,
        availability: 'Government',
        intervalRules: 'الجرعة الأولى في عمر سنة (12 شهراً). تحمي ضد الحصبة والنكاف والحصبة الألمانية.',
        safeWindowStartDays: -7,
        safeWindowEndDays: 60,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        vaccineName: 'المكورات السحائية ACWY',
        description: 'يحمي من التهاب السحايا البكتيري الناجم عن الأنواع السحائية A, C, W, Y.',
        recommendedAgeMonths: 12,
        doseNumber: 1,
        availability: 'Government',
        intervalRules: 'يُعطى في عمر سنة كجرعة واحدة للوقاية من الحمى الشوكية البكتيرية.',
        safeWindowStartDays: -7,
        safeWindowEndDays: 60,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        vaccineName: 'جدري الماء (Varicella - الجرعة 1)',
        description: 'يحمي من فيروس جدري الماء (الحماق).',
        recommendedAgeMonths: 18,
        doseNumber: 1,
        availability: 'Private',
        intervalRules: 'يُعطى في عمر 18 شهراً كجرعة أولى للتحصين ضد العنقز (جدري الماء).',
        safeWindowStartDays: -7,
        safeWindowEndDays: 60,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('users', null, {});
    await queryInterface.bulkDelete('vaccines', null, {});
  }
};
