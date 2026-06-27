const express = require('express');
const router = express.Router();
const hospitalController = require('../controllers/hospitalController');
const { protect } = require('../middleware/auth');

// All hospital routes require authentication
router.use(protect);

// @GET /api/hospitals/government  — Government hospitals only
// NOTE: These specific paths must come BEFORE /:id to avoid route conflict
router.get('/government', hospitalController.getGovernmentHospitals);

// @GET /api/hospitals/private  — Private hospitals only
router.get('/private', hospitalController.getPrivateHospitals);

// @GET /api/hospitals/city/amman  — Hospitals in Amman
router.get('/city/amman', hospitalController.getAmmanHospitals);

// @GET /api/hospitals  — All hospitals
router.get('/', hospitalController.getAllHospitals);

// @GET /api/hospitals/:id  — Single hospital with vaccines
router.get('/:id', hospitalController.getHospitalById);

module.exports = router;
