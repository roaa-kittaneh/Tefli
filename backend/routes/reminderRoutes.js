const express = require('express');
const router = express.Router();
const reminderController = require('../controllers/reminderController');

// POST /api/test/send-reminder/:childVaccineId
router.post('/send-reminder/:childVaccineId', reminderController.sendReminderImmediately);

// GET /api/test/run-cron-dry-run
router.get('/run-cron-dry-run', reminderController.runCronDryRun);

// GET /api/test/update-dates-june
router.get('/update-dates-june', reminderController.updateDatesJune);

module.exports = router;
