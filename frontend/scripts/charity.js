const DOMAIN_URL = "http://localhost:3000";
const token = localStorage.getItem("charity-token");
async function fetchCharityProfile() {
  try {
    if (!token) {
      alert("You are not logged in!");
      return;
    }

    const response = await axios.get(`${DOMAIN_URL}/api/charity/getprofile`, {
      headers: {
        Authorization: token,
      },
    });
    
    renderCharityProfile(response.data.charityInfo);
  } catch (error) {
    console.error("Error fetching profile:", error);
    alert("Failed to load profile. Please try again.");
  }
}

function renderCharityProfile(charityInfo) {
  const profileInfoElement = document.getElementById("profile-info");
  profileInfoElement.innerHTML = `
    <div class="row mt-3 d-flex align-items-center gap-5" id="${charityInfo.id}">
        <h3>Name : ${charityInfo.name}</h3>
        <h3>Email : ${charityInfo.email}</h3>
        <h3>Mission : ${charityInfo.mission}</h3>
        <h3>Category : ${charityInfo.category}</h3>
        <h3>Location : ${charityInfo.location}</h3>
        <div class="d-flex justify-content-end gap-3">
        <button class="btn btn-secondary col-2" data-toggle="modal" onclick="addUpdateProfileForm('${charityInfo.id}', '${charityInfo.name}', '${charityInfo.email}', '${charityInfo.mission}', '${charityInfo.category}', '${charityInfo.location}')">Update Profile</button>
        <button class="btn btn-danger col-3" onclick="deleteProfile(${charityInfo.id})">Delete Your Account</button>
        </div>
    </div>
  `;
}


function addUpdateProfileForm(id, name, email, mission, category, location) {
  
    const profileInfoElement = document.getElementById("profile-info");
  
    profileInfoElement.innerHTML = `<form id="charity-update-profile-form" onsubmit="updateProfile(event,${id})">
          <h2> Update Profile</h2>
          <div class="form-group mt-2">
              <label for="charity-update-name">Name</label>
              <input type="text" class="form-control w-75" id="charity-update-name" value="${name}" required>
          </div>
          
          <div class="form-group mt-2">
              <label for="charity-update-email">Email address</label>
              <input type="email" class="form-control w-75" id="charity-update-email" aria-describedby="emailHelp" value="${email}" required>
          </div>
          <div class="form-group mt-2">
              <label for="charity-update-password">Password</label>
              <input type="password" class="form-control w-75" id="charity-update-password" placeholder="Update Password" required>
          </div>
          <div class="form-group mt-2">
              <label for="charity-update-mission">Mission</label>
              <textarea type="text" class="form-control w-75" id="charity-update-mission" required>${mission}</textarea>
          </div>
          <div class="form-group mt-2">
              <label for="charity-update-category">Charity Category</label>
              <input type="text" class="form-control w-75" id="charity-update-category" value="${category}" required>
          </div>
          <div class="form-group mt-2">
              <label for="charity-update-location">Location</label>
              <input type="text" class="form-control w-75" id="charity-update-location" value="${location}" required>
          </div>
          <button type="submit" class="btn btn-primary mt-2" id="charity-update-profile-submit">Update Profile</button>
      </form>
      `;
  }
  
  async function updateProfile(event, id) {
    event.preventDefault();
    const nameInput = document.getElementById("charity-update-name");
    const emailInput = document.getElementById("charity-update-email");
    const passwordInput = document.getElementById("charity-update-password");
    const missionInput = document.getElementById("charity-update-mission");
    const categoryInput = document.getElementById("charity-update-category");
    const locationInput = document.getElementById("charity-update-location");
    try {
      const response = await axios.put(
        `${DOMAIN_URL}/api/charity/updateprofile/${id}`,
        {
          name: nameInput.value,
          email: emailInput.value,
          password: passwordInput.value,
          mission: missionInput.value,
          category: categoryInput.value,
          location: locationInput.value
        },
        { headers: { Authorization: token } }
      );
  
      console.log(response);
      alert(response.data.message);
  
      fetchCharityProfile();
    } catch (error) {
      console.error("Error updating profile:", error);
      if (error.response) alert(error.response.data.message);
    }
  }
  
  async function deleteProfile(id) {
    try {
      const response = await axios.delete(
        `${DOMAIN_URL}/api/charity/deleteprofile/${id}`,
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