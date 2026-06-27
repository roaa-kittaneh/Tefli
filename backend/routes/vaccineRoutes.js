const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const vaccineController = require('../controllers/vaccineController');
const { protect, restrictTo } = require('../middleware/auth');

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

// All vaccine routes are protected
router.use(protect);

// @GET /api/vaccines  - Get all vaccines (Parent + Admin)
router.get('/', vaccineController.getAllVaccines);

// @GET /api/vaccines/:id/hospitals  - Get hospitals where this vaccine is available
router.get('/:id/hospitals', vaccineController.getVaccineHospitals);

// @GET /api/vaccines/:id  - Get vaccine by ID (Parent + Admin)
router.get('/:id', vaccineController.getVaccineById);

// @POST /api/vaccines  - Create a vaccine (Admin only)
router.post(
  '/',
  restrictTo('Admin'),
  [
    body('vaccineName').trim().notEmpty().withMessage('اسم اللقاح مطلوب.'),
    body('recommendedAgeMonths').isInt({ min: 0 }).withMessage('العمر الموصى به يجب أن يكون عدداً صحيحاً موجباً بالأشهر.'),
    body('doseNumber').optional().isInt({ min: 1 }).withMessage('رقم الجرعة يجب أن يكون 1 أو أكثر.'),
    body('description').optional().trim(),
    validate,
  ],
  vaccineController.createVaccine
);

// @PUT /api/vaccines/:id  - Update vaccine (Admin only)
router.put(
  '/:id',
  restrictTo('Admin'),
  [
    body('vaccineName').optional().trim().notEmpty().withMessage('اسم اللقاح لا يمكن أن يكون فارغاً.'),
    body('recommendedAgeMonths').optional().isInt({ min: 0 }).withMessage('العمر الموصى به يجب أن يكون عدداً صحيحاً موجباً.'),
    body('doseNumber').optional().isInt({ min: 1 }).withMessage('رقم الجرعة يجب أن يكون 1 أو أكثر.'),
    validate,
  ],
  vaccineController.updateVaccine
);

// @DELETE /api/vaccines/:id  - Delete vaccine (Admin only)
router.delete('/:id', restrictTo('Admin'), vaccineController.deleteVaccine);

module.exports = router;
