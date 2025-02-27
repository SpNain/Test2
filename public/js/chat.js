const messageTextArea = document.getElementById("messageTextArea");
const messageSendBtn = document.getElementById("messageSendBtn");

async function messageSend() {
  try {
    const message = messageTextArea.value;
    const token = localStorage.getItem("token");
    const res = await axios.post(
      "/chat/sendMessage",
      {
        message: message,
      },
      { headers: { Authorization: token } }
    );
  } catch (error) {
    console.error("something went wrong : ", error);
  }
}

messageSendBtn.addEventListener("click", messageSend);