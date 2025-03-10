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
router.get("/getcharitieslist", authenticate, adminController.getCharitiesList);
router.delete("/deletecharity/:id", authenticate, adminController.deleteCharity);
router.get("/getpendingcharitieslist", authenticate, adminController.getPendingCharitiesList);
router.patch("/approvecharity/:id", authenticate, adminController.approveCharity);

module.exports = router;