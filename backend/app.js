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
const Charity = require("./models/charityModel");
const Project = require("./models/projectModel");
const User = require("./models/userModel");
const Order = require("./models/orderModel");
const Donation = require("./models/donationModel");

// Routes
const userRoutes = require("./routes/userRoutes");
const adminRoutes = require("./routes/adminRoutes");
const charityRoutes = require("./routes/charityRoutes");

// Middlewares
app.use("/api/user", userRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/charity", charityRoutes);

// Associations
Charity.hasMany(Project, { onDelete: "CASCADE" });
Project.belongsTo(Charity);

User.hasMany(Order, { onDelete: "CASCADE" });
Order.belongsTo(User);

User.hasMany(Donation, { onDelete: "CASCADE" });
Donation.belongsTo(User);

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
