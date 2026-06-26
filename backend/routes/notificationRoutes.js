const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');
const { protect, restrictTo } = require('../middleware/auth');

// All notification routes are protected
router.use(protect);

// @GET /api/notifications  - Get logged-in user's notifications
router.get('/', notificationController.getMyNotifications);

// @PATCH /api/notifications/read-all  - Mark all as read
router.patch('/read-all', notificationController.markAllAsRead);

// @PATCH /api/notifications/:id/read  - Mark one as read
router.patch('/:id/read', notificationController.markAsRead);

// @DELETE /api/notifications/:id  - Delete a notification
router.delete('/:id', notificationController.deleteNotification);

// @GET /api/notifications/all  - Admin: get ALL notifications in the system
router.get('/all', restrictTo('Admin'), notificationController.getAllNotifications);

module.exports = router;
