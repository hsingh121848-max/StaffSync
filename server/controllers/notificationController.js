const mongoose = require('mongoose');
const { Notification } = require('../models');
const { inMemoryStore } = require('../utils/demoAuthService');

/**
 * @desc    Get current user's notifications
 * @route   GET /api/notifications
 * @access  Private (All Roles)
 */
const getMyNotifications = async (req, res, next) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      const userNotifications = (inMemoryStore.notifications || []).filter(
        (n) => String(n.recipientId) === String(req.user._id)
      );
      const unreadCount = userNotifications.filter((n) => !n.isRead).length;
      return res.status(200).json({
        success: true,
        unreadCount,
        count: userNotifications.length,
        data: userNotifications,
      });
    }

    const notifications = await Notification.find({ recipientId: req.user._id })
      .sort({ createdAt: -1 })
      .limit(50);

    const unreadCount = await Notification.countDocuments({
      recipientId: req.user._id,
      isRead: false,
    });

    res.status(200).json({
      success: true,
      unreadCount,
      count: notifications.length,
      data: notifications,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Mark single notification as read
 * @route   PUT /api/notifications/:id/read
 * @access  Private (All Roles)
 */
const markAsRead = async (req, res, next) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      const notification = (inMemoryStore.notifications || []).find(
        (n) => String(n._id) === String(req.params.id) && String(n.recipientId) === String(req.user._id)
      );
      if (!notification) {
        return res.status(404).json({
          success: false,
          message: 'Notification not found',
        });
      }
      notification.isRead = true;
      return res.status(200).json({
        success: true,
        message: 'Notification marked as read',
        data: notification,
      });
    }

    const notification = await Notification.findOne({
      _id: req.params.id,
      recipientId: req.user._id,
    });

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found',
      });
    }

    notification.isRead = true;
    await notification.save();

    res.status(200).json({
      success: true,
      message: 'Notification marked as read',
      data: notification,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Mark all user notifications as read
 * @route   PUT /api/notifications/read-all
 * @access  Private (All Roles)
 */
const markAllAsRead = async (req, res, next) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      (inMemoryStore.notifications || []).forEach((n) => {
        if (String(n.recipientId) === String(req.user._id)) {
          n.isRead = true;
        }
      });
      return res.status(200).json({
        success: true,
        message: 'All notifications marked as read',
      });
    }

    await Notification.updateMany(
      { recipientId: req.user._id, isRead: false },
      { $set: { isRead: true } }
    );

    res.status(200).json({
      success: true,
      message: 'All notifications marked as read',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getMyNotifications,
  markAsRead,
  markAllAsRead,
};
