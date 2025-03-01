const User = require("../models/User");
const bcrypt = require("bcrypt");
const { Op } = require("sequelize");
const jwt = require("jsonwebtoken");


function generateAccessToken(id, email) {
  return jwt.sign({ userId: id, email: email }, process.env.JWT_SECRET_KEY, { expiresIn: "1h" });
}

exports.signUp = async (req, res) => {
  const { name, phoneNumber, email, password } = req.body;
  const saltRounds = 10;
  console.log(req.body.email);

  try {
    const existingUser = await User.findOne({ where: { [Op.or]: [{ email: email }, { phoneNumber: phoneNumber }] } });
    if (existingUser) {
      return res
        .status(409)
        .json({ message: "This email or phone number is already taken. Please choose another one." });
    }

      const hashedPassword = await bcrypt.hash(password, saltRounds);
      if (!hashedPassword) {
        return res.status(400).json({ error: "Error hashing password" });
      }

      const userCreated = await User.create({
        name: name,
        phoneNumber: phoneNumber,
        email: email,
        password: hashedPassword,
      });

      if (userCreated) {
        return res.status(201).json({ message: "User created" });
      } else {
        return res.status(400).json({ error: "Error creating user" });
      }
  } catch (err) {
    res.status(500).json({ error: "Internal Server Error" });
    console.log(err);
  }
};

exports.login = async (req, res, next) => {
  const { email, password } = req.body;

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