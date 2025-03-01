const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");

router.post("/user/signup", userController.signUp);
router.post("/user/login", userController.login);

module.exports = router;