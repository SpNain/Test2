const User = require("../models/User");
const bcrypt = require("bcrypt");

exports.signup = async (req, res) => {
  const { name, phoneNumber, email, password } = req.body;
  const saltRounds = 10;
  console.log(req.body.email);

  try {
    const isUser = await User.findOne({ where: { email: email } });

    if (isUser) {
      return res.status(400).json({ error: "User already exists" });
    } else {
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
    }
  } catch (err) {
    res.status(500).json({ error: "Internal Server Error" });
    console.log(err);
  }
};