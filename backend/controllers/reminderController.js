const { ChildVaccine, Vaccine, Child, User, Notification } = require('../models');
const { sendVaccinationReminderEmail } = require('../services/mailService');

/**
 * Controller for immediate manual vaccination reminder testing.
 */
const sendReminderImmediately = async (req, res, next) => {
  const { childVaccineId } = req.params;

  try {
    const record = await ChildVaccine.findByPk(childVaccineId, {
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

    if (!record) {
      return res.status(404).json({
        success: false,
        message: 'Vaccination record not found.',
      });
    }

    const { vaccine, child } = record;
    if (!child || !child.parent || !vaccine) {
      return res.status(400).json({
        success: false,
        message: 'Record is missing parent, child, or vaccine relation data.',
      });
    }

    const parent = child.parent;
    const childFullName = `${child.firstName} ${child.lastName}`;

    console.log(`Manual trigger: Sending reminder email immediately to ${parent.email}`);

    // Send email immediately
    await sendVaccinationReminderEmail(
      parent.email,
      parent.fullName,
      childFullName,
      vaccine.vaccineName,
      record.scheduledDate
    );

    // Create Notification record inside MySQL
    await Notification.create({
      userId: parent.id,
      childVaccineId: record.id,
      title: 'Vaccination Reminder',
      body: "Your child's vaccination is scheduled in 2 days.",
      isRead: false,
    });

    // Mark reminderSent = true
    record.reminderSent = true;
    await record.save();

    return res.status(200).json({
      success: true,
      message: 'Reminder email sent and notification created successfully.',
      data: {
        childVaccineId: record.id,
        parentEmail: parent.email,
        childName: childFullName,
        vaccineName: vaccine.vaccineName,
        scheduledDate: record.scheduledDate,
      },
    });

  } catch (error) {
    console.error('Error in sendReminderImmediately controller:', error.message);
    return res.status(500).json({
      success: false,
      message: 'An error occurred while sending the reminder.',
      error: error.message,
    });
  }
};

/**
 * Endpoint to trigger dry run of checking vaccination reminders.
 */
const runCronDryRun = async (req, res) => {
  try {
    console.log('--- Manual Trigger of Cron Job Dry Run via HTTP ---');
    const { checkAndSendReminders } = require('../services/reminderService');
    await checkAndSendReminders();
    return res.status(200).json({
      success: true,
      message: 'Cron job dry run executed. Check server console logs for output.',
    });
  } catch (error) {
    console.error('Error in runCronDryRun:', error.message);
    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

const updateDatesJune = async (req, res) => {
  try {
    const { ChildVaccine } = require('../models');
    const { Op } = require('sequelize');

    const recordsBefore = await ChildVaccine.findAll({
      where: {
        [Op.or]: [
          { scheduledDate: '2026-06-27' },
          { takenDate: '2026-06-27' }
        ]
      }
    });

    const listBefore = recordsBefore.map(r => ({
      id: r.id,
      vaccineId: r.vaccineId,
      status: r.status,
      scheduledDate: r.scheduledDate,
      takenDate: r.takenDate
    }));

    // Update any scheduledDate or takenDate from 2026-06-27 to 2026-06-29
    const [updatedCount] = await ChildVaccine.update(
      { 
        scheduledDate: sequelize.literal("CASE WHEN scheduledDate = '2026-06-27' THEN '2026-06-29' ELSE scheduledDate END"),
        takenDate: sequelize.literal("CASE WHEN takenDate = '2026-06-27' THEN '2026-06-29' ELSE takenDate END")
      },
      {
        where: {
          [Op.or]: [
            { scheduledDate: '2026-06-27' },
            { takenDate: '2026-06-27' }
          ]
        }
      }
    );

    const recordsAfter = await ChildVaccine.findAll({
      where: {
        [Op.or]: [
          { scheduledDate: { [Op.like]: '2026-06-%' } },
          { takenDate: { [Op.like]: '2026-06-%' } }
        ]
      }
    });

    const listAfter = recordsAfter.map(r => ({
      id: r.id,
      vaccineId: r.vaccineId,
      status: r.status,
      scheduledDate: r.scheduledDate,
      takenDate: r.takenDate
    }));

    return res.status(200).json({
      success: true,
      message: `Successfully updated ${updatedCount} records from June 27 to June 29.`,
      before: listBefore,
      after: listAfter
    });
  } catch (error) {
    console.error('Error in updateDatesJune:', error.message);
    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

module.exports = {
  sendReminderImmediately,
  runCronDryRun,
  updateDatesJune,
};
