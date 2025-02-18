const express = require("express");
const router = express.Router();

const leaderboardController = require("../controllers/leaderboardController");
const userAuthentication = require("../middleware/auth");


router.get("/getLeaderboardPage", leaderboardController.getLeaderboardPage);

router.get(
  "/getAllUsersForLeaderboard", userAuthentication,
  leaderboardController.getAllUsersForLeaderboard
);

module.exports = router;