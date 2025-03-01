async function handleMsgSubmit(e) {
  e.preventDefault();
  const messageInput = document.getElementById("message-input");
  const token = localStorage.getItem("token");

  try {
    const response = await axios.post(
      "http://localhost:4000/api/user/message",
      {
        message: messageInput.value,
      },
      { headers: { Authorization: token } }
    );
    messageInput.value = "";
    alert(response.data.message);
  } catch (err) {
    console.log(err);
  }
}
