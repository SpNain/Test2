const express = require("express");
const router = express.Router();
const groupController = require("../controllers/groupController");
const authenticate = require("../middlewares/authenticator");

router.post("/createGroup", authenticate, groupController.createGroup);
router.get("/getGroups", authenticate, groupController.getGroups);
router.post("/addMember", authenticate, groupController.addMember);
router.get("/:groupId", authenticate, groupController.getGroupById);

module.exports = router;