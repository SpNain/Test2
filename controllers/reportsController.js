const path = require("path");

exports.getReportsPage = (req, res, next) => {
  try {
    res.sendFile(
      path.join(__dirname, "../", "public", "views", "reports.html")
    );
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err });
  }
};