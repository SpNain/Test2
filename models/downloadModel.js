const mongoose = require("mongoose");

const downloadSchema = new mongoose.Schema({
  downloadLink: {
    type: String,
    required: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
});

const Download = mongoose.model("Download", downloadSchema);

module.exports = Download;
