const bcrypt = require("bcrypt");
const User = require("../models/userModel");
const jwtService = require("../services/jwtService");
const { Op } = require("sequelize");

exports.postUserSignup = async (req, res, next) => {
  const { name, email, password } = req.body;

  try {
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(409).json({
        message: "This email is already taken. Please choose another one.",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    await User.create({
      name,
      email,
      password: hashedPassword,
    });

    res.status(200).json({ message: "User Created Successfully!" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err });
  }
};

exports.postUserLogin = async (req, res, next) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ where: { email } });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User doesn't exist!",
      });
    }

    if (user.role === "user") {
      const isPasswordValid = await bcrypt.compare(password, user.password);

      if (!isPasswordValid) {
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
        message: "User doesn't exist!",
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

exports.getUserProfile = async (req, res, next) => {
  res.status(200).json({ userInfo : req.user });
};

exports.updateUserProfile = async (req, res, next) => {

  try {
    const userId = req.params.id;
    const { name, email, password } = req.body;

    const existingUser = await User.findOne({
      where: {
        email,
        id: { [Op.ne]: userId }, // Check if email exists for a different user
      },
    });

    if (existingUser) {
      return res.status(409).json({
        message: "This email is already taken. Please choose another one.",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await User.update(
      {
        name,
        email,
        password: hashedPassword,
      },
      {
        where: { id: userId },
      }
    );

    res.status(200).json({ message: "User profile updated successfully!" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err });
  }
};

exports.deleteUserProfile = async (req, res, next) => {
  try {
    const userId = req.params.id;
    await User.destroy({ where: { id: userId } });
    res.status(200).json({ message: "User deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err });
  }
};
