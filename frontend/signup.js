const signUpError = document.getElementById("signUpError");

async function handleSignUp(e) {
  e.preventDefault();

  try {
    let email = document.getElementById("email").value;
    let password = document.getElementById("password").value;
    let name = document.getElementById("name").value;
    let phoneNumber = document.getElementById("phone").value;

    const response = await axios.post("http://localhost:4000/api/user/signup", {
      email: email,
      password: password,
      name: name,
      phoneNumber: phoneNumber,
    });

    alert(response.data.message);

    document.getElementById("email").value = "";
    document.getElementById("password").value = "";
    document.getElementById("name").value = "";
  } catch (error) {
    if (error.response) {
      signUpError.textContent = error.response.data.message;
      signUpError.style.display = "block";
      setTimeout(() => {
        signUpError.textContent = "";
        signUpError.style.display = "none";
      }, 3000);
    } else {
      alert("An error occurred. Please try again later.");
    }
  }
}