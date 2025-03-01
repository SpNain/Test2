const express = require("express");
const router = express.Router();

const userMsgController = require("../controllers/userMsgController");
const authenticator = require("../middlewares/authenticator");

router.post("/message", authenticator, userMsgController.postUserMsg);
router.get("/allmessages", authenticator, userMsgController.getAllMessages);

module.exports = router;