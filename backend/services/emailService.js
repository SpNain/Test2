const Sib = require("sib-api-v3-sdk");

const client = Sib.ApiClient.instance;
const apiKey = client.authentications["api-key"];
apiKey.apiKey = process.env.EMAIL_API_KEY;

exports.sendEmail = async (senderInfo, receiversInfo) => {
  const transEmailApi = new Sib.TransactionalEmailsApi();
  const sender = {
    email: "hnspnain@gmail.com",
    name: senderInfo.name,
  };

  try {
    const receivers = receiversInfo.emails.map((email) => ({ email }));
    console.log(receivers)
    await transEmailApi.sendTransacEmail({
      sender,
      To: receivers,
      subject: receiversInfo.subject,
      textContent: receiversInfo.content,
    });
  } catch (error) {
    console.error("Error sending email:", error);
    throw new Error("Failed to send email");
  }
};
