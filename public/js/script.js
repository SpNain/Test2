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

      let allStudents = response.data.allStudents;

      const form = document.createElement("form"); // attendance form

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
    } else {

      const nsDiv = document.createElement("div"); // No student div

      nsDiv.innerHTML += `
      <h2>No student exist in the system.</h2>
      <h2> Create a student first.</h2>
      <h2> Click <button class="btn btn-warning text-white" onclick="fetchStudentsDetails()">Fetch Students Details</button></h2>`;

      document.getElementById("data-container").replaceChildren(nsDiv);
    }
  } catch (err) {
    console.log(err);
  }
}

async function submitAttendance(event, dateValue) {

  event.preventDefault();

  const formData = new FormData(event.target);
  const attendanceData = {};

  for (const [key, value] of formData.entries()) {
    attendanceData[key] = value;
  }

  let attendanceDataWithDate = {};

  attendanceDataWithDate = {
    date: dateValue,
    combinedStatus: attendanceData,
  };

  try {
    await axios.post(
      `${API_URL}/attendance/attendancedatawithdate`,
      attendanceDataWithDate
    );
    fetchUIForDate();
  } catch (err) {
    console.log(err);
  }
}

async function fetchAttendanceReport() {
  try {
    let response = await axios.get(`${API_URL}/attendance/report`);
    let allStudentsAttendanceReport = response.data;

    const reportDiv = document.createElement("div"); // attendance result div

    reportDiv.id = "reportDiv";
    reportDiv.className = "w-100";

    allStudentsAttendanceReport.forEach((studentsAttendanceReport) => {

      reportDiv.innerHTML += `
      <div class="row mt-3" id="${studentsAttendanceReport.studentId}">
        <p class="col-5">${studentsAttendanceReport.studentName}</p>
        <p class="col-2">${studentsAttendanceReport.presentCount}/${
        studentsAttendanceReport.totalAttendance
      }</p>
        <p class="col-2">${(
          (studentsAttendanceReport.presentCount /
            studentsAttendanceReport.totalAttendance) *
          100
        ).toFixed(2)}%</p>
      </div>
      `;
    });

    document.getElementById("data-container").replaceChildren(reportDiv);
  } catch (err) {
    console.log(err);
  }
}

async function fetchStudentsDetails() {
  try {
    let response = await axios.get(`${API_URL}/student/allStudents`);
    let allStudents = response.data;

    if (allStudents.length > 0) {
      const sdDiv = document.createElement("div"); // student details div

      sdDiv.id = "sdDiv";
      sdDiv.className = "w-100";

      allStudents.forEach((student) => {
        sdDiv.innerHTML += `
      <div class="row mt-3 d-flex align-items-center gap-5" id="${student.id}">
        <p class="col-5">${student.name}</p>
        <button class="btn btn-secondary col-1" onclick="editStudent('${student.name}','${student.id}')">Edit</button>
        <button class="btn btn-danger col-1" onclick="deleteStudent(${student.id})">Delete</button>
      </div>
      `;
      });

      sdDiv.innerHTML += `<button class="btn btn-info mt-5" id="add-New-Student" onclick="addNewStudent()">Add New Student</button>`;

      document.getElementById("data-container").replaceChildren(sdDiv);
    } else {
      const nsDiv = document.createElement("div"); // no student div

      nsDiv.innerHTML += `
      <h2>No student exist in the system.</h2>
      <h2> <button class="btn btn-info mt-5" id="add-New-Student" onclick="addNewStudent()">Add New Student</button></h2>`;

      document.getElementById("data-container").replaceChildren(nsDiv);
    }
  } catch (err) {
    console.log(err);
  }
}

function addNewStudent() {
  const asForm = document.createElement("form"); // add student form

  // Set attributes
  asForm.id = "asForm";
  asForm.className = "w-100";

  asForm.onsubmit = function (event) {
    addEditStudentData(event);
  };

  asForm.innerHTML += `
  <div class="row mt-5 gap-3 d-flex align-items-center flex-column">
  <div>
  <label for="name">Name</label>
  <input type="text" id="name" name="name" class="col-4" required>
  </div>
  <button type="submit" class="btn btn-info col-1">Add</button>
  </div>`;

  document.getElementById("data-container").replaceChildren(asForm);
}

async function addEditStudentData(event,id) {
  event.preventDefault();

  const formData = new FormData(event.target);
  const studentDetails = {};

  for (const [key, value] of formData.entries()) {
    studentDetails[key] = value;
  }

  if (id) {

    try {
      await axios.put(
        `${API_URL}/student/edit/${id}`,
        studentDetails
      );
      fetchStudentsDetails();
    } catch (err) {
      console.log(err);
    }

  } else {
    
    try {
      await axios.post(
        `${API_URL}/student/addStudentData`,
        studentDetails
      );
      fetchStudentsDetails();
    } catch (err) {
      console.log(err);
    }
  }

}

async function deleteStudent(id) {
  try {
    await axios.delete(`${API_URL}/student/delete/${id}`);
    document.getElementById(`${id}`).remove();
  } catch (error) {
    console.log(error);
  }
}

function editStudent(name, id) {
  const esForm = document.createElement("form"); // edit student form

  // Set attributes
  esForm.id = "asForm";
  esForm.className = "w-100";

  esForm.onsubmit = function (event) {
    addEditStudentData(event,id);
  };

  esForm.innerHTML += `
  <div class="row mt-5 gap-3 d-flex align-items-center flex-column">
  <div>
  <label for="name">Name</label>
  <input type="text" id="name" name="name" class="col-4" value=${name}>
  </div>
  <button type="submit" class="btn btn-info col-1">Add</button>
  </div>`;

  document.getElementById("data-container").replaceChildren(esForm);
}