const jwt = require('jsonwebtoken');
const { User } = require('../models');

// Protect routes - Authenticate JWT token
const protect = async (req, res, next) => {
  try {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'غير مصرح لك بالوصول. يرجى تسجيل الدخول أولاً.',
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Check if user still exists
    const user = await User.findByPk(decoded.id);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'المستخدم صاحب هذا الرمز المميز لم يعد موجوداً.',
      });
    }

    // Grant access to protected route
    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'رمز التحقق غير صالح أو منتهي الصلاحية.',
      error: error.message,
    });
  }
};

// Restrict access to specific roles (e.g., Admin)
const restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'ليس لديك الصلاحية للقيام بهذا الإجراء.',
      });
    }
    next();
  };
};

module.exports = {
  protect,
  restrictTo,
};
