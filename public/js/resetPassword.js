const resetPasswordBtn = document.getElementById("resetPasswordBtn");
async function updatePassword() {
  try {
    const newPassword = document.getElementById("newPassword").value;
    const res = await axios.post("/password/resetPassword", {
      password: newPassword,
    });
    alert(res.data.message);
    window.location.href = "/";
  } catch (error) {
    console.error(error);
    alert(error.response.data.message);
    window.location.reload();
  }
}
resetPasswordBtn.addEventListener("click", updatePassword);
