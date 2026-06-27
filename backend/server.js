require('dotenv').config();

const app = require('./app');
const { sequelize } = require('./models');
const { startVaccinationReminderJob } = require('./cron/vaccinationReminder');

const PORT = process.env.PORT || 5000;

// ==========================================================================
// Database Connection + Server Startup
// ==========================================================================

const seedVaccines = async () => {
  try {
    const { Vaccine } = sequelize.models;
    const vaccinesData = [
      {
        vaccineName: 'مطعوم الدرن (BCG)',
        description: 'يحمي من السل والتهاب السحايا السلي.',
        recommendedAgeMonths: 0,
        doseNumber: 1,
        availability: 'Government',
        intervalRules: 'يُعطى كجرعة واحدة عند الولادة.',
        safeWindowStartDays: 0,
        safeWindowEndDays: 30
      },
      {
        vaccineName: 'التهاب الكبد البائي (HepB)',
        description: 'يحمي من الإصابة بفيروس التهاب الكبد B.',
        recommendedAgeMonths: 0,
        doseNumber: 1,
        availability: 'Government',
        intervalRules: 'عند الولادة خلال أول 24 ساعة.',
        safeWindowStartDays: 0,
        safeWindowEndDays: 30
      },
      {
        vaccineName: 'اللقاح المركب (الجرعة 1)',
        description: 'يضم الخماسي/السداسي وشلل الأطفال.',
        recommendedAgeMonths: 2,
        doseNumber: 1,
        availability: 'Government',
        intervalRules: 'الجرعة الأولى في عمر شهرين.',
        safeWindowStartDays: -7,
        safeWindowEndDays: 45
      },
      {
        vaccineName: 'مطعوم فيروس الروتا (الجرعة 1)',
        description: 'لقاح فموي يحمي من الإسهال الشديد الناجم عن فيروس الروتا.',
        recommendedAgeMonths: 2,
        doseNumber: 1,
        availability: 'Government',
        intervalRules: 'الجرعة الأولى في عمر شهرين.',
        safeWindowStartDays: -7,
        safeWindowEndDays: 15
      },
      {
        vaccineName: 'مطعوم المكورات الرئوية (الجرعة 1)',
        description: 'يحمي من الالتهاب الرئوي والتهاب السحايا الناجم عن المكورات الرئوية.',
        recommendedAgeMonths: 2,
        doseNumber: 1,
        availability: 'Government',
        intervalRules: 'الجرعة الأولى في عمر شهرين.',
        safeWindowStartDays: -7,
        safeWindowEndDays: 45
      },
      {
        vaccineName: 'اللقاح المركب (الجرعة 2)',
        description: 'يضم الخماسي/السداسي وشلل الأطفال.',
        recommendedAgeMonths: 4,
        doseNumber: 2,
        availability: 'Government',
        intervalRules: 'الجرعة الثانية في عمر 4 أشهر.',
        safeWindowStartDays: -7,
        safeWindowEndDays: 45
      },
      {
        vaccineName: 'مطعوم فيروس الروتا (الجرعة 2)',
        description: 'الجرعة الثانية للوقاية من فيروس الروتا.',
        recommendedAgeMonths: 4,
        doseNumber: 2,
        availability: 'Government',
        intervalRules: 'الجرعة الثانية في عمر 4 أشهر.',
        safeWindowStartDays: -7,
        safeWindowEndDays: 30
      },
      {
        vaccineName: 'مطعوم المكورات الرئوية (الجرعة 2)',
        description: 'الجرعة الثانية للوقاية من المكورات الرئوية.',
        recommendedAgeMonths: 4,
        doseNumber: 2,
        availability: 'Government',
        intervalRules: 'الجرعة الثانية في عمر 4 أشهر.',
        safeWindowStartDays: -7,
        safeWindowEndDays: 45
      },
      {
        vaccineName: 'اللقاح المركب (الجرعة 3)',
        description: 'يضم الخماسي/السداسي وشلل الأطفال.',
        recommendedAgeMonths: 6,
        doseNumber: 3,
        availability: 'Government',
        intervalRules: 'الجرعة الثالثة في عمر 6 أشهر.',
        safeWindowStartDays: -7,
        safeWindowEndDays: 45
      },
      {
        vaccineName: 'مطعوم فيروس الروتا (الجرعة 3)',
        description: 'الجرعة الثالثة للوقاية من فيروس الروتا.',
        recommendedAgeMonths: 6,
        doseNumber: 3,
        availability: 'Government',
        intervalRules: 'الجرعة الثالثة في عمر 6 أشهر.',
        safeWindowStartDays: -7,
        safeWindowEndDays: 30
      },
      {
        vaccineName: 'مطعوم المكورات الرئوية (الجرعة 3)',
        description: 'الجرعة الثالثة للمكورات الرئوية.',
        recommendedAgeMonths: 6,
        doseNumber: 3,
        availability: 'Government',
        intervalRules: 'الجرعة الثالثة في عمر 6 أشهر.',
        safeWindowStartDays: -7,
        safeWindowEndDays: 45
      },
      {
        vaccineName: 'مطعوم الحصبة وشلل الأطفال',
        description: 'جرعة الحصبة بالإضافة لجرعة شلل أطفال فموية.',
        recommendedAgeMonths: 9,
        doseNumber: 1,
        availability: 'Government',
        intervalRules: 'في عمر 9 أشهر للتحصين ضد الحصبة.',
        safeWindowStartDays: -7,
        safeWindowEndDays: 45
      },
      {
        vaccineName: 'المطعوم الثلاثي الفيروسي (MMR - الجرعة 1)',
        description: 'حماية ضد الحصبة والنكاف والحصبة الألمانية.',
        recommendedAgeMonths: 12,
        doseNumber: 1,
        availability: 'Government',
        intervalRules: 'الجرعة الأولى في عمر سنة (12 شهراً).',
        safeWindowStartDays: -7,
        safeWindowEndDays: 60
      },
      {
        vaccineName: 'مطعوم جدري الماء',
        description: 'يحمي من فيروس جدري الماء (الحماق).',
        recommendedAgeMonths: 12,
        doseNumber: 1,
        availability: 'Government',
        intervalRules: 'يُعطى في عمر 12 شهراً كجرعة أولى للتحصين ضد العنقز.',
        safeWindowStartDays: -7,
        safeWindowEndDays: 60
      },
      {
        vaccineName: 'المطعوم الثلاثي الفيروسي (MMR - الجرعة 2)',
        description: 'الجرعة الداعمة ضد الحصبة والنكاف والحصبة الألمانية.',
        recommendedAgeMonths: 18,
        doseNumber: 2,
        availability: 'Government',
        intervalRules: 'الجرعة الداعمة في عمر 18 شهراً.',
        safeWindowStartDays: -7,
        safeWindowEndDays: 60
      },
      {
        vaccineName: 'الجرعة الداعمة للثلاثي البكتيري وشلل الأطفال',
        description: 'جرعة داعمة في عمر السنة ونصف.',
        recommendedAgeMonths: 18,
        doseNumber: 4,
        availability: 'Government',
        intervalRules: 'جرعة منشطة في عمر 18 شهراً.',
        safeWindowStartDays: -7,
        safeWindowEndDays: 60
      }
    ];

    for (const vData of vaccinesData) {
      const [vaccine, created] = await Vaccine.findOrCreate({
        where: { vaccineName: vData.vaccineName },
        defaults: vData
      });
      if (!created) {
        await vaccine.update({
          description: vData.description,
          recommendedAgeMonths: vData.recommendedAgeMonths,
          doseNumber: vData.doseNumber,
          availability: vData.availability,
          intervalRules: vData.intervalRules,
          safeWindowStartDays: vData.safeWindowStartDays,
          safeWindowEndDays: vData.safeWindowEndDays
        });
      }
    }
    console.log('✅ Official vaccines synced/seeded successfully.');
  } catch (err) {
    console.error('❌ Failed to seed vaccines on startup:', err);
  }
};

// ==========================================================================
// Auto-seed: Hospitals (Amman, Jordan) + Hospital-Vaccine Associations
// ==========================================================================

const seedHospitals = async () => {
  try {
    const { Hospital, Vaccine, HospitalVaccine } = sequelize.models;

    // ── Hospital definitions ──────────────────────────────────────────────
    const hospitalDefs = [
      {
        name: 'مستشفى البشير الحكومي',
        type: 'Government',
        city: 'Amman',
        latitude: 31.9591,
        longitude: 35.9263,
        address: 'شارع الملكة رانيا العبدالله، الشميساني، عمان',
        phone: '+962 6 484 0161',
        isVaccinationCenter: true,
        status: 'Active',
      },
      {
        name: 'مستشفى الأمير حمزة',
        type: 'Government',
        city: 'Amman',
        latitude: 31.9862,
        longitude: 35.8778,
        address: 'ضاحية الرشيد، الطريق الصحراوي، عمان',
        phone: '+962 6 520 5050',
        isVaccinationCenter: true,
        status: 'Active',
      },
      {
        name: 'مستشفى البشير للأمومة والطفولة',
        type: 'Government',
        city: 'Amman',
        latitude: 31.9605,
        longitude: 35.9280,
        address: 'قرب دوار الشميساني، عمان',
        phone: '+962 6 562 2212',
        isVaccinationCenter: true,
        status: 'Active',
      },
      {
        name: 'مستشفى الزرقاء الحكومي',
        type: 'Government',
        city: 'Amman',
        latitude: 32.0687,
        longitude: 36.0890,
        address: 'شارع الأمير الحسن، الزرقاء',
        phone: '+962 5 397 0100',
        isVaccinationCenter: true,
        status: 'Active',
      },
      {
        name: 'مستشفى الأردن',
        type: 'Private',
        city: 'Amman',
        latitude: 31.9624,
        longitude: 35.8994,
        address: 'شارع المدينة المنورة، الشميساني، عمان',
        phone: '+962 6 560 8080',
        isVaccinationCenter: true,
        status: 'Active',
      },
      {
        name: 'مستشفى التخصصي',
        type: 'Private',
        city: 'Amman',
        latitude: 31.9671,
        longitude: 35.9069,
        address: 'شارع الأمير شاكر بن زيد، عمان',
        phone: '+962 6 469 0970',
        isVaccinationCenter: true,
        status: 'Active',
      },
      {
        name: 'مستشفى الاستشاري',
        type: 'Private',
        city: 'Amman',
        latitude: 31.9952,
        longitude: 35.8620,
        address: 'شارع المطار، تلاع العلي، عمان',
        phone: '+962 6 581 4000',
        isVaccinationCenter: true,
        status: 'Active',
      },
      {
        name: 'المركز الطبي العربي',
        type: 'Private',
        city: 'Amman',
        latitude: 31.9540,
        longitude: 35.9193,
        address: 'شارع المدينة المنورة، خلف مجمع المدينة، عمان',
        phone: '+962 6 551 5151',
        isVaccinationCenter: true,
        status: 'Active',
      },
      {
        name: 'المستشفى الإسلامي',
        type: 'Private',
        city: 'Amman',
        latitude: 31.9545,
        longitude: 35.9350,
        address: 'شارع الملك عبدالله الثاني، عمان',
        phone: '+962 6 477 9111',
        isVaccinationCenter: true,
        status: 'Active',
      },
    ];

    // Upsert all hospitals
    const hospitalInstances = {};
    for (const hDef of hospitalDefs) {
      const [hospital] = await Hospital.findOrCreate({
        where: { name: hDef.name },
        defaults: hDef,
      });
      hospitalInstances[hDef.name] = hospital;
    }

    // ── Vaccine → hospital mapping ────────────────────────────────────────
    // Each entry: [vaccineName, [hospitalNames...]]
    const gov = [
      'مستشفى البشير الحكومي',
      'مستشفى الأمير حمزة',
      'مستشفى البشير للأمومة والطفولة',
      'مستشفى الزرقاء الحكومي',
    ];
    const pvt = [
      'مستشفى الأردن',
      'مستشفى التخصصي',
      'مستشفى الاستشاري',
      'المركز الطبي العربي',
      'المستشفى الإسلامي',
    ];
    const all = [...gov, ...pvt];
    const govAndSomePvt = [...gov, 'مستشفى الأردن', 'مستشفى التخصصي', 'مستشفى الاستشاري'];

    const vaccineHospitalMap = [
      // Government-only vaccines (newborn)
      { name: 'السل (BCG)', hospitals: gov },
      { name: 'التهاب الكبد البائي (HepB - الجرعة 1)', hospitals: gov },
      // Government + private
      { name: 'اللقاح السداسي (الجرعة 1)', hospitals: all },
      { name: 'اللقاح السداسي (الجرعة 2)', hospitals: all },
      { name: 'اللقاح السداسي (الجرعة 3)', hospitals: all },
      { name: 'المكورات الرئوية (PCV13 - الجرعة 1)', hospitals: all },
      { name: 'المكورات الرئوية (PCV13 - الجرعة 2)', hospitals: all },
      { name: 'المكورات الرئوية (PCV13 - الجرعة 3)', hospitals: all },
      { name: 'لقاح الحصبة', hospitals: govAndSomePvt },
      { name: 'الثلاثي الفيروسي (MMR - الجرعة 1)', hospitals: all },
      { name: 'المكورات السحائية ACWY', hospitals: govAndSomePvt },
      // Private-only vaccines
      { name: 'فيروس الروتا (الجرعة 1)', hospitals: pvt },
      { name: 'فيروس الروتا (الجرعة 2)', hospitals: pvt },
      { name: 'جدري الماء (Varicella - الجرعة 1)', hospitals: pvt },
    ];

    let assocCount = 0;
    for (const entry of vaccineHospitalMap) {
      const vaccine = await Vaccine.findOne({ where: { vaccineName: entry.name } });
      if (!vaccine) continue;

      for (const hospitalName of entry.hospitals) {
        const hospital = hospitalInstances[hospitalName];
        if (!hospital) continue;

        await HospitalVaccine.findOrCreate({
          where: { hospitalId: hospital.id, vaccineId: vaccine.id },
          defaults: { hospitalId: hospital.id, vaccineId: vaccine.id },
        });
        assocCount++;
      }
    }

    console.log(`✅ Hospitals seeded (${hospitalDefs.length} hospitals, ${assocCount} associations).`);
  } catch (err) {
    console.error('❌ Failed to seed hospitals on startup:', err.message);
  }
};

const startServer = async () => {
  try {
    // Test database connection
    await sequelize.authenticate();
    console.log('✅ Database connected successfully.');

    if (process.env.NODE_ENV === 'development') {
      // Use { alter: true } carefully — only adds/changes columns, doesn't drop
      // In production, always use migrations via sequelize-cli
      await sequelize.sync({ alter: true });
      console.log('✅ Sequelize models synchronized.');
      await seedVaccines();
      await seedHospitals();

    }

    // Start HTTP server
    const server = app.listen(PORT, () => {
      console.log(`🚀 Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
      console.log(`📡 Health check: http://localhost:${PORT}/api/health`);
    });

    // Start daily vaccination reminder cron job
    startVaccinationReminderJob();

    // ==========================================================================
    // Graceful Shutdown Handlers
    // ==========================================================================

    const shutdown = async (signal) => {
      console.log(`\n${signal} received. Shutting down gracefully...`);
      server.close(async () => {
        try {
          await sequelize.close();
          console.log('✅ Database connection closed.');
          process.exit(0);
        } catch (err) {
          console.error('Error during shutdown:', err.message);
          process.exit(1);
        }
      });
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));

    // Handle unhandled promise rejections
    process.on('unhandledRejection', (reason, promise) => {
      console.error('Unhandled Rejection at:', promise, 'Reason:', reason);
      // Optionally exit — in production you may want to log and continue
    });

    // Handle uncaught exceptions
    process.on('uncaughtException', (err) => {
      console.error('Uncaught Exception:', err.message);
      process.exit(1);
    });

  } catch (error) {
    console.error('❌ Failed to start server:', error.message);
    process.exit(1);
  }
};

startServer();
