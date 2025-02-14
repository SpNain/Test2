const dateInput = document.getElementById("date");
const dateShowBtn = document.getElementById("dateShowBtn");
const tbodyDaily = document.getElementById("tbodyDailyId");
const tfootDaily = document.getElementById("tfootDailyId");

const weekInput = document.getElementById("week");
const weekShowBtn = document.getElementById("weekShowBtn");
const tbodyWeekly = document.getElementById("tbodyWeeklyId");
const tfootWeekly = document.getElementById("tfootWeeklyId");

const monthInput = document.getElementById("month");
const monthShowBtn = document.getElementById("monthShowBtn");
const tbodyMonthly = document.getElementById("tbodyMonthlyId");
const tfootMonthly = document.getElementById("tfootMonthlyId");

async function getDailyReport(e) {
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
      "http://localhost:3000/reports/dailyReports",
      {
        date: dateValue,
      },
      { headers: { Authorization: token } }
    );
    tbodyDaily.innerHTML = "";
    tfootDaily.innerHTML = "";
    response.data.forEach((expense) => {
      totalAmount += expense.amount;
      const tr = document.createElement("tr");
      tr.setAttribute("class", "trStyle");
      tbodyDaily.appendChild(tr);
      const th = document.createElement("th");
      th.setAttribute("scope", "row");
      th.appendChild(document.createTextNode(expense.date));
      const td1 = document.createElement("td");
      td1.appendChild(document.createTextNode(expense.category));
      const td2 = document.createElement("td");
      td2.appendChild(document.createTextNode(expense.description));
      const td3 = document.createElement("td");
      td3.appendChild(document.createTextNode(expense.amount));
      tr.appendChild(th);
      tr.appendChild(td1);
      tr.appendChild(td2);
      tr.appendChild(td3);
    });
    const tr = document.createElement("tr");
    tr.setAttribute("class", "trStyle");
    tfootDaily.appendChild(tr);
    const td1 = document.createElement("td");
    const td2 = document.createElement("td");
    const td3 = document.createElement("td");
    const td4 = document.createElement("td");
    td3.setAttribute("id", "dailyTotal");
    td4.setAttribute("id", "dailyTotalAmount");
    td3.appendChild(document.createTextNode("Total"));
    td4.appendChild(document.createTextNode(totalAmount));
    tr.appendChild(td1);
    tr.appendChild(td2);
    tr.appendChild(td3);
    tr.appendChild(td4);
  } catch (err) {
    console.error(err);
  }
}

async function getWeeklyReport(e) {
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
      "http://localhost:3000/reports/weeklyReports",
      {
        week: weekValue,
      },
      { headers: { Authorization: token } }
    );
    tbodyWeekly.innerHTML = "";
    tfootWeekly.innerHTML = "";
    response.data.forEach((expense) => {
      totalAmount += expense.amount;
      const tr = document.createElement("tr");
      tr.setAttribute("class", "trStyle");
      tbodyWeekly.appendChild(tr);
      const th = document.createElement("th");
      th.setAttribute("scope", "row");
      th.appendChild(document.createTextNode(expense.date));
      const td1 = document.createElement("td");
      td1.appendChild(document.createTextNode(expense.category));
      const td2 = document.createElement("td");
      td2.appendChild(document.createTextNode(expense.description));
      const td3 = document.createElement("td");
      td3.appendChild(document.createTextNode(expense.amount));
      tr.appendChild(th);
      tr.appendChild(td1);
      tr.appendChild(td2);
      tr.appendChild(td3);
    });
    const tr = document.createElement("tr");
    tr.setAttribute("class", "trStyle");
    tfootWeekly.appendChild(tr);
    const td1 = document.createElement("td");
    const td2 = document.createElement("td");
    const td3 = document.createElement("td");
    const td4 = document.createElement("td");
    td3.setAttribute("id", "monthlyTotal");
    td4.setAttribute("id", "monthlyTotalAmount");
    td3.appendChild(document.createTextNode("Total"));
    td4.appendChild(document.createTextNode(totalAmount));
    tr.appendChild(td1);
    tr.appendChild(td2);
    tr.appendChild(td3);
    tr.appendChild(td4);
  } catch (err) {
    console.error(err);
  }
}
async function getMonthlyReport(e) {
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
      "http://localhost:3000/reports/monthlyReports",
      {
        month: monthValue,
      },
      { headers: { Authorization: token } }
    );
    tbodyMonthly.innerHTML = "";
    tfootMonthly.innerHTML = "";
    response.data.forEach((expense) => {
      totalAmount += expense.amount;
      const tr = document.createElement("tr");
      tr.setAttribute("class", "trStyle");
      tbodyMonthly.appendChild(tr);
      const th = document.createElement("th");
      th.setAttribute("scope", "row");
      th.appendChild(document.createTextNode(expense.date));
      const td1 = document.createElement("td");
      td1.appendChild(document.createTextNode(expense.category));
      const td2 = document.createElement("td");
      td2.appendChild(document.createTextNode(expense.description));
      const td3 = document.createElement("td");
      td3.appendChild(document.createTextNode(expense.amount));
      tr.appendChild(th);
      tr.appendChild(td1);
      tr.appendChild(td2);
      tr.appendChild(td3);
    });
    const tr = document.createElement("tr");
    tr.setAttribute("class", "trStyle");
    tfootMonthly.appendChild(tr);
    const td1 = document.createElement("td");
    const td2 = document.createElement("td");
    const td3 = document.createElement("td");
    const td4 = document.createElement("td");
    td3.setAttribute("id", "monthlyTotal");
    td4.setAttribute("id", "monthlyTotalAmount");
    td3.appendChild(document.createTextNode("Total"));
    td4.appendChild(document.createTextNode(totalAmount));
    tr.appendChild(td1);
    tr.appendChild(td2);
    tr.appendChild(td3);
    tr.appendChild(td4);
  } catch (err) {
    console.error(err);
  }
}

dateShowBtn.addEventListener("click", getDailyReport);
weekShowBtn.addEventListener("click", getWeeklyReport);
monthShowBtn.addEventListener("click", getMonthlyReport);
