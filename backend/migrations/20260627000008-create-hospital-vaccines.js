'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('hospital_vaccines', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      hospitalId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'hospitals',
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
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    });

    // Unique constraint to prevent duplicate hospital-vaccine associations
    await queryInterface.addIndex('hospital_vaccines', ['hospitalId', 'vaccineId'], {
      unique: true,
      name: 'hospital_vaccines_unique_pair',
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('hospital_vaccines');
  },
};
