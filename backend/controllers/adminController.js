const { User, Child, Vaccine, ChildVaccine } = require('../models');
const { Op } = require('sequelize');

// Get Admin Dashboard Statistics
exports.getStats = async (req, res, next) => {
  try {
    const [
      totalUsers,
      totalParents,
      totalChildren,
      totalVaccines,
      completedVaccines,
      pendingVaccines,
      upcomingVaccines,
      missedVaccines,
    ] = await Promise.all([
      User.count(),
      User.count({ where: { role: 'Parent' } }),
      Child.count(),
      Vaccine.count(),
      ChildVaccine.count({ where: { status: 'Completed' } }),
      ChildVaccine.count({ where: { status: 'Pending' } }),
      ChildVaccine.count({ where: { status: 'Upcoming' } }),
      ChildVaccine.count({ where: { status: 'Missed' } }),
    ]);

    const totalVaccineRecords = completedVaccines + pendingVaccines + upcomingVaccines + missedVaccines;
    const completionRate = totalVaccineRecords > 0
      ? ((completedVaccines / totalVaccineRecords) * 100).toFixed(1)
      : 0;

    return res.status(200).json({
      success: true,
      data: {
        users: {
          total: totalUsers,
          parents: totalParents,
          admins: totalUsers - totalParents,
        },
        children: {
          total: totalChildren,
        },
        vaccines: {
          defined: totalVaccines,
          completed: completedVaccines,
          pending: pendingVaccines,
          upcoming: upcomingVaccines,
          missed: missedVaccines,
          total: totalVaccineRecords,
          completionRate: `${completionRate}%`,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

// Get all users with their children count (Admin view)
exports.getAllUsersWithStats = async (req, res, next) => {
  try {
    const users = await User.findAll({
      attributes: { exclude: ['password'] },
      include: [
        {
          model: Child,
          as: 'children',
          attributes: ['id', 'firstName', 'lastName', 'birthDate', 'gender'],
        },
      ],
      order: [['createdAt', 'DESC']],
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

// Get all children across the system with vaccination stats (Admin view)
exports.getAllChildrenWithStats = async (req, res, next) => {
  try {
    const children = await Child.findAll({
      include: [
        {
          model: User,
          as: 'parent',
          attributes: ['id', 'fullName', 'email', 'phone'],
        },
        {
          model: ChildVaccine,
          as: 'childVaccines',
          attributes: ['id', 'status', 'scheduledDate', 'takenDate'],
        },
      ],
      order: [['createdAt', 'DESC']],
    });

    // Map with counts for quick admin overview
    const enriched = children.map((child) => {
      const plain = child.toJSON();
      const counts = {
        total: plain.childVaccines.length,
        completed: plain.childVaccines.filter((v) => v.status === 'Completed').length,
        pending: plain.childVaccines.filter((v) => v.status === 'Pending').length,
        upcoming: plain.childVaccines.filter((v) => v.status === 'Upcoming').length,
        missed: plain.childVaccines.filter((v) => v.status === 'Missed').length,
      };
      return { ...plain, vaccinationCounts: counts };
    });

    return res.status(200).json({
      success: true,
      count: children.length,
      data: enriched,
    });
  } catch (error) {
    next(error);
  }
};

// Get upcoming vaccines across all children in the next N days (Admin monitor)
exports.getUpcomingVaccinesReport = async (req, res, next) => {
  try {
    const days = parseInt(req.query.days) || 7;
    const today = new Date();
    const futureDate = new Date();
    futureDate.setDate(today.getDate() + days);

    const todayStr = today.toISOString().split('T')[0];
    const futureDateStr = futureDate.toISOString().split('T')[0];

    const upcoming = await ChildVaccine.findAll({
      where: {
        scheduledDate: {
          [Op.between]: [todayStr, futureDateStr],
        },
        status: ['Upcoming', 'Pending'],
      },
      include: [
        { model: Vaccine, as: 'vaccine' },
        {
          model: Child,
          as: 'child',
          include: [
            { model: User, as: 'parent', attributes: ['id', 'fullName', 'email', 'phone'] }
          ],
        },
      ],
      order: [['scheduledDate', 'ASC']],
    });

    return res.status(200).json({
      success: true,
      days,
      count: upcoming.length,
      data: upcoming,
    });
  } catch (error) {
    next(error);
  }
};
