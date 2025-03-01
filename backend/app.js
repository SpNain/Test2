const express = require("express");
const cors = require("cors");

const dotenv = require("dotenv");
dotenv.config();

const sequelize = require("./utils/database");

const app = express();

app.use(
  cors({
    origin: "http://127.0.0.1:5500",
  })
);
app.use(express.json());

// Models
const User = require("./models/User");
const Messages = require("./models/Messages");

// Associations
User.hasMany(Messages);
Messages.belongsTo(User, { constraints: true, onDelete: "CASCADE" });

// Routers
const userRoute = require("./routes/userRoute");
const UserMsgRoute = require("./routes/userMsgRoute");


// Middlewares
app.use("/api/user", userRoute);
app.use("/api/user", UserMsgRoute);

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
