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
      window.location.reload();
    } catch (error) {
      showError("user-signup-error", error);
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
    }
  }

  // Charity Signup
  async function handleCharitySignup() {
    try {
      let name = document.getElementById("charity-signup-name").value;
      let email = document.getElementById("charity-signup-email").value;
      let password = document.getElementById("charity-signup-password").value;
      let mission = document.getElementById("charity-signup-mission").value;
      let categories = getSelectedCategories();
      let city = document.getElementById("charity-signup-city").value;
      let state = document.getElementById("charity-signup-state").value;
      let country = document.getElementById("charity-signup-country").value;
      
      const response = await axios.post(`${DOMAIN_URL}/api/charity/signup`, {
        name,
        email,
        password,
        mission,
        categories,
        location: {
          city,
          state,
          country,
        }
      });

      alert(response.data.message);
      window.location.reload();

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
    }
  }

  // Function to get selected categories for charity signup
  function getSelectedCategories() {
    let categories = [];
    document
      .querySelectorAll("#charity-signup-categories input:checked")
      .forEach((checkbox) => {
        categories.push(checkbox.value);
      });
    return categories;
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
  if (document.getElementById("user-signup-submit")) {
    document
      .getElementById("user-signup-submit")
      .addEventListener("click", handleUserSignup);
  }

  if (document.getElementById("user-login-submit")) {
    document
      .getElementById("user-login-submit")
      .addEventListener("click", handleUserLogin);
  }

  if (document.getElementById("charity-signup-submit")) {
    document
      .getElementById("charity-signup-submit")
      .addEventListener("click", handleCharitySignup);
  }

  if (document.getElementById("charity-login-submit")) {
    document
      .getElementById("charity-login-submit")
      .addEventListener("click", handleCharityLogin);
  }

  if (document.getElementById("admin-login-submit")) {
    document
      .getElementById("admin-login-submit")
      .addEventListener("click", handleAdminLogin);
  }
});
