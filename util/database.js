const Sequelize = require("sequelize");

const sequelize = new Sequelize(
  process.env.DB_NAME,   // your RDS DB name
  process.env.DB_USER,   // your RDS username
  process.env.DB_PASSWORD, // your RDS password
  {
    host: process.env.DB_HOST, // your RDS endpoint
    dialect: process.env.DB_DIALECT, // 'mysql' | 'mariadb' | 'postgres' | 'mssql'
  }
);

module.exports = sequelize;