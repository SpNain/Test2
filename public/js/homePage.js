const categoryItems = document.querySelectorAll(".dropdown-item");
const categoryInput = document.querySelector("#categoryInput");
const categoryBtn = document.querySelector("#categoryBtn");
const form = document.getElementById("form1");
const addExpenseBtn = document.getElementById("submitBtn");
const tableBody = document.getElementById("tbodyId");
const buyPremiumBtn = document.getElementById("buyPremiumBtn");
const reportsLink = document.getElementById("reportsLink");
const leaderboardLink = document.getElementById("leaderboardLink");
const rowsPerPageSelect = document.getElementById("rowsPerPageSelect");
const logoutBtn = document.getElementById("logoutBtn");

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
      "/expense/addExpense",
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
  } catch (error) {
    console.error("AddExpense went wrong:", error);
  }
}

async function getAllExpensesForPage(pageNo) {
  try {
    
    if (localStorage.getItem("rpp")) {
      rowsPerPageSelect.value = parseInt(localStorage.getItem("rpp"));
    }
    let rowsPerPage = parseInt(rowsPerPageSelect.value);
    const token = localStorage.getItem("token");
    const response = await axios.get(
      `/expense/getAllExpensesForPage?pageNo=${pageNo}&rowsPerPage=${rowsPerPage}`,
      { headers: { Authorization: token } }
    );

    tableBody.innerHTML = "";

    response.data.expenses.forEach((expenses) => {
      const id = expenses.id;
      const date = expenses.date;
      const categoryValue = expenses.category;
      const descriptionValue = expenses.description;
      const amountValue = expenses.amount;

      let tr = document.createElement("tr");
      tr.className = "trStyle";

      tableBody.appendChild(tr);

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

    addPaginationNav(pageNo, response.data.totalPages);
  } catch (error) {
    console.error("getAllExpensesForPage went wrong:", error);
  }
}

function addPaginationNav(currentPage, totalPages) {
  document.getElementById("paginationUL")?.remove();

  const paginationNav = document.getElementById("paginationNav");

  const ul = document.createElement("ul");
  ul.id = "paginationUL";
  ul.className = "pagination";

  const prevLi = document.createElement("li");
  const prevA = document.createElement("a");
  prevLi.setAttribute("class", "page-item");
  prevA.setAttribute("class", "page-link");
  prevA.setAttribute("href", "#");
  currentPage === 1
    ? prevA.setAttribute("class", "page-link disabledPage")
    : null;
  prevA.appendChild(document.createTextNode("<"));
  prevLi.appendChild(prevA);
  ul.appendChild(prevLi);
  prevLi.addEventListener("click", () => {
    if (currentPage > 1) getAllExpensesForPage(currentPage - 1);
  });

  for (let i = 1; i <= totalPages; i++) {
    const li = document.createElement("li");
    const a = document.createElement("a");
    li.setAttribute("class", "page-item");
    a.setAttribute("class", "page-link");
    i === currentPage ? a.setAttribute("class", "page-link activePage") : null;
    a.setAttribute("href", "#");
    a.appendChild(document.createTextNode(i));
    li.appendChild(a);
    ul.appendChild(li);
    a.addEventListener("click", () => getAllExpensesForPage(i));
  }

  const nextLi = document.createElement("li");
  const nextA = document.createElement("a");
  nextLi.setAttribute("class", "page-item");
  nextA.setAttribute("class", "page-link");
  nextA.setAttribute("href", "#");
  currentPage === totalPages
    ? nextA.setAttribute("class", "page-link disabledPage")
    : null;
  nextA.appendChild(document.createTextNode(">"));
  nextLi.appendChild(nextA);
  ul.appendChild(nextLi);
  nextLi.addEventListener("click", () => {
    if (currentPage < totalPages) getAllExpensesForPage(currentPage + 1);
  });

  paginationNav.appendChild(ul);
}

async function deleteExpense(e) {
  try {
    const token = localStorage.getItem("token");
    if (e.target.classList.contains("delete")) {
      let tr = e.target.parentElement.parentElement;
      let id = tr.children[0].textContent;
      await axios.get(`/expense/deleteExpense/${id}`, {
        headers: { Authorization: token },
      });
      window.location.reload();
    }
  } catch (error) {
    console.error("DeleteExpense went wrong:", error);
  }
}

async function editExpense(e) {
  try {
    const token = localStorage.getItem("token");
    const categoryValue = document.getElementById("categoryBtn");
    const descriptionValue = document.getElementById("descriptionValue");
    const amountValue = document.getElementById("amountValue");
    const addExpenseBtn = document.getElementById("submitBtn");

    if (categoryValue.value || descriptionValue.value || amountValue.value) {
      alert("Please clear the form before editing another expense!");
      window.location.reload();
      return;
    }

    if (e.target.classList.contains("edit")) {
      let tr = e.target.parentElement.parentElement;
      let id = tr.children[0].textContent;

      const allExpenses = await axios.get(
        "/expense/getAllExpenses",
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
              `/expense/editExpense/${id}`,
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
  } catch (error) {
    console.error("EditExpense went wrong:", error);
  }
}

async function buyPremium(e) {
  try {
    const token = localStorage.getItem("token");

    const response = await axios.post(
      "/purchase/createOrder",
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
          `/purchase/getPaymentStatus/${orderId}`
        );

        const statusUpdateResponse = await axios.post(
          "/purchase/updateTransactionStatus",
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
  } catch (error) {
    console.error("Error:", error);
  }
}

async function isPremiumUser() {
  try {
    const token = localStorage.getItem("token");
    const res = await axios.get("/user/isPremiumUser", {
      headers: { Authorization: token },
    });
    if (res.data.isPremiumUser) {
      buyPremiumBtn.innerHTML = "Premium Member &#x1F48E";
      buyPremiumBtn.removeEventListener("click", buyPremium);

      leaderboardLink.removeAttribute("onclick");
      reportsLink.removeAttribute("onclick");
      downloadsLink.removeAttribute("onclick");
      leaderboardLink.setAttribute("href", "/premium/getLeaderboardPage");
      reportsLink.setAttribute("href", "/reports/getReportsPage");
      downloadsLink.setAttribute("href", "/download/getDownloadsPage");

      const divEle = document.createElement("div");

      divEle.setAttribute("data-bs-toggle", "tooltip");

      divEle.title = "Download All Your Expenses";

      divEle.innerHTML = `
      <a href="#" class="btn btn-download downloadAllExpenses">
          <i class="bi bi-arrow-down"></i>
      </a>`;

      divEle.addEventListener("click", downloadAllExpenses);

      document
        .getElementById("containerDiv")
        .insertAdjacentElement("afterend", divEle);
    }
  } catch (error) {
    console.error("Error:", error);
  }
}

async function downloadAllExpenses() {
  try {
    const token = localStorage.getItem("token");
    const response = await axios.get(
      "/expense/downloadAllExpenses",
      {
        headers: { Authorization: token },
      }
    );
    window.location.href = response.data.downloadURL;
  } catch (error) {
    console.error("Error in downloading all the expenses:", error);
  }
}

buyPremiumBtn.addEventListener("click", buyPremium);
addExpenseBtn.addEventListener("click", addExpense);

document.addEventListener("DOMContentLoaded", isPremiumUser);
document.addEventListener("DOMContentLoaded", () => getAllExpensesForPage(1));
rowsPerPageSelect.addEventListener("change", () => {
  localStorage.setItem("rpp", rowsPerPageSelect.value);
  getAllExpensesForPage(1)
});

tableBody.addEventListener("click", (e) => {
  deleteExpense(e);
});

tableBody.addEventListener("click", (e) => {
  editExpense(e);
});

async function logout() {
  try {
    localStorage.clear();
    window.location.href = "/";
  } catch (error) {
    console.log(error);
  }
}

logoutBtn.addEventListener("click", logout);