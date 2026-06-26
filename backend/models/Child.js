const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Child = sequelize.define('Child', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    parentId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id',
      },
    },
    firstName: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true,
      },
    },
    lastName: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true,
      },
    },
    gender: {
      type: DataTypes.ENUM('Male', 'Female'),
      allowNull: false,
    },
    birthDate: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    bloodType: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    weight: {
      type: DataTypes.DECIMAL(5, 2), // e.g. 999.99 kg max
      allowNull: true,
    },
    height: {
      type: DataTypes.DECIMAL(5, 2), // e.g. 999.99 cm max
      allowNull: true,
    },
    allergies: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    chronicDiseases: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  }, {
    tableName: 'children',
    timestamps: true,
  });

  Child.associate = (models) => {
    // A child belongs to a parent user
    Child.belongsTo(models.User, {
      foreignKey: 'parentId',
      as: 'parent',
    });

    // A child has many child vaccines
    Child.hasMany(models.ChildVaccine, {
      foreignKey: 'childId',
      as: 'childVaccines',
      onDelete: 'CASCADE',
    });
  };

  return Child;
};
