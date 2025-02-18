const express = require("express");
const router = express.Router();
const downloadController = require("../controllers/downloadController");
const userAuthentication = require("../middleware/auth");

router.get("/getDownloadsPage", downloadController.getDownloadsPage);

router.get(
  "/getAllDownloads",
  userAuthentication,
  downloadController.getAllDownloads
);

module.exports = router;
