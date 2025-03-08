const bcrypt = require("bcrypt");
const User = require("../models/userModel");
const jwtService = require("../services/jwtService");

exports.postAdminLogin = async (req, res, next) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ where: { email } });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Admin doesn't exist!",
      });
    }

    if (user.role === "admin") {
      const isPasswordValid = await bcrypt.compare(password, user.password);

      if (!isPasswordValid) {
        await t.rollback();
        return res.status(401).json({
          success: false,
          message: "Password incorrect!",
        });
      }

      res.status(200).json({
        success: true,
        message: "Login successful!",
        token: jwtService.generateAccessToken(user.id, user.email, user.role),
      });
    } else {
      return res.status(401).json({
        success: false,
        message: "Admin doesn't exist!",
      });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: "Something went wrong!",
      error: err,
    });
  }
};
