"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn("subscriptions", "tier");

    await queryInterface.addColumn("subscriptions", "members_count", {
      type: Sequelize.INTEGER,
      allowNull: false,
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn("subscriptions", "tier", {
      type: Sequelize.STRING,
      allowNull: false,
    });

    await queryInterface.removeColumn("subscriptions", "members_count");
  },
};
