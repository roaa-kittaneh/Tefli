'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('vaccines', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      vaccineName: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      recommendedAgeMonths: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      doseNumber: {
        type: Sequelize.INTEGER,
        defaultValue: 1,
        allowNull: false,
      },
      availability: {
        type: Sequelize.ENUM('Government', 'Private', 'Both'),
        defaultValue: 'Both',
        allowNull: false,
      },
      intervalRules: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      safeWindowStartDays: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
        allowNull: false,
      },
      safeWindowEndDays: {
        type: Sequelize.INTEGER,
        defaultValue: 30,
        allowNull: false,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('vaccines');
  },
};
