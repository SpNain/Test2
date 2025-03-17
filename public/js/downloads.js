const dTbody = document.getElementById("dTbodyId");
const logoutBtn = document.getElementById("logoutBtn");

function extractInfo(str) {
  try {
    const typeMatch = str.match(
      /(AllExpenses|DailyReport|WeeklyReport|MonthlyReport)/
    );
    if (!typeMatch) {
      throw new Error(
        "Error in fetching downloads history. Type not found in the string."
      );
    }
    let type = typeMatch[0];
    if (type === "AllExpenses") {
      type = "All Expenses";
    }
    if (type === "DailyReport") {
      type = "Daily Report";
    }
    if (type === "WeeklyReport") {
      type = "Weekly Report";
    }
    if (type === "MonthlyReport") {
      type = "Monthly Report";
    }

    const dateMatch = str.match(/_(\d{4}-\d{2}-\d{2})/);
    if (!dateMatch) {
      throw new Error(
        "Error in fetching downloads history. Date not found in the string."
      );
    }
    const datePart = dateMatch[1];
    const [year, month, day] = datePart.split("-");
    const formattedDate = new Date(year, month - 1, day).toLocaleDateString(
      "en-GB",
      { day: "numeric", month: "short", year: "numeric" }
    );

    return { type, formattedDate };
  } catch (error) {
    console.error("Error extracting information:", error.message);
    return null;
  }
}

async function getAllDownloads() {
  try {
    const token = localStorage.getItem("token");
    const response = await axios.get("/download/getAllDownloads", {
      headers: { Authorization: token },
    });

    let sno = 1;
    response.data.forEach((row) => {
      let { type, formattedDate } = extractInfo(row.downloadLink);

      let tr = document.createElement("tr");
      tr.setAttribute("class", "trStyle");

      dTbody.appendChild(tr);

      let th = document.createElement("th");
      th.setAttribute("scope", "row");
      th.appendChild(document.createTextNode(sno++));

      let td1 = document.createElement("td");
      td1.appendChild(document.createTextNode(type));

      let td2 = document.createElement("td");
      td2.appendChild(document.createTextNode(formattedDate));

      let td3 = document.createElement("td");

      let downloadBtn = document.createElement("button");
      downloadBtn.className = "btn btn-download btn-success";
      downloadBtn.appendChild(document.createTextNode("Download"));

      downloadBtn.addEventListener("click", async () => {
        window.location.href = row.downloadLink;
      });

      td3.appendChild(downloadBtn);

      tr.appendChild(th);
      tr.appendChild(td1);
      tr.appendChild(td2);
      tr.appendChild(td3);
    });
  } catch (error) {
    console.error("Error getting all the downloads:", error);
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

document.addEventListener("DOMContentLoaded", getAllDownloads);
logoutBtn.addEventListener("click", logout);
