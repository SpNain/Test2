const API_URL = "http://localhost:3000";

async function fetchUIForDate() {
  const dateValue = document.getElementById("dateInput").value;
  if (!dateValue) return alert("Please select a date");
  // console.log(date);

  // agr mai apne url me path change krke date daalta hu to muje json object milta h response me jo maine apne controller se bhej rkha h
  // isiliye muje same url yaani home pe hi rehna pdega ya fir har ek url ke liye html file send krni hogi sendFile ka use krke which isn't good
  // window.location.href = `${API_URL}/attendance/${date}`;

  try {
    let response = await axios.get(`${API_URL}/attendance/${dateValue}`);

    if (response.data.attendanceData) {
      console.log("Attendance data");

      let attendanceData = response.data.attendanceData;

      const arDiv = document.createElement("div"); // attendance result div

      arDiv.id = "arDiv";
      arDiv.className = "w-100";

      attendanceData.forEach((student) => {
        arDiv.innerHTML += `
              <div class="row mt-3">
              <p class="col-6">${student.name}</p>
              <p class="col-6">${student.status}</p>
              </div>
              `;
      });

      document.getElementById("data-container").replaceChildren(arDiv);
    } else if (response.data.allStudents) {
      console.log("All students");

      let allStudents = response.data.allStudents;

      const form = document.createElement("form");

      // Set attributes
      form.id = "attendanceForm";
      form.className = "w-100";

      // Why form.onsubmit = submitAttendance(event); Fails? because in this way submitAttendance(event) immediately executes the function and didn't wait for the form to be submitted.
      form.onsubmit = function (event) {
        submitAttendance(event, dateValue);
      };

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

      form.innerHTML += `
          <div class="row mt-5 d-flex justify-content-center">
            <button type="submit" class="btn btn-info col-2">Mark Attendance</button>
          </div>`;

      document.getElementById("data-container").replaceChildren(form);
    }
    else {
      console.log("No student");
      const nsDiv = document.createElement("div"); // no student div
      
      nsDiv.innerHTML += `
      <h3>No students exist in the system.</h3>
      <h3> Create a student first.</h3>
      <h3> Click the button below.</h3>
      <button>Create Student</button>`;

      document.getElementById("data-container").replaceChildren(nsDiv);
    }
  } catch (error) {
    console.log(error);
  }
}

async function submitAttendance(event, dateValue) {
  event.preventDefault(); // Prevent page refresh

  const formData = new FormData(event.target); // Get form data
  const attendanceData = {};

  for (const [key, value] of formData.entries()) {
    attendanceData[key] = value;
  }

  // console.log(attendanceData); // Outputs selected values

  let attendanceDataWithDate = {};

  attendanceDataWithDate = {
    date: dateValue,
    combinedStatus: attendanceData,
  };

  // console.log(attendanceDataWithDate);

  try {
    await axios.post(
      `${API_URL}/attendance/attendancedatawithdate`,
      attendanceDataWithDate
    );
    fetchUIForDate();
  } catch (error) {
    console.log(error);
  }

}