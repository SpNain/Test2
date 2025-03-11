const { DataTypes } = require("sequelize");
const sequelize = require("../utils/database");

const Project = sequelize.define("Projects", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true,
  },
  name: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  raisedFunds: {
    type: DataTypes.FLOAT,
    defaultValue: 0,
  },
  requiredFunds: {
    type: DataTypes.FLOAT,
    allowNull: false,
  },
  status: {
    type: DataTypes.TEXT,
    defaultValue: "Active",
  },
  donors: {
    type: DataTypes.JSON,
    defaultValue: [],
  },
});

module.exports = Project;
