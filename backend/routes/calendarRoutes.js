const express = require('express');
const router = express.Router();
const calendarController = require('../controllers/calendarController');
const { protect } = require('../middleware/auth');

// All calendar routes require authentication
router.use(protect);

// GET /api/calendar - Retrieve calendar appointments & trigger background reminders
router.get('/', calendarController.getCalendarAppointments);

module.exports = router;
