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
  };

  return Vaccine;
};
