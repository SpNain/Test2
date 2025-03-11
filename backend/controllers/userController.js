const bcrypt = require("bcrypt");
const User = require("../models/userModel");
const Charity = require("../models/charityModel");
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
  res.status(200).json({ userInfo: req.user });
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

exports.getCharitiesList = async (req, res, next) => {
  try {
    const pageNo = parseInt(req.query.pageNo) || 1;
    const limit = parseInt(req.query.rowsPerPage) || 10;
    const filter = req.query.filter;
    const search = req.query.search;
    console.log(filter, search);

    if (pageNo < 1 || limit < 1) {
      return res.status(400).json({ error: "Invalid pagination parameters" });
    }

    const offset = (pageNo - 1) * limit;

    let totalCharities;
    if (filter == "String") {
      totalCharities = await Charity.count({
        where: {
          isApproved: true,
          [Op.or]: [
            { category: { [Op.like]: `%${search}%` } },
            { location: { [Op.like]: `%${search}%` } },
            { mission: { [Op.like]: `%${search}%` } },
          ],
        },
      });
    } else if (filter == "Category") {
      totalCharities = await Charity.count({
        where: {
          isApproved: true,
          category: { [Op.like]: `%${search}%` },
        },
      });
    } else if (filter == "Location") {
      totalCharities = await Charity.count({
        where: {
          isApproved: true,
          location: { [Op.like]: `%${search}%` },
        },
      });
    }

    const totalPages = Math.ceil(totalCharities / limit);

    let charities;
    if (filter == "String") {
      charities = await Charity.findAll({
        where: {
          isApproved: true,
          [Op.or]: [
            { category: { [Op.like]: `%${search}%` } },
            { location: { [Op.like]: `%${search}%` } },
            { mission: { [Op.like]: `%${search}%` } },
          ],
        },
        offset: offset,
        limit: limit,
      });
    } else if (filter == "Category") {
      charities = await Charity.findAll({
        where: {
          isApproved: true,
          category: { [Op.like]: `%${search}%` },
        },
        offset: offset,
        limit: limit,
      });
    } else if (filter == "Location") {
      charities = await Charity.findAll({
        where: {
          isApproved: true,
          location: { [Op.like]: `%${search}%` },
        },
        offset: offset,
        limit: limit,
      });
    }

    res.json({ charities: charities, totalPages: totalPages });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err });
  }
};
