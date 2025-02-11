const argon2 = require("argon2");

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const hashedPassword = await argon2.hash("Admin@123");

    await queryInterface.bulkInsert(
      "users",
      [
        {
          id: "b1a2c3d4-e5f6-7890-1234-56789abcdef0",
          first_name: "Admin",
          last_name: "User",
          date_of_birth: "1990-01-01",
          phone_number: "+1234567890",
          email: "admin@example.com",
          password: hashedPassword,
          role: "admin",
          created_at: new Date(),
          updated_at: new Date(),
        },
      ],
      {}
    );
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete("users", { email: "admin@example.com" });
  },
};
