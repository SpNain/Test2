const DOMAIN_URL = "http://localhost:3000";
const token = localStorage.getItem("user-token");
const charities_rowsPerPageSelect = document.getElementById(
  "charities-rowsPerPageSelect"
);
const donation_rowsPerPageSelect = document.getElementById("donation-rowsPerPageSelect");


charities_rowsPerPageSelect.addEventListener("change", () => {
  localStorage.setItem(
    "charities-rowsPerPageSelect",
    charities_rowsPerPageSelect.value
  );
  fetchCharitiesList(1);
});

donation_rowsPerPageSelect.addEventListener("change", () => {
  localStorage.setItem("donation-rowsPerPageSelect", donation_rowsPerPageSelect.value);
  fetchDonationHistory(1);
});

document.getElementById("charities-filter").addEventListener("change", () => {
  fetchCharitiesList(1);
});

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
  const profileInfoElement = document.getElementById("profile-info");

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

let timeoutId;
async function fetchCharitiesList(pageNo, search) {
  const charitiesTableBody = document.getElementById("charities-table-body");
  const filter = document.getElementById("charities-filter").value;
  if (!search) {
    search = document.getElementById("charities-search").value;
  }

  if (localStorage.getItem("charities-rowsPerPageSelect")) {
    charities_rowsPerPageSelect.value = parseInt(
      localStorage.getItem("charities-rowsPerPageSelect")
    );
  }
  let rowsPerPage = parseInt(charities_rowsPerPageSelect.value);
  let sno = 1;

  if (timeoutId) {
    clearTimeout(timeoutId);
  }

  timeoutId = setTimeout(async () => {
    // if (!search) {
    //   console.log([]);
    //   return;
    // }

    try {
      const response = await axios.get(
        `${DOMAIN_URL}/api/user/getcharitieslist?pageNo=${pageNo}&rowsPerPage=${rowsPerPage}&filter=${filter}&search=${encodeURIComponent(
          search
        )}`,
        { headers: { Authorization: token } }
      );

      charitiesTableBody.innerHTML = "";

      response.data.charities.forEach((charity) => {
        const id = charity.id;
        const name = charity.name;
        const mission = charity.mission;
        const category = charity.category;
        const location = charity.location;

        let tr = document.createElement("tr");
        tr.className = "trStyle";

        charitiesTableBody.appendChild(tr);

        let th = document.createElement("th");
        th.setAttribute("scope", "row");
        tr.appendChild(th);
        th.appendChild(document.createTextNode(sno++));

        let td1 = document.createElement("td");
        td1.appendChild(document.createTextNode(name));

        let td2 = document.createElement("td");
        td2.appendChild(document.createTextNode(mission));

        let td3 = document.createElement("td");
        td3.appendChild(document.createTextNode(category));

        let td4 = document.createElement("td");
        td4.appendChild(document.createTextNode(location));

        let td5 = document.createElement("td");

        let detailsBtn = document.createElement("button");
        detailsBtn.className = "btn btn-sm btn-info";
        detailsBtn.addEventListener("click", () => getCharityDetails(id));
        detailsBtn.appendChild(document.createTextNode("Details"));

        td5.appendChild(detailsBtn);

        tr.appendChild(td1);
        tr.appendChild(td2);
        tr.appendChild(td3);
        tr.appendChild(td4);
        tr.appendChild(td5);
      });

      addPaginationNav(
        "charities-table-pagination-nav",
        pageNo,
        response.data.totalPages,
        fetchCharitiesList
      );
    } catch (error) {
      console.error("Error fetching Charities:", error);
      alert("Failed to load Charities. Please try again.");
    }
  }, 500);
}

async function getCharityDetails(id) {
  try {
    const response = await axios.get(
      `${DOMAIN_URL}/api/user/getcharitydetails/${id}`,
      { headers: { Authorization: token } }
    );
    const charityDetails = response.data.charityDetails;
    console.log(charityDetails)

    document.getElementById("charity-details-modal-charityName").textContent =
      charityDetails.name;
    document.getElementById(
      "charity-details-modal-charityMission"
    ).textContent = charityDetails.mission;
    document.getElementById(
      "charity-details-modal-charityCategory"
    ).textContent = charityDetails.category;
    document.getElementById(
      "charity-details-modal-charityLocation"
    ).textContent = charityDetails.location;

    const projectsTableBody = document.getElementById("projects-table-body");
    projectsTableBody.innerHTML = "";

    let sno = 1;

    charityDetails.Projects.forEach((project) => {
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

      let donateBtn = document.createElement("button");
      donateBtn.className = "btn btn-info btn-sm";
      donateBtn.addEventListener("click", () => {
        donate(project.id, charityDetails.id);
      });
      donateBtn.appendChild(document.createTextNode("Donate"));

      td6.appendChild(donateBtn);

      tr.appendChild(td1);
      tr.appendChild(td2);
      tr.appendChild(td3);
      tr.appendChild(td4);
      tr.appendChild(td5);
      tr.appendChild(td6);
    });

    const charityDetailsModal = new bootstrap.Modal(
      document.getElementById("charity-details-modal")
    );
    charityDetailsModal.show();
  } catch (error) {
    console.error("Error fetching Charity Details:", error);
    alert("Failed to load Charity Details. Please try again.");
  }
}

async function donate(projectId, charityId) {
  const donateModal = new bootstrap.Modal(
    document.getElementById("donation-modal")
  );
  donateModal.show();

  document
    .getElementById("donation-form")
    .addEventListener("submit", async (event) => {
      event.preventDefault();
      const donationAmount = document.getElementById("donation-amount").value;

      if (isNaN(donationAmount) || donationAmount <= 0) {
        alert("Please enter a valid donation amount.");
        return;
      }

      donateModal.hide();

      try {
        const response = await axios.post(
          `${DOMAIN_URL}/api/user/donate/createOrder`,
          { orderId: `${Date.now()}`, orderAmount: donationAmount },
          {
            headers: { Authorization: token },
            "Content-Type": "application/json",
          }
        );

        const orderId = response.data.orderId;
        const paymentId = response.data.paymentId;

        if (paymentId) {
          const cashfree = Cashfree({
            mode: "sandbox",
          });

          let checkoutOptions = {
            paymentSessionId: paymentId,

            //? Payment page option
            redirectTarget: "_modal",
          };

          const result = await cashfree.checkout(checkoutOptions);

          if (result.error) {
            console.log(
              "User has closed the popup or there is some payment error, Check for Payment Status"
            );
            console.log(result.error);
          }
          if (result.redirect) {
            console.log("Payment will be redirected");
          }
          if (result.paymentDetails) {
            console.log("Payment has been completed, Check for Payment Status");
            const statusResponse = await axios.get(
              `${DOMAIN_URL}/api/user/donate/getPaymentStatus/${orderId}`
            );

            const statusUpdateResponse = await axios.post(
              `${DOMAIN_URL}/api/user/donate/updateTransactionStatus`,
              {
                orderId: orderId,
                status: statusResponse.data.orderStatus,
                projectId: projectId,
                charityId: charityId,
                donationAmount: donationAmount,
              },
              { headers: { Authorization: token } }
            );

            alert(statusUpdateResponse.data.message);
          }
          window.location.reload();
          getCharityDetails(charityId);
        }
      } catch (err) {
        console.error("Error:", err);
      }
    });
}


async function fetchDonationHistory(pageNo) {
  const donationTableBody = document.getElementById("donation-table-body");
  if (localStorage.getItem("donation-rowsPerPageSelect")) {
    donation_rowsPerPageSelect.value = parseInt(localStorage.getItem("donation-rowsPerPageSelect"));
  }
  let rowsPerPage = parseInt(donation_rowsPerPageSelect.value);
  let sno = 1;

  try {

    const response = await axios.get(
      `${DOMAIN_URL}/api/user/getdonationhistory?pageNo=${pageNo}&rowsPerPage=${rowsPerPage}`,
      { headers: { Authorization: token } }
    );

    donationTableBody.innerHTML = "";

    response.data.donations.forEach((donation) => {
      const date = donation.createdAt;
      const charityName = donation.charityName;
      const projectName = donation.projectName;
      const donationAmount = donation.donationAmount;
      const receiptUrl = donation.receiptUrl;

      let tr = document.createElement("tr");
      tr.className = "trStyle";

      donationTableBody.appendChild(tr);

      let th = document.createElement("th");
      th.setAttribute("scope", "row");
      tr.appendChild(th);
      th.appendChild(document.createTextNode(sno++));

      let td1 = document.createElement("td");
      td1.appendChild(document.createTextNode(date));

      let td2 = document.createElement("td");
      td2.appendChild(document.createTextNode(charityName));

      let td3 = document.createElement("td");
      td3.appendChild(document.createTextNode(projectName));
      
      let td4 = document.createElement("td");
      td4.appendChild(document.createTextNode(donationAmount));

      let td5 = document.createElement("td");

      let downloadBtn = document.createElement("button");
      downloadBtn.className = "btn btn-info btn-sm";
      downloadBtn.addEventListener("click", () => window.location.href = receiptUrl);
      downloadBtn.appendChild(document.createTextNode("Download"));

      td5.appendChild(downloadBtn);

      tr.appendChild(td1);
      tr.appendChild(td2);
      tr.appendChild(td3);
      tr.appendChild(td4);
      tr.appendChild(td5);
    });

    addPaginationNav("donation-table-pagination-nav", pageNo, response.data.totalPages, fetchDonationHistory);
  } catch (error) {
    console.error("Error fetching Charities:", error);
    alert("Failed to load Charities. Please try again.");
  }
}