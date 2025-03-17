const wrapper = document.querySelector(".wrapper"),
  signupHeader = document.querySelector(".signup header"),
  loginHeader = document.querySelector(".login header"),
  signUpAnker = document.querySelector("#signUpAnker");

// wrapper pe agr active class lgi h to login show hoga aur active nahi lga h to signup show hoga
loginHeader.addEventListener("click", () => {
  wrapper.classList.add("active");

  // login active hote hi sign up input khaali krdo
  document.getElementById("name").value = "";
  document.getElementById("email").value = "";
  document.getElementById("password").value ="";
});

signupHeader.addEventListener("click", () => {
  wrapper.classList.remove("active");

  // signup active hote hi login input khaali krdo
  document.getElementById("loginEmail").value = "";
  document.getElementById("loginPassword").value = "";
});

signUpAnker.addEventListener("click", () => {
  wrapper.classList.remove("active");

  // signup active hote hi login input khaali krdo
  document.getElementById("loginEmail").value = "";
  document.getElementById("loginPassword").value = "";
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
  const password = document.getElementById("password");
  try {
    const response = await axios.post("/user/signUp", {
      name: name.value,
      email: email.value,
      password: password.value,
    });
    alert(response.data.message);
    loginHeader.click();
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
