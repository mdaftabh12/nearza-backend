const { Sequelize } = require("sequelize");

const sequelize = new Sequelize(
  process.env.SQL_DB_NAME,
  process.env.SQL_DB_USER,
  process.env.SQL_DB_PASSWORD,
  {
    host: process.env.SQL_DB_HOST,
    dialect: process.env.SQL_DB_DIALECT || "mysql",
    logging: false, // optional
  },
);

const connectMySQL = async () => {
  try {
    await sequelize.authenticate();
    console.log("✅ MySQL connected successfully");
  } catch (error) {
    console.error("❌ MySQL connection failed:", error.message);
  }
};

module.exports = { sequelize, connectMySQL };
