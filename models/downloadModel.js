const Sequelize = require("sequelize");
const sequelize = require("../util/database");

const Download = sequelize.define("downloads", {
  id: {
    type: Sequelize.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true,
  },
  downloadLink: {
    type: Sequelize.STRING,
    allowNull: false,
  }
});

module.exports = Download;
