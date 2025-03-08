const { DataTypes } = require("sequelize");
const sequelize = require("../utils/database");

const Charity = sequelize.define("Charity", {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
            isEmail: true,
        },
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    mission: {
        type: DataTypes.TEXT,
        allowNull: false,
    },
    categories: {
        type: DataTypes.JSON, // Use JSON for array of strings in MySQL
        allowNull: false,
        defaultValue: [], // Initialize as an empty array
    },
    location: {
        type: DataTypes.JSON, // Storing address as JSON (city, state, country)
        allowNull: true,
    },
    isApproved: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
    },
});

module.exports = Charity;