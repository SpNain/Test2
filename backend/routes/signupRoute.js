const express = require("express");
const router = express.Router();
const signupController = require("../controllers/signupController");

router.post("/user/signup", signupController.signup);

module.exports = router;