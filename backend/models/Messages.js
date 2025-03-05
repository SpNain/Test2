const sequelize = require("../utils/database");
const Sequelize = require("sequelize");

const Messages = sequelize.define("messages", {
  id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true,
  },
  message: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  senderName: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  fileUrl: {
    type: Sequelize.STRING,
    allowNull: true,
  },
});

module.exports = Messages;