const Sequelize = require("sequelize");
const sequelize = require("../util/database");

const Media = sequelize.define("Media", {
  id: {
    type: Sequelize.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true,
  },
  mediaLink: {
    type: Sequelize.STRING,
    allowNull: false,
  }
});

module.exports = Media;
