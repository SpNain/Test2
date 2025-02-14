const express = require("express");
const router = express.Router();
const passwordController = require("../controllers/passwordController");

router.get("/forgotPasswordPage", passwordController.forgotPasswordPage);
router.post("/sendMail", passwordController.sendMail);

module.exports = router;