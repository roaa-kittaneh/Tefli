const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { protect, restrictTo } = require('../middleware/auth');

// All admin routes are protected and restricted to Admins only
router.use(protect);
router.use(restrictTo('Admin'));

// @GET /api/admin/stats  - Dashboard statistics
router.get('/stats', adminController.getStats);

// @GET /api/admin/users  - All users with child count
router.get('/users', adminController.getAllUsersWithStats);

// @GET /api/admin/children  - All children with vaccination stats
router.get('/children', adminController.getAllChildrenWithStats);

// @GET /api/admin/upcoming-vaccines  - Upcoming vaccines across system (optional ?days=7)
router.get('/upcoming-vaccines', adminController.getUpcomingVaccinesReport);

module.exports = router;
