'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.sequelize.query('CREATE EXTENSION IF NOT EXISTS "pgcrypto";');

    await queryInterface.createTable('rental_details', {
      rental_id: {
        type: Sequelize.UUID,
        primaryKey: true,
        defaultValue: Sequelize.fn('gen_random_uuid'),
        allowNull: false,
      },
      property: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      street_address: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      appartment: { 
        type: Sequelize.STRING,
        allowNull: false,
      },
      rent_amount: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      due_date: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      month_to_month: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
      },
      lease_start_date: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      lease_end_date: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      lease_type: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      lease_co_signers: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      lease_source: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },
    });
  },

  down: async (queryInterface) => {
    // Drop the "rental_details" table
    await queryInterface.dropTable('rental_details');
  },
};
