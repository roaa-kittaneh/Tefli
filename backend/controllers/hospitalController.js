const { Hospital, Vaccine, HospitalVaccine } = require('../models');
const { Op } = require('sequelize');

// Shared vaccine attributes to include
const vaccineAttributes = ['id', 'vaccineName', 'description', 'recommendedAgeMonths', 'doseNumber', 'availability'];

// GET /api/hospitals — All active hospitals
exports.getAllHospitals = async (req, res, next) => {
  try {
    const hospitals = await Hospital.findAll({
      where: { status: 'Active' },
      include: [{
        model: Vaccine,
        as: 'vaccines',
        attributes: vaccineAttributes,
        through: { attributes: [] }, // exclude junction columns
      }],
      order: [['type', 'ASC'], ['name', 'ASC']],
    });

    return res.status(200).json({
      success: true,
      count: hospitals.length,
      data: hospitals,
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/hospitals/:id — Single hospital by ID
exports.getHospitalById = async (req, res, next) => {
  try {
    const hospital = await Hospital.findOne({
      where: { id: req.params.id, status: 'Active' },
      include: [{
        model: Vaccine,
        as: 'vaccines',
        attributes: vaccineAttributes,
        through: { attributes: [] },
      }],
    });

    if (!hospital) {
      return res.status(404).json({
        success: false,
        message: 'لم يتم العثور على المستشفى المطلوب.',
      });
    }

    return res.status(200).json({
      success: true,
      data: hospital,
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/hospitals/government — Government hospitals only
exports.getGovernmentHospitals = async (req, res, next) => {
  try {
    const hospitals = await Hospital.findAll({
      where: { type: 'Government', status: 'Active' },
      include: [{
        model: Vaccine,
        as: 'vaccines',
        attributes: vaccineAttributes,
        through: { attributes: [] },
      }],
      order: [['name', 'ASC']],
    });

    return res.status(200).json({
      success: true,
      count: hospitals.length,
      data: hospitals,
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/hospitals/private — Private hospitals only
exports.getPrivateHospitals = async (req, res, next) => {
  try {
    const hospitals = await Hospital.findAll({
      where: { type: 'Private', status: 'Active' },
      include: [{
        model: Vaccine,
        as: 'vaccines',
        attributes: vaccineAttributes,
        through: { attributes: [] },
      }],
      order: [['name', 'ASC']],
    });

    return res.status(200).json({
      success: true,
      count: hospitals.length,
      data: hospitals,
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/hospitals/city/amman — Hospitals in Amman
exports.getAmmanHospitals = async (req, res, next) => {
  try {
    const hospitals = await Hospital.findAll({
      where: {
        city: { [Op.like]: '%Amman%' },
        status: 'Active',
      },
      include: [{
        model: Vaccine,
        as: 'vaccines',
        attributes: vaccineAttributes,
        through: { attributes: [] },
      }],
      order: [['type', 'ASC'], ['name', 'ASC']],
    });

    return res.status(200).json({
      success: true,
      count: hospitals.length,
      data: hospitals,
    });
  } catch (error) {
    next(error);
  }
};
