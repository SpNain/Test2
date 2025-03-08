const express = require("express");
const router = express.Router();

const userController = require("../controllers/userController");

router.post("/signup", userController.postUserSignup);
router.post("/login", userController.postUserLogin);

module.exports = router;