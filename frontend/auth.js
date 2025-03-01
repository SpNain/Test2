const signUpError = document.getElementById("signUpError");
const loginError = document.getElementById("loginError");

async function handleSignUp() {
  try {
    let name = document.getElementById("name").value;
    let email = document.getElementById("email").value;
    let phoneNumber = document.getElementById("phone").value;
    let password = document.getElementById("password").value;

    const response = await axios.post("http://localhost:4000/api/user/signup", {
      email: email,
      password: password,
      name: name,
      phoneNumber: phoneNumber,
    });

    alert(response.data.message);

    document.getElementById("name").value = "";
    document.getElementById("email").value = "";
    document.getElementById("phone").value = "";
    document.getElementById("password").value = "";
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

async function handleLogin() {
  const loginEmail = document.getElementById("email");
  const loginPassword = document.getElementById("password");

  const loginDetails = {
    email: loginEmail.value,
    password: loginPassword.value,
  };

  try {
    localStorage.clear();

    const response = await axios.post("http://localhost:4000/api/user/login", loginDetails);

    alert(response.data.message);
    localStorage.setItem("token", response.data.token);
  } catch (error) {
    if (error.response) {
      loginError.textContent = error.response.data.message;
      loginError.style.display = "block";
      setTimeout(() => {
        loginError.textContent = "";
        loginError.style.display = "none";
      }, 3000);
    } else {
      alert("An error occurred. Please try again later.");
    }
  }
}

if (document.getElementById("signUpForm")) {
  document.getElementById("signUpForm").addEventListener("submit", handleSignUp);
}
if (document.getElementById("loginForm")) {
  document.getElementById("loginForm").addEventListener("submit", handleLogin);
}
