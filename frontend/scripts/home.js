const DOMAIN_URL = "http://localhost:3000";

document.addEventListener("DOMContentLoaded", () => {
  // User Signup
  async function handleUserSignup() {
    try {
      let name = document.getElementById("user-signup-name").value;
      let email = document.getElementById("user-signup-email").value;
      let password = document.getElementById("user-signup-password").value;

      const response = await axios.post(`${DOMAIN_URL}/api/user/signup`, {
        name,
        email,
        password,
      });

      alert(response.data.message);
      clearInputs("user-signup-name", "user-signup-email", "user-signup-password");
    } catch (error) {
      showError("user-signup-error", error);
      clearInputs("user-signup-name", "user-signup-email", "user-signup-password");
    }
  }

  // User Login
  async function handleUserLogin() {
    try {
      let email = document.getElementById("user-login-email").value;
      let password = document.getElementById("user-login-password").value;

      const response = await axios.post(`${DOMAIN_URL}/api/user/login`, {
        email,
        password,
      });
      alert(response.data.message);
      localStorage.setItem("user-token", response.data.token);

      window.location.href = "../views/user.html";

    } catch (error) {
      showError("user-login-error", error);
      clearInputs("user-login-email", "user-login-password");
    }
  }

  // Charity Signup
  async function handleCharitySignup() {
    try {
      let name = document.getElementById("charity-signup-name").value;
      let email = document.getElementById("charity-signup-email").value;
      let password = document.getElementById("charity-signup-password").value;
      let mission = document.getElementById("charity-signup-mission").value;
      let category = document.getElementById("charity-signup-category").value;
      let city = document.getElementById("charity-signup-city").value;
      let state = document.getElementById("charity-signup-state").value;
      let country = document.getElementById("charity-signup-country").value;
      
      const response = await axios.post(`${DOMAIN_URL}/api/charity/signup`, {
        name,
        email,
        password,
        mission,
        category,
        location: `${city}, ${state}, ${country}`,
      });

      alert(response.data.message);
      clearInputs("charity-signup-name", "charity-signup-email", "charity-signup-password", "charity-signup-mission", "charity-signup-city", "charity-signup-state", "charity-signup-country");

    } catch (error) {
      showError("charity-signup-error", error);
    }
  }

  // Charity Login
  async function handleCharityLogin() {
    try {
      let email = document.getElementById("charity-login-email").value;
      let password = document.getElementById("charity-login-password").value;

      const response = await axios.post(`${DOMAIN_URL}/api/charity/login`, {
        email,
        password,
      });

      alert(response.data.message);
      localStorage.setItem("charity-token", response.data.token);

      window.location.href = "/charity.html";

    } catch (error) {
      showError("charity-login-error", error);
      clearInputs("charity-login-email", "charity-login-password");
    }
  }

  // Admin Login
  async function handleAdminLogin() {
    try {
      let email = document.getElementById("admin-login-email").value;
      let password = document.getElementById("admin-login-password").value;

      const response = await axios.post(`${DOMAIN_URL}/api/admin/login`, {
        email,
        password,
      });

      alert(response.data.message);
      localStorage.setItem("admin-token", response.data.token);

      window.location.href = "/admin.html";

    } catch (error) {
      showError("admin-login-error", error);
      clearInputs("admin-login-email", "admin-login-password");
    }
  }

  // Function to clear inputs
  function clearInputs(...args) {
    for (let i = 0; i < args.length; i++) { 
      document.getElementById(args[i]).value = "";
    }
  }

  // Function to show error messages
  function showError(elementId, error) {
    const errorElement = document.getElementById(elementId);
    if (error.response) {
      errorElement.textContent = error.response.data.message;
      errorElement.style.display = "block";
      setTimeout(() => {
        errorElement.textContent = "";
        errorElement.style.display = "none";
      }, 3000);
    } else {
      console.error(error);
      alert("An error occurred. Please try again later.");
    }
  }

  // Event Listeners
  document.getElementById("user-signup-form").addEventListener("submit", handleUserSignup);
  document.getElementById("user-login-form").addEventListener("submit", handleUserLogin);
  document.getElementById("charity-signup-form").addEventListener("submit", handleCharitySignup);
  document.getElementById("charity-login-form").addEventListener("submit", handleCharityLogin);
  document.getElementById("admin-login-form").addEventListener("submit", handleAdminLogin);
});
