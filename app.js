const express = require("express");

const bodyParser = require("body-parser");

const dotenv = require("dotenv");
dotenv.config();

const sequelize = require("./util/database");

const userRouter = require("./router/userRouter");
const expenseRouter = require("./router/expenseRouter");
const purchaseMembershipRouter = require("./router/purchaseMembershipRouter");
const leaderboardRouter = require("./router/leaderboardRouter");
const passwordRouter = require("./router/passwordRouter");
const reportsRouter = require("./router/reportsRouter");
const mediaRouter = require("./router/mediaRouter");

const User = require("./models/userModel");
const Expense = require("./models/expenseModel");
const Order = require("./models/ordersModel");
const ResetPassword = require("./models/resetPasswordModel");
const Media = require("./models/mediaModel");

const app = express();

app.use(express.static("public"));

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use("/", userRouter);
app.use("/user", userRouter);

app.use("/homePage", expenseRouter);
app.use("/expense", expenseRouter);

app.use("/purchase", purchaseMembershipRouter);

app.use("/premium", leaderboardRouter);

app.use("/password", passwordRouter);
app.use("/password", passwordRouter);

app.use("/reports", reportsRouter);

app.use("/media", mediaRouter);

User.hasMany(Expense);
Expense.belongsTo(User);

User.hasMany(Order);
Order.belongsTo(User);

User.hasMany(ResetPassword);
ResetPassword.belongsTo(User);

User.hasMany(Media);
Media.belongsTo(User);

async function initiate() {
  try {
    // await sequelize.sync({ force: true })
    await sequelize.sync();
    app.listen(process.env.PORT || 3000, () => {
      console.log("Server started on port 3000");
    });
  } catch (err) {
    console.log("error", err);
  }
}

initiate();