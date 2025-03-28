const lTbody = document.getElementById("lTbodyId");
const logoutBtn = document.getElementById("logoutBtn");

async function getLeaderboard() {
  try {
    const token = localStorage.getItem("token");
    const allUsers = await axios.get("/premium/getAllUsersForLeaderboard", {
      headers: { Authorization: token },
    });
    let position = 1;
    allUsers.data.forEach((user) => {
      let name = user.name;
      let amount = user.totalExpenses;

      let tr = document.createElement("tr");
      tr.setAttribute("class", "trStyle");

      lTbody.appendChild(tr);

      let th = document.createElement("th");
      th.setAttribute("scope", "row");
      th.appendChild(document.createTextNode(position++));

      let td1 = document.createElement("td");
      td1.appendChild(document.createTextNode(name));

      let td2 = document.createElement("td");
      td2.appendChild(document.createTextNode(amount));

      tr.appendChild(th);
      tr.appendChild(td1);
      tr.appendChild(td2);
    });
  } catch (error) {
    console.error("Error in getting Leaderboard:", error);
  }
}

async function logout() {
  try {
    localStorage.clear();
    window.location.href = "/";
  } catch (error) {
    console.log(error);
  }
}

document.addEventListener("DOMContentLoaded", getLeaderboard);
logoutBtn.addEventListener("click", logout);
