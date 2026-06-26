const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const User = sequelize.define('User', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    fullName: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true,
      },
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
        notEmpty: true,
      },
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    phone: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    role: {
      type: DataTypes.ENUM('Parent', 'Admin'),
      defaultValue: 'Parent',
      allowNull: false,
    },
  }, {
    tableName: 'users',
    timestamps: true,
  });

  User.associate = (models) => {
    // A parent has many children
    User.hasMany(models.Child, {
      foreignKey: 'parentId',
      as: 'children',
      onDelete: 'CASCADE',
    });

    // A user has many notifications
    User.hasMany(models.Notification, {
      foreignKey: 'userId',
      as: 'notifications',
      onDelete: 'CASCADE',
    });

    // A user can have password reset tokens
    User.hasMany(models.PasswordResetToken, {
      foreignKey: 'userId',
      as: 'passwordResetTokens',
      onDelete: 'CASCADE',
    });
  };

  return User;
};
