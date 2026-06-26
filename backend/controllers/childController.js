const { Child, Vaccine, ChildVaccine, User } = require('../models');

// Helper to add months to a date
const addMonths = (dateStr, months) => {
  const date = new Date(dateStr);
  date.setMonth(date.getMonth() + months);
  return date.toISOString().split('T')[0];
};

// Create a Child and dynamically assign Vaccine Schedule
exports.createChild = async (req, res, next) => {
  try {
    const {
      firstName,
      lastName,
      gender,
      birthDate,
      bloodType,
      weight,
      height,
      allergies,
      chronicDiseases,
      notes
    } = req.body;

    const parentId = req.user.role === 'Admin' && req.body.parentId ? req.body.parentId : req.user.id;

    // Verify parent exists
    const parent = await User.findByPk(parentId);
    if (!parent) {
      return res.status(404).json({
        success: false,
        message: 'ولي الأمر المحدد غير موجود.',
      });
    }

    // Create Child record
    const child = await Child.create({
      parentId,
      firstName,
      lastName,
      gender,
      birthDate,
      bloodType,
      weight,
      height,
      allergies,
      chronicDiseases,
      notes
    });

    // Fetch all active vaccines from database dynamically
    const allVaccines = await Vaccine.findAll();

    // Map vaccines to child's schedule
    const todayStr = new Date().toISOString().split('T')[0];
    const childVaccineSchedules = allVaccines.map((vaccine) => {
      const scheduledDate = addMonths(birthDate, vaccine.recommendedAgeMonths);
      
      // Determine initial status based on whether scheduled date is in past or future
      let status = 'Upcoming';
      if (scheduledDate < todayStr) {
        status = 'Pending'; // Past due but not yet marked taken
      }

      return {
        childId: child.id,
        vaccineId: vaccine.id,
        scheduledDate,
        status,
      };
    });

    // Bulk insert vaccine schedule
    if (childVaccineSchedules.length > 0) {
      await ChildVaccine.bulkCreate(childVaccineSchedules);
    }

    // Retrieve child with schedules
    const childWithSchedule = await Child.findByPk(child.id, {
      include: [
        {
          model: ChildVaccine,
          as: 'childVaccines',
          include: [{ model: Vaccine, as: 'vaccine' }]
        }
      ]
    });

    return res.status(201).json({
      success: true,
      message: 'تم تسجيل الطفل وتوليد جدول التطعيمات الخاص به بنجاح.',
      data: childWithSchedule,
    });
  } catch (error) {
    next(error);
  }
};

// Get Children (Parents get their own, Admins get all or by parentId query)
exports.getChildren = async (req, res, next) => {
  try {
    let whereClause = {};

    // If Parent, only show their children
    if (req.user.role === 'Parent') {
      whereClause.parentId = req.user.id;
    } else if (req.user.role === 'Admin' && req.query.parentId) {
      // Admin query filter by parent
      whereClause.parentId = req.query.parentId;
    }

    const children = await Child.findAll({
      where: whereClause,
      include: [
        {
          model: User,
          as: 'parent',
          attributes: ['id', 'fullName', 'email', 'phone']
        }
      ],
      order: [['firstName', 'ASC']]
    });

    return res.status(200).json({
      success: true,
      count: children.length,
      data: children,
    });
  } catch (error) {
    next(error);
  }
};

// Get Child by ID
exports.getChildById = async (req, res, next) => {
  try {
    const child = await Child.findByPk(req.params.id, {
      include: [
        {
          model: User,
          as: 'parent',
          attributes: ['id', 'fullName', 'email', 'phone']
        },
        {
          model: ChildVaccine,
          as: 'childVaccines',
          include: [{ model: Vaccine, as: 'vaccine' }]
        }
      ]
    });

    if (!child) {
      return res.status(404).json({
        success: false,
        message: 'لم يتم العثور على سجل الطفل.',
      });
    }

    // Check ownership
    if (req.user.role === 'Parent' && child.parentId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'ليس لديك الإذن لعرض هذا السجل.',
      });
    }

    return res.status(200).json({
      success: true,
      data: child,
    });
  } catch (error) {
    next(error);
  }
};

// Update Child details
exports.updateChild = async (req, res, next) => {
  try {
    const child = await Child.findByPk(req.params.id);

    if (!child) {
      return res.status(404).json({
        success: false,
        message: 'لم يتم العثور على سجل الطفل لتحديثه.',
      });
    }

    // Check ownership
    if (req.user.role === 'Parent' && child.parentId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'ليس لديك الإذن لتعديل هذا السجل.',
      });
    }

    const {
      firstName,
      lastName,
      gender,
      birthDate,
      bloodType,
      weight,
      height,
      allergies,
      chronicDiseases,
      notes
    } = req.body;

    // If birth date changed, we must recalculate and update schedules that are not completed!
    let dateChanged = false;
    if (birthDate && birthDate !== child.birthDate) {
      child.birthDate = birthDate;
      dateChanged = true;
    }

    if (firstName) child.firstName = firstName;
    if (lastName) child.lastName = lastName;
    if (gender) child.gender = gender;
    if (bloodType) child.bloodType = bloodType;
    if (weight) child.weight = weight;
    if (height) child.height = height;
    if (allergies) child.allergies = allergies;
    if (chronicDiseases) child.chronicDiseases = chronicDiseases;
    if (notes) child.notes = notes;

    await child.save();

    // Recalculate dates if birthDate was modified
    if (dateChanged) {
      const pendingSchedules = await ChildVaccine.findAll({
        where: {
          childId: child.id,
          status: ['Upcoming', 'Pending', 'Missed']
        },
        include: [{ model: Vaccine, as: 'vaccine' }]
      });

      const todayStr = new Date().toISOString().split('T')[0];

      for (const schedule of pendingSchedules) {
        const newScheduledDate = addMonths(birthDate, schedule.vaccine.recommendedAgeMonths);
        schedule.scheduledDate = newScheduledDate;
        
        // Readjust status based on the new date relative to today
        if (schedule.status !== 'Completed') {
          schedule.status = newScheduledDate < todayStr ? 'Pending' : 'Upcoming';
        }
        await schedule.save();
      }
    }

    return res.status(200).json({
      success: true,
      message: 'تم تحديث بيانات الطفل بنجاح.',
      data: child,
    });
  } catch (error) {
    next(error);
  }
};

// Delete Child
exports.deleteChild = async (req, res, next) => {
  try {
    const child = await Child.findByPk(req.params.id);

    if (!child) {
      return res.status(404).json({
        success: false,
        message: 'لم يتم العثور على سجل الطفل لحذفه.',
      });
    }

    // Check ownership
    if (req.user.role === 'Parent' && child.parentId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'ليس لديك الإذن لحذف هذا السجل.',
      });
    }

    await child.destroy();

    return res.status(200).json({
      success: true,
      message: 'تم حذف سجل الطفل وجميع سجلات التطعيمات التابعة له بنجاح.',
    });
  } catch (error) {
    next(error);
  }
};
