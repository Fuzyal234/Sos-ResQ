'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('sos_requests', {
      id: {
        type: Sequelize.UUID,
        primaryKey: true,
        defaultValue: Sequelize.fn('gen_random_uuid'),
        allowNull: false,
      },
      sos_user_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'sos_users',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      agent_id: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: 'agents',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
      request_timestamp: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      location: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      status: {
        type: Sequelize.ENUM('pending', 'in_progress', 'resolved', 'rejected', 'cancelled'),
        allowNull: false,
        defaultValue: 'pending',
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('NOW()'),
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('NOW()'),
      },
    });
  },

  down: async (queryInterface) => {
    await queryInterface.dropTable('sos_requests');
  },
};
