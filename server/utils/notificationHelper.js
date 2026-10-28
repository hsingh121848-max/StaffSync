const { Notification } = require('../models');

/**
 * Creates an in-app notification record for a recipient user.
 * Note: Stored in database; client retrieves notifications via REST API.
 */
const createNotification = async ({ recipientId, title, message, type = 'General', actionUrl = '' }) => {
  try {
    if (!recipientId || !title || !message) return null;
    return await Notification.create({
      recipientId,
      title,
      message,
      type,
      actionUrl,
    });
  } catch (err) {
    console.warn(`[StaffSync Notification Notice] Could not log notification: ${err.message}`);
    return null;
  }
};

module.exports = { createNotification };
