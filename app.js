const express = require("express");

const bodyParser = require("body-parser");

const dotenv = require("dotenv");
dotenv.config();

const sequelize = require("./util/database");

const userRouter = require("./router/userRouter");
const expenseRouter = require("./router/expenseRouter");
const purchaseMembershipRouter = require("./router/purchaseMembershipRouter");

const User = require("./models/userModel");
const Expense = require("./models/expenseModel");
const Order = require("./models/ordersModel");

const app = express();

app.use(express.static("public"));

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use("/", userRouter);
app.use("/user", userRouter);

app.use("/homePage", expenseRouter);
app.use("/expense", expenseRouter);

app.use("/purchase", purchaseMembershipRouter);

User.hasMany(Expense);
Expense.belongsTo(User);

User.hasMany(Order);
Order.belongsTo(User);

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