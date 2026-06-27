const { ChildVaccine, Vaccine, Child, User } = require('../models');
const { sendVaccinationReminderEmail } = require('./mailService');
const { createNotification } = require('./notificationService');
const { Op } = require('sequelize');

/**
 * Get the "effective today" date.
 * If TEST_MODE=true and TEST_DATE is set, use TEST_DATE instead of real system date.
 */
const getEffectiveToday = () => {
  const isTestMode = process.env.TEST_MODE === 'true';
  const testDate = process.env.TEST_DATE;

  if (isTestMode && testDate) {
    console.log(`[REMINDER] TEST_MODE active. Using TEST_DATE: ${testDate}`);
    return testDate; // e.g. "2026-06-27"
  }

  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];
  console.log(`[REMINDER] Production mode. Today's date: ${todayStr}`);
  return todayStr;
};

/**
 * Calculate the number of whole days between two YYYY-MM-DD strings.
 * Returns positive number if schedDate is in the future.
 */
const daysBetween = (todayStr, scheduledDateStr) => {
  const t = new Date(todayStr + 'T00:00:00.000Z');
  const s = new Date(scheduledDateStr + 'T00:00:00.000Z');
  return Math.round((s - t) / (1000 * 60 * 60 * 24));
};

/**
 * Process a single child vaccine record — check if reminder should be sent.
 * Sends email + creates notification + marks reminderSent = true.
 * @param {object} record - ChildVaccine model instance with includes
 * @param {string} todayStr - The effective today date
 */
const processRecord = async (record, todayStr) => {
  const { vaccine, child } = record;

  if (!child || !child.parent || !vaccine) {
    console.log(`[REMINDER] Skipped record ID ${record.id}: missing child, parent, or vaccine data.`);
    return { sent: false, reason: 'missing-relations' };
  }

  if (record.reminderSent) {
    console.log(`[REMINDER] Reminder already sent for record ID ${record.id} (${vaccine.vaccineName}). Skipping.`);
    return { sent: false, reason: 'already-sent' };
  }

  const parent = child.parent;
  const childFullName = `${child.firstName} ${child.lastName}`;
  const scheduledDateStr = record.scheduledDate;

  const remaining = daysBetween(todayStr, scheduledDateStr);

  console.log(`[REMINDER] Today's Date: ${todayStr}`);
  console.log(`[REMINDER] Scheduled Date: ${scheduledDateStr}`);
  console.log(`[REMINDER] Days Remaining: ${remaining}`);

  if (remaining !== 2) {
    console.log(`[REMINDER] No Reminder Needed for "${vaccine.vaccineName}" (${remaining} days away)`);
    return { sent: false, reason: 'not-2-days' };
  }

  // Days Remaining == 2 — send reminder
  try {
    await sendVaccinationReminderEmail(
      parent.email,
      parent.fullName,
      childFullName,
      vaccine.vaccineName,
      scheduledDateStr
    );

    await createNotification({
      userId: parent.id,
      childVaccineId: record.id,
      title: 'Vaccination Reminder',
      body: `Your child's vaccination is scheduled in 2 days (${scheduledDateStr}).`,
    });

    record.reminderSent = true;
    await record.save();

    console.log(`[REMINDER] Reminder Sent to ${parent.email} for "${vaccine.vaccineName}" on ${scheduledDateStr}`);
    return { sent: true, vaccineName: vaccine.vaccineName, parentEmail: parent.email };
  } catch (err) {
    console.error(`[REMINDER] Failed to send reminder for record ID ${record.id}:`, err.message);
    return { sent: false, reason: 'send-error', error: err.message };
  }
};

/**
 * Check all appointments (for cron job — checks every parent's children).
 */
const checkAndSendReminders = async () => {
  const todayStr = getEffectiveToday();
  console.log('[REMINDER] Checking vaccination reminders...');

  try {
    const records = await ChildVaccine.findAll({
      where: {
        status: { [Op.in]: ['Upcoming', 'Pending'] },
        reminderSent: false,
      },
      include: [
        { model: Vaccine, as: 'vaccine', attributes: ['id', 'vaccineName'] },
        {
          model: Child,
          as: 'child',
          attributes: ['id', 'firstName', 'lastName', 'parentId'],
          include: [{ model: User, as: 'parent', attributes: ['id', 'fullName', 'email'] }],
        },
      ],
    });

    if (records.length === 0) {
      console.log('[REMINDER] No upcoming appointments found.');
      return;
    }

    let sentCount = 0;
    for (const record of records) {
      const result = await processRecord(record, todayStr);
      if (result.sent) sentCount++;
    }

    if (sentCount > 0) {
      console.log(`[REMINDER] Done. ${sentCount} reminder(s) sent successfully.`);
    } else {
      console.log('[REMINDER] No reminders needed today.');
    }
  } catch (error) {
    console.error('[REMINDER] Critical error in checkAndSendReminders:', error.message);
  }
};

/**
 * Check appointments for a specific parent (called when Calendar page opens).
 * Runs asynchronously so it does NOT delay the HTTP response.
 * @param {number} parentId - The logged-in parent's user ID
 */
const checkAndSendRemindersForUser = async (parentId) => {
  const todayStr = getEffectiveToday();
  console.log(`[REMINDER] Calendar opened by parent ${parentId}. Checking reminders...`);

  try {
    // Get all children for this parent
    const children = await Child.findAll({
      where: { parentId },
      attributes: ['id'],
    });

    if (children.length === 0) {
      console.log(`[REMINDER] No children found for parent ${parentId}.`);
      return;
    }

    const childIds = children.map((c) => c.id);

    // Find all upcoming/pending vaccine records that haven't been reminded yet
    const records = await ChildVaccine.findAll({
      where: {
        childId: { [Op.in]: childIds },
        status: { [Op.in]: ['Upcoming', 'Pending'] },
        reminderSent: false,
      },
      include: [
        { model: Vaccine, as: 'vaccine', attributes: ['id', 'vaccineName'] },
        {
          model: Child,
          as: 'child',
          attributes: ['id', 'firstName', 'lastName', 'parentId'],
          include: [{ model: User, as: 'parent', attributes: ['id', 'fullName', 'email'] }],
        },
      ],
    });

    if (records.length === 0) {
      console.log(`[REMINDER] No pending reminders for parent ${parentId}.`);
      return;
    }

    for (const record of records) {
      await processRecord(record, todayStr);
    }
  } catch (error) {
    console.error(`[REMINDER] Error in checkAndSendRemindersForUser for parent ${parentId}:`, error.message);
  }
};

module.exports = {
  checkAndSendReminders,
  checkAndSendRemindersForUser,
  getEffectiveToday,
};
