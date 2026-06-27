const { Notification } = require('../models');

/**
 * Create an in-app notification in MySQL.
 * @param {object} params
 * @param {number} params.userId
 * @param {number|null} params.childVaccineId
 * @param {string} params.title
 * @param {string} params.body
 */
const createNotification = async ({ userId, childVaccineId = null, title, body }) => {
  try {
    const notification = await Notification.create({
      userId,
      childVaccineId,
      title,
      body,
      isRead: false,
    });
    console.log(`[NOTIFICATION] Created notification ID ${notification.id} for user ${userId}`);
    return notification;
  } catch (error) {
    console.error('[NOTIFICATION] Failed to create notification:', error.message);
    throw error;
  }
};

module.exports = {
  createNotification,
};
