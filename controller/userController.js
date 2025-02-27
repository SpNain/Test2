const path = require("path");
const User = require("../models/userModel");
const bcrypt = require("bcrypt");
const { Op } = require("sequelize");

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