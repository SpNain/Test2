const path = require("path");
const Download = require("../models/downloadModel");

exports.getDownloadsPage = async (req, res, next) => {
  try {
    res.sendFile(
      path.join(__dirname, "../", "public", "views", "downloads.html")
    );
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

exports.getAllDownloads = async (req, res, next) => {
  try {
    const allDownloads = await Download.find({ userId: req.user._id });
    res.status(200).json(allDownloads);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};
