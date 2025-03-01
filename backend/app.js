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


// Routers
const userRoute = require("./routes/userRoute");

// Models
const User = require("./models/User");

// Middlewares
app.use("/api", userRoute);

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
