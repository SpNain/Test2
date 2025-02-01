const API_URL = "http://localhost:3000";

async function fetchStudents() {
  const date = document.getElementById("dateInput").value;
  if (!date) return alert("Please select a date");

  const form = document.createElement("form");

  // Set attributes
  form.id = "attendanceForm";
  form.className = "w-100";

  // Why form.onsubmit = submitAttendance(event); Fails? because in this way submitAttendance(event) immediately executes the function and didn't wait for the form to be submitted. 
  form.onsubmit = function (event) {
    submitAttendance(event,date);
  };

  // console.log(form);

  try {
    let response = await axios.get(`${API_URL}/student/allstudents`);
    console.log(response.data);

    let allStudents = response.data;
    allStudents.forEach((student) => {
      form.innerHTML += `
          <div class="row mt-3">
              <label class="col-4">${student.name}</label>
              <div class="col-3">
              <label for="${student.id}_present">
              <input type="radio" id="${student.id}_present" name="${student.id}" value="Present" required> Present
              </label>
              </div>
              <div class="col-3">
              <label for="${student.id}_absent">
              <input type="radio" id="${student.id}_absent" name="${student.id}" value="Absent"> Absent
              </label>
              </div>
          </div>`;
    });
  }
  catch (error) {
    console.log(error);
  }

  // let user = [
  //   { name: "A", id: "1" },
  //   { name: "B", id: "2" },
  //   { name: "C", id: "3" },
  //   { name: "D", id: "4" },
  //   { name: "E", id: "5" },
  // ];

  

  form.innerHTML += `
    <div class="row mt-5 d-flex justify-content-center">
    <button type="submit" class="btn btn-info col-2">Mark Attendance</button>
    </div>`;

  document.getElementById("data-container").replaceChildren(form);
}

async function submitAttendance(event,date) {
  event.preventDefault(); // Prevent page refresh

  const formData = new FormData(event.target); // Get form data
  const attendanceData = {};

  for (const [key, value] of formData.entries()) {
    attendanceData[key] = value;
  }

  // console.log(attendanceData); // Outputs selected values

  let attendanceDataWithDate = {};

  attendanceDataWithDate = {
    Date: date,
    combinedStatus : attendanceData
  }

  console.log(attendanceDataWithDate)

  try {
    let response = await axios.post(`${API_URL}/attendance/attendancedatawithdate`, attendanceDataWithDate);
    console.log(response.data)
  } catch (error) {
    console.log(error);
  }

  displayAttendance(attendanceData);
}

function displayAttendance(attendanceData) {
  const arDiv = document.createElement("div");

  arDiv.id = "arDiv";
  arDiv.className = "w-100";

  for (let key in attendanceData) {
    arDiv.innerHTML += `
        <div class="user row mt-3">
        <p class="col-6">${key}</p>
        <p class="col-6">${attendanceData[key]}</p>
        </div>
        `;
  }

  document.getElementById("data-container").replaceChildren(arDiv);
}
