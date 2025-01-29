const express = require('express');
const cors = require('cors');
const sequelize = require('./util/database');

const userRouter = require('./routes/user');

const app = express();

app.use(cors());
app.use(express.urlencoded({extended:false}));
app.use(express.static('public'));
app.use('/user',userRouter);


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