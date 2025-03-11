const express = require("express");
const router = express.Router();

const userController = require("../controllers/userController");
const authenticate = require("../middlewares/authenticator");

router.post("/signup", userController.postUserSignup);
router.post("/login", userController.postUserLogin);
router.get("/getprofile", authenticate, userController.getUserProfile);
router.put("/updateprofile/:id", authenticate, userController.updateUserProfile);
router.delete("/deleteprofile/:id", authenticate, userController.deleteUserProfile);
router.get("/getcharitieslist", authenticate, userController.getCharitiesList);
router.get("/getCharityDetails/:id", authenticate, userController.getCharityDetails);

module.exports = router;