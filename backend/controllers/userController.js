const User = require("../models/User");
const bcrypt = require("bcrypt");
const { Op } = require("sequelize");

exports.signup = async (req, res) => {
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