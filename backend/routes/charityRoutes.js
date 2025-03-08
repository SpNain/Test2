const express = require("express");
const router = express.Router();

const charityController = require("../controllers/charityController");

router.post("/signup", charityController.postCharitySignup);
router.post("/login", charityController.postCharityLogin);

module.exports = router;