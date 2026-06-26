const { Notification } = require('../models');

// Get all notifications for the logged-in user
exports.getMyNotifications = async (req, res, next) => {
  try {
    const notifications = await Notification.findAll({
      where: { userId: req.user.id },
      order: [['createdAt', 'DESC']],
    });

    const unreadCount = notifications.filter((n) => !n.isRead).length;

    return res.status(200).json({
      success: true,
      count: notifications.length,
      unreadCount,
      data: notifications,
    });
  } catch (error) {
    next(error);
  }
};

// Mark a single notification as read
exports.markAsRead = async (req, res, next) => {
  try {
    const notification = await Notification.findOne({
      where: {
        id: req.params.id,
        userId: req.user.id, // Ensure ownership
      },
    });

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'لم يتم العثور على الإشعار أو ليس لديك الصلاحية لتعديله.',
      });
    }

    notification.isRead = true;
    await notification.save();

    return res.status(200).json({
      success: true,
      message: 'تم تحديد الإشعار كمقروء.',
      data: notification,
    });
  } catch (error) {
    next(error);
  }
};

// Mark ALL notifications as read for the logged-in user
exports.markAllAsRead = async (req, res, next) => {
  try {
    await Notification.update(
      { isRead: true },
      { where: { userId: req.user.id, isRead: false } }
    );

    return res.status(200).json({
      success: true,
      message: 'تم تحديد جميع الإشعارات كمقروءة.',
    });
  } catch (error) {
    next(error);
  }
};

// Delete a notification
exports.deleteNotification = async (req, res, next) => {
  try {
    const notification = await Notification.findOne({
      where: {
        id: req.params.id,
        userId: req.user.id,
      },
    });

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'لم يتم العثور على الإشعار.',
      });
    }

    await notification.destroy();

    return res.status(200).json({
      success: true,
      message: 'تم حذف الإشعار بنجاح.',
    });
  } catch (error) {
    next(error);
  }
};

// Admin: Get ALL notifications across all users
exports.getAllNotifications = async (req, res, next) => {
  try {
    const notifications = await Notification.findAll({
      order: [['createdAt', 'DESC']],
    });

    return res.status(200).json({
      success: true,
      count: notifications.length,
      data: notifications,
    });
  } catch (error) {
    next(error);
  }
};
