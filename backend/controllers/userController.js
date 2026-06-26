const { User, Child } = require('../models');

// Get Profile of logged in user
exports.getProfile = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: { exclude: ['password'] },
      include: [{ model: Child, as: 'children' }]
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'لم يتم العثور على ملف المستخدم.',
      });
    }

    return res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

// Update Profile
exports.updateProfile = async (req, res, next) => {
  try {
    const { fullName, phone, email } = req.body;
    const user = await User.findByPk(req.user.id);

    if (email && email !== user.email) {
      // Check if email already in use
      const existingUser = await User.findOne({ where: { email } });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'البريد الإلكتروني الجديد مستخدم بالفعل من قبل مستخدم آخر.',
        });
      }
      user.email = email;
    }

    if (fullName) user.fullName = fullName;
    if (phone) user.phone = phone;

    await user.save();

    return res.status(200).json({
      success: true,
      message: 'تم تحديث الملف الشخصي بنجاح.',
      data: {
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

// Get All Users (Admin Only)
exports.getAllUsers = async (req, res, next) => {
  try {
    const users = await User.findAll({
      attributes: { exclude: ['password'] },
      include: [{ model: Child, as: 'children' }],
      order: [['createdAt', 'DESC']]
    });

    return res.status(200).json({
      success: true,
      count: users.length,
      data: users,
    });
  } catch (error) {
    next(error);
  }
};

// Get User by ID (Admin Only)
exports.getUserById = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.params.id, {
      attributes: { exclude: ['password'] },
      include: [{ model: Child, as: 'children' }]
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'لم يتم العثور على حساب المستخدم المطلوبة.',
      });
    }

    return res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

// Delete User (Admin Only)
exports.deleteUser = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'لم يتم العثور على حساب المستخدم لحذفه.',
      });
    }

    await user.destroy();

    return res.status(200).json({
      success: true,
      message: 'تم حذف حساب المستخدم وجميع البيانات المرتبطة به بنجاح.',
    });
  } catch (error) {
    next(error);
  }
};
