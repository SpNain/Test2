const sequelize = require("../utils/database");
const Sequelize = require("sequelize");

const ArchivedChat = sequelize.define("ArchivedChats", {
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
  userId: {
    type: Sequelize.INTEGER,
    allowNull: false,
  },
  groupId: {
    type: Sequelize.INTEGER,
  },
});

module.exports = ArchivedChat;