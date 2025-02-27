const path = require("path");

exports.getLoginPage = async (req, res, next) => {
  try {
    res.sendFile(path.join(__dirname, "../", "public", "views", "login.html"));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err });
  }
};
