const express = require("express");
const cors = require("cors");

// do this before importing database kyunki database me process.env use hua hai
const dotenv = require("dotenv");
dotenv.config();

const sequelize = require("./utils/database");

const app = express();

// if we want that no request is not blocked by CORS policy we can use *
app.use(
  cors({
    origin: "http://127.0.0.1:5500", // this is the frontend url from where we are making http request to backend
  })
);
app.use(express.json());


// Routers
const signupRoute = require("./routes/signupRoute");

// Models
const User = require("./models/User");

// Middlewares
app.use("/api", signupRoute);

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
