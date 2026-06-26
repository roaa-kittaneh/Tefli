const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const PasswordResetToken = sequelize.define('PasswordResetToken', {
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
    token: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    expiresAt: {
      type: DataTypes.DATE,
      allowNull: false,
    },
  }, {
    tableName: 'password_reset_tokens',
    timestamps: true,
  });

  PasswordResetToken.associate = (models) => {
    // A password reset token belongs to a User
    PasswordResetToken.belongsTo(models.User, {
      foreignKey: 'userId',
      as: 'user',
    });
  };

  return PasswordResetToken;
};
