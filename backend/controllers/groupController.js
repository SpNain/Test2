const User = require("../models/User");
const Group = require("../models/Group");

exports.createGroup = async (req, res) => {
  try {
    const { groupName, groupDescription } = req.body;

    if (!groupName || !groupDescription) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const group = await Group.create({
      groupName,
      groupDescription,
      groupAdmin: req.user.id,
    });

    if (!group) {
      return res
        .status(400)
        .json({ message: "Some error occured while creating the group" });
    }

    const user = await User.findByPk(req.user.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.role = "admin";
    await user.save();
    await user.addGroup(group);

    return res.status(201).json({ message: "Group created successfully" });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

exports.getGroups = async (req, res) => {
  try {
    if (req.user.id === undefined) {
      return res.status(400).json({ message: "User not found" });
    }

    const user = await User.findByPk(req.user.id, {
      include: [{ model: Group, as: "groups" }],
    });

    if (!user) {
      throw new Error("User not found");
    }

    const groups = user.groups;

    if (!groups) {
      return res.status(404).json({ message: "No groups found" });
    }
    
    return res.status(200).json({ groups });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

exports.getGroupById = async (req, res) => {
  try {
    const groupId = req.params.groupId;

    if (!groupId) {
      return res.status(400).json({ message: "Group Id is required" });
    }

    const group = await Group.findByPk(groupId);

    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }

    const usersInGroup = await User.findAll({
      include: [
        {
          model: Group,
          as: "groups",
          where: { id: groupId },
          required: true,
        },
      ],
    });

    if (!usersInGroup) {
      await Group.destroy({ where: { id: groupId } });
      return res
        .status(404)
        .json({ message: "No Users or Admin ! Group has been destroyed" });
    }

    return res.status(200).json({ group, usersInGroup });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

exports.addMember = async (req, res) => {
  try {
    const { email, memberId, groupId } = req.body;

    if (!email || !memberId || !groupId) {
      return res.status(400).json({
        message: "All fields are required, Select a Group first and try again",
      });
    }

    const group = await Group.findByPk(groupId);

    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }

    const groupAdminId = group.groupAdmin;

    if (groupAdminId !== req.user.id) {
      return res.status(400).json({
        message:
          "You are not the admin of this group, Only admin can add members",
      });
    }

    if (memberId === req.user.id) {
      return res.status(400).json({ message: "You cannot add yourself" });
    }

    const user = await User.findOne({ where: { email, id: memberId } });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const isMember = await group.hasUser(user);

    if (isMember) {
      return res.status(400).json({ message: "User is already a member" });
    }

    await group.addUser(user);

    return res.status(201).json({ message: "User added successfully" });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};