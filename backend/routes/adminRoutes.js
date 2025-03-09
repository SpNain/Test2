const express = require("express");
const router = express.Router();

const adminController = require("../controllers/adminController");
const authenticate = require("../middlewares/authenticator");

router.post("/login", adminController.postAdminLogin);
router.get("/getprofile", authenticate, adminController.getAdminProfile);
router.put("/updateprofile/:id", authenticate, adminController.updateAdminProfile);
router.delete("/deleteprofile/:id", authenticate, adminController.deleteAdminProfile);
router.get("/getuserslist", authenticate, adminController.getUsersList);
router.delete("/deleteuser/:id", authenticate, adminController.deleteUser);

module.exports = router;