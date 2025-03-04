'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {

    await queryInterface.addColumn("subscriptions", "stripe_product_id", {
      type: Sequelize.STRING,
      allowNull: true,
    });

    await queryInterface.addColumn("subscriptions", "stripe_price_id", {
      type: Sequelize.STRING,
      allowNull: true,
    })
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn("subscriptions", "stripe_product_id");
    await queryInterface.removeColumn("subscriptions", "stripe_price_id");
  }
};
