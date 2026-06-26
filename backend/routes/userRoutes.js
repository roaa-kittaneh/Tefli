const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const userController = require('../controllers/userController');
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

// All user routes are protected
router.use(protect);

// @GET /api/users/profile  - Get own profile
router.get('/profile', userController.getProfile);

// @PUT /api/users/profile  - Update own profile
router.put(
  '/profile',
  [
    body('fullName').optional().trim().isLength({ min: 2 }).withMessage('الاسم يجب أن يحتوي على حرفين على الأقل.'),
    body('email').optional().trim().isEmail().withMessage('يرجى إدخال بريد إلكتروني صحيح.').normalizeEmail(),
    body('phone').optional().isMobilePhone().withMessage('رقم الهاتف غير صحيح.'),
    validate,
  ],
  userController.updateProfile
);

// @GET /api/users  - Get all users (Admin only)
router.get('/', restrictTo('Admin'), userController.getAllUsers);

// @GET /api/users/:id  - Get user by ID (Admin only)
router.get('/:id', restrictTo('Admin'), userController.getUserById);

// @DELETE /api/users/:id  - Delete user (Admin only)
router.delete('/:id', restrictTo('Admin'), userController.deleteUser);

module.exports = router;
