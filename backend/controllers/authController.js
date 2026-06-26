const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { User, PasswordResetToken } = require('../models');
const { sendPasswordResetEmail } = require('../services/mailService');
const { Op } = require('sequelize');

// Helper to sign JWT Token
const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '24h',
  });
};

// Register Parent User
exports.register = async (req, res, next) => {
  try {
    const { fullName, email, password, phone } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'البريد الإلكتروني مسجل بالفعل. يرجى تسجيل الدخول بدلاً من ذلك.',
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user with role 'Parent'
    const newUser = await User.create({
      fullName,
      email,
      password: hashedPassword,
      phone,
      role: 'Parent',
    });

    // Generate JWT token
    const token = signToken(newUser.id);

    return res.status(201).json({
      success: true,
      message: 'تم إنشاء الحساب بنجاح.',
      token,
      user: {
        id: newUser.id,
        fullName: newUser.fullName,
        email: newUser.email,
        phone: newUser.phone,
        role: newUser.role,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Login User (Parent or Admin)
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'يرجى تقديم البريد الإلكتروني وكلمة المرور.',
      });
    }

    // Find user
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'البريد الإلكتروني أو كلمة المرور غير صحيحة.',
      });
    }

    // Validate password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'البريد الإلكتروني أو كلمة المرور غير صحيحة.',
      });
    }

    // Generate JWT token
    const token = signToken(user.id);

    return res.status(200).json({
      success: true,
      message: 'تم تسجيل الدخول بنجاح.',
      token,
      user: {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        phone: user.phone,
        role: user.role,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Logout User
exports.logout = async (req, res, next) => {
  try {
    // JWT is stateless, so client deletes the token. Just return confirmation message.
    return res.status(200).json({
      success: true,
      message: 'تم تسجيل الخروج بنجاح.',
    });
  } catch (error) {
    next(error);
  }
};

// Change Password
exports.changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findByPk(req.user.id);

    // Verify current password
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: 'كلمة المرور الحالية غير صحيحة.',
      });
    }

    // Hash and update new password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();

    return res.status(200).json({
      success: true,
      message: 'تم تغيير كلمة المرور بنجاح.',
    });
  } catch (error) {
    next(error);
  }
};

// Forgot Password Request
exports.forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ where: { email } });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'البريد الإلكتروني المدخل غير مرتبط بأي حساب.',
      });
    }

    // Generate 6-digit numeric code or random hex token
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 3600000); // 1 Hour from now

    // Save token to database
    await PasswordResetToken.create({
      userId: user.id,
      token,
      expiresAt,
    });

    // Create password reset URL link
    const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
    const resetUrl = `${clientUrl}/reset-password?token=${token}`;

    // Send email
    await sendPasswordResetEmail(user.email, user.fullName, resetUrl);

    return res.status(200).json({
      success: true,
      message: 'تم إرسال رابط إعادة تعيين كلمة المرور إلى بريدك الإلكتروني.',
    });
  } catch (error) {
    next(error);
  }
};

// Reset Password Action
exports.resetPassword = async (req, res, next) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'الرجاء توفير رمز التحقق وكلمة المرور الجديدة.',
      });
    }

    // Find password reset record
    const resetTokenRecord = await PasswordResetToken.findOne({
      where: {
        token,
        expiresAt: {
          [Op.gt]: new Date(),
        },
      },
      include: [{ model: User, as: 'user' }],
    });

    if (!resetTokenRecord) {
      return res.status(400).json({
        success: false,
        message: 'رمز إعادة التعيين غير صالح أو انتهت صلاحيته.',
      });
    }

    const user = resetTokenRecord.user;

    // Hash and update new password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();

    // Delete token
    await resetTokenRecord.destroy();

    return res.status(200).json({
      success: true,
      message: 'تمت إعادة تعيين كلمة المرور بنجاح. يمكنك الآن تسجيل الدخول باستخدام كلمة المرور الجديدة.',
    });
  } catch (error) {
    next(error);
  }
};
