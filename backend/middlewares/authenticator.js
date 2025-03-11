const jwt = require("jsonwebtoken");
const User = require("../models/userModel");
const Charity = require("../models/charityModel");

const authenticate = async (req, res, next) => {
  try {
    const token = req.header("Authorization");
    if (!token) {
      return res
        .status(401)
        .json({ success: false, message: "Access denied. No token provided." });
    }

    const decoded = jwt.verify(token, process.env.TOKEN_SECRET_KEY);
    
    if(decoded.role){
      const user = await User.findByPk(decoded.id);
      if (!user) {
        return res
          .status(404)
          .json({ success: false, message: "User not found." });
      }
  
      req.user = user;
    }
    else {
      const charity = await Charity.findByPk(decoded.id);
      if (!charity) {
        return res
          .status(404)
          .json({ success: false, message: "User not found." });
      }
  
      req.charity = charity;
    }

    next();
  } catch (err) {
    console.error(err);
    res.status(401).json({ success: false, message: "Authentication failed." });
  }
};

module.exports = authenticate;