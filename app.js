const express = require("express");
const app = express();

const bodyParser = require("body-parser");

const cors = require("cors");
app.use(
  cors({
    origin: "*",
  })
);

const dotenv = require("dotenv");
dotenv.config();

const sequelize = require("./util/database");

app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

//Routers
const userRouter = require("./router/userRouter");
const homePageRouter = require("./router/homePageRouter");
const chatRouter = require("./router/chatRouter");

//Models
const User = require("./models/userModel");
const Chat = require("./models/chatModel");

//Associations
User.hasMany(Chat, { onDelete: "CASCADE", hooks: true });
Chat.belongsTo(User);

//Middlewares
app.use("/", userRouter);
app.use("/user", userRouter);

app.use("/homePage", homePageRouter);

app.use("/chat", chatRouter);

async function initiate() {
  try {
    // await sequelize.sync({ force: true })
    await sequelize.sync();
    app.listen(process.env.PORT, () => {
      console.log(`Server started on port ${process.env.PORT}`);
    });
  } catch (err) {
    console.log("error", err);
  }
}

initiate();
