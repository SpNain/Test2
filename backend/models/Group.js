const Sequelize = require("sequelize");
const sequelize = require("../utils/database");

const Group = sequelize.define("groups", {
  id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true,
  },
  groupName: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  groupDescription: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  groupAdmin: {
    type: Sequelize.INTEGER,
    allowNull: false,
  },
});

module.exports = Group;