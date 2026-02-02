import { Sequelize, Dialect } from "sequelize";

const {
  SQL_DB_NAME,
  SQL_DB_USER,
  SQL_DB_PASSWORD,
  SQL_DB_HOST,
  SQL_DB_DIALECT,
} = process.env;

if (
  !SQL_DB_NAME ||
  !SQL_DB_USER ||
  !SQL_DB_PASSWORD ||
  !SQL_DB_HOST
) {
  throw new Error("❌ Missing required MySQL environment variables");
}

const sequelize = new Sequelize(
  SQL_DB_NAME,
  SQL_DB_USER,
  SQL_DB_PASSWORD,
  {
    host: SQL_DB_HOST,
    dialect: (SQL_DB_DIALECT as Dialect) || "mysql",
    logging: false,
  }
);

const connectMySQL = async (): Promise<void> => {
  try {
    await sequelize.authenticate();
    console.log("✅ MySQL connected successfully");
  } catch (error: any) {
    console.error("❌ MySQL connection failed:", error.message);
  }
};

export { sequelize, connectMySQL };
