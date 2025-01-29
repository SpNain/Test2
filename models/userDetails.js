const Sequelize = require('sequelize');
const sequelize = require('../util/database');

const userDetails = sequelize.define('userDetails',{
    id:{
        type:Sequelize.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey:true,
        unique:true
    },
    Name:{
        type: Sequelize.STRING,
        allowNull :false
    },
    Email:{
        type: Sequelize.STRING,
        allowNull:false,
        unique:true
    },
    Phone:{
        type: Sequelize.BIGINT,
        allowNull:false,
    },
    Date:{
        type: Sequelize.DATEONLY,
        allowNull:false
    }
});

module.exports=userDetails;