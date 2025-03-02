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
const Group = require("./models/Group");

// Associations
User.hasMany(Messages);
Messages.belongsTo(User, { constraints: true, onDelete: "CASCADE" });

Group.hasMany(Messages);
Messages.belongsTo(Group, { constraints: true, onDelete: "CASCADE" });

User.belongsToMany(Group, { through: "UserGroups" });
Group.belongsToMany(User, { through: "UserGroups" });

// Routes
const userRoute = require("./routes/userRoute");
const UserMsgRoute = require("./routes/userMsgRoute");
const groupRoute = require("./routes/groupRoute");

// Middlewares
app.use("/api/user", userRoute);
app.use("/api/user", UserMsgRoute);
app.use("/api/group", groupRoute);

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
