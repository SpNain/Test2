const bcrypt = require("bcrypt");
const Charity = require("../models/charityModel");
const jwtService = require("../services/jwtService");

exports.postCharitySignup = async (req, res, next) => {
  const { name, email, password, mission, category, location } = req.body;

  try {
    const existingCharity = await Charity.findOne({ where: { email } });
    if (existingCharity) {
      return res.status(409).json({
        message: "This email is already taken. Please choose another one.",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    await Charity.create({
      name,
      email,
      password: hashedPassword,
      mission,
      category,
      location,
    });

    res.status(200).json({ message: "Charity Created Successfully!" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err });
  }
};

exports.postCharityLogin = async (req, res, next) => {
  const { email, password } = req.body;

  try {
    const charity = await Charity.findOne({ where: { email } });

    if (!charity) {
      return res.status(404).json({
        success: false,
        message: "Charity doesn't exist!",
      });
    }

    if (charity.isApproved) {
      const isPasswordValid = await bcrypt.compare(password, charity.password);

      if (!isPasswordValid) {
        return res.status(401).json({
          success: false,
          message: "Password incorrect!",
        });
      }

      res.status(200).json({
        success: true,
        message: "Login successful!",
        token: jwtService.generateAccessToken(
          charity.id,
          charity.email,
          charity.role
        ),
      });
    } else {
      return res.status(401).json({
        success: false,
        message:
          "Charity isn't approved yet! Please wait. We will send you a mail after the approval.",
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
