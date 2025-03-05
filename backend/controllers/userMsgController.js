const User = require("../models/User");
const Messages = require("../models/Messages");
const { Op } = require("sequelize");
const { uploadFileToS3 } = require("../services/awsService");

exports.postUserMsg = async (req, res) => {
  try {
    const { message, groupId, fileUrl } = req.body;

    if (!groupId) {
      return res.status(400).json({ message: "Group Id is required" });
    }

    const isStored = await Messages.create({
      message: message,
      userId: req.user.id,
      senderName: req.user.name,
      groupId,
      fileUrl,
    });

    if (!isStored) {
      return res
        .status(400)
        .json({ message: "Some error occured while saving the message" });
    }

    return res.status(201).json({
      message: "Message saved successfully",
      userId: req.user.id,
      senderName: req.user.name,
      createdAt: isStored.createdAt,
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

exports.getAllMessages = async (req, res) => {
  try {
    const groupId = req.query.groupId;

    if (!groupId) {
      return res.status(400).json({ message: "Group Id is required" });
    }

    let MAX_MESSAGES = 10;

    const set = parseInt(req.query.set, 10) || 1;
    if (set < 1) {
      return res.status(400).json({ message: "Set must be greater than 0" });
    }

    const offset = (set - 1) * MAX_MESSAGES;

    let messages = await Messages.findAll({
      where: { groupId },
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

exports.searchUsers = async (req, res) => {
  try {
    const search = req.query.name;

    if (!search) {
      return res.status(400).json({ message: "Search Query is required" });
    }

    const users = await User.findAll({
      where: {
        [Op.or]: [
          {
            name: {
              [Op.like]: `%${search}%`,
            },
          },
          {
            phoneNumber: {
              [Op.like]: `%${search}%`,
            },
          },
        ],
      },
    });

    if (!users) {
      return res.status(404).json({ message: "No users found" });
    }

    return res.status(200).json({ users });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

exports.uploadFile = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const fileUrl = await uploadFileToS3(req.file);
    req.user.upd;
    return res
      .status(201)
      .json({ message: "File uploaded successfully", fileUrl });
  } catch (error) {
    console.error("Upload error:", error);
    return res
      .status(500)
      .json({ message: "Error uploading file", error: error.message });
  }
};
