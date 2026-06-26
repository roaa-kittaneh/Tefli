const { Vaccine, Child, ChildVaccine } = require('../models');

// Helper to add months to a date
const addMonths = (dateStr, months) => {
  const date = new Date(dateStr);
  date.setMonth(date.getMonth() + months);
  return date.toISOString().split('T')[0];
};

// Get All Vaccines (Parents and Admins can view)
exports.getAllVaccines = async (req, res, next) => {
  try {
    const vaccines = await Vaccine.findAll({
      order: [['recommendedAgeMonths', 'ASC'], ['doseNumber', 'ASC']]
    });

    return res.status(200).json({
      success: true,
      count: vaccines.length,
      data: vaccines,
    });
  } catch (error) {
    next(error);
  }
};

// Get Vaccine by ID
exports.getVaccineById = async (req, res, next) => {
  try {
    const vaccine = await Vaccine.findByPk(req.params.id);

    if (!vaccine) {
      return res.status(404).json({
        success: false,
        message: 'لم يتم العثور على اللقاح المطلوب.',
      });
    }

    return res.status(200).json({
      success: true,
      data: vaccine,
    });
  } catch (error) {
    next(error);
  }
};

// Create a Vaccine (Admin Only) - Propagates to all children schedules
exports.createVaccine = async (req, res, next) => {
  try {
    const { vaccineName, description, recommendedAgeMonths, doseNumber } = req.body;

    const newVaccine = await Vaccine.create({
      vaccineName,
      description,
      recommendedAgeMonths,
      doseNumber: doseNumber || 1,
    });

    // Retroactively create schedules for all existing children dynamically
    const children = await Child.findAll();
    if (children.length > 0) {
      const todayStr = new Date().toISOString().split('T')[0];
      const newSchedules = children.map((child) => {
        const scheduledDate = addMonths(child.birthDate, newVaccine.recommendedAgeMonths);
        const status = scheduledDate < todayStr ? 'Pending' : 'Upcoming';

        return {
          childId: child.id,
          vaccineId: newVaccine.id,
          scheduledDate,
          status,
        };
      });

      await ChildVaccine.bulkCreate(newSchedules);
    }

    return res.status(201).json({
      success: true,
      message: 'تم إضافة اللقاح بنجاح وتحديث جداول الأطفال الحالية.',
      data: newVaccine,
    });
  } catch (error) {
    next(error);
  }
};

// Update Vaccine details (Admin Only)
exports.updateVaccine = async (req, res, next) => {
  try {
    const { vaccineName, description, recommendedAgeMonths, doseNumber } = req.body;
    const vaccine = await Vaccine.findByPk(req.params.id);

    if (!vaccine) {
      return res.status(404).json({
        success: false,
        message: 'لم يتم العثور على اللقاح المطلوب لتحديثه.',
      });
    }

    const originalAgeMonths = vaccine.recommendedAgeMonths;

    if (vaccineName) vaccine.vaccineName = vaccineName;
    if (description) vaccine.description = description;
    if (recommendedAgeMonths !== undefined) vaccine.recommendedAgeMonths = recommendedAgeMonths;
    if (doseNumber !== undefined) vaccine.doseNumber = doseNumber;

    await vaccine.save();

    // If recommendedAgeMonths changed, recalculate dates in all uncompleted child schedules
    if (recommendedAgeMonths !== undefined && recommendedAgeMonths !== originalAgeMonths) {
      const childVaccinesToUpdate = await ChildVaccine.findAll({
        where: {
          vaccineId: vaccine.id,
          status: ['Upcoming', 'Pending', 'Missed']
        },
        include: [{ model: Child, as: 'child' }]
      });

      const todayStr = new Date().toISOString().split('T')[0];

      for (const schedule of childVaccinesToUpdate) {
        if (schedule.child) {
          const newScheduledDate = addMonths(schedule.child.birthDate, recommendedAgeMonths);
          schedule.scheduledDate = newScheduledDate;

          // Re-evaluate pending vs upcoming status
          schedule.status = newScheduledDate < todayStr ? 'Pending' : 'Upcoming';
          await schedule.save();
        }
      }
    }

    return res.status(200).json({
      success: true,
      message: 'تم تحديث بيانات اللقاح بنجاح وجداول الأطفال المرتبطة به.',
      data: vaccine,
    });
  } catch (error) {
    next(error);
  }
};

// Delete Vaccine (Admin Only)
exports.deleteVaccine = async (req, res, next) => {
  try {
    const vaccine = await Vaccine.findByPk(req.params.id);

    if (!vaccine) {
      return res.status(404).json({
        success: false,
        message: 'لم يتم العثور على اللقاح لحذفه.',
      });
    }

    // Cascade delete is handled by database level / associate cascades
    await vaccine.destroy();

    return res.status(200).json({
      success: true,
      message: 'تم حذف اللقاح وسجلاته بنجاح.',
    });
  } catch (error) {
    next(error);
  }
};
