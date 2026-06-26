const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Notification = sequelize.define('Notification', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id',
      },
    },
    childVaccineId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'child_vaccines',
        key: 'id',
      },
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true,
      },
    },
    body: {
      type: DataTypes.TEXT,
      allowNull: false,
      validate: {
        notEmpty: true,
      },
    },
    isRead: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      allowNull: false,
    },
  }, {
    tableName: 'notifications',
    timestamps: true,
  });

  Notification.associate = (models) => {
    // A notification belongs to a User
    Notification.belongsTo(models.User, {
      foreignKey: 'userId',
      as: 'user',
    });

    // A notification belongs to a ChildVaccine record (optional)
    Notification.belongsTo(models.ChildVaccine, {
      foreignKey: 'childVaccineId',
      as: 'childVaccine',
    });
  };

  return Notification;
};
