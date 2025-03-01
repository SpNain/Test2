const Messages = require("../models/Messages");
const { Op } = require("sequelize");

exports.postUserMsg = async (req, res) => {
  try {
    const isStored = await Messages.create({
      message: req.body.message,
      userId: req.user.id,
      senderName: req.user.name,
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
    let MAX_MESSAGES = 10;

    const set = parseInt(req.query.set, 10) || 1;
    if (set < 1) {
      return res.status(400).json({ message: "Set must be greater than 0" });
    }

    const offset = (set - 1) * MAX_MESSAGES;

    let messages = await Messages.findAll({
      order: [["createdAt", "DESC"]],
      limit: MAX_MESSAGES,
      offset: offset,
    });

    if (!messages) {
      return res.status(404).json({ message: "No messages found" });
    }

    return res.status(200).json({ messages });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};
