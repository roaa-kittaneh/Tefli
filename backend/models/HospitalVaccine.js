const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const HospitalVaccine = sequelize.define('HospitalVaccine', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    hospitalId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'hospitals',
        key: 'id',
      },
    },
    vaccineId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'vaccines',
        key: 'id',
      },
    },
  }, {
    tableName: 'hospital_vaccines',
    timestamps: true,
  });

  return HospitalVaccine;
};
