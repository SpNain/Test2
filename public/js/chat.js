const messageTextArea = document.getElementById("messageTextArea");
const messageSendBtn = document.getElementById("messageSendBtn");
const chatBoxBody = document.getElementById("chatBoxBody");
const groupUl = document.getElementById("groups");
const groupNameHeading = document.getElementById("groupNameHeading");

async function activeGroup(e) {

  // clear the chatbox and group name heading
  chatBoxBody.innerHTML = "";
  groupNameHeading.innerHTML = "";

  // remove the active class from previously active group
  const activeLi = document.getElementsByClassName("active");
  if (activeLi.length != 0) {
    activeLi[0].removeAttribute("class", "active");
  }

  // set the clicked group as active
  let li = e.target;
  while (li.tagName !== "LI") {
    li = li.parentElement;
  }
  li.setAttribute("class", "active");

  // update the group name in local storage and UI
  const groupName = li.querySelector("span").textContent;
  localStorage.setItem("groupName", groupName);
  const span = document.createElement("span");
  span.appendChild(document.createTextNode(groupName));
  groupNameHeading.appendChild(span);

  // get messages from local storage
  getMessagesFromLocalStorage(groupName);

  // set an interval to fetch messages
  setInterval(() => {
    getMessages(groupName);
  }, 5000);
}

async function messageSend() {
  try {
    const message = messageTextArea.value;
    const token = localStorage.getItem("token");

    const groupName = localStorage.getItem("groupName");
    if (!groupName || groupName == "") {
      return alert("Select group to send the message Or create a new group");
    }

    const res = await axios.post(
      "/chat/sendMessage",
      {
        message: message,
        groupName: groupName,
      },
      { headers: { Authorization: token } }
    );
    messageTextArea.value = "";
  } catch (error) {
    console.error("something went wrong : ", error);
  }
}

function decodeToken(token) {
  const base64Url = token.split(".")[1];
  const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
  const jsonPayload = decodeURIComponent(
    atob(base64)
      .split("")
      .map(function (c) {
        return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
      })
      .join("")
  );

  return JSON.parse(jsonPayload);
}

async function getMessages(groupName) {
  try {
    let param;
    const localStorageChats = JSON.parse(localStorage.getItem(`${groupName}`));
    if (localStorageChats) {
      param = localStorageChats[localStorageChats.length - 1].id;
    } else {
      param = 0;
    }

    const res = await axios.get(`/chat/getMessages/?param=${param}&groupName=${groupName}`);
    const token = localStorage.getItem("token");
    const decodedToken = decodeToken(token);
    const userId = decodedToken.userId;


    if (localStorageChats) {
      res.data.messages.forEach((message) => {
        localStorageChats.push(message); // pahle push kro fir check kro
        if (localStorageChats.length > 10) {
          localStorageChats.shift();
        }
      });
      localStorage.setItem(`${groupName}`, JSON.stringify(localStorageChats)); 
    } else {
      while (res.data.messages.length > 10) {
        res.data.messages.shift();
      }
      localStorage.setItem(`${groupName}`, JSON.stringify(res.data.messages));
    }

    res.data.messages.forEach((message) => {
      if (message.userId == userId) {
        const div = document.createElement("div");
        chatBoxBody.appendChild(div);

        const messageSendby = document.createElement("span");
        messageSendby.classList.add(
          "d-flex",
          "justify-content-end",
          "px-3",
          "mb-1",
          "text-uppercase",
          "small",
          "text-white"
        );
        messageSendby.appendChild(document.createTextNode("You"));
        div.appendChild(messageSendby);

        const messageBox = document.createElement("div");
        const messageText = document.createElement("div");

        messageBox.classList.add("d-flex", "justify-content-end", "mb-4");

        messageText.classList.add("msg_container_send");
        messageText.appendChild(document.createTextNode(message.message));

        messageBox.appendChild(messageText);
        div.appendChild(messageBox);
      } else {
        const div = document.createElement("div");
        chatBoxBody.appendChild(div);

        const messageSendby = document.createElement("span");
        messageSendby.classList.add(
          "d-flex",
          "justify-content-start",
          "px-3",
          "mb-1",
          "text-uppercase",
          "small",
          "text-white"
        );
        messageSendby.appendChild(document.createTextNode(message.name));
        div.appendChild(messageSendby);

        const messageBox = document.createElement("div");
        const messageText = document.createElement("div");

        messageBox.classList.add("d-flex", "justify-content-start", "mb-4");

        messageText.classList.add("msg_container");
        messageText.appendChild(document.createTextNode(message.message));

        messageBox.appendChild(messageText);
        div.appendChild(messageBox);
      }
    });
  } catch (error) {
    console.error(error);
  }
}


async function getMessagesFromLocalStorage(groupName) {
  const messages = JSON.parse(localStorage.getItem(`${groupName}`));

  const token = localStorage.getItem("token");
  const decodedToken = decodeToken(token);
  const userId = decodedToken.userId;
  chatBoxBody.innerHTML = "";

  if (messages) {
    messages.forEach((message) => {
      if (message.userId == userId) {
        const div = document.createElement("div");
        chatBoxBody.appendChild(div);

        const messageSendby = document.createElement("span");
        messageSendby.classList.add(
          "d-flex",
          "justify-content-end",
          "px-3",
          "mb-1",
          "text-uppercase",
          "small",
          "text-white"
        );
        messageSendby.appendChild(document.createTextNode("You"));
        div.appendChild(messageSendby);

        const messageBox = document.createElement("div");
        const messageText = document.createElement("div");

        messageBox.classList.add("d-flex", "justify-content-end", "mb-4");

        messageText.classList.add("msg_container_send");
        messageText.appendChild(document.createTextNode(message.message));

        messageBox.appendChild(messageText);
        div.appendChild(messageBox);
      } else {
        const div = document.createElement("div");
        chatBoxBody.appendChild(div);

        const messageSendby = document.createElement("span");
        messageSendby.classList.add(
          "d-flex",
          "justify-content-start",
          "px-3",
          "mb-1",
          "text-uppercase",
          "small",
          "text-white"
        );
        messageSendby.appendChild(document.createTextNode(message.name));
        div.appendChild(messageSendby);

        const messageBox = document.createElement("div");
        const messageText = document.createElement("div");

        messageBox.classList.add("d-flex", "justify-content-start", "mb-4");

        messageText.classList.add("msg_container");
        messageText.appendChild(document.createTextNode(message.message));

        messageBox.appendChild(messageText);
        div.appendChild(messageBox);
      }
    });
  }
}

messageSendBtn.addEventListener("click", messageSend);

groupUl.addEventListener("click", activeGroup);
document.addEventListener("DOMContentLoaded", () => {
  localStorage.setItem("groupName", "");
});
