const express = require("express");
const router = express.Router();
const groupController = require("../controllers/groupController");
const authenticate = require("../middlewares/authenticator");

router.post("/createGroup", authenticate, groupController.createGroup);
router.get("/getGroups", authenticate, groupController.getGroups);

module.exports = router;