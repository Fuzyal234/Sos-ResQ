const { DataTypes } = require("sequelize");

/** @param {import('sequelize').QueryInterface} queryInterface */
module.exports = {
  up: async (queryInterface: QueryInterface) => {
    await queryInterface.createTable("subscriptions", {
      id: {
        type: DataTypes.UUID,
        primaryKey: true,
        allowNull: false,
        defaultValue: DataTypes.UUIDV4,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      tier: {
        type: DataTypes.ENUM("1", "2", "3", "4", "5"),
        allowNull: false,
      },
      includes_house: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
      },
      includes_car: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
      },
      price: {
        type: DataTypes.FLOAT,
        allowNull: false,
      },
      created_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
      updated_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
    });
  },

  down: async (queryInterface) => {
    await queryInterface.dropTable("subscriptions");
  },
};
