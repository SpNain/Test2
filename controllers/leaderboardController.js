const path = require("path");
const User = require("../models/userModel");
const sequelize = require("../util/database");

exports.getLeaderboardPage = async (req, res, next) => {
  try {
    res.sendFile(
      path.join(__dirname, "../", "public", "views", "leaderboard.html")
    );
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err });
  }
};

exports.getAllUsersForLeaderboard = async (req, res, next) => {
  try {
    const users = await User.findAll({
      attributes: [
        [sequelize.col("name"), "name"],
        [sequelize.col("totalExpenses"), "totalExpenses"],
      ],
      order: [[sequelize.col("totalExpenses"), "DESC"]],
    });

    const result = users.map((user) => ({
      name: user.getDataValue("name"),
      totalExpenses: user.getDataValue("totalExpenses"),
    }));

    res.status(200).json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err });
  }
};

