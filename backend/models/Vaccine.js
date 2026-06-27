const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Vaccine = sequelize.define('Vaccine', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    vaccineName: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true,
      },
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    recommendedAgeMonths: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 0,
      },
    },
    doseNumber: {
      type: DataTypes.INTEGER,
      defaultValue: 1,
      allowNull: false,
      validate: {
        min: 1,
      },
    },
    availability: {
      type: DataTypes.ENUM('Government', 'Private', 'Both'),
      defaultValue: 'Both',
      allowNull: false,
    },
    intervalRules: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    safeWindowStartDays: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      allowNull: false,
    },
    safeWindowEndDays: {
      type: DataTypes.INTEGER,
      defaultValue: 30,
      allowNull: false,
    },
  }, {
    tableName: 'vaccines',
    timestamps: true,
  });

  Vaccine.associate = (models) => {
    // A vaccine has many linked child vaccines
    Vaccine.hasMany(models.ChildVaccine, {
      foreignKey: 'vaccineId',
      as: 'childVaccines',
      onDelete: 'CASCADE',
    });

    // A vaccine is available at many hospitals (many-to-many)
    Vaccine.belongsToMany(models.Hospital, {
      through: models.HospitalVaccine,
      foreignKey: 'vaccineId',
      otherKey: 'hospitalId',
      as: 'hospitals',
    });
  };

  return Vaccine;
};
