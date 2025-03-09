const DOMAIN_URL = "http://localhost:3000";
const token = localStorage.getItem("user-token");
async function fetchUserProfile() {
  try {
    if (!token) {
      alert("You are not logged in!");
      return;
    }

    const response = await axios.get(`${DOMAIN_URL}/api/user/getprofile`, {
      headers: {
        Authorization: token,
      },
    });

    renderUserProfile(response.data.userInfo);
  } catch (error) {
    console.error("Error fetching profile:", error);
    alert("Failed to load profile. Please try again.");
  }
}

function renderUserProfile(userInfo) {
  const profileInfoElement = document.getElementById("profile-info");
  profileInfoElement.innerHTML = `
    <div class="row mt-3 d-flex align-items-center gap-5" id="${userInfo.id}">
        <h3>Name : ${userInfo.name}</h3>
        <h3>Email : ${userInfo.email}</h3>
        <div class="d-flex justify-content-end gap-3">
        <button class="btn btn-secondary col-2" data-toggle="modal" onclick="addUpdateProfileForm('${userInfo.id}', '${userInfo.name}', '${userInfo.email}')">Update Profile</button>
        <button class="btn btn-danger col-3" onclick="deleteProfile(${userInfo.id})">Delete Your Account</button>
        </div>
    </div>
  `;
}

function addUpdateProfileForm(id, name, email) {
  // console.log(userInfo)
  // const updateProfileFormDiv = document.createElement("div");
  const profileInfoElement = document.getElementById("profile-info");

  // updateProfileFormDiv.setAttribute("z-index", "2");

  profileInfoElement.innerHTML = `<form id="user-update-profile-form" onsubmit="updateProfile(event,${id})">
        <h2> Update Profile</h2>
        <div class="form-group mt-2">
            <label for="user-update-name">Name</label>
            <input type="text" class="form-control w-75" id="user-update-name" value="${name}" required>
        </div>
        
        <div class="form-group mt-2">
            <label for="user-update-email">Email address</label>
            <input type="email" class="form-control w-75" id="user-update-email" aria-describedby="emailHelp" value="${email}" required>
        </div>
        <div class="form-group mt-2">
            <label for="user-update-password">Password</label>
            <input type="password" class="form-control w-75" id="user-update-password" placeholder="Update Password" required>
        </div>

        <button type="submit" class="btn btn-primary mt-2" id="user-update-profile-submit">Update Profile</button>
    </form>
    `;
}

async function updateProfile(event, id) {
  event.preventDefault();
  const nameInput = document.getElementById("user-update-name");
  const emailInput = document.getElementById("user-update-email");
  const passwordInput = document.getElementById("user-update-password");
  try {
    const response = await axios.put(
      `${DOMAIN_URL}/api/user/updateprofile/${id}`,
      {
        name: nameInput.value,
        email: emailInput.value,
        password: passwordInput.value,
      },
      { headers: { Authorization: token } }
    );

    console.log(response);
    alert(response.data.message);

    fetchUserProfile();
  } catch (error) {
    console.error("Error updating profile:", error);
    if (error.response) alert(error.response.data.message);
  }
}

async function deleteProfile(id) {
  try {
    const response = await axios.delete(
      `${DOMAIN_URL}/api/user/deleteprofile/${id}`,
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
