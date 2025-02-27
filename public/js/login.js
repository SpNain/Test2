const signUp = document.getElementById("signUp");
const signIn = document.getElementById("signIn");
const container = document.getElementById("container");

signUp.addEventListener("click", () => {
  container.classList.add("right-panel-active");

  document.getElementById("loginEmail").value = "";
  document.getElementById("loginPassword").value = "";
});

signIn.addEventListener("click", () => {
  container.classList.remove("right-panel-active");

  document.getElementById("name").value = "";
  document.getElementById("email").value = "";
  document.getElementById("number").value = "";
  document.getElementById("password").value ="";
});

const signUpError = document.getElementById("signUpError");
const loginError = document.getElementById("loginError");

async function login() {
  const loginEmail = document.getElementById("loginEmail");
  const loginPassword = document.getElementById("loginPassword");

  const loginDetails = {
    loginEmail: loginEmail.value,
    loginPassword: loginPassword.value,
  };

  try {
    const response = await axios.post("/user/login", loginDetails);

    alert(response.data.message);
    localStorage.setItem("token", response.data.token);
    window.location.href = "/homePage";
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

async function signUP() {
  const name = document.getElementById("name");
  const email = document.getElementById("email");
  const number = document.getElementById("number");
  const password = document.getElementById("password");
  try {
    const response = await axios.post("/user/signUp", {
      name: name.value,
      email: email.value,
      number: number.value,
      password: password.value,
    });
    alert(response.data.message);
    window.location.href = "/";
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

document.getElementById("loginForm").addEventListener("submit", login);
document.getElementById("signUpForm").addEventListener("submit", signUP);
