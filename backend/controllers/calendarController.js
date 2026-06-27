const { ChildVaccine, Vaccine, Child } = require('../models');
const { checkAndSendRemindersForUser } = require('../services/reminderService');
const { Op } = require('sequelize');

/**
 * GET /api/calendar
 * Retrieves all vaccination appointments for the logged-in parent
 * and automatically triggers the email reminder checks in the background.
 */
const getCalendarAppointments = async (req, res, next) => {
  try {
    const parentId = req.user.id;
    const { childId } = req.query;

    // Fetch children belonging to the parent
    const children = await Child.findAll({
      where: { parentId },
      attributes: ['id']
    });
    const childIds = children.map((c) => c.id);

    const whereClause = {
      childId: { [Op.in]: childIds }
    };

    if (childId) {
      whereClause.childId = childId;
    }

    // Retrieve appointments (ChildVaccine records)
    const appointments = await ChildVaccine.findAll({
      where: whereClause,
      include: [
        {
          model: Vaccine,
          as: 'vaccine',
          attributes: ['id', 'vaccineName', 'description', 'recommendedAgeMonths', 'doseNumber']
        },
        {
          model: Child,
          as: 'child',
          attributes: ['id', 'firstName', 'lastName', 'birthDate']
        }
      ],
      order: [['scheduledDate', 'ASC']]
    });

    // Trigger reminder checks automatically in the background
    checkAndSendRemindersForUser(parentId).catch((err) => {
      console.error(`[CALENDAR] Asynchronous reminder check failed for parent ${parentId}:`, err.message);
    });

    // Return calendar data normally
    return res.status(200).json({
      success: true,
      count: appointments.length,
      data: appointments
    });

  } catch (error) {
    console.error('[CALENDAR] Failed to retrieve calendar appointments:', error.message);
    next(error);
  }
};

module.exports = {
  getCalendarAppointments
};
