const path = require("path");
const User = require("../models/userModel");
const Sib = require("sib-api-v3-sdk");

exports.forgotPasswordPage = async (req, res, next) => {
  try {
    res
      .status(200)
      .sendFile(
        path.join(__dirname, "../", "public", "views", "forgotPassword.html")
      );
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err });
  }
};

exports.sendMail = async (req, res, next) => {
  try {

    const email = req.body.email;

    const recepientEmail = await User.findOne({ where: { email: email } });

    if (!recepientEmail) {
      return res
        .status(404)
        .json({ message: "Please provide the registered email!" });
    }

    const client = Sib.ApiClient.instance;
    const apiKey = client.authentications["api-key"];
    apiKey.apiKey = process.env.RESET_PASSWORD_API_KEY;
    const transEmailApi = new Sib.TransactionalEmailsApi();
    const sender = {
      email: "hnspnain@gmail.com",
      name: "Hardeep Nain",
    };
    const receivers = [
      {
        email: req.body.email,
      },
    ];
    await transEmailApi.sendTransacEmail({
      sender,
      To: receivers,
      subject: "Expense Tracker Reset Password",
      textContent: "Link Below",
    });
    res.status(200).json({
      message:
        "Link for reset the password is successfully send on your Mail Id!",
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err });
  }
};
