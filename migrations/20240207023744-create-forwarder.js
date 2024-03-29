'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Forwarders', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false
      },
      originProvince: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "Provinces",
          key: "id",
        },
      },
      destinationProvince: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "Provinces",
          key: "id",
        },
      },
      status: {
        type: Sequelize.BOOLEAN,
        allowNull: false
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Forwarders');
  }
};