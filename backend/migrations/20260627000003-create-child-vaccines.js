'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('child_vaccines', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      childId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'children',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      vaccineId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'vaccines',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      scheduledDate: {
        type: Sequelize.DATEONLY,
        allowNull: false,
      },
      takenDate: {
        type: Sequelize.DATEONLY,
        allowNull: true,
      },
      status: {
        type: Sequelize.ENUM('Pending', 'Completed', 'Missed', 'Upcoming'),
        defaultValue: 'Upcoming',
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
    await queryInterface.dropTable('child_vaccines');
  },
};
