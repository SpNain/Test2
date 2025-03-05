const express = require("express");
const router = express.Router();

const userMsgController = require("../controllers/userMsgController");
const authenticator = require("../middlewares/authenticator");
const upload = require("../middlewares/multer");

router.post("/message", authenticator, userMsgController.postUserMsg);
router.get("/allmessages", authenticator, userMsgController.getAllMessages);
router.get("/searchusers", authenticator, userMsgController.searchUsers);
router.post("/upload", authenticator, upload.single("file"),userMsgController.uploadFile);

module.exports = router;