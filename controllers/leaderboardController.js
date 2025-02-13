const path = require("path");
const User = require("../models/userModel");
const sequelize = require("../util/database");

exports.getLeaderboardPage = (req, res, next) => {
  res.sendFile(
    path.join(__dirname, "../", "public", "views", "leaderboard.html")
  );
};

exports.getAllUsersForLeaderboard = (req, res, next) => {
  User.findAll({
    attributes: [
      [sequelize.col("name"), "name"],
      [sequelize.col("totalExpenses"), "totalExpenses"],
    ],
    order: [[sequelize.col("totalExpenses"), "DESC"]],
  })
    .then((users) => {
      const result = users.map((user) => ({
        name: user.getDataValue("name"),
        totalExpenses: user.getDataValue("totalExpenses"),
      }));
      res.send(JSON.stringify(result));
    })
    .catch((err) => {
      console.error('Error fetching users for leaderboard:', err);
      res.status(500).send('An error occurred while retrieving the leaderboard.');
    });
};
