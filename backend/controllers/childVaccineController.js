const { ChildVaccine, Vaccine, Child, User, Notification } = require('../models');
const { Op } = require('sequelize');

// Get all ChildVaccines (with filters: childId, status)
exports.getChildVaccines = async (req, res, next) => {
  try {
    const { childId, status } = req.query;
    const whereClause = {};

    if (status) {
      whereClause.status = status;
    }

    // If Parent, they can only access their own children's records
    if (req.user.role === 'Parent') {
      // Build a list of their children IDs
      const myChildren = await Child.findAll({
        where: { parentId: req.user.id },
        attributes: ['id']
      });
      const myChildIds = myChildren.map((c) => c.id);

      if (childId) {
        // Ensure the requested childId belongs to this parent
        if (!myChildIds.includes(parseInt(childId))) {
          return res.status(403).json({
            success: false,
            message: 'ليس لديك صلاحية لعرض سجلات هذا الطفل.',
          });
        }
        whereClause.childId = childId;
      } else {
        whereClause.childId = { [Op.in]: myChildIds };
      }
    } else {
      // Admin can filter by childId or see all
      if (childId) whereClause.childId = childId;
    }

    const records = await ChildVaccine.findAll({
      where: whereClause,
      include: [
        {
          model: Vaccine,
          as: 'vaccine',
          attributes: ['id', 'vaccineName', 'description', 'recommendedAgeMonths', 'doseNumber']
        },
        {
          model: Child,
          as: 'child',
          attributes: ['id', 'firstName', 'lastName', 'birthDate']
        }
      ],
      order: [['scheduledDate', 'ASC']]
    });

    return res.status(200).json({
      success: true,
      count: records.length,
      data: records,
    });
  } catch (error) {
    next(error);
  }
};

// Get a single ChildVaccine record by ID
exports.getChildVaccineById = async (req, res, next) => {
  try {
    const record = await ChildVaccine.findByPk(req.params.id, {
      include: [
        { model: Vaccine, as: 'vaccine' },
        {
          model: Child,
          as: 'child',
          include: [{ model: User, as: 'parent', attributes: ['id', 'fullName', 'email'] }]
        }
      ]
    });

    if (!record) {
      return res.status(404).json({
        success: false,
        message: 'لم يتم العثور على سجل التطعيم المطلوب.',
      });
    }

    // Ownership check for Parent
    if (req.user.role === 'Parent' && record.child.parentId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'ليس لديك صلاحية لعرض هذا السجل.',
      });
    }

    return res.status(200).json({
      success: true,
      data: record,
    });
  } catch (error) {
    next(error);
  }
};

// Mark a vaccine as Completed (taken)
exports.markVaccineTaken = async (req, res, next) => {
  try {
    const { takenDate } = req.body;
    const record = await ChildVaccine.findByPk(req.params.id, {
      include: [
        { model: Vaccine, as: 'vaccine' },
        { model: Child, as: 'child' }
      ]
    });

    if (!record) {
      return res.status(404).json({
        success: false,
        message: 'لم يتم العثور على سجل التطعيم.',
      });
    }

    // Ownership check for Parent
    if (req.user.role === 'Parent' && record.child.parentId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'ليس لديك الصلاحية لتعديل هذا السجل.',
      });
    }

    // Update status and taken date
    record.status = 'Completed';
    record.takenDate = takenDate || new Date().toISOString().split('T')[0];
    await record.save();

    // Create an in-app notification for completion
    const parentId = record.child.parentId;
    await Notification.create({
      userId: parentId,
      childVaccineId: record.id,
      title: 'تم إكمال التطعيم ✅',
      body: `تم تسجيل تطعيم "${record.vaccine.vaccineName}" للطفل ${record.child.firstName} بتاريخ ${record.takenDate}.`,
      isRead: false,
    });

    return res.status(200).json({
      success: true,
      message: 'تم تسجيل التطعيم كمكتمل بنجاح.',
      data: record,
    });
  } catch (error) {
    next(error);
  }
};

// Update ChildVaccine status manually (e.g., Missed, Pending)
exports.updateChildVaccineStatus = async (req, res, next) => {
  try {
    const { status, scheduledDate, takenDate } = req.body;
    const validStatuses = ['Pending', 'Completed', 'Missed', 'Upcoming'];

    if (status && !validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `الحالة غير صالحة. القيم المتاحة: ${validStatuses.join(', ')}`,
      });
    }

    const record = await ChildVaccine.findByPk(req.params.id, {
      include: [{ model: Child, as: 'child' }]
    });

    if (!record) {
      return res.status(404).json({
        success: false,
        message: 'لم يتم العثور على سجل التطعيم.',
      });
    }

    // Ownership check
    if (req.user.role === 'Parent' && record.child.parentId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'ليس لديك صلاحية لتعديل هذا السجل.',
      });
    }

    if (status) record.status = status;
    if (scheduledDate) record.scheduledDate = scheduledDate;
    if (takenDate) record.takenDate = takenDate;
    if (status !== 'Completed') record.takenDate = null;

    await record.save();

    return res.status(200).json({
      success: true,
      message: 'تم تحديث حالة التطعيم بنجاح.',
      data: record,
    });
  } catch (error) {
    next(error);
  }
};
