let url =
  "http://localhost:3000";

const nameInput = document.querySelector("#name");
const emailInput = document.querySelector("#email");
const phoneInput = document.querySelector("#phone");
const dateInput = document.querySelector("#date");

const bookingForm = document.querySelector("#bookingForm");
bookingForm.addEventListener("submit", onSubmit);

window.addEventListener("DOMContentLoaded", refresh);

async function refresh() {
  try {
    let response = await axios.get(`${url}/user/allappointments`);
    console.log(response.data);
    for (let i = 0; i < response.data.length; i++) {
      displayUserOnScreen(response.data[i]);
    }
  } catch (error) {
    console.log(error);
  }
}

function onSubmit(event) {
  event.preventDefault();

  addDetailsCard();

  nameInput.value = "";
  emailInput.value = "";
  phoneInput.value = "";
  dateInput.value = "";
}

async function addDetailsCard() {
  console.log("addDetailsCard run")
  let userDetailsObj = {
    userName: `${nameInput.value}`,
    userEmail: `${emailInput.value}`,
    userPhone: `${phoneInput.value}`,
    userDate: `${dateInput.value}`
    // uniqueKey: `${new Date().getTime()}`,
  };
  console.log(userDetailsObj);
  
  if (
    userDetailsObj.userName == "" ||
    userDetailsObj.userPhone == "" ||
    userDetailsObj.userEmail == ""
  ) {
    alert(`Fill all the details`);
  } else {
    try {
      console.log(userDetailsObj);
      let response = await axios.post(`${url}/user/appointments`, userDetailsObj);
      console.log(response.data);
      displayUserOnScreen(response.data);
    } catch (error) {
      console.log(error);
    }
  }
}

async function deleteDetailsCard(id) {

  try {
    let response = await axios.delete(`${url}/user/appointments/delete/${id}`);
    document.getElementById(`${id}`).remove();
  } catch (error) {
    console.log(error);
  }
}

function editDetailsCard(id,userName, userEmail, userPhone, userDate) {

  document.getElementById(
    `${id}`
  ).innerHTML = `<form action="#" class="w-75 mx-auto" id="editBookingForm">
  <!-- Name -->
  <div class="col mb-3">
  <label for="editName" class="col-form-label">Name</label>
  <input type="text" class="form-control" name="editName" id="editName" value=${userName}>
  </div>
  
  <!-- Email -->
  <div class="col mb-3">
  <label for="editEmail" class="col-form-label">Email</label>
  <input type="email" class="form-control" name="editEmail" id="editEmail" required value=${userEmail}>
  </div>
  
  <!-- Phone Number -->
  <div class="col mb-3">
  <label for="editPhone" class="col-form-label">Phone Number</label>
  <input type="number" class="form-control" name="editPhone" id="editPhone" value=${userPhone}>
  </div>
  
  <!-- Date -->
  <div class="col mb-3">
  <label for="editDate" class="col-form-label">Date</label>
  <input type="date" class="form-control" name="editDate" id="editDate" value=${userDate}>
  </div>
  
  <!-- Submit Button -->
  <div class="col mt-4 mb-2">
    <div class="col-12 d-flex justify-content-center">
    <input type="submit" class="form-control button d-flex justify-content-center bg-success" id="submit" value="Done">
    </div>
    </div>
    </form>`;

  const editBookingForm = document.querySelector("#editBookingForm");
  editBookingForm.addEventListener("submit", addEditedCard);
}

async function addEditedCard(event) {
  event.preventDefault();

  let editedUserObj = {
    userName: event.target.editName.value,
    userEmail: event.target.editEmail.value,
    userPhone: event.target.editPhone.value,
    userDate: event.target.editDate.value,
    // uniqueKey: targetObj.uniqueKey,
  };

  try {
    let response = await axios.put(`${url}/user/appointments/edit/${event.target.parentNode.id}`, editedUserObj);
    // console.log(response.data);
    // updateResponseData("put", editedUserObj);

    document.getElementById(`${event.target.parentNode.id}`).innerHTML = `<div>
      <h5> ${editedUserObj.userName} </h5>
      <h6> Email : ${editedUserObj.userEmail} </h6>
      <h6> Phone Number : ${editedUserObj.userPhone} </h6>
      <h6> Date : ${editedUserObj.userDate} </h6>
    </div>
    <div class ="d-flex justify-content-end">
      <button class="btn btn-danger m-2 p-2" onclick="deleteDetailsCard(${editedUserObj.id})">X</button>
      <button class="btn btn-primary m-2 p-2" onclick="editDetailsCard(${editedUserObj.id, editedUserObj.userName, editedUserObj.userEmail, editedUserObj.userPhone, editedUserObj.userDate})">Edit</button>
    </div>`;
  } catch (error) {
    console.log(error);
  }
}

function displayUserOnScreen(userDetailsObj) {
  document.querySelector(
    ".detailsObjectsDiv"
  ).innerHTML += `<div class="card"  id=${userDetailsObj.id}>
  <div>
  <h5> ${userDetailsObj.userName} </h5>
  <h6> Email : ${userDetailsObj.userEmail} </h6>
  <h6> Phone Number : ${userDetailsObj.userPhone} </h6>
  <h6> Date : ${userDetailsObj.userDate} </h6>
  </div>
  <div class ="d-flex justify-content-end">
  <button class="btn btn-danger m-2 p-2" onclick="deleteDetailsCard(${userDetailsObj.id})">X</button>
  <button class="btn btn-primary m-2 p-2" onclick="editDetailsCard(${userDetailsObj.id, userDetailsObj.userName, userDetailsObj.userEmail, userDetailsObj.userPhone, userDetailsObj.userDate})">Edit</button>
  </div>
  </div>`;
}

// function getTargetObj(element) {
//   for (let i = 0; i < responseData.length; i++) {
//     if (responseData[i].uniqueKey == element.id) return responseData[i];
//   }
// }