const Chat = require("../models/chatModel");
const { Op } = require("sequelize");

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

exports.getMessages = async (req, res, next) => {
  try {
    const param = req.params.param;
    const messages = await Chat.findAll({
      where: { id: { [Op.gt]: param } },
    });
    res.status(200).json({ messages: messages });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error" });
  }
};
