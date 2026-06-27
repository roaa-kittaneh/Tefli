const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Hospital = sequelize.define('Hospital', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: false,
      validate: {
        notEmpty: true,
      },
    },
    type: {
      type: DataTypes.ENUM('Government', 'Private'),
      allowNull: false,
    },
    city: {
      type: DataTypes.STRING(100),
      allowNull: false,
      defaultValue: 'Amman',
    },
    latitude: {
      type: DataTypes.DECIMAL(10, 7),
      allowNull: true,
    },
    longitude: {
      type: DataTypes.DECIMAL(10, 7),
      allowNull: true,
    },
    address: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    phone: {
      type: DataTypes.STRING(30),
      allowNull: true,
    },
    isVaccinationCenter: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
    status: {
      type: DataTypes.ENUM('Active', 'Inactive'),
      allowNull: false,
      defaultValue: 'Active',
    },
  }, {
    tableName: 'hospitals',
    timestamps: true,
  });

  Hospital.associate = (models) => {
    // A hospital provides many vaccines (many-to-many)
    Hospital.belongsToMany(models.Vaccine, {
      through: models.HospitalVaccine,
      foreignKey: 'hospitalId',
      otherKey: 'vaccineId',
      as: 'vaccines',
    });
  };

  return Hospital;
};
