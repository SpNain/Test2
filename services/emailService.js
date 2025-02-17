const Sib = require("sib-api-v3-sdk");

const client = Sib.ApiClient.instance;
const apiKey = client.authentications["api-key"];
apiKey.apiKey = process.env.RESET_PASSWORD_API_KEY;

const transEmailApi = new Sib.TransactionalEmailsApi();
const sender = {
  email: "hnspnain@gmail.com",
  name: "Hardeep Nain",
};

exports.sendResetPasswordEmail = async (email, requestId) => {
  try {
    const receivers = [{ email }];
    await transEmailApi.sendTransacEmail({
      sender,
      To: receivers,
      subject: "Expense Tracker Reset Password",
      textContent: "Reset your password using the link below:",
      htmlContent: `<h3>Click the link below to reset your password:</h3>
        <a href="http://localhost:3000/password/resetPasswordPage/${requestId}">Reset Password</a>`,
    });
  } catch (error) {
    console.error("Error sending email:", error);
    throw new Error("Failed to send reset email");
  }
};