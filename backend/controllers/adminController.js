const bcrypt = require("bcrypt");
const User = require("../models/userModel");
const Charity = require("../models/charityModel");
const jwtService = require("../services/jwtService");
const { Op } = require("sequelize");
const { sendEmail } = require("../services/emailService");

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

exports.getAdminProfile = async (req, res, next) => {
  res.status(200).json({ userInfo : req.user });
};

exports.updateAdminProfile = async (req, res, next) => {
  try {
    const userId = req.params.id;
    const { name, email, password } = req.body;

    const existingUser = await User.findOne({
      where: {
        email,
        id: { [Op.ne]: userId },
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

    res.status(200).json({ message: "Admin profile updated successfully!" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err });
  }
};

exports.deleteAdminProfile = async (req, res, next) => {
  try {
    const userId = req.params.id;
    await User.destroy({ where: { id: userId } });
    res.status(200).json({ message: "Admin deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err });
  }
};

exports.getUsersList = async (req, res, next) => {
  try {
    const pageNo = parseInt(req.query.pageNo) || 1;
    const limit = parseInt(req.query.rowsPerPage) || 10;

    if (pageNo < 1 || limit < 1) {
      return res.status(400).json({ error: "Invalid pagination parameters" });
    }

    const offset = (pageNo - 1) * limit;
    const totalUsers = await User.count({
      where: { role: "user" },
    });

    const totalPages = Math.ceil(totalUsers / limit);

    const users = await User.findAll({
      where: { role: "user" },
      offset: offset,
      limit: limit,
    });
    res.json({ users: users, totalPages: totalPages });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err });
  }
};

exports.deleteUser = async (req, res, next) => {
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

    if (pageNo < 1 || limit < 1) {
      return res.status(400).json({ error: "Invalid pagination parameters" });
    }

    const offset = (pageNo - 1) * limit;
    const totalCharities = await Charity.count({
      where: { isApproved: true },
    });

    const totalPages = Math.ceil(totalCharities / limit);

    const charities = await Charity.findAll({
      where: { isApproved: true },
      offset: offset,
      limit: limit,
    });
    res.json({ charities: charities, totalPages: totalPages });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err });
  }
};

exports.deleteCharity = async (req, res, next) => {
  try {
    const charityId = req.params.id;
    await Charity.destroy({ where: { id: charityId } });
    res.status(200).json({ message: "Charity deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err });
  }
};

exports.getPendingCharitiesList = async (req, res, next) => {
  try {
    const pageNo = parseInt(req.query.pageNo) || 1;
    const limit = parseInt(req.query.rowsPerPage) || 10;

    if (pageNo < 1 || limit < 1) {
      return res.status(400).json({ error: "Invalid pagination parameters" });
    }

    const offset = (pageNo - 1) * limit;
    const totalPendingCharities = await Charity.count({
      where: { isApproved: false },
    });

    const totalPages = Math.ceil(totalPendingCharities / limit);

    const pendingCharities = await Charity.findAll({
      where: { isApproved: false },
      offset: offset,
      limit: limit,
    });
    res.json({ pendingCharities: pendingCharities, totalPages: totalPages });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err });
  }
};

exports.approveCharity = async (req, res, next) => {
  try {
    const charityId = req.params.id;
    await Charity.update({ isApproved: true }, { where: { id: charityId } });
    sendVerificationMailToCharity(req.user, charityId);
    res.status(200).json({ message: "Charity approved successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err });
  }
};

async function sendVerificationMailToCharity(admin, charityId) {
  try {
    const adminInfo = {
      name: admin.name,
      email: admin.email,
    };

    const { email: charityEmail } = await Charity.findOne({
      where: { id: charityId },
    });

    const charityInfo = {
      emails: [charityEmail],
      subject: "Charity Approval Notification",
      content: `<h3>Congratulations!</h3><p>Your charity has been approved.</p>`,
    };

    await sendEmail(adminInfo, charityInfo);
  } catch (err) {
    console.error("Error sending verification email:", err);
  }
}
