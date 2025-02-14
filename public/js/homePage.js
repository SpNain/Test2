const categoryItems = document.querySelectorAll(".dropdown-item");
const categoryInput = document.querySelector("#categoryInput");
const categoryBtn = document.querySelector("#categoryBtn");
const form = document.getElementById("form1");
const addExpenseBtn = document.getElementById("submitBtn");
const table = document.getElementById("tbodyId");
const buyPremiumBtn = document.getElementById("buyPremiumBtn");
const reportsLink = document.getElementById("reportsLink");
const leaderboardLink = document.getElementById("leaderboardLink");

categoryItems.forEach((item) => {
  item.addEventListener("click", (e) => {
    const selectedCategory = e.target.getAttribute("data-value");
    categoryBtn.textContent = e.target.textContent;
    categoryInput.value = selectedCategory;
  });
});

async function addExpense() {
  try {
    const category = document.getElementById("categoryBtn");
    const description = document.getElementById("descriptionValue");
    const amount = document.getElementById("amountValue");
    const categoryValue = category.textContent.trim();
    const descriptionValue = description.value.trim();
    const amountValue = amount.value.trim();

    if (categoryValue === "Select Category") {
      alert("Select the Category!");
      return (window.location.href = "/homePage");
    }
    if (!descriptionValue) {
      alert("Add the Description!");
      return (window.location.href = "/homePage");
    }
    if (!parseInt(amountValue)) {
      alert("Please enter a valid amount!");
      return (window.location.href = "/homePage");
    }

    const currentDate = new Date();
    const day = currentDate.getDate();
    const month = currentDate.getMonth() + 1;
    const year = currentDate.getFullYear();

    const formattedDay = day < 10 ? `0${day}` : day;
    const formattedMonth = month < 10 ? `0${month}` : month;
    const dateStr = `${year}-${formattedMonth}-${formattedDay}`;

    const token = localStorage.getItem("token");

    const response = await axios.post(
      "http://localhost:3000/expense/addExpense",
      {
        date: dateStr,
        category: categoryValue,
        description: descriptionValue,
        amount: parseInt(amountValue),
      },
      { headers: { Authorization: token } }
    );

    if (response.status === 200) {
      window.location.reload();
    }
  } catch (err) {
    console.error("AddExpense went wrong:", err);
  }
}

async function getAllExpenses() {
  // e.preventDefault();
  try {
    const token = localStorage.getItem("token");
    const allExpenses = await axios.get(
      "http://localhost:3000/expense/getAllExpenses",
      { headers: { Authorization: token } }
    );
    allExpenses.data.forEach((expenses) => {
      const id = expenses.id;
      const date = expenses.date;
      const categoryValue = expenses.category;
      const descriptionValue = expenses.description;
      const amountValue = expenses.amount;

      let tr = document.createElement("tr");
      tr.className = "trStyle";

      table.appendChild(tr);

      let idValue = document.createElement("th");
      idValue.setAttribute("scope", "row");
      idValue.setAttribute("style", "display: none");
      tr.appendChild(idValue);
      idValue.appendChild(document.createTextNode(id));

      let th = document.createElement("th");
      th.setAttribute("scope", "row");
      tr.appendChild(th);
      th.appendChild(document.createTextNode(date));

      let td1 = document.createElement("td");
      td1.appendChild(document.createTextNode(categoryValue));

      let td2 = document.createElement("td");
      td2.appendChild(document.createTextNode(descriptionValue));

      let td3 = document.createElement("td");
      td3.appendChild(document.createTextNode(amountValue));

      let td4 = document.createElement("td");

      let deleteBtn = document.createElement("button");
      deleteBtn.className = "editDelete btn btn-danger delete";
      deleteBtn.appendChild(document.createTextNode("Delete"));

      let editBtn = document.createElement("button");
      editBtn.className = "editDelete btn btn-success edit";
      editBtn.appendChild(document.createTextNode("Edit"));

      td4.appendChild(deleteBtn);
      td4.appendChild(editBtn);

      tr.appendChild(td1);
      tr.appendChild(td2);
      tr.appendChild(td3);
      tr.appendChild(td4);
    });
  } catch (err) {
    console.error("GetAllExpenses went wrong:", err);
  }
}

async function deleteExpense(e) {
  try {
    const token = localStorage.getItem("token");
    if (e.target.classList.contains("delete")) {
      let tr = e.target.parentElement.parentElement;
      let id = tr.children[0].textContent;
      await axios.get(`http://localhost:3000/expense/deleteExpense/${id}`, {
        headers: { Authorization: token },
      });
      window.location.reload();
    }
  } catch (err) {
    console.error("DeleteExpense went wrong:", err);
  }
}

async function editExpense(e) {
  try {
    const token = localStorage.getItem("token");
    const categoryValue = document.getElementById("categoryBtn");
    const descriptionValue = document.getElementById("descriptionValue");
    const amountValue = document.getElementById("amountValue");
    const addExpenseBtn = document.getElementById("submitBtn");
    if (e.target.classList.contains("edit")) {
      let tr = e.target.parentElement.parentElement;
      let id = tr.children[0].textContent;

      const allExpenses = await axios.get(
        "http://localhost:3000/expense/getAllExpenses",
        { headers: { Authorization: token } }
      );
      allExpenses.data.forEach((expense) => {
        if (expense.id == id) {
          categoryValue.textContent = expense.category;
          descriptionValue.value = expense.description;
          amountValue.value = expense.amount;
          addExpenseBtn.textContent = "Update";

          addExpenseBtn.removeEventListener("click", addExpense);

          addExpenseBtn.addEventListener("click", async function update(e) {
            e.preventDefault();
            await axios.post(
              `http://localhost:3000/expense/editExpense/${id}`,
              {
                category: categoryValue.textContent.trim(),
                description: descriptionValue.value,
                amount: amountValue.value,
              },
              { headers: { Authorization: token } }
            );
            window.location.reload();
          });
        }
      });
    }
  } catch (err) {
    console.error("EditExpense went wrong:", err);
  }
}

async function buyPremium(e) {
  try {
    const token = localStorage.getItem("token");

    const response = await axios.post(
      "http://localhost:3000/purchase/createOrder",
      { orderId: `${Date.now()}` },
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
          `http://localhost:3000/purchase/getPaymentStatus/${orderId}`
        );

        const statusUpdateResponse = await axios.post(
          "http://localhost:3000/purchase/updateTransactionStatus",
          {
            orderId: orderId,
            status: statusResponse.data.orderStatus,
          },
          { headers: { Authorization: token } }
        );

        alert(
          "Welcome to our Premium Membership, You have now access to Reports and LeaderBoard"
        );
        localStorage.setItem("token", statusUpdateResponse.data.token);
        window.location.reload();
      }
    }
  } catch (err) {
    console.error("Error:", err);
  }
}

async function isPremiumUser() {
  const token = localStorage.getItem("token");
  const res = await axios.get("http://localhost:3000/user/isPremiumUser", {
    headers: { Authorization: token },
  });
  if (res.data.isPremiumUser) {
    buyPremiumBtn.innerHTML = "Premium Member &#128081";
    buyPremiumBtn.removeEventListener("click", buyPremium);
    reportsLink.removeAttribute("onclick");
    leaderboardLink.removeAttribute("onclick");
    leaderboardLink.setAttribute("href", "/premium/getLeaderboardPage");
    reportsLink.setAttribute("href", "/reports/getReportsPage");
  }
}

buyPremiumBtn.addEventListener("click", buyPremium);
addExpenseBtn.addEventListener("click", addExpense);

document.addEventListener("DOMContentLoaded", isPremiumUser);
document.addEventListener("DOMContentLoaded", getAllExpenses);

table.addEventListener("click", (e) => {
  deleteExpense(e);
});

table.addEventListener("click", (e) => {
  editExpense(e);
});