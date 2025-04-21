'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.removeColumn('subscriptions', 'price');
    await queryInterface.removeColumn('subscriptions', 'stripe_price_id');
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.addColumn('subscriptions', 'price', {
      type: Sequelize.FLOAT,
      allowNull: false,
    });
    await queryInterface.addColumn('subscriptions', 'stripe_price_id', {
      type: Sequelize.STRING,
      allowNull: true,
    });
  },
};
