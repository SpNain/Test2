const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");

router.post("/user/signup", userController.signup);

module.exports = router;