const Chat = require("../models/chatModel");

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
    const messages = await Chat.findAll();
    res.status(200).json({ messages: messages });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error" });
  }
};
