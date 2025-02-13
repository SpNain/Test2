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

    if (categoryValue == "Select Category") {
      alert("Select the Category!");
      window.location.href("/homePage");
    }
    if (!descriptionValue) {
      alert("Add the Description!");
      window.location.href("/homePage");
    }
    if (!parseInt(amountValue)) {
      alert("Please enter the valid amount!");
      window.location.href("/homePage");
    }

    const currentDate = new Date();
    const day = currentDate.getDate();
    const month = currentDate.getMonth() + 1;
    const year = currentDate.getFullYear();

    const formattedDay = day < 10 ? `0${day}` : day;
    const formattedMonth = month < 10 ? `0${month}` : month;

    const dateStr = `${formattedDay}-${formattedMonth}-${year}`;

    const token = localStorage.getItem("token");
    const res = await axios
      .post(
        "http://localhost:3000/expense/addExpense",
        {
          date: dateStr,
          category: categoryValue,
          description: descriptionValue,
          amount: parseInt(amountValue),
        },
        { headers: { Authorization: token } }
      )
      .then((res) => {
        if (res.status == 200) {
          window.location.reload();
        }
      })
      .catch((err) => {
        console.log(err);
      });
  } catch {
    console.error("AddExpense went wrong");
  }
}

async function getAllExpenses() {
  // e.preventDefault();
  try {
    const token = localStorage.getItem("token");
    const res = await axios.get(
      "http://localhost:3000/expense/getAllExpenses",
      { headers: { Authorization: token } }
    );
    res.data.forEach((expenses) => {
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

      let th = document.createElement("th");
      th.setAttribute("scope", "row");

      tr.appendChild(idValue);
      tr.appendChild(th);

      idValue.appendChild(document.createTextNode(id));
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
  } catch {
    (err) => console.log(err);
  }
}

async function deleteExpense(e) {
  try {
    const token = localStorage.getItem("token");
    if (e.target.classList.contains("delete")) {
      let tr = e.target.parentElement.parentElement;
      let id = tr.children[0].textContent;
      const res = await axios.get(
        `http://localhost:3000/expense/deleteExpense/${id}`,
        { headers: { Authorization: token } }
      );
      window.location.reload();
    }
  } catch {
    (err) => console.log(err);
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

      const res = await axios.get(
        "http://localhost:3000/expense/getAllExpenses",
        { headers: { Authorization: token } }
      );
      res.data.forEach((expense) => {
        if (expense.id == id) {
          categoryValue.textContent = expense.category;
          descriptionValue.value = expense.description;
          amountValue.value = expense.amount;
          addExpenseBtn.textContent = "Update";

          addExpenseBtn.removeEventListener("click", addExpense);

          addExpenseBtn.addEventListener("click", async function update(e) {
            e.preventDefault();
            console.log("request to backend for edit");
            const res = await axios.post(
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
  } catch {
    (err) => console.log(err);
  }
}
/*
FLOW OF CODE :
frontend me buyPremium pe click hoga
token nikal ke createOrder pe post request jaayegi order ke saath jisme order id h
ab usse pahle token ka use krke authentication hoga
fir backend pe createOrder fxn me cashfree ke liye order structure hoga
order_meta me return url pe payement done (success or fail) hone ke baad hmara page redirect hoga jo bhi url humne provide kra hoga
ye mostly _self (means dusre page pe jaake payment krna) ke case me kaam me aata h
maine _modal use kra h isme iska koi itna khaas kaam nhi h
ab order structure hone ke baad hmara order create hoga
aur agr hmara order create ho jaata h cashfree pe to fir hum hmari order table me bhi order create kr denge whase reponse me aaye data ka use krke
aur response me orderId and paymentId bhej denge frontend pe jaha se call lgi thi whape
ab humara order create hone ke baad hume frontend pe response milega
aur agr response me paymentId aa jaati h to fir hum cashfree ke code ka use krke payment modal open kr denge payment krne ke liye
ab jaise hi hmari payment complete ho jaayegi to hum getPaymentStatus pe get ki request maar denge
aur backend pe getPaymentStatus me hum orderId ki madad se order nikal lenge aur fir us order ka status find krke response me send kr denge
aur hume order ka status frontend pe mil jaayega
aur us orderStatus ko updateTransactionStatus pe bhej denge update hone ke liye
aur backend pe orderId ki madad se order nikal ke order ke status ko update kr denge
aur user ke isPremiumUser ko true kr denge
aur fir nya token generate krke response send kr denge
aur frontend pe fir hum us nye token ko localstorage me set kr denge
aur fir window ko reload kr denge jisse isPremiumUser fxn run ho aur user premium set ho jaaye
*/
async function buyPremium(e) {
  try {
    console.log("bph");
    const token = localStorage.getItem("token");
    // Get payment session ID from backend
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

      // Initialize checkout options
      let checkoutOptions = {
        paymentSessionId: paymentId,

        //? New page payment options
        redirectTarget: "_modal", // (default)
      };

      // Start the checkout process
      const result = await cashfree.checkout(checkoutOptions);

      if (result.error) {
        // This will be true whenever user clicks on close icon inside the modal or any error happens during the payment
        console.log(
          "User has closed the popup or there is some payment error, Check for Payment Status"
        );
        console.log(result.error);
      }
      if (result.redirect) {
        // This will be true when the payment redirection page couldn't be opened in the same window
        // This is an exceptional case only when the page is opened inside an inAppBrowser
        // In this case the customer will be redirected to return url once payment is completed
        console.log("Payment will be redirected");
      }
      if (result.paymentDetails) {
        // This will be called whenever the payment is completed irrespective of transaction status
        console.log("Payment has been completed, Check for Payment Status");
        const statusResponse = await axios.get(
          `http://localhost:3000/purchase/getPaymentStatus/${orderId}`,
        );

        const statusUpdateResponse = await axios.post(
          "http://localhost:3000/purchase/updateTransactionStatus",
          {
            orderId : orderId,
            status: statusResponse.data.orderStatus
          },
          { headers: { Authorization: token } }
        );

        alert("Welcome to our Premium Membership, You have now access to Reports and LeaderBoard");
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
    reportsLink.removeAttribute("onclick");
    leaderboardLink.removeAttribute("onclick");
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