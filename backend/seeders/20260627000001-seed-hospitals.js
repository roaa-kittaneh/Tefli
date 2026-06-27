'use strict';

/**
 * Seed: Hospitals in Amman, Jordan + Hospital-Vaccine associations
 *
 * Run: npx sequelize-cli db:seed --seed 20260627000001-seed-hospitals.js
 * Undo: npx sequelize-cli db:seed:undo --seed 20260627000001-seed-hospitals.js
 */

module.exports = {
  async up(queryInterface, Sequelize) {

    // ─────────────────────────────────────────────────────────────────────
    // 1. Insert Hospitals (Amman, Jordan only)
    // ─────────────────────────────────────────────────────────────────────
    await queryInterface.bulkInsert('hospitals', [
      // ── Government Hospitals ──────────────────────────────────────────
      {
        name: 'مستشفى البشير الحكومي',
        type: 'Government',
        city: 'Amman',
        latitude: 31.9591,
        longitude: 35.9263,
        address: 'شارع الملكة رانيا العبدالله، الشميساني، عمان، الأردن',
        phone: '+962 6 484 0161',
        isVaccinationCenter: true,
        status: 'Active',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: 'مستشفى الأمير حمزة',
        type: 'Government',
        city: 'Amman',
        latitude: 31.9862,
        longitude: 35.8778,
        address: 'ضاحية الرشيد، الطريق الصحراوي، عمان، الأردن',
        phone: '+962 6 520 5050',
        isVaccinationCenter: true,
        status: 'Active',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: 'مستشفى البشير للأمومة والطفولة',
        type: 'Government',
        city: 'Amman',
        latitude: 31.9605,
        longitude: 35.9280,
        address: 'قرب دوار الشميساني، عمان، الأردن',
        phone: '+962 6 562 2212',
        isVaccinationCenter: true,
        status: 'Active',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: 'مستشفى الزرقاء الحكومي',
        type: 'Government',
        city: 'Amman',
        latitude: 32.0687,
        longitude: 36.0890,
        address: 'شارع الأمير الحسن، الزرقاء، الأردن',
        phone: '+962 5 397 0100',
        isVaccinationCenter: true,
        status: 'Active',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      // ── Private Hospitals ─────────────────────────────────────────────
      {
        name: 'مستشفى الأردن',
        type: 'Private',
        city: 'Amman',
        latitude: 31.9624,
        longitude: 35.8994,
        address: 'شارع المدينة المنورة، الشميساني، عمان، الأردن',
        phone: '+962 6 560 8080',
        isVaccinationCenter: true,
        status: 'Active',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: 'مستشفى التخصصي',
        type: 'Private',
        city: 'Amman',
        latitude: 31.9671,
        longitude: 35.9069,
        address: 'شارع الأمير شاكر بن زيد، عمان، الأردن',
        phone: '+962 6 469 0970',
        isVaccinationCenter: true,
        status: 'Active',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: 'مستشفى الاستشاري',
        type: 'Private',
        city: 'Amman',
        latitude: 31.9952,
        longitude: 35.8620,
        address: 'شارع المطار، تلاع العلي، عمان، الأردن',
        phone: '+962 6 581 4000',
        isVaccinationCenter: true,
        status: 'Active',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: 'المركز الطبي العربي',
        type: 'Private',
        city: 'Amman',
        latitude: 31.9540,
        longitude: 35.9193,
        address: 'شارع المدينة المنورة، خلف مجمع المدينة، عمان، الأردن',
        phone: '+962 6 551 5151',
        isVaccinationCenter: true,
        status: 'Active',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: 'المستشفى الإسلامي',
        type: 'Private',
        city: 'Amman',
        latitude: 31.9545,
        longitude: 35.9350,
        address: 'شارع الملك عبدالله الثاني، عمان، الأردن',
        phone: '+962 6 477 9111',
        isVaccinationCenter: true,
        status: 'Active',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ], {});

    // ─────────────────────────────────────────────────────────────────────
    // 2. Fetch inserted hospital IDs and vaccine IDs
    // ─────────────────────────────────────────────────────────────────────
    const [hospitals] = await queryInterface.sequelize.query(
      `SELECT id, name FROM hospitals ORDER BY id ASC`
    );

    const [vaccines] = await queryInterface.sequelize.query(
      `SELECT id, vaccineName FROM vaccines ORDER BY id ASC`
    );

    // Build lookup maps by name
    const hospitalByName = {};
    hospitals.forEach(h => { hospitalByName[h.name] = h.id; });

    const vaccineByName = {};
    vaccines.forEach(v => { vaccineByName[v.vaccineName] = v.id; });

    // Hospital ID shortcuts
    const bashir   = hospitalByName['مستشفى البشير الحكومي'];
    const hamza    = hospitalByName['مستشفى الأمير حمزة'];
    const maternity = hospitalByName['مستشفى البشير للأمومة والطفولة'];
    const zarqa    = hospitalByName['مستشفى الزرقاء الحكومي'];
    const jordan   = hospitalByName['مستشفى الأردن'];
    const special  = hospitalByName['مستشفى التخصصي'];
    const istish   = hospitalByName['مستشفى الاستشاري'];
    const arab     = hospitalByName['المركز الطبي العربي'];
    const islamic  = hospitalByName['المستشفى الإسلامي'];

    // ─────────────────────────────────────────────────────────────────────
    // 3. Define hospital ↔ vaccine associations
    //    Every vaccine maps to which hospital IDs offer it
    // ─────────────────────────────────────────────────────────────────────
    const associations = [];
    const now = new Date();

    const addAssoc = (hospitalId, vaccineName) => {
      const vaccineId = vaccineByName[vaccineName];
      if (hospitalId && vaccineId) {
        associations.push({ hospitalId, vaccineId, createdAt: now, updatedAt: now });
      }
    };

    // BCG (السل) — Newborn vaccine, government only
    const bcgName = 'السل (BCG)';
    [bashir, hamza, maternity, zarqa].forEach(h => addAssoc(h, bcgName));

    // HepB-1 — Newborn, government only
    const hepbName = 'التهاب الكبد البائي (HepB - الجرعة 1)';
    [bashir, hamza, maternity, zarqa].forEach(h => addAssoc(h, hepbName));

    // Hexavalent Dose 1
    const hex1 = 'اللقاح السداسي (الجرعة 1)';
    [bashir, hamza, maternity, zarqa, jordan, special, istish, arab, islamic].forEach(h => addAssoc(h, hex1));

    // Hexavalent Dose 2
    const hex2 = 'اللقاح السداسي (الجرعة 2)';
    [bashir, hamza, maternity, zarqa, jordan, special, istish, arab, islamic].forEach(h => addAssoc(h, hex2));

    // Hexavalent Dose 3
    const hex3 = 'اللقاح السداسي (الجرعة 3)';
    [bashir, hamza, maternity, zarqa, jordan, special, istish, arab, islamic].forEach(h => addAssoc(h, hex3));

    // PCV13 Dose 1 — Both government and private
    const pcv1 = 'المكورات الرئوية (PCV13 - الجرعة 1)';
    [bashir, hamza, zarqa, jordan, special, istish, arab, islamic].forEach(h => addAssoc(h, pcv1));

    // PCV13 Dose 2
    const pcv2 = 'المكورات الرئوية (PCV13 - الجرعة 2)';
    [bashir, hamza, zarqa, jordan, special, istish, arab, islamic].forEach(h => addAssoc(h, pcv2));

    // PCV13 Dose 3
    const pcv3 = 'المكورات الرئوية (PCV13 - الجرعة 3)';
    [bashir, hamza, zarqa, jordan, special, istish, arab, islamic].forEach(h => addAssoc(h, pcv3));

    // Rotavirus Dose 1 — Private only
    const rota1 = 'فيروس الروتا (الجرعة 1)';
    [jordan, special, istish, arab, islamic].forEach(h => addAssoc(h, rota1));

    // Rotavirus Dose 2 — Private only
    const rota2 = 'فيروس الروتا (الجرعة 2)';
    [jordan, special, istish, arab, islamic].forEach(h => addAssoc(h, rota2));

    // Measles vaccine (9 months)
    const measles = 'لقاح الحصبة';
    [bashir, hamza, maternity, zarqa, jordan, special].forEach(h => addAssoc(h, measles));

    // MMR Dose 1
    const mmr1 = 'الثلاثي الفيروسي (MMR - الجرعة 1)';
    [bashir, hamza, maternity, zarqa, jordan, special, istish, arab, islamic].forEach(h => addAssoc(h, mmr1));

    // Meningococcal ACWY
    const menin = 'المكورات السحائية ACWY';
    [bashir, hamza, zarqa, jordan, special, istish].forEach(h => addAssoc(h, menin));

    // Varicella — Private only
    const varicella = 'جدري الماء (Varicella - الجرعة 1)';
    [jordan, special, istish, arab, islamic].forEach(h => addAssoc(h, varicella));

    // Insert all associations (skip duplicates just in case)
    if (associations.length > 0) {
      await queryInterface.bulkInsert('hospital_vaccines', associations, {
        ignoreDuplicates: true,
      });
    }

    console.log(`✅ Seeded ${hospitals.length} hospitals and ${associations.length} hospital-vaccine associations.`);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('hospital_vaccines', null, {});
    await queryInterface.bulkDelete('hospitals', null, {});
  },
};
