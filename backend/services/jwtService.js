const jwt = require("jsonwebtoken");

exports.generateAccessToken = (id, email, role) => {
  return jwt.sign({ id: id, email: email, role: role }, process.env.TOKEN_SECRET_KEY, {
    expiresIn: "4h",
  });
};
