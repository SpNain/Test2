const path = require("path");
const User = require("../models/userModel");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { Op } = require("sequelize");

function generateAccessToken(id, email) {
  return jwt.sign({ userId: id, email: email }, process.env.TOKEN_SECRET_KEY);
}

exports.getLoginPage = async (req, res, next) => {
  try {
    res.sendFile(path.join(__dirname, "../", "public", "views", "login.html"));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err });
  }
};

exports.postUserSignUp = async (req, res, next) => {
  const { name, email, number, password } = req.body;

  try {
    const existingUser = await User.findOne({ where: { [Op.or]: [{ email: email }, { number: number }] } });
    if (existingUser) {
      return res
        .status(409)
        .json({ message: "This email or phone number is already taken. Please choose another one." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    await User.create(
      {
        name,
        email,
        number,
        password: hashedPassword,
      }
    );

    res
      .status(200)
      .json({message: "User Created Successfully!"});
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err });
  }
};

exports.postUserLogin = async (req, res, next) => {
  const { loginEmail: email, loginPassword: password } = req.body;

  try {
    const user = await User.findOne({ where: { email } });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User doesn't exist!",
      });
    }

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
      token: generateAccessToken(user.id, user.email),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: "Something went wrong!",
      error: err,
    });
  }
};

exports.generateAccessToken = generateAccessToken;