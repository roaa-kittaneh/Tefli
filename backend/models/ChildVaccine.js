const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const ChildVaccine = sequelize.define('ChildVaccine', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    childId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'children',
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
    scheduledDate: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    takenDate: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM('Pending', 'Completed', 'Missed', 'Upcoming'),
      defaultValue: 'Upcoming',
      allowNull: false,
    },
    reminderSent: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      allowNull: false,
    },
  }, {
    tableName: 'child_vaccines',
    timestamps: true,
  });

  ChildVaccine.associate = (models) => {
    // ChildVaccine belongs to a Child
    ChildVaccine.belongsTo(models.Child, {
      foreignKey: 'childId',
      as: 'child',
    });

    // ChildVaccine belongs to a Vaccine
    ChildVaccine.belongsTo(models.Vaccine, {
      foreignKey: 'vaccineId',
      as: 'vaccine',
    });

    // ChildVaccine has many notifications
    ChildVaccine.hasMany(models.Notification, {
      foreignKey: 'childVaccineId',
      as: 'notifications',
      onDelete: 'CASCADE',
    });
  };

  return ChildVaccine;
};
