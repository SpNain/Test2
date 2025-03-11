const DOMAIN_URL = "http://localhost:3000";
const token = localStorage.getItem("charity-token");

const projects_rowsPerPageSelect = document.getElementById(
  "projects-rowsPerPageSelect"
);

projects_rowsPerPageSelect.addEventListener("change", () => {
  localStorage.setItem(
    "projects-rowsPerPageSelect",
    projects_rowsPerPageSelect.value
  );
  fetchProjectsList(1);
});

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
          <button type="submit" class="btn mt-2" id="charity-update-profile-submit">Update Profile</button>
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
        location: locationInput.value,
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

async function fetchProjectsList(pageNo, status) {
  const projectsTableBody = document.getElementById("projects-table-body");

  if (localStorage.getItem("projects-rowsPerPageSelect")) {
    projects_rowsPerPageSelect.value = parseInt(
      localStorage.getItem("projects-rowsPerPageSelect")
    );
  }
  let rowsPerPage = parseInt(projects_rowsPerPageSelect.value);
  let sno = 1;

  try {
    const response = await axios.get(
      `${DOMAIN_URL}/api/charity/getprojectslist?pageNo=${pageNo}&rowsPerPage=${rowsPerPage}&status=${status}`,
      { headers: { Authorization: token } }
    );

    projectsTableBody.innerHTML = "";
    console.log(response.data);

    response.data.projects.forEach((project) => {
      const id = project.id;
      const name = project.name;
      const description = project.description;
      const raisedFunds = project.raisedFunds;
      const requiredFunds = project.requiredFunds;
      const projectStatus = project.status;

      let tr = document.createElement("tr");
      tr.className = "trStyle";

      projectsTableBody.appendChild(tr);

      let th = document.createElement("th");
      th.setAttribute("scope", "row");
      tr.appendChild(th);
      th.appendChild(document.createTextNode(sno++));

      let td1 = document.createElement("td");
      td1.appendChild(document.createTextNode(name));

      let td2 = document.createElement("td");
      td2.appendChild(document.createTextNode(description));

      let td3 = document.createElement("td");
      td3.appendChild(document.createTextNode(raisedFunds));

      let td4 = document.createElement("td");
      td4.appendChild(document.createTextNode(requiredFunds));

      let td5 = document.createElement("td");
      td5.appendChild(document.createTextNode(projectStatus));

      let td6 = document.createElement("td");

      let editBtn = document.createElement("button");
      editBtn.className = "btn btn-primary m-1";
      editBtn.addEventListener("click", () => {
        editProject(id, name, description, requiredFunds);
      });
      editBtn.appendChild(document.createTextNode("Edit"));

      let deleteBtn = document.createElement("button");
      deleteBtn.className = "btn btn-danger m-1";
      deleteBtn.addEventListener("click", () => deleteProject(id));
      deleteBtn.appendChild(document.createTextNode("Delete"));

      td6.appendChild(editBtn);
      td6.appendChild(deleteBtn);

      let td7 = document.createElement("td");

      let emailBtn = document.createElement("button");
      emailBtn.className = "btn btn-info";
      emailBtn.addEventListener("click", () => sendEmailToDonors(id));
      emailBtn.appendChild(document.createTextNode("Send Email"));

      td7.appendChild(emailBtn);

      tr.appendChild(td1);
      tr.appendChild(td2);
      tr.appendChild(td3);
      tr.appendChild(td4);
      tr.appendChild(td5);
      tr.appendChild(td6);
      tr.appendChild(td7);
    });

    addPaginationNav(
      "projects-table-pagination-nav",
      pageNo,
      response.data.totalPages,
      fetchProjectsList,
      status
    );
  } catch (error) {
    console.error("Error fetching Projects:", error);
    alert("Failed to load Projects. Please try again.");
  }
}

async function handleCreateProject() {
  const nameInput = document.getElementById("project-name");
  const descriptionInput = document.getElementById("project-description");
  const requiredFundsInput = document.getElementById("required-funds");
  try {
    const response = await axios.post(
      `${DOMAIN_URL}/api/charity/createproject`,
      {
        name: nameInput.value,
        description: descriptionInput.value,
        requiredFunds: requiredFundsInput.value,
      },
      { headers: { Authorization: token } }
    );

    console.log(response);
    alert(response.data.message);

    nameInput.value = "";
    descriptionInput.value = "";
    requiredFundsInput.value = "";

    fetchProjectsList(1);
  } catch (error) {
    console.error("Error creating project:", error);
    if (error.response) alert(error.response.data.message);
    nameInput.value = "";
    descriptionInput.value = "";
    requiredFundsInput.value = "";
  }
}
document
  .getElementById("create-project-form")
  .addEventListener("submit", handleCreateProject);

function editProject(id, name, description, requiredFunds) {
  document.getElementById("edit-project-name").value = name;
  document.getElementById("edit-project-description").value = description;
  document.getElementById("edit-required-funds").value = requiredFunds;

  const editProjectModal = new bootstrap.Modal(
    document.getElementById("edit-project-modal")
  );
  editProjectModal.show();

  document
    .getElementById("edit-project-form")
    .addEventListener("submit", async (event) => {
      event.preventDefault();
      const nameInput = document.getElementById("edit-project-name");
      const descriptionInput = document.getElementById(
        "edit-project-description"
      );
      const requiredFundsInput = document.getElementById("edit-required-funds");
      try {
        const response = await axios.put(
          `${DOMAIN_URL}/api/charity/updateproject/${id}`,
          {
            name: nameInput.value,
            description: descriptionInput.value,
            requiredFunds: requiredFundsInput.value,
          },
          { headers: { Authorization: token } }
        );

        console.log(response);
        alert(response.data.message);

        fetchProjectsList(1);
      } catch (error) {
        console.error("Error updating project:", error);
        if (error.response) alert(error.response.data.message);
      }
      editProjectModal.hide();
    });
}

async function deleteProject(id) {
  try {
    const response = await axios.delete(
      `${DOMAIN_URL}/api/charity/deleteproject/${id}`,
      { headers: { Authorization: token } }
    );
    alert(response.data.message);
    fetchProjectsList(1);
  } catch (error) {
    console.error("Error deleting project:", error);
    alert("Failed to delete project. Please try again.");
  }
}

async function sendEmailToDonors(id) {
  const createEmailModal = new bootstrap.Modal(
    document.getElementById("create-email-modal")
  );
  createEmailModal.show();

  document
    .getElementById("create-email-form")
    .addEventListener("submit", async (event) => {
      event.preventDefault();
      const emailSubjectInput = document.getElementById("email-subject");
      const emailContentInput = document.getElementById("email-content");
console.log(emailContentInput.value, emailSubjectInput.value)
      try {
        const response = await axios.post(
          `${DOMAIN_URL}/api/charity/sendemailtodonors/${id}`,
          {
            subject: emailSubjectInput.value,
            content: emailContentInput.value,
          },
          { headers: { Authorization: token } }
        );

        console.log(response);
        alert(response.data.message);
      } catch (error) {
        console.error("Error sending email:", error);
        if (error.response) alert(error.response.data.message);
      }
      createEmailModal.hide();
    });
}
