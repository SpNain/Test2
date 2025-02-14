const express = require("express");
const router = express.Router();
const passwordController = require("../controllers/passwordController");

router.get("/forgotPasswordPage", passwordController.forgotPasswordPage);
router.post("/sendMail", passwordController.sendMail);

router.get("/resetPasswordPage/:requestId",passwordController.resetPasswordPage);
router.post("/resetPassword", passwordController.updatePassword);

module.exports = router;