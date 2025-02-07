const Sequelize = require('sequelize');
const sequelize = new Sequelize('expense-tracker','root','T#9758@qlph',{
    dialect:'mysql',
    host:'localhost',
    logging:false
});
module.exports = sequelize;