const express = require("express");

const bodyParser = require("body-parser");

const sequelize = require("./util/database");

const userRouter = require("./router/userRouter");

const app = express();

app.use(express.static("public"));

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use("/", userRouter);
app.use("/user", userRouter);

async function initiate(){
    try {
        // await sequelize.sync({ force: true })
        await sequelize.sync();
        app.listen(3000,()=>{
            console.log("Server started on port 3000");
        })
        
    }catch(err){
        console.log("error", err);
    }
}

initiate();