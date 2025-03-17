const express = require("express");
const cors = require("cors");
const morgan = require("morgan");

const bodyParser = require("body-parser");

const dotenv = require("dotenv");
dotenv.config();

const path = require("path");
const fs = require("fs");

const mongoose = require("mongoose");

const userRouter = require("./router/userRouter");
const expenseRouter = require("./router/expenseRouter");
const purchaseMembershipRouter = require("./router/purchaseMembershipRouter");
const leaderboardRouter = require("./router/leaderboardRouter");
const passwordRouter = require("./router/passwordRouter");
const reportsRouter = require("./router/reportsRouter");
const downloadRouter = require("./router/downloadRouter");

const app = express();
app.use(cors());

app.use(express.static("public"));

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

const accessLogStream = fs.createWriteStream(
  path.join(__dirname, "access.log"),
  { flags: "a" }
);

app.use(morgan("combined", { stream: accessLogStream }));

app.use("/", userRouter);
app.use("/user", userRouter);

app.use("/homePage", expenseRouter);
app.use("/expense", expenseRouter);

app.use("/purchase", purchaseMembershipRouter);

app.use("/premium", leaderboardRouter);

app.use("/password", passwordRouter);

app.use("/reports", reportsRouter);

app.use("/download", downloadRouter);

async function initiate() {
  try {
    await mongoose.connect(process.env.MONGODB_URL);
    app.listen(process.env.PORT, () => {
      console.log(`Server started on port ${process.env.PORT}`);
    });
  } catch (err) {
    console.log("error", err);
  }
}

initiate();
