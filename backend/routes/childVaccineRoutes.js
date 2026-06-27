const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const childVaccineController = require('../controllers/childVaccineController');
const { protect } = require('../middleware/auth');

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({
      success: false,
      message: 'خطأ في التحقق من صحة البيانات.',
      errors: errors.array().map((e) => ({ field: e.path, message: e.msg })),
    });
  }
  next();
};

// All child vaccine routes are protected
router.use(protect);

// @GET /api/child-vaccines  - Get schedule records (filter by ?childId= or ?status=)
router.get('/', childVaccineController.getChildVaccines);

// @GET /api/child-vaccines/:id  - Get a specific record
router.get('/:id', childVaccineController.getChildVaccineById);

// @PATCH /api/child-vaccines/:id/mark-taken  - Mark a vaccine as completed
router.patch(
  '/:id/mark-taken',
  [
    body('takenDate').optional().isDate().withMessage('تاريخ الأخذ يجب أن يكون بصيغة YYYY-MM-DD.'),
    validate,
  ],
  childVaccineController.markVaccineTaken
);

// @PATCH /api/child-vaccines/:id/status  - Update status (Missed, Pending, etc.)
router.patch(
  '/:id/status',
  [
    body('status').isIn(['Pending', 'Completed', 'Missed', 'Upcoming']).withMessage('الحالة المدخلة غير صحيحة.'),
    body('scheduledDate').optional().isDate().withMessage('يرجى إدخال تاريخ مجدول صحيح.'),
    body('takenDate').optional().isDate().withMessage('يرجى إدخال تاريخ الأخذ بصيغة صحيحة.'),
    validate,
  ],
  childVaccineController.updateChildVaccineStatus
);

// @PATCH /api/child-vaccines/:id/reschedule - Reschedule a vaccine with safe-window validation
router.patch(
  '/:id/reschedule',
  [
    body('newDate').isDate().withMessage('يرجى إدخال تاريخ مجدول صحيح بصيغة YYYY-MM-DD.'),
    validate,
  ],
  childVaccineController.rescheduleVaccine
);

module.exports = router;
