async function getDailyReport(e) {
  const dateInput = document.getElementById("date");
  const tbodyDaily = document.getElementById("tbodyDailyId");
  const tfootDaily = document.getElementById("tfootDailyId");

  try {
    e.preventDefault();
    const token = localStorage.getItem("token");
    const dateValue = dateInput.value;

    if (!dateValue) {
      alert("Please select a date.");
      return;
    }

    let totalAmount = 0;
    const response = await axios.post(
      "/reports/dailyReports",
      { date: dateValue },
      { headers: { Authorization: token } }
    );

    tbodyDaily.innerHTML = "";
    tfootDaily.innerHTML = "";
    response.data.forEach((expense) => {
      totalAmount += expense.amount;
      const tr = document.createElement("tr");
      tr.classList.add("trStyle");
      tbodyDaily.appendChild(tr);
      const th = document.createElement("th");
      th.setAttribute("scope", "row");
      th.textContent = expense.date;
      const td1 = document.createElement("td");
      td1.textContent = expense.category;
      const td2 = document.createElement("td");
      td2.textContent = expense.description;
      const td3 = document.createElement("td");
      td3.textContent = expense.amount;
      tr.append(th, td1, td2, td3);
    });
    const tr = document.createElement("tr");
    tr.classList.add("trStyle");
    tfootDaily.appendChild(tr);
    const td1 = document.createElement("td");
    const td2 = document.createElement("td");
    const td3 = document.createElement("td");
    const td4 = document.createElement("td");
    td3.setAttribute("id", "dailyTotal");
    td4.setAttribute("id", "dailyTotalAmount");
    td3.textContent = "Total";
    td4.textContent = totalAmount;
    tr.append(td1, td2, td3, td4);
  } catch (error) {
    console.error("Error in getting daily report", err);
  }
}

document.getElementById("dailyForm").addEventListener("submit", getDailyReport);

function loadDailyReportForm() {
  const container = document.getElementById("reportsContainer");
  container.innerHTML = `
      <!-- Daily Table -->
  
          <div class="container table-responsive mt-4 p-3 d-flex bd-highlight reportTable">
              <!-- Daily table Form -->
  
              <div class="ps-2 pe-5 py-1 ms-3 me-5 my-1 bd-highlight">
                  <div class="my-1">
                      <h3>DAILY REPORTS</h3>
                  </div>
                  <div>
                      <form id="dailyForm">
                          <div class="mb-3">
                              <label for="date" class="form-label"> Select Date</label>
                              <input type="date" class="form-control" id="date" />
                          </div>
                          <button id="dateShowBtn" type="submit" class="btn btn-primary showBtn">Show</button>
                      </form>
                  </div>
              </div>
  
              <div id="dailyTable" class="p-2 flex-grow-1 bd-highlight">
                  <table class="table table-hover display" style="width: 100%">
                      <!-- Daily table head -->
  
                      <thead class="rTheadId">
                          <tr>
                              <th scope="col" class="rounded-start">Date</th>
                              <th scope="col">Category</th>
                              <th scope="col">Description</th>
                              <th scope="col" class="rounded-end">Amount</th>
                          </tr>
                      </thead>
  
                      <!-- Daily table body -->
  
                      <tbody id="tbodyDailyId">
                        
                      </tbody>
                      <tfoot id="tfootDailyId">
  
                      </tfoot>
                  </table>
              </div>
          </div>
  
      </div>
    `;
  document
    .getElementById("dailyForm")
    .addEventListener("submit", getDailyReport);
}

document.getElementById("btnDaily").addEventListener("click", function () {
  document
    .getElementById("btnDaily")
    .classList.replace("btn-secondary", "btn-primary");
  document
    .getElementById("btnWeekly")
    .classList.replace("btn-primary", "btn-secondary");
  document
    .getElementById("btnMonthly")
    .classList.replace("btn-primary", "btn-secondary");
  loadDailyReportForm();
});

async function getWeeklyReport(e) {
  const weekInput = document.getElementById("week");
  const tbodyWeekly = document.getElementById("tbodyWeeklyId");
  const tfootWeekly = document.getElementById("tfootWeeklyId");

  try {
    e.preventDefault();
    const token = localStorage.getItem("token");
    const weekValue = weekInput.value;

    if (!weekValue) {
      alert("Please select a week.");
      return;
    }

    let totalAmount = 0;
    const response = await axios.post(
      "/reports/weeklyReports",
      { week: weekValue },
      { headers: { Authorization: token } }
    );

    tbodyWeekly.innerHTML = "";
    tfootWeekly.innerHTML = "";
    response.data.forEach((expense) => {
      totalAmount += expense.amount;
      const tr = document.createElement("tr");
      tr.classList.add("trStyle");
      tbodyWeekly.appendChild(tr);
      const th = document.createElement("th");
      th.setAttribute("scope", "row");
      th.textContent = expense.date;
      const td1 = document.createElement("td");
      td1.textContent = expense.category;
      const td2 = document.createElement("td");
      td2.textContent = expense.description;
      const td3 = document.createElement("td");
      td3.textContent = expense.amount;
      tr.append(th, td1, td2, td3);
    });
    const tr = document.createElement("tr");
    tr.classList.add("trStyle");
    tfootWeekly.appendChild(tr);
    const td1 = document.createElement("td");
    const td2 = document.createElement("td");
    const td3 = document.createElement("td");
    const td4 = document.createElement("td");
    td3.setAttribute("id", "weeklyTotal");
    td4.setAttribute("id", "weeklyTotalAmount");
    td3.textContent = "Total";
    td4.textContent = totalAmount;
    tr.append(td1, td2, td3, td4);
  } catch (error) {
    console.error("Error in getting weekly report", err);
  }
}

function loadWeeklyReportForm() {
  const container = document.getElementById("reportsContainer");
  container.innerHTML = `
    <!-- Weekly Table -->

    <div class="container table-responsive mt-4 mb-3 p-3 d-flex bd-highlight reportTable">
        <!-- Weekly table Form -->

        <div class="ps-2 pe-4 py-1 ms-3 me-5 my-1 bd-highlight">
            <div class="my-1">
                <h3>WEEKLY REPORTS</h3>
            </div>
            <div>
                <form id="weeklyForm">
                    <div class="mb-3">
                        <label for="week" class="form-label">Select Week</label>
                        <input type="week" class="form-control" id="week" />
                    </div>
                    <button id="weekShowBtn" type="submit" class="btn btn-primary showBtn">Show</button>
                </form>
            </div>
        </div>

        <div id="weeklyTable" class="p-2 flex-grow-1 bd-highlight">
            <table class="table table-hover" style="width: 100%">
                <!-- Weekly table head -->

                <thead class="rTheadId">
                    <tr>
                        <th scope="col" class="rounded-start">Date</th>
                        <th scope="col">Category</th>
                        <th scope="col">Description</th>
                        <th scope="col" class="rounded-end">Amount</th>
                    </tr>
                </thead>

                <!-- Weekly table body -->

                <tbody id="tbodyWeeklyId">
                    
                </tbody>
                <tfoot id="tfootWeeklyId">
                    
                </tfoot>
            </table>
        </div>
    </div>
  `;
  document
    .getElementById("weeklyForm")
    .addEventListener("submit", getWeeklyReport);
}

document.getElementById("btnWeekly").addEventListener("click", function () {
  document
    .getElementById("btnWeekly")
    .classList.replace("btn-secondary", "btn-primary");
  document
    .getElementById("btnDaily")
    .classList.replace("btn-primary", "btn-secondary");
  document
    .getElementById("btnMonthly")
    .classList.replace("btn-primary", "btn-secondary");
  loadWeeklyReportForm();
});

async function getMonthlyReport(e) {
  const monthInput = document.getElementById("month");
  const tbodyMonthly = document.getElementById("tbodyMonthlyId");
  const tfootMonthly = document.getElementById("tfootMonthlyId");

  try {
    e.preventDefault();
    const token = localStorage.getItem("token");
    const monthValue = monthInput.value;

    if (!monthValue) {
      alert("Please select a month.");
      return;
    }

    let totalAmount = 0;
    const response = await axios.post(
      "/reports/monthlyReports",
      { month: monthValue },
      { headers: { Authorization: token } }
    );

    tbodyMonthly.innerHTML = "";
    tfootMonthly.innerHTML = "";
    response.data.forEach((expense) => {
      totalAmount += expense.amount;
      const tr = document.createElement("tr");
      tr.classList.add("trStyle");
      tbodyMonthly.appendChild(tr);
      const th = document.createElement("th");
      th.setAttribute("scope", "row");
      th.textContent = expense.date;
      const td1 = document.createElement("td");
      td1.textContent = expense.category;
      const td2 = document.createElement("td");
      td2.textContent = expense.description;
      const td3 = document.createElement("td");
      td3.textContent = expense.amount;
      tr.append(th, td1, td2, td3);
    });
    const tr = document.createElement("tr");
    tr.classList.add("trStyle");
    tfootMonthly.appendChild(tr);
    const td1 = document.createElement("td");
    const td2 = document.createElement("td");
    const td3 = document.createElement("td");
    const td4 = document.createElement("td");
    td3.setAttribute("id", "monthlyTotal");
    td4.setAttribute("id", "monthlyTotalAmount");
    td3.textContent = "Total";
    td4.textContent = totalAmount;
    tr.append(td1, td2, td3, td4);
  } catch (error) {
    console.error("Error in getting monthly report", err);
  }
}

function loadMonthlyReportForm() {
  const container = document.getElementById("reportsContainer");
  container.innerHTML = `
    <!-- Monthly Table -->

    <div class="container table-responsive mt-4 p-3 d-flex bd-highlight reportTable">
        <!-- Monthly table Form -->

        <div class="px-2 py-1 ms-3 me-4 my-1 bd-highlight">
            <div class="my-1">
                <h3>MONTHLY REPORTS</h3>
            </div>
            <div>
                <form id="monthlyForm">
                    <div class="mb-3">
                        <label for="month" class="form-label">Select Month</label>
                        <input type="month" class="form-control" id="month" />
                    </div>
                    <button id="monthShowBtn" type="submit" class="btn btn-primary showBtn">Show</button>
                </form>
            </div>
        </div>

        <div id="monthlyTable" class="p-2 flex-grow-1 bd-highlight">
            <table class="table table-hover display" style="width: 100%">
                <!-- Monthly table head -->

                <thead class="rTheadId">
                    <tr>
                        <th scope="col" class="rounded-start">Date</th>
                        <th scope="col">Category</th>
                        <th scope="col">Description</th>
                        <th scope="col" class="rounded-end">Amount</th>
                    </tr>
                </thead>

                <!-- Monthly table body -->

                <tbody id="tbodyMonthlyId">
                    
                </tbody>
                <tfoot id="tfootMonthlyId">
                    
                </tfoot>
            </table>
        </div>
    </div>
  `;
  document
    .getElementById("monthlyForm")
    .addEventListener("submit", getMonthlyReport);
}

document.getElementById("btnMonthly").addEventListener("click", function () {
  document
    .getElementById("btnMonthly")
    .classList.replace("btn-secondary", "btn-primary");
  document
    .getElementById("btnDaily")
    .classList.replace("btn-primary", "btn-secondary");
  document
    .getElementById("btnWeekly")
    .classList.replace("btn-primary", "btn-secondary");
  loadMonthlyReportForm();
});

const downloadReportBtn = document.querySelector(".downloadReport");
downloadReportBtn.addEventListener("click", downloadReports);

async function downloadReports() {
  try {
    const token = localStorage.getItem("token");
    const response = await axios.get("/reports/downloadReport", {
      headers: { Authorization: token },
    });
    if (response.data.success) window.location.href = response.data.downloadURL;
    else alert(response.data.message);
  } catch (error) {
    console.error("Error in downloading the report:", error);
  }
}

const logoutBtn = document.getElementById("logoutBtn");

async function logout() {
  try {
    localStorage.clear();
    window.location.href = "/";
  } catch (error) {
    console.log(error);
  }
}

logoutBtn.addEventListener("click", logout);
