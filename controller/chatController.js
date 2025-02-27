const path = require("path");
const User = require("../models/userModel");
const Chat = require("../models/chatModel");
const sequelize = require("../util/database");

exports.sendMessage = async (req, res, next) => {
  try {
    await req.user.createChat({
      name: req.user.name,
      message: req.body.message,
    });

    res.status(200).json({ message: "Success!" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error" });
  }
};
