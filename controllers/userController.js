const path = require("path");
const User = require("../models/userModel");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const sequelize = require("../util/database");

function generateAccessToken(id, email) {
  return jwt.sign({ userId: id, email: email }, process.env.TOKEN_SECRET_KEY);
}

exports.isPremiumUser = (req, res, next) => {
  if (req.user.isPremiumUser) {
    return res.json({ isPremiumUser: true });
  }
};

exports.getLoginPage = async (req, res, next) => {
  try {
    res.sendFile(path.join(__dirname, "../", "public", "views", "login.html"));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err });
  }
};

exports.postUserSignUp = async (req, res, next) => {
  const t = await sequelize.transaction();
  const { name, email, password } = req.body;

  try {
    const existingUser = await User.findOne({
      where: { email },
      transaction: t,
    });
    if (existingUser) {
      await t.rollback();
      return res
        .status(409)
        .send(
          `<script>alert('This email is already taken. Please choose another one.'); window.location.href='/'</script>`
        );
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    await User.create(
      {
        name,
        email,
        password: hashedPassword,
      },
      { transaction: t }
    );

    await t.commit();
    res
      .status(200)
      .send(
        `<script>alert('User Created Successfully!'); window.location.href='/'</script>`
      );
  } catch (err) {
    await t.rollback();
    console.error(err);
    res.status(500).json({ error: err });
  }
};

exports.postUserLogin = async (req, res, next) => {
  const t = await sequelize.transaction();
  const { loginEmail: email, loginPassword: password } = req.body;

  try {
    const user = await User.findOne({ where: { email }, transaction: t });

    if (!user) {
      await t.rollback();
      return res.status(404).json({
        success: false,
        message: "User doesn't exist!",
      });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      await t.rollback();
      return res.status(401).json({
        success: false,
        message: "Password incorrect!",
      });
    }

    await t.commit();
    res.status(200).json({
      success: true,
      message: "Login successful!",
      token: generateAccessToken(user.id, user.email),
    });
  } catch (err) {
    await t.rollback();
    console.error(err);
    res.status(500).json({
      success: false,
      message: "Something went wrong!",
      error: err,
    });
  }
};

exports.generateAccessToken = generateAccessToken;