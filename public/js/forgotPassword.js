const resetPasswordEmailBtn = document.getElementById("resetPasswordEmailBtn");

async function sendMail() {
  try {
    const email = document.getElementById("email").value;
    const res = await axios.post("/password/sendMail", {
      email: email,
    });
    alert(res.data.message);
    window.location.href = "/";
  } catch (error) {
    console.error(error);
    alert(error.response.data.message);
    window.location.reload();
  }
}
resetPasswordEmailBtn.addEventListener("click", sendMail);
