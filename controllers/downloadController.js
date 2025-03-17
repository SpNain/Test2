const path = require("path");

exports.getDownloadsPage = async (req, res, next) => {
  try {
    res.sendFile(
      path.join(__dirname, "../", "public", "views", "downloads.html")
    );
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err });
  }
};

exports.getAllDownloads = async (req, res, next) => {
  try {
    const allDownloads = await req.user.getDownloads();
    res.status(200).json(allDownloads);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err });
  }
}