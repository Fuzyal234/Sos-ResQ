'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.removeColumn("users", "gender");
    await queryInterface.addColumn("users", "gender", {
      type: Sequelize.ENUM("male", "female", "prefer_not_to_say"),
      allowNull: true
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn("users", "gender");
    await queryInterface.addColumn("users", "gender", {
      type: Sequelize.ENUM("male", "female", "other"),
      allowNull: true
    });
  }
};
