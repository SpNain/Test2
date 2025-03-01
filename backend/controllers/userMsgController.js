const Messages = require("../models/Messages");
const { Op } = require("sequelize");

exports.postUserMsg = async (req, res) => {
  try {
    const isStored = await Messages.create({
      message: req.body.message,
      userId: req.user.id,
    });

    if (!isStored) {
      return res
        .status(400)
        .json({ message: "Some error occured while saving the message" });
    }

    return res.status(201).json({ message: "Message saved successfully" });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

exports.getAllMessages = async (req, res) => {
  try {
    const messages = await Messages.findAll({
      where: { id: { [Op.gt]: req.query.lastMessageId } },
    });
    console.log(req.query.lastMessageId);
    if (!messages) {
      return res.status(404).json({ message: "No messages found" });
    }

    return res.status(200).json({ messages });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};
