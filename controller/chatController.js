const Chat = require("../models/chatModel");
const Group = require("../models/groupModel");
const { Op } = require("sequelize");

exports.sendMessage = async (req, res, next) => {
  try {
    const group = await Group.findOne({
      where: { name: req.body.groupName },
    });

    await Chat.create({
      name: req.user.name,
      message: req.body.message,
      userId: req.user.id,
      groupId: group.dataValues.id,
    });

    res.status(200).json({ message: "Success!" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error" });
  }
};

exports.getMessages = async (req, res, next) => {
  try {
    const param = req.query.param;

    const group = await Group.findOne({
      where: { name: req.query.groupName },
    });
    const messages = await Chat.findAll({
      where: {
        [Op.and]: {
          id: {
            [Op.gt]: param,
          },
          groupId: group.dataValues.id,
        },
      },
    });
    res.status(200).json({ messages: messages });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error" });
  }
};
