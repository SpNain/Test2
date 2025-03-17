const path = require("path");
const User = require("../models/userModel");

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
    const users = await User.find({}, "name totalExpenses").sort({
      totalExpenses: -1,
    });

    const result = users.map((user) => ({
      name: user.name,
      totalExpenses: user.totalExpenses,
    }));

    res.status(200).json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err });
  }
};
