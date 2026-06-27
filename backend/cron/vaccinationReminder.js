const cron = require('node-cron');
const { checkAndSendReminders } = require('../services/reminderService');

/**
 * Start the node-cron job for checking vaccination reminders.
 * Runs every minute in TEST_MODE, or every day at 8:00 AM in Production.
 */
const startVaccinationReminderJob = () => {
  const isTestMode = process.env.TEST_MODE === 'true';
  // Runs every minute in test mode to allow immediate testing, or daily at 8:00 AM in production
  const cronPattern = isTestMode ? '* * * * *' : '0 8 * * *';

  cron.schedule(cronPattern, async () => {
    console.log('Cron running...');
    try {
      await checkAndSendReminders();
    } catch (error) {
      console.error('[CRON] Error executing checkAndSendReminders:', error.message);
    }
  }, {
    scheduled: true,
    timezone: 'Asia/Amman',
  });

  console.log(`[CRON] Vaccination reminder job scheduled with pattern: ${cronPattern} (TEST_MODE: ${isTestMode})`);
};

module.exports = { startVaccinationReminderJob };
