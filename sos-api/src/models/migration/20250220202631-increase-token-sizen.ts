'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.changeColumn('user_sessions', 'token', {
      type: Sequelize.TEXT,
      allowNull: false,
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.changeColumn('user_sessions', 'token', {
      type: Sequelize.STRING, // Reverting to original VARCHAR(255)
      allowNull: false,
    });
  },
};
