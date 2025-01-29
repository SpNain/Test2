const Sequelize = require('sequelize');
const sequelize = new Sequelize('booking_appointment_app_db','root','Mysql@99',{
    dialect:'mysql',
    host:'localhost',
    logging:false
});
module.exports=sequelize;