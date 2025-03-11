const express = require("express");
const router = express.Router();

const charityController = require("../controllers/charityController");
const authenticate = require("../middlewares/authenticator");

router.post("/signup", charityController.postCharitySignup);
router.post("/login", charityController.postCharityLogin);
router.get("/getprofile", authenticate, charityController.getCharityProfile);
router.put("/updateprofile/:id", authenticate, charityController.updateCharityProfile);
router.delete("/deleteprofile/:id", authenticate, charityController.deleteCharityProfile);
router.get("/getprojectslist", authenticate, charityController.getProjectsList);
router.post("/createproject", authenticate, charityController.createProject);
router.put("/updateproject/:id", authenticate, charityController.updateProject);
router.delete("/deleteproject/:id", authenticate, charityController.deleteProject);
router.post("/sendemailtodonors/:id", authenticate, charityController.sendEmailToDonors);

module.exports = router;