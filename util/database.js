const {DB_NAME,DB_USER,DB_PASSWORD} = require('./secrets');
const Sequelize = require('sequelize');

const sequelize = new Sequelize(DB_NAME,DB_USER,DB_PASSWORD,{
    dialect:'mysql',
    host:'localhost',
    logging:false
});
module.exports=sequelize;