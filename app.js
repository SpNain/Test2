const path = require('path');

const express = require('express');
const cors = require("cors");


const app = express();
app.use(express.json());
app.use(cors());

const sequelize = require('./util/database');

const Student = require('./models/student');
const Attendance = require('./models/attendance');

const studentRoutes = require('./routes/student');
const attendanceRoutes = require('./routes/attendance');

app.use(express.static(path.join(__dirname, 'public')));


app.use('/student', studentRoutes);
app.use('/attendance',attendanceRoutes);

Student.hasMany(Attendance);
Attendance.belongsTo(Student);

async function initiate(){
    try{
        await sequelize.sync();
        app.listen(3000,()=>{
            console.log("Server started on port 3000");
        })
        
    }catch(err){
        console.log("error", err);
    }
}

initiate();