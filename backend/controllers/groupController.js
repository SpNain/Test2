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
