const DOMAIN_URL = "http://localhost:3000";
const token = localStorage.getItem("admin-token");
async function fetchAdminProfile() {
  try {
    if (!token) {
      alert("You are not logged in!");
      return;
    }

    const response = await axios.get(`${DOMAIN_URL}/api/admin/getprofile`, {
      headers: {
        Authorization: token,
      },
    });

    renderAdminProfile(response.data.adminInfo);
  } catch (error) {
    console.error("Error fetching profile:", error);
    alert("Failed to load profile. Please try again.");
  }
}

function renderAdminProfile(adminInfo) {
  const profileInfoElement = document.getElementById("profile-info");
  profileInfoElement.innerHTML = `
    <div class="row mt-3 d-flex align-items-center gap-5" id="${adminInfo.id}">
        <h3>Name : ${adminInfo.name}</h3>
        <h3>Email : ${adminInfo.email}</h3>
        <div class="d-flex justify-content-end gap-3">
        <button class="btn btn-secondary col-2" data-toggle="modal" onclick="addUpdateProfileForm('${adminInfo.id}', '${adminInfo.name}', '${adminInfo.email}')">Update Profile</button>
        <button class="btn btn-danger col-3" onclick="deleteProfile(${adminInfo.id})">Delete Your Account</button>
        </div>
    </div>
  `;
}

function addUpdateProfileForm(id, name, email) {
  const profileInfoElement = document.getElementById("profile-info");

  profileInfoElement.innerHTML = `<form id="admin-update-profile-form" onsubmit="updateProfile(event,${id})">
        <h2> Update Profile</h2>
        <div class="form-group mt-2">
            <label for="admin-update-name">Name</label>
            <input type="text" class="form-control w-75" id="admin-update-name" value="${name}" required>
        </div>
        
        <div class="form-group mt-2">
            <label for="admin-update-email">Email address</label>
            <input type="email" class="form-control w-75" id="admin-update-email" aria-describedby="emailHelp" value="${email}" required>
        </div>
        <div class="form-group mt-2">
            <label for="admin-update-password">Password</label>
            <input type="password" class="form-control w-75" id="admin-update-password" placeholder="Update Password" required>
        </div>

        <button type="submit" class="btn btn-primary mt-2" id="admin-update-profile-submit">Update Profile</button>
    </form>
    `;
}

async function updateProfile(event, id) {
  event.preventDefault();
  const nameInput = document.getElementById("admin-update-name");
  const emailInput = document.getElementById("admin-update-email");
  const passwordInput = document.getElementById("admin-update-password");
  try {
    const response = await axios.put(
      `${DOMAIN_URL}/api/admin/updateprofile/${id}`,
      {
        name: nameInput.value,
        email: emailInput.value,
        password: passwordInput.value,
      },
      { headers: { Authorization: token } }
    );

    console.log(response);
    alert(response.data.message);

    fetchAdminProfile();
  } catch (error) {
    console.error("Error updating profile:", error);
    if (error.response) alert(error.response.data.message);
  }
}

async function deleteProfile(id) {
  try {
    const response = await axios.delete(
      `${DOMAIN_URL}/api/admin/deleteprofile/${id}`,
      { headers: { Authorization: token } }
    );
    alert(response.data.message);
    window.localStorage.clear();
    window.location.href = "./home.html";
  } catch (error) {
    console.error("Error deleting profile:", error);
    alert("Failed to delete profile. Please try again.");
  }
}
