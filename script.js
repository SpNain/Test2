function fetchStudents() {
  const date = document.getElementById("dateInput").value;
  if (!date) return alert("Please select a date");

  const form = document.createElement("form");

  // Set attributes
  form.id = "attendanceForm";
  form.className = "w-100";
  form.onsubmit = function (event) {
    submitAttendance(event);
  };

  // console.log(form);

  let user = [
    { name: "A", id: "1" },
    { name: "B", id: "2" },
    { name: "C", id: "3" },
    { name: "D", id: "4" },
    { name: "E", id: "5" },
  ];

  user.forEach((user) => {
    form.innerHTML += `
        <div class="user row mt-3">
            <label class="col-4">${user.name}</label>
            <div class="col-3">
            <label for="${user.id}_present">
            <input type="radio" id="${user.id}_present" name="${user.id}" value="✅ Present" required> Present
            </label>
            </div>
            <div class="col-3">
            <label for="${user.id}_absent">
            <input type="radio" id="${user.id}_absent" name="${user.id}" value="❌ Absent"> Absent
            </label>
            </div>
        </div>

   `;
  });

  form.innerHTML += `
    <div class="row mt-5 d-flex justify-content-center">
    <button type="submit" class="btn btn-info col-2">Mark Attendance</button>
    </div>`;

  document.getElementById("data-container").replaceChildren(form);
}

function submitAttendance(event) {

  event.preventDefault(); // Prevent page refresh

  const formData = new FormData(event.target); // Get form data
  const attendanceData = {};

  for (const [key, value] of formData.entries()) {
    attendanceData[key] = value;
  }

  console.log(attendanceData); // Outputs selected values

  displayAttendance(attendanceData);
}

function displayAttendance(attendanceData) {

  const arDiv = document.createElement("div");

  arDiv.id = "arDiv";
    arDiv.className = "w-100";
    
    for (let key in attendanceData) {
        arDiv.innerHTML += `
        <div class="user row mt-3">
        <p class="col-4">${key}</p>
        <p class="col-8">${attendanceData[key]}</p>
        </div>
        `
    }

  document.getElementById("data-container").replaceChildren(arDiv);

}