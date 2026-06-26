const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const childController = require('../controllers/childController');
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

// All child routes are protected
router.use(protect);

// @POST /api/children  - Register a new child (auto-assigns vaccine schedule)
router.post(
  '/',
  [
    body('firstName').trim().notEmpty().withMessage('الاسم الأول للطفل مطلوب.'),
    body('lastName').trim().notEmpty().withMessage('الاسم الأخير للطفل مطلوب.'),
    body('gender').isIn(['Male', 'Female']).withMessage('الجنس يجب أن يكون Male أو Female.'),
    body('birthDate').isDate().withMessage('يرجى إدخال تاريخ ميلاد صحيح (YYYY-MM-DD).'),
    body('bloodType').optional().isIn(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']).withMessage('فصيلة الدم غير صحيحة.'),
    body('weight').optional().isFloat({ min: 0 }).withMessage('الوزن يجب أن يكون رقماً موجباً.'),
    body('height').optional().isFloat({ min: 0 }).withMessage('الطول يجب أن يكون رقماً موجباً.'),
    validate,
  ],
  childController.createChild
);

// @GET /api/children  - Get children (parents see their own, admins see all)
router.get('/', childController.getChildren);

// @GET /api/children/:id  - Get single child by ID
router.get('/:id', childController.getChildById);

// @PUT /api/children/:id  - Update child
router.put(
  '/:id',
  [
    body('firstName').optional().trim().notEmpty().withMessage('الاسم الأول لا يمكن أن يكون فارغاً.'),
    body('lastName').optional().trim().notEmpty().withMessage('الاسم الأخير لا يمكن أن يكون فارغاً.'),
    body('gender').optional().isIn(['Male', 'Female']).withMessage('الجنس يجب أن يكون Male أو Female.'),
    body('birthDate').optional().isDate().withMessage('يرجى إدخال تاريخ ميلاد صحيح.'),
    body('bloodType').optional().isIn(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']).withMessage('فصيلة الدم غير صحيحة.'),
    body('weight').optional().isFloat({ min: 0 }).withMessage('الوزن يجب أن يكون رقماً موجباً.'),
    body('height').optional().isFloat({ min: 0 }).withMessage('الطول يجب أن يكون رقماً موجباً.'),
    validate,
  ],
  childController.updateChild
);

// @DELETE /api/children/:id  - Delete child
router.delete('/:id', childController.deleteChild);

module.exports = router;
