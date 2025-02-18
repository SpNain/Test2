const path = require("path");
const bcrypt = require("bcrypt");
const { v4: uuidv4 } = require("uuid");

const User = require("../models/userModel");
const ResetPassword = require("../models/resetPasswordModel");
const { sendResetPasswordEmail } = require("../services/emailService");

const saltRounds = 10;

const hashPassword = async (password) => {
  return await bcrypt.hash(password, saltRounds);
};

exports.forgotPasswordPage = async (req, res, next) => {
  try {
    res
      .status(200)
      .sendFile(
        path.join(__dirname, "../", "public", "views", "forgotPassword.html")
      );
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err });
  }
};

exports.sendMail = async (req, res, next) => {
  try {
    const email = req.body.email;
    const requestId = uuidv4();
    
    const recepientEmail = await User.findOne({ where: { email: email } });
    
    if (!recepientEmail) {
      return res
      .status(404)
      .json({ message: "Please provide the registered email!" });
    }
    
    await ResetPassword.create({
      id: requestId,
      isActive: true,
      userId: recepientEmail.dataValues.id,
    });

    await sendResetPasswordEmail(email, requestId);

    return res.status(200).json({
      message:
        "Link for reset the password is successfully send on your Mail Id!",
    });
  } catch (err) {
    console.error(err);
    return res.status(409).json({ message: "Failed changing password" });
  }
};
exports.resetPasswordPage = async (req, res, next) => {
  try {
    res
      .status(200)
      .sendFile(
        path.join(__dirname, "../", "public", "views", "resetPassword.html")
      );
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err });
  }
};
exports.updatePassword = async (req, res, next) => {
  try {
    const requestId = req.headers.referer.split("/").pop();
    const resetRequest = await ResetPassword.findOne({ where: { id: requestId, isActive: true } });

    if (!resetRequest) {
      return res.status(409).json({ message: "Reset link expired or already used" });
    }

    await resetRequest.update({ isActive: false });

    const newPassword = await hashPassword(req.body.password);
    await User.update({ password: newPassword }, { where: { id: resetRequest.userId } });

    return res.status(200).json({ message: "Password updated successfully!" });
  } catch (err) {
    console.error(err);
    return res.status(409).json({ message: "Failed to change password!" });
  }
};