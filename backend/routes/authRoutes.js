const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const authController = require('../controllers/authController');
const { protect } = require('../middleware/auth');

// Validation middleware helper
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

// @POST /api/auth/register
router.post(
  '/register',
  [
    body('fullName').trim().notEmpty().withMessage('الاسم الكامل مطلوب.').isLength({ min: 2 }).withMessage('يجب أن يكون الاسم حرفين على الأقل.'),
    body('email').trim().isEmail().withMessage('يرجى إدخال بريد إلكتروني صحيح.').normalizeEmail(),
    body('password').isLength({ min: 8 }).withMessage('يجب أن تتكون كلمة المرور من 8 أحرف على الأقل.'),
    body('phone').optional().isMobilePhone().withMessage('يرجى إدخال رقم هاتف صحيح.'),
    validate,
  ],
  authController.register
);

// @POST /api/auth/login
router.post(
  '/login',
  [
    body('email').trim().isEmail().withMessage('يرجى إدخال بريد إلكتروني صحيح.').normalizeEmail(),
    body('password').notEmpty().withMessage('كلمة المرور مطلوبة.'),
    validate,
  ],
  authController.login
);

// @POST /api/auth/logout  (Protected)
router.post('/logout', protect, authController.logout);

// @POST /api/auth/change-password  (Protected)
router.post(
  '/change-password',
  protect,
  [
    body('currentPassword').notEmpty().withMessage('كلمة المرور الحالية مطلوبة.'),
    body('newPassword').isLength({ min: 8 }).withMessage('يجب أن تتكون كلمة المرور الجديدة من 8 أحرف على الأقل.'),
    validate,
  ],
  authController.changePassword
);

// @POST /api/auth/forgot-password
router.post(
  '/forgot-password',
  [
    body('email').trim().isEmail().withMessage('يرجى إدخال بريد إلكتروني صحيح.').normalizeEmail(),
    validate,
  ],
  authController.forgotPassword
);

// @POST /api/auth/reset-password
router.post(
  '/reset-password',
  [
    body('token').notEmpty().withMessage('رمز إعادة التعيين مطلوب.'),
    body('newPassword').isLength({ min: 8 }).withMessage('يجب أن تتكون كلمة المرور الجديدة من 8 أحرف على الأقل.'),
    validate,
  ],
  authController.resetPassword
);

module.exports = router;
