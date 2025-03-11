const { DataTypes } = require("sequelize");
const sequelize = require("../utils/database");

const Donation = sequelize.define("Donations", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true,
  },
  paymentId: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  charityName: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  projectName: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  donationAmount: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  receiptUrl: {
    type: DataTypes.STRING,
    allowNull: true,
  },
});

module.exports = Donation;
