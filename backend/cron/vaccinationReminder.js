const cron = require('node-cron');
const { ChildVaccine, Vaccine, Child, User, Notification } = require('../models');
const { sendVaccinationReminderEmail } = require('../services/mailService');
const { Op } = require('sequelize');

/**
 * Vaccination Reminder Cron Job
 * Schedule: Every day at 8:00 AM
 * Task: Find all vaccines scheduled exactly 2 days from today,
 *       send email reminders to parents, and create in-app notifications.
 */
const startVaccinationReminderJob = () => {
  // Cron pattern: '0 8 * * *' => runs at 08:00 every day
  cron.schedule('0 8 * * *', async () => {
    console.log(`[CRON] Vaccination reminder job started at ${new Date().toISOString()}`);

    try {
      // Calculate the target date (today + 2 days)
      const targetDate = new Date();
      targetDate.setDate(targetDate.getDate() + 2);
      const targetDateStr = targetDate.toISOString().split('T')[0];

      console.log(`[CRON] Checking for vaccines scheduled on: ${targetDateStr}`);

      // Fetch all upcoming/pending vaccine records scheduled for the target date
      const upcomingVaccines = await ChildVaccine.findAll({
        where: {
          scheduledDate: targetDateStr,
          status: {
            [Op.in]: ['Upcoming', 'Pending'],
          },
        },
        include: [
          {
            model: Vaccine,
            as: 'vaccine',
            attributes: ['id', 'vaccineName'],
          },
          {
            model: Child,
            as: 'child',
            attributes: ['id', 'firstName', 'lastName', 'parentId'],
            include: [
              {
                model: User,
                as: 'parent',
                attributes: ['id', 'fullName', 'email'],
              },
            ],
          },
        ],
      });

      if (upcomingVaccines.length === 0) {
        console.log('[CRON] No vaccines found for the target date. Job complete.');
        return;
      }

      console.log(`[CRON] Found ${upcomingVaccines.length} vaccine appointment(s) to remind.`);

      // Process each upcoming vaccine record
      const results = await Promise.allSettled(
        upcomingVaccines.map(async (record) => {
          const { vaccine, child } = record;

          if (!child || !child.parent) {
            console.warn(`[CRON] Skipping record ID ${record.id}: missing child or parent data.`);
            return;
          }

          const parent = child.parent;
          const childFullName = `${child.firstName} ${child.lastName}`;

          // 1. Send reminder email to parent
          await sendVaccinationReminderEmail(
            parent.email,
            parent.fullName,
            childFullName,
            vaccine.vaccineName,
            record.scheduledDate
          );

          // 2. Create in-app notification record in MySQL
          await Notification.create({
            userId: parent.id,
            childVaccineId: record.id,
            title: `تذكير: موعد تطعيم ${childFullName} 💉`,
            body: `يُذكّركم بأن موعد تطعيم "${vaccine.vaccineName}" للطفل ${childFullName} هو بعد يومين، بتاريخ ${record.scheduledDate}. يرجى زيارة المركز الصحي.`,
            isRead: false,
          });

          console.log(`[CRON] Reminder sent for child: ${childFullName}, vaccine: ${vaccine.vaccineName}, parent: ${parent.email}`);
        })
      );

      // Log any failures without crashing
      results.forEach((result, index) => {
        if (result.status === 'rejected') {
          console.error(`[CRON] Failed to process record index ${index}:`, result.reason?.message || result.reason);
        }
      });

      const successCount = results.filter((r) => r.status === 'fulfilled').length;
      console.log(`[CRON] Job complete. ${successCount}/${upcomingVaccines.length} reminders sent successfully.`);

    } catch (error) {
      // Catch top-level failures to prevent cron from crashing the server
      console.error('[CRON] Critical error in vaccination reminder job:', error.message);
    }
  }, {
    scheduled: true,
    timezone: 'Asia/Amman', // Jordan timezone
  });

  console.log('[CRON] Vaccination reminder job scheduled — runs daily at 08:00 AM (Asia/Amman).');
};

module.exports = { startVaccinationReminderJob };
